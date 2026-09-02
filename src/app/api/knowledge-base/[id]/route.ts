import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { rebuildIndex } from "@/lib/rag/indexer";

// GET /api/knowledge-base/[id] — get single entry
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = await prisma.knowledgeBaseEntry.findUnique({
    where: { id: params.id },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

// PUT /api/knowledge-base/[id] — update entry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const entry = await prisma.knowledgeBaseEntry.update({
    where: { id: params.id },
    data: {
      ...body,
      lastUpdated: new Date(),
    },
  });

  try {
    await rebuildIndex();
  } catch (err) {
    console.error("Index rebuild failed (entry was still updated):", err);
  }

  return NextResponse.json(entry);
}

// DELETE /api/knowledge-base/[id] — delete entry
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.knowledgeBaseEntry.delete({
    where: { id: params.id },
  });

  try {
    await rebuildIndex();
  } catch (err) {
    console.error("Index rebuild failed (entry was still deleted):", err);
  }

  return NextResponse.json({ success: true });
}
