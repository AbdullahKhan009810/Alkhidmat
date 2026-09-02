/**
 * scripts/embed-kb.ts
 *
 * Offline RAG indexing pipeline (AI-Architecture.md §5.2):
 *   1. Reads data/kb/<category>.json knowledge-base files
 *   2. Chunks long content (sentence-aware, ~400 chars)
 *   3. Embeds each chunk — MaaS API (text-embedding-v4, 1024-dim) when
 *      QWEN_API_KEY is set, else local ONNX MiniLM (384-dim)
 *   4. Writes data/kb-index.json — the local vector index used at query time
 *   5. Mirrors vectors into Upstash Vector (backup store) if configured
 *
 * Run: npm run kb:embed
 */
import fs from "fs";
import path from "path";
import { pipeline, env } from "@huggingface/transformers";
import { Index } from "@upstash/vector";

const ROOT = path.resolve(__dirname, "..");
const KB_DIR = process.env.KB_DATA_DIR
  ? path.resolve(ROOT, process.env.KB_DATA_DIR)
  : path.join(ROOT, "data", "kb");
const INDEX_FILE = process.env.KB_INDEX_FILE
  ? path.resolve(ROOT, process.env.KB_INDEX_FILE)
  : path.join(ROOT, "data", "kb-index.json");
const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ||
  "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

const CHUNK_SIZE = 400; // characters
const UPSTASH_NAMESPACE = "muawin-kb";

// Cache model files inside the project so reruns are offline
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

/** Sentence-aware chunking — splits on line breaks/sentences, merges up to CHUNK_SIZE */
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

  // Safety: hard-split any oversized chunk
  return chunks.flatMap((c) =>
    c.length <= CHUNK_SIZE * 1.5
      ? [c]
      : c.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [c]
  );
}

/** Collect all embeddable chunks (title + content, per language) from KB entries */
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

/** Embed texts via MaaS API (text-embedding-v4) in batches */
async function embedAllViaApi(
  texts: string[],
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<number[][]> {
  const vectors: number[][] = [];
  const BATCH = 10; // MaaS embedding API hard limit: batch ≤ 10
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data?.data || []) as any[];
    if (rows.length !== batch.length) {
      throw new Error(`Embedding API returned ${rows.length}/${batch.length} vectors`);
    }
    // API may reorder — sort by index to preserve input order
    rows.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    vectors.push(...rows.map((r) => r.embedding as number[]));
    console.log(`   embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}`);
  }
  return vectors;
}

/** Embed texts with mean pooling + L2 normalization (batched, local ONNX) */
async function embedAllLocal(
  texts: string[]
): Promise<number[][]> {
  console.log(`🧠 Loading embedding model: ${EMBEDDING_MODEL}`);
  const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);

  const vectors: number[][] = [];
  const BATCH = 16;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output: any = await extractor(batch, {
      pooling: "mean",
      normalize: true,
    });
    const arr: number[][] = output.tolist();
    vectors.push(...arr);
    console.log(`   embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}`);
  }
  return vectors;
}

/** Embed all texts — MaaS API when configured, local ONNX otherwise */
async function embedAll(texts: string[]): Promise<{ vectors: number[][]; provider: "api" | "local" }> {
  const envVars = (() => {
    try {
      const raw = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
      const values: Record<string, string> = {};
      for (const line of raw.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i === -1) continue;
        values[t.slice(0, i)] = t
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
      return values;
    } catch {
      return {} as Record<string, string>;
    }
  })();

  const apiKey = envVars.QWEN_API_KEY || process.env.QWEN_API_KEY;
  const baseUrl = (envVars.QWEN_BASE_URL || process.env.QWEN_BASE_URL || "").replace(/\/+$/, "");
  const model = envVars.QWEN_EMBEDDING_MODEL || process.env.QWEN_EMBEDDING_MODEL || "text-embedding-v4";

  if (apiKey && baseUrl) {
    console.log(`🚀 Embedding via MaaS API: ${model}`);
    try {
      const vectors = await embedAllViaApi(texts, apiKey, baseUrl, model);
      return { vectors, provider: "api" };
    } catch (err) {
      console.warn(`⚠️  API embedding failed (${(err as Error).message}) — falling back to local ONNX`);
    }
  }

  const vectors = await embedAllLocal(texts);
  return { vectors, provider: "local" };
}

/** Mirror vectors into Upstash Vector (backup store) if credentials exist */
async function syncToUpstash(chunks: IndexedChunk[]): Promise<void> {
  const url = process.env.UPSTASH_VECTOR_URL;
  const token = process.env.UPSTASH_VECTOR_TOKEN;
  if (!url || !token) {
    console.log("⏭️  Upstash not configured — skipping backup sync");
    return;
  }

  console.log("☁️  Syncing vectors to Upstash Vector (backup)...");
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
  console.log(`✅ Upserted ${chunks.length} vectors to Upstash`);
}

async function main() {
  if (!fs.existsSync(KB_DIR)) {
    console.error(`❌ KB directory not found: ${KB_DIR}`);
    console.error('   Run "npm run kb:export" first.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(KB_DIR)
    .filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error(`❌ No JSON files found in ${KB_DIR}`);
    process.exit(1);
  }

  const entries: KBEntry[] = [];
  for (const file of files) {
    const parsed = JSON.parse(
      fs.readFileSync(path.join(KB_DIR, file), "utf-8")
    ) as KBEntry[];
    console.log(`📄 ${file} — ${parsed.length} entries`);
    entries.push(...parsed);
  }

  const chunks = collectChunks(entries);
  console.log(`\n✂️  Created ${chunks.length} chunks from ${entries.length} entries`);

  const { vectors, provider } = await embedAll(chunks.map((c) => c.text));
  const indexed: IndexedChunk[] = chunks.map((c, i) => ({
    ...c,
    vector: vectors[i],
  }));
  const dims = indexed[0]?.vector.length ?? 0;

  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexed), "utf-8");
  console.log(`\n💾 Local index written: ${INDEX_FILE}`);
  console.log(
    `   (${(fs.statSync(INDEX_FILE).size / 1024 / 1024).toFixed(2)} MB, ${indexed.length} vectors × ${dims} dims, provider: ${provider})`
  );

  await syncToUpstash(indexed).catch((err) => {
    console.warn(`⚠️  Upstash sync failed (local index is still valid): ${(err as Error).message}`);
    if (provider === "api") {
      console.warn("   Note: Upstash backup still holds OLD 384-dim vectors. Re-create the");
      console.warn("   Upstash index with 1024 dims if you rely on the backup path.");
    }
  });
  console.log("\n✨ Done. The RAG retriever will pick up the new index automatically.");
}

main().catch((err) => {
  console.error("❌ Embedding failed:", err);
  process.exit(1);
});
