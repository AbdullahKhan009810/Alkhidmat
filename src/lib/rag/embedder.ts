/**
 * src/lib/rag/embedder.ts
 *
 * Query-time embedding with three layers:
 *   1. LRU cache — repeated queries cost 0ms
 *   2. MaaS embedding API (text-embedding-v4, ~165ms warm) — primary
 *   3. Local ONNX (paraphrase-multilingual-MiniLM-L12-v2) — fallback
 *
 * NOTE: API and local vectors live in different spaces (1024-dim vs
 * 384-dim). The KB index must be built with the SAME layer used at
 * query time — the retriever checks dimension compatibility and this
 * module exposes embedTextFor(dims) to re-embed with the matching layer.
 */
import fs from "fs";
import path from "path";

const API_DIMS = 1024; // text-embedding-v4
const LOCAL_DIMS = 384; // paraphrase-multilingual-MiniLM-L12-v2

/* ── .env read from disk (dev server may hold stale process.env) ── */
let envCache: { mtime: number; values: Record<string, string> } | null = null;

function readEnv(): Record<string, string> {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const stat = fs.statSync(envPath);
    if (envCache && stat.mtimeMs === envCache.mtime) return envCache.values;

    const values: Record<string, string> = {};
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      values[t.slice(0, i)] = t
        .slice(i + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
    }
    envCache = { mtime: stat.mtimeMs, values };
    return values;
  } catch {
    return {};
  }
}

function getQwenConfig() {
  const disk = readEnv();
  return {
    apiKey: disk.QWEN_API_KEY || process.env.QWEN_API_KEY,
    baseUrl: (
      disk.QWEN_BASE_URL ||
      process.env.QWEN_BASE_URL ||
      "https://dashscope.aliyuncs.com/compatible-mode/v1"
    ).replace(/\/+$/, ""),
    embeddingModel:
      disk.QWEN_EMBEDDING_MODEL ||
      process.env.QWEN_EMBEDDING_MODEL ||
      "text-embedding-v4",
  };
}

/* ── LRU query cache ─────────────────────────────────────────── */
const MAX_CACHE = 200;
const apiCache = new Map<string, number[]>(); // text → 1024-dim vector
const localCache = new Map<string, number[]>(); // text → 384-dim vector

function cacheGet(cache: Map<string, number[]>, text: string): number[] | undefined {
  const v = cache.get(text);
  if (v) {
    // refresh LRU position
    cache.delete(text);
    cache.set(text, v);
  }
  return v;
}

function cacheSet(cache: Map<string, number[]>, text: string, vec: number[]) {
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(text, vec);
}

/* ── API embedding layer (primary) ───────────────────────────── */
const inFlightApi = new Map<string, Promise<number[]>>();

async function embedViaApi(text: string): Promise<number[]> {
  const cached = cacheGet(apiCache, text);
  if (cached) return cached;

  // Deduplicate concurrent identical queries
  const inFlight = inFlightApi.get(text);
  if (inFlight) return inFlight;

  const task = (async () => {
    const { apiKey, baseUrl, embeddingModel } = getQwenConfig();
    if (!apiKey) throw new Error("QWEN_API_KEY not configured");

    const res = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: embeddingModel, input: [text] }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`Embedding API ${res.status}: ${(await res.text()).slice(0, 120)}`);
    }

    const data = await res.json();
    const vec = data?.data?.[0]?.embedding;
    if (!Array.isArray(vec) || vec.length === 0) {
      throw new Error("Embedding API returned no vector");
    }
    return vec as number[];
  })();

  inFlightApi.set(text, task);
  try {
    const vec = await task;
    cacheSet(apiCache, text, vec);
    return vec;
  } finally {
    inFlightApi.delete(text);
  }
}

/* ── Local ONNX layer (fallback) ─────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelinePromise: Promise<any> | null = null;

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ||
  "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

async function getExtractor() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.cacheDir = path.join(process.cwd(), ".transformers-cache");
      env.allowLocalModels = true;
      return pipeline("feature-extraction", EMBEDDING_MODEL);
    })();
  }
  return pipelinePromise;
}

async function embedViaLocal(text: string): Promise<number[]> {
  const cached = cacheGet(localCache, text);
  if (cached) return cached;

  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  const vec = output.tolist()[0] as number[];
  cacheSet(localCache, text, vec);
  return vec;
}

/* ── Public API ──────────────────────────────────────────────── */

/** Embed a query — API first, local ONNX fallback. */
export async function embedText(text: string): Promise<number[]> {
  try {
    return await embedViaApi(text);
  } catch (err) {
    console.warn("API embedding failed, falling back to local ONNX:", (err as Error).message);
    return embedViaLocal(text);
  }
}

/** Embed a query producing a vector compatible with `dims` (1024 | 384). */
export async function embedTextFor(text: string, dims: number): Promise<number[]> {
  if (dims === API_DIMS) {
    // API-built index — query must come from the same API model (no local
    // fallback here: a 384-dim vector against 1024-dim index is garbage).
    return embedViaApi(text);
  }
  // Local-built 384-dim index — must use the local ONNX model.
  return embedViaLocal(text);
}

/** Warm the API connection (called on page load so first real query is fast). */
export async function warmUpEmbedder(): Promise<void> {
  await embedViaApi("warmup").catch(() => undefined);
}

export const EMBEDDING_DIMS = { api: API_DIMS, local: LOCAL_DIMS };
