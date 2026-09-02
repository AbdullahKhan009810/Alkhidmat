import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { rebuildIndex } from "@/lib/rag/indexer";

// GET /api/knowledge-base — list all entries
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  // Temporarily show all data to see what's in Supabase
  if (category && category !== "all") {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { titleUr: { contains: search } },
      { id: { contains: search, mode: "insensitive" } },
    ];
  }

  const entries = await prisma.knowledgeBaseEntry.findMany({
    where,
    orderBy: { lastUpdated: "desc" },
  });

  return NextResponse.json(entries);
}

// POST /api/knowledge-base — create new entry
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, titleUr, category, language, status, contentEn, contentUr, fileUrl, fileName } = body;

  if (!title || !category) {
    return NextResponse.json(
      { error: "Title and category are required" },
      { status: 400 }
    );
  }

  // Validate category (only 3 use cases allowed)
  const ALLOWED_CATEGORIES = [
    "facility-finder",
    "eligibility-check",
    "transport-guidance",
  ];
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category. Only facility-finder, eligibility-check, and transport-guidance are allowed" },
      { status: 400 }
    );
  }

  const entry = await prisma.knowledgeBaseEntry.create({
    data: {
      title,
      titleUr: titleUr || "",
      category,
      language: language || "both",
      status: status || "active",
      contentEn: contentEn || "",
      contentUr: contentUr || "",
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      lastUpdated: new Date(),
    },
  });

  // Automatically rebuild RAG index so new content is immediately searchable
  try {
    const result = await rebuildIndex();
    console.log(`Index rebuilt: ${result.entries} entries, ${result.chunks} chunks`);
  } catch (err) {
    console.error("Index rebuild failed (entry was still created):", err);
  }

  return NextResponse.json(entry, { status: 201 });
}
