/**
 * src/lib/rag/retriever.ts
 *
 * Deterministic RAG retrieval (AI-Architecture.md §5.3):
 *   1. Embed query with paraphrase-multilingual-MiniLM-L12-v2
 *   2. Cosine search over the local JSON index (data/kb-index.json)
 *   3. Fall back to Upstash Vector if the local index is unavailable
 */
import fs from "fs";
import path from "path";
import { embedText, embedTextFor } from "./embedder";
import { getUpstashIndex } from "./upstash";

const INDEX_FILE = process.env.KB_INDEX_FILE
  ? path.resolve(process.cwd(), process.env.KB_INDEX_FILE)
  : path.join(process.cwd(), "data", "kb-index.json");

export const DEFAULT_TOP_K = 6;
/** Minimum cosine similarity for a chunk to count as relevant */
export const SCORE_THRESHOLD = 0.28;

export interface RetrievedChunk {
  id: string;
  entryId: string;
  category: string;
  language: string;
  title: string;
  text: string;
  score: number;
  source: "local" | "upstash";
}

interface LocalChunk {
  id: string;
  entryId: string;
  category: string;
  language: string;
  title: string;
  text: string;
  vector: number[];
}

/* ── Local index cache (invalidated when the file changes) ─────── */
let cachedIndex: LocalChunk[] | null = null;
let cachedMtime = 0;

function loadLocalIndex(): LocalChunk[] | null {
  try {
    const stat = fs.statSync(INDEX_FILE);
    if (cachedIndex && stat.mtimeMs === cachedMtime) return cachedIndex;
    cachedIndex = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
    cachedMtime = stat.mtimeMs;
    return cachedIndex;
  } catch {
    return null;
  }
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are pre-normalized
}

async function searchUpstash(
  queryVector: number[],
  topK: number,
  category?: string
): Promise<RetrievedChunk[]> {
  const index = getUpstashIndex();
  if (!index) return [];

  try {
    const results = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });

    return results
      .map((r) => {
        const meta = (r.metadata || {}) as Record<string, string>;
        return {
          id: String(r.id),
          entryId: meta.entryId || "",
          category: meta.category || "",
          language: meta.language || "",
          title: meta.title || "",
          text: meta.text || "",
          score: r.score,
          source: "upstash" as const,
        };
      })
      .filter((r) => !category || r.category === category);
  } catch (err) {
    console.error("Upstash fallback query failed:", err);
    return [];
  }
}

/** Map common slang / abbreviations to canonical names before embedding. */
function expandQuery(query: string): string {
  const aliases: [string, string][] = [
    // Cities
    ["pindi", "Rawalpindi راولپنڈی"],
    ["lahore", "Lahore لاہور"],
    ["karachi", "Karachi کراچی"],
    ["islamabad", "Islamabad اسلام آباد"],
    ["islam", "Islamabad اسلام آباد"],
    ["kashmore", "Kashmore کشمور"],
    ["peshawar", "Peshawar پشاور"],
    ["multan", "Multan ملتان"],
    ["faisalabad", "Faisalabad فیصل آباد"],
    ["gujranwala", "Gujranwala گوجرانوالہ"],
    ["sialkot", "Sialkot سیالکوٹ"],
    ["hyderabad", "Hyderabad حیدرآباد"],
    ["quetta", "Quetta کوئٹہ"],
    ["sukkur", "Sukkur سکھر"],
    ["nawab", "Nawab Shah نوابشاہ"],
    ["rahim", "Rahim Yar Khan رحیم یار خان"],
    ["bahawalpur", "Bahawalpur بہاولپور"],
    ["buner", "Buner بونیر"],
    ["chitral", "Chitral چترال"],
    ["mardan", "Mardan مردان"],
    ["swat", "Swat سوات"],
    ["bannu", "Bannu بنوں"],
    ["kohat", "Kohat کوہاٹ"],
    ["mansehra", "Mansehra مانسہرہ"],
    ["attock", "Attock اٹک"],
    ["sargodha", "Sargodha سرگودھا"],
    ["gujrat", "Gujrat گجرات"],
    ["sahiwal", "Sahiwal ساہیوال"],
    ["larkana", "Larkana لاڑکانہ"],
    ["dir", "Dir دیر"],
    // Programs & Services
    ["bano", "Bano Qabil بنو قابل"],
    ["qabil", "Bano Qabil بنو قابل"],
    ["aghosh", "Aghosh Homes آغوش ہومز"],
    ["mawakhat", "Mawakhat ماواکھات"],
    ["ofsp", "Orphan Family Support Program"],
    ["qarz", "Qarz-e-Hasana قرض حسنہ"],
    ["wash", "WASH Clean Water Program"],
  ];

  let expanded = query;
  for (const [alias, canonical] of aliases) {
    const re = new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    expanded = expanded.replace(re, canonical);
  }
  return expanded;
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 * Local JSON first; Upstash Vector as automatic backup.
 *
 * The index vectors may be 1024-dim (API-embedded) or 384-dim (local ONNX).
 * The query is re-embedded with the matching layer so cosine always
 * compares vectors from the same space.
 */
export async function retrieve(
  query: string,
  options?: { topK?: number; category?: string; minScore?: number }
): Promise<RetrievedChunk[]> {
  const topK = options?.topK ?? DEFAULT_TOP_K;
  const minScore = options?.minScore ?? SCORE_THRESHOLD;
  const expanded = expandQuery(query);

  const local = loadLocalIndex();

  // Match the query embedding layer to the index vectors' dimension
  let queryVector: number[];
  if (local && local.length > 0 && local[0].vector.length !== 1024) {
    queryVector = await embedTextFor(expanded, local[0].vector.length);
  } else {
    queryVector = await embedText(expanded);
  }

  if (!local) {
    console.warn("⚠️  Local KB index unavailable — falling back to Upstash");
    return searchUpstash(queryVector, topK, options?.category);
  }

  const pool = options?.category
    ? local.filter((c) => c.category === options.category)
    : local;

  const scored = pool.map((c) => ({
    id: c.id,
    entryId: c.entryId,
    category: c.category,
    language: c.language,
    title: c.title,
    text: c.text,
    score: cosine(queryVector, c.vector),
    source: "local" as const,
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score >= minScore);
}

/** Format retrieved chunks as grounding context for the LLM system prompt */
export function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] (${c.category}, ${c.language})\n${c.text}`
    )
    .join("\n\n");
}
