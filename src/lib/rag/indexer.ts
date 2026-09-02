/**
 * src/lib/rag/indexer.ts
 *
 * Reusable RAG index rebuild pipeline.
 * Reads active entries from the database, chunks, embeds, and writes
 * data/kb-index.json so the retriever picks up new content immediately.
 *
 * Called automatically after every KB entry create/update/delete.
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { pipeline, env } from "@huggingface/transformers";
import { Index } from "@upstash/vector";

const ROOT = path.resolve(process.cwd());
const KB_DIR = path.join(ROOT, "data", "kb");
const INDEX_FILE = path.join(ROOT, "data", "kb-index.json");
const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ||
  "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

const CHUNK_SIZE = 400;
const UPSTASH_NAMESPACE = "muawin-kb";

env.cacheDir = path.join(ROOT, ".transformers-cache");
env.allowLocalModels = true;

interface KBEntry {
  id: string;
  title: string;
  titleUr: string;
  category: string;
  language: string;
  status: string;
  contentEn: string;
  contentUr: string;
}

export interface IndexedChunk {
  id: string;
  entryId: string;
  category: string;
  language: "en" | "ur";
  title: string;
  text: string;
  vector: number[];
}

function chunkText(text: string): string[] {
  const sentences = text
    .split(/\n+|(?<=[.!?۔؟])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current && (current + "\n" + sentence).length > CHUNK_SIZE) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current}\n${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);

  return chunks.flatMap((c) =>
    c.length <= CHUNK_SIZE * 1.5
      ? [c]
      : c.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [c]
  );
}

function collectChunks(entries: KBEntry[]): Omit<IndexedChunk, "vector">[] {
  const chunks: Omit<IndexedChunk, "vector">[] = [];

  for (const entry of entries) {
    if (entry.status !== "active") continue;

    const parts: { lang: "en" | "ur"; title: string; body: string }[] = [];
    if (entry.contentEn)
      parts.push({ lang: "en", title: entry.title, body: entry.contentEn });
    if (entry.contentUr)
      parts.push({ lang: "ur", title: entry.titleUr, body: entry.contentUr });

    for (const part of parts) {
      const fullText = part.title ? `${part.title}\n${part.body}` : part.body;
      const pieces = chunkText(fullText);
      pieces.forEach((piece, i) => {
        chunks.push({
          id: `${entry.id}:${part.lang}:${i}`,
          entryId: entry.id,
          category: entry.category,
          language: part.lang,
          title: part.title,
          text: piece,
        });
      });
    }
  }

  return chunks;
}

async function embedAllViaApi(
  texts: string[],
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<number[][]> {
  const vectors: number[][] = [];
  const BATCH = 10;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: batch }),
    });
    if (!res.ok) {
      throw new Error(`Embedding API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const data = await res.json();
    const rows = (data?.data || []) as { index: number; embedding: number[] }[];
    if (rows.length !== batch.length) {
      throw new Error(`Embedding API returned ${rows.length}/${batch.length} vectors`);
    }
    rows.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    vectors.push(...rows.map((r) => r.embedding));
  }
  return vectors;
}

async function embedAllLocal(texts: string[]): Promise<number[][]> {
  const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);

  const vectors: number[][] = [];
  const BATCH = 16;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const output = await extractor(batch, {
      pooling: "mean",
      normalize: true,
    });
    const arr: number[][] = output.tolist();
    vectors.push(...arr);
  }
  return vectors;
}

async function embedAll(texts: string[]): Promise<{ vectors: number[][]; provider: "api" | "local" }> {
  const apiKey = process.env.QWEN_API_KEY;
  const baseUrl = (process.env.QWEN_BASE_URL || "").replace(/\/+$/, "");
  const model = process.env.QWEN_EMBEDDING_MODEL || "text-embedding-v4";

  if (apiKey && baseUrl) {
    try {
      const vectors = await embedAllViaApi(texts, apiKey, baseUrl, model);
      return { vectors, provider: "api" };
    } catch {
      console.warn(`API embedding failed — falling back to local ONNX`);
    }
  }

  const vectors = await embedAllLocal(texts);
  return { vectors, provider: "local" };
}

async function syncToUpstash(chunks: IndexedChunk[]): Promise<void> {
  const url = process.env.UPSTASH_VECTOR_URL;
  const token = process.env.UPSTASH_VECTOR_TOKEN;
  if (!url || !token) return;

  const index = new Index({ url, token }).namespace(UPSTASH_NAMESPACE);
  const BATCH = 100;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    await index.upsert(
      batch.map((c) => ({
        id: c.id,
        vector: c.vector,
        metadata: {
          entryId: c.entryId,
          category: c.category,
          language: c.language,
          title: c.title,
          text: c.text,
        },
      }))
    );
  }
}

/**
 * Rebuild the entire RAG index from the database.
 * Call this after any KB entry create/update/delete.
 */
export async function rebuildIndex(): Promise<{ chunks: number; entries: number }> {
  const prisma = new PrismaClient();

  const entries = await prisma.knowledgeBaseEntry.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  await prisma.$disconnect();

  // Also write to data/kb/<category>.json for the export pipeline
  const byCategory = new Map<string, KBEntry[]>();
  for (const e of entries) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, []);
    byCategory.get(e.category)!.push({
      id: e.id,
      title: e.title || "",
      titleUr: e.titleUr || "",
      category: e.category,
      language: e.language || "both",
      status: e.status || "active",
      contentEn: e.contentEn || "",
      contentUr: e.contentUr || "",
    });
  }

  fs.mkdirSync(KB_DIR, { recursive: true });
  byCategory.forEach((list, category) => {
    fs.writeFileSync(
      path.join(KB_DIR, `${category}.json`),
      JSON.stringify(list, null, 2),
      "utf-8"
    );
  });

  const chunks = collectChunks(entries);
  const { vectors } = await embedAll(chunks.map((c) => c.text));
  const indexed: IndexedChunk[] = chunks.map((c, i) => ({
    ...c,
    vector: vectors[i],
  }));

  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexed), "utf-8");

  await syncToUpstash(indexed).catch(() => {});

  return { chunks: indexed.length, entries: entries.length };
}
