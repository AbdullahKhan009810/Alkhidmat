import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/conversations — list all conversations
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(conversations);
}

// POST /api/conversations — create a new conversation with messages (public — no auth required)
export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, language, messages } = body;

  if (!sessionId || !messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "sessionId and messages array are required" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.create({
    data: {
      sessionId,
      language: language || "en",
      messages: {
        create: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content,
        })),
      },
    },
    include: {
      messages: true,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
