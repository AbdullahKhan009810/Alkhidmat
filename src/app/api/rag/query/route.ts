import { NextResponse } from "next/server";
import { retrieve } from "@/lib/rag/retriever";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/rag/query
 * Deterministic retrieval endpoint (AI-Architecture.md §6).
 * Body: { query: string, category?: string, topK?: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, category, topK } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "query (string) is required" },
        { status: 400 }
      );
    }

    const chunks = await retrieve(query, { category, topK });

    return NextResponse.json({
      query,
      count: chunks.length,
      results: chunks.map((c) => ({
        id: c.id,
        entryId: c.entryId,
        category: c.category,
        language: c.language,
        title: c.title,
        text: c.text,
        score: Number(c.score.toFixed(4)),
        source: c.source,
      })),
    });
  } catch (err) {
    console.error("RAG query error:", err);
    return NextResponse.json(
      { error: "Retrieval failed" },
      { status: 500 }
    );
  }
}
