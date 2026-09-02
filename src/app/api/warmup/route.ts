import { NextResponse } from "next/server";
import { warmUpEmbedder } from "@/lib/rag/embedder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/warmup
 * Warms the embedding API connection so the first real chat query is fast.
 * Called fire-and-forget by the client on page load.
 */
export async function GET() {
  try {
    await warmUpEmbedder();
    return NextResponse.json({ ok: true });
  } catch {
    // Non-fatal — first real query will warm the connection instead
    return NextResponse.json({ ok: false });
  }
}
