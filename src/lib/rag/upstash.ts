/**
 * src/lib/rag/upstash.ts
 *
 * Backup vector store client (Upstash Vector). Only used when the local
 * JSON index is unavailable, or when explicitly requested (AI-Architecture.md §5.3).
 */
import { Index } from "@upstash/vector";

export const UPSTASH_NAMESPACE = "muawin-kb";

/** Namespaced handle type (Namespace isn't exported by the package) */
export type NamespacedIndex = ReturnType<Index["namespace"]>;

let client: Index | null = null;

/** Returns the Upstash namespaced index, or null when not configured */
export function getUpstashIndex(): NamespacedIndex | null {
  const url = process.env.UPSTASH_VECTOR_URL;
  const token = process.env.UPSTASH_VECTOR_TOKEN;
  if (!url || !token) return null;

  if (!client) {
    client = new Index({ url, token });
  }
  return client.namespace(UPSTASH_NAMESPACE);
}
