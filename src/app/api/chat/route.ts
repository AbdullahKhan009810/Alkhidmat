import { NextResponse } from "next/server";
import { retrieve, formatContext } from "@/lib/rag/retriever";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QWEN_BASE_URL =
  process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
const QWEN_CHAT_MODEL = process.env.QWEN_CHAT_MODEL || "qwen3-omni-flash";

const HELPLINE_FALLBACK_EN =
  "I couldn't find that in the Al Khidmat knowledge base. Please call the Al Khidmat helpline at 051-4853951 (or dial 1122 for emergencies) for direct assistance.";
const HELPLINE_FALLBACK_UR =
  "مجھے الخدمت کے ریکارڈ میں یہ معلومات نہیں ملیں۔ براہ کرم براہِ راست مدد کے لیے الخدمت ہیلپ لائن 051-4853951 پر کال کریں (ایمرجنسی کے لیے 1122 ڈائل کریں)۔";

/** Qwen sometimes misspells الخدمت — normalize so TTS pronounces it correctly */
function normalizeUrduAnswer(text: string): string {
  return text
    .replace(/\u0627\u0644\u06a9\u06be\u062f\u0645\u062a/g, "\u0627\u0644\u062e\u062f\u0645\u062a")
    .replace(/\u06a9\u06be\u062f\u0645\u062a/g, "\u062e\u062f\u0645\u062a")
    // LLM sometimes hallucinates مبین (Moin) instead of معاون (Muawin)
    .replace(/\u0645\u0628\u06cc\u0646/g, "\u0645\u0639\u0627\u0648\u0646")
    // Strip any parenthetical spelling guides the LLM might include, e.g. (م-ع-ا-و-ن)
    .replace(/\s*\([^-—]*[-—][^-—]*\)\s*/g, " ")
    // Fix truncated phone numbers — ensure full 051-4853951 is present
    .replace(/051-4853(?!951)/g, "051-4853951");
}

/**
 * Unified answer response: SSE stream when the client asked for streaming,
 * plain JSON otherwise. Prevents the client from receiving JSON when it
 * expects SSE (which made short fallback replies appear "stuck" / silent).
 */
function sendAnswer(
  answer: string,
  sources: Array<Record<string, unknown>>,
  fallback: boolean,
  stream: boolean
): Response {
  if (!stream) {
    return NextResponse.json({ answer, sources, fallback });
  }
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "token", token: answer })}\n\n`)
      );
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`)
      );
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
      );
      controller.close();
    },
  });
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/**
 * Conversational closing intents (thanks / goodbye) — answered instantly,
 * without RAG or the LLM, so a "thank you" never gets the awkward
 * "information not found" fallback and TTS caches the fixed phrasing.
 */
function closingAnswer(message: string, language?: string): string | null {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 60) return null;

  const thanks =
    /\u0634\u06a9\u0631\u06cc\u06c1|\u0645\u06c1\u0631\u0628\u0627\u0646\u06cc/.test(trimmed) ||
    /\b(thanks?|thank you|thankyou)\b/i.test(trimmed);
  const bye =
    /\u062e\u062f\u0627\s*\u062d\u0627\u0641\u0638|\u0627\u0644\u0644\u06c1\s*\u062d\u0627\u0641\u0638|\u0627\u0644\u0648\u062f\u0627\u0639/.test(trimmed) ||
    /\b(bye|goodbye|good bye)\b/i.test(trimmed);
  if (!thanks && !bye) return null;

  // Strip closing words and fillers — a real closing has almost nothing left.
  // Substantive leftovers ("...اب بتائیں ہسپتال کہاں ہے") go to RAG instead.
  const rest = trimmed
    .replace(
      /\u0634\u06a9\u0631\u06cc\u06c1|\u0645\u06c1\u0631\u0628\u0627\u0646\u06cc|\u062e\u062f\u0627\s*\u062d\u0627\u0641\u0638|\u0627\u0644\u0644\u06c1\s*\u062d\u0627\u0641\u0638|\u0627\u0644\u0648\u062f\u0627\u0639|\u0679\u06be\u06cc\u06a9/g,
      " "
    )
    .replace(
      /\b(thanks?|thank you|thankyou|bye|goodbye|good bye|okay|ok|alright|theek)\b/gi,
      " "
    )
    .replace(/[?!.,\u060c\u06d4\s]+/g, " ")
    .trim();

  if (rest.length > 12) return null;

  const urdu =
    language === "ur" ||
    (!language && /[\u0600-\u06FF]/.test(trimmed));

  if (urdu) {
    return thanks
      ? "\u0628\u06c1\u062a \u0634\u06a9\u0631\u06cc\u06c1! \u0627\u0644\u062e\u062f\u0645\u062a \u06c1\u06cc\u0644\u067e \u0644\u0627\u0626\u0646 \u06c1\u0631 \u0648\u0642\u062a \u0622\u067e \u06a9\u06cc \u062e\u062f\u0645\u062a \u06a9\u06d2 \u0644\u06cc\u06d2 \u062d\u0627\u0636\u0631 \u06c1\u06d2\u06d4 \u062e\u062f\u0627 \u062d\u0627\u0641\u0638!"
      : "\u062e\u062f\u0627 \u062d\u0627\u0641\u0638! \u0622\u067e \u06a9\u0627 \u062f\u0646 \u0627\u0686\u06be\u0627 \u06af\u0632\u0631\u06d2\u06d4";
  }
  return thanks
    ? "You're welcome! The Al Khidmat helpline is here anytime. Goodbye!"
    : "Goodbye! Take care, and call us anytime you need help.";
}

/**
 * Ultra-common small talk (greeting, how-are-you, identity) answered instantly
 * without RAG or the LLM — fixed phrasing also hits the TTS audio cache, so
 * repeat turns play immediately. Only fires when nothing substantive remains
 * after stripping politeness words, so "ہسپتال کیسے جاؤں" still goes to RAG.
 */
function smallTalkAnswer(message: string, language?: string): string | null {
  const t = message.trim();
  if (!t || t.length > 60) return null;

  const urdu = language === "ur" || (!language && /[\u0600-\u06FF]/.test(t));
  const offTopicUr = "میں الخدمت فاؤنڈیشن کا وائس اسسٹنٹ ہوں — میں صرف الخدمت کی بہبودی خدمات کے بارے میں معلومات دے سکتا ہوں۔ براہِ کرم دوسری مدد کے لیے الخدمت ہیلپ لائن 051-4853951 پر کال کریں۔";
  const offTopicEn = "I'm a voice assistant for Al Khidmat Foundation — I can only help with information about our welfare services. Please call our helpline at 051-4853951 for other assistance.";

  // Intent probes (Urdu script, Roman Urdu, English)
  const howAreYou =
    /\u06a9\u06cc\u0633[\u06d2\u06cc\u0627]|\u06a9\u06cc\u0627 \u062d\u0627\u0644|\bkais\w*|\bkes[iye]?\b|kya haal|how are (you|u)/i.test(t);
  const identity =
    /\u0622\u067e \u06a9\u0648\u0646|\u062a\u0645 \u06a9\u0648\u0646|\u0622\u067e \u06a9\u0627 \u0646\u0627\u0645|\b(kaun|kon|naam)\b|who are (you|u)|your name/i.test(t);
  const greeting =
    /^(?:\u0627\u0644)?\u0633\u0644\u0627\u0645|assalam|asalam|\bsalam\b|\bsalaam\b|\b(hello|hi|hey)\b/i.test(t);

  // Off-topic keyword detection — catches non-Alkhidmat queries BEFORE they reach the LLM
  const offTopicKeywords =
    /\b(murree|muree|meri|mari|hotel|booking|restaurant|food|tour|travel|trip|visit|place|weather|mausam|سیر|سیاحت|ہوٹل|بکنگ|ریسٹورنٹ|کھانا|مری|سوات|کاغان|ناران|trips?|vacation|holiday|resort|food|khana|khany)\b/i.test(t) ||
    /\u0645\u0631\u06cc|\u0633\u0648\u0627\u062a|\u06a9\u0627\u063a\u0627\u0646|\u0646\u0627\u0631\u0627\u0646|\u06c1\u0648\u0679\u0644|\u0628\u06a9\u0646\u06af|\u0633\u06cc\u0627\u062d\u062a|\u0633\u06cc\u0631/i.test(t);

  if (!howAreYou && !identity && !greeting) {
    // If it has off-topic keywords, reject immediately without LLM
    if (offTopicKeywords) return urdu ? offTopicUr : offTopicEn;
    return null;
  }

  // Strip small-talk words — anything substantive left goes to RAG / the LLM
  const rest = t
    .replace(
      /\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u06cc\u06a9\u0645|\u0633\u0644\u0627\u0645|\u06a9\u06cc\u0633[\u06d2\u06cc\u0627]|\u06a9\u06cc\u0627 \u062d\u0627\u0644|\u06a9\u06cc\u0627|\u0622\u067e|\u062a\u0645|\u06c1\u06cc\u06ba|\u06c1\u0648|\u06c1\u06d2|\u0645\u06cc\u06ba|\u062c\u06cc|\u06a9\u0648\u0646|\u0646\u0627\u0645/g,
      " "
    )
    .replace(
      /\b(aap|ap|tum|tu|hain|ho|hai|hein|ji|kais\w*|kes\w*|kya|haal|hello|hi|hey|assalam|asalam|salam|salaam|o|alaikum|walikum|you|u|your|name|who|are|what|is|kaun|kon|naam|apna|ka|ke|ki|main|i|m|s|and|the|a|se|so)\b/gi,
      " "
    )
    .replace(/[?!.,\u060c\u061f\u06d4\s]+/g, " ")
    .trim();

  if (rest.length > 4) {
    // Substantive content after stripping greetings — check if it's off-topic
    if (offTopicKeywords) return urdu ? offTopicUr : offTopicEn;
    return null;
  }

  if (urdu) {
    if (howAreYou) return "میں بالکل ٹھیک ہوں، شکریہ! آپ کیسے ہیں؟";
    if (identity)
      return "میں معاون ہوں، الخدمت فاؤنڈیشن کا وائس اسسٹنٹ ہوں۔ میں ہسپتال، مفت علاج اور ایمبولینس کے بارے میں رہنمائی دے سکتا ہوں۔";
    return "و علیکم السلام! میں الخدمت فاؤنڈیشن سے بات کر رہا ہوں۔ بتائیں، میں آپ کی کیا مدد کر سکتا ہوں؟";
  }
  if (howAreYou) return "I'm doing great, thank you! How about you?";
  if (identity)
    return "I'm Muawin, a voice assistant for Al Khidmat Foundation. I can help with hospitals, free treatment, and ambulance guidance.";
  return "Assalam o Alaikum! This is Muawin, voice assistant for Al Khidmat Foundation. How can I help you?";
}

/**
 * Conversational mode — used when no knowledge-base chunks match the message
 * (greetings, small talk, general questions). The LLM chats naturally but can
 * never invent Al Khidmat facts; specifics deflect to the helpline.
 */
function smallTalkPrompt(language: string): string {
  const fallback = language === "ur" ? HELPLINE_FALLBACK_UR : HELPLINE_FALLBACK_EN;
  const isUrdu = language === "ur";
  const genderRule = isUrdu
    ? "Use MASCULINE Urdu grammar: کرتا ہوں, بتاتا ہوں, سکتا ہوں (never feminine کرتی/بتاتی)."
    : "Use warm, friendly phrasing.";
  const nameNote = isUrdu
    ? "Your name is معاون. Always write it as معاون — NEVER as مبین or any other spelling. Never include spelling guides or letter breakdowns."
    : "Your name is Muawin.";
  const clarificationMsg = isUrdu
    ? "براہ کرم بتائیں میں آپ کی کیا مدد کر سکتا ہوں؟ میں الخدمت کی بہبودی خدمات کے بارے میں معلومات دے سکتا ہوں۔"
    : "Could you please clarify what you need help with? I can assist with Al Khidmat's welfare services.";

  return `You are Muawin, a voice assistant for Al Khidmat Foundation (Pakistan). You are NOT a human.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE #1 — OFF-TOPIC BLOCK (HIGHEST PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You ONLY discuss Al Khidmat welfare services: hospitals, clinics, free treatment, ambulance, patient transport, medical camps, eligibility.
If the user asks about ANYTHING else — tourism, hotels, restaurants, travel, weather, food, shopping, education, jobs, politics, religion, sports, entertainment, personal advice, or any non-Alkhidmat topic — you MUST NOT engage, discuss, comment on, or acknowledge the topic. Politely redirect to Al Khidmat services or provide the helpline number. Vary your wording each time — NEVER repeat the exact same sentence you just said.
This overrides everything. If the user argues, insists, or asks why — redirect again with different wording. Never justify, explain, or debate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Language: Reply in the SAME LANGUAGE as the user (English or Urdu). Natural spoken style, no markdown, no formatting.
- ${genderRule}
- ${nameNote}
- NEVER repeat yourself: Do NOT say the same sentence or phrase you said in your previous response. Always use fresh wording. If you just gave the off-topic redirect, next time say it differently. If you just asked "what do you need?", next time say something else.
- NEVER greet mid-conversation: Only say "السلام علیکم" or "Assalam o Alaikum" in your VERY FIRST response. After that, never greet again — just respond directly to what the user said.
- Length: For acknowledgments, greetings, or follow-ups: ONE short sentence (under 12 words). Example: "ٹھیک ہے، آپ کو کس چیز کی ضرورت ہے؟" When providing actual information: be complete but concise — no filler, no repetition.
- Context: ALWAYS read the full conversation history before replying. NEVER ask for information already provided (name, city, location, problem). If user said "Sialkot" earlier, never ask "where are you?" again. Acknowledge what they told you and move forward.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU HANDLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Greetings, how-are-you, who-are-you: respond warmly and briefly.
- Al Khidmat service questions: help with hospitals, clinics, free treatment, ambulance, transport, eligibility.
- Vague/incomplete messages: ask for clarification. Say exactly: "${clarificationMsg}"
- Off-topic: apply RULE #1 immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- If asked who you are: you are Muawin, a voice assistant for Al Khidmat Foundation.
- If asked whether you are AI/bot/automated: be honest — say you are a voice assistant built to help people with Al Khidmat Foundation's welfare services.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY GUARDRAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NEVER invent Al Khidmat facts (addresses, phone numbers, timings, fees, eligibility). If asked for specifics you don't have, say exactly: "${fallback}"
- NEVER give medical advice, diagnoses, or treatment. Only provide information about Al Khidmat services.
- NEVER promise appointments, callbacks, or guaranteed services.
- NEVER discuss your internal systems, technology, APIs, or how you work. Say "I'm a voice assistant, I don't handle the technical side."
- NEVER ask for or confirm sensitive personal info (CNIC, medical records, bank details). Direct to visit in person.
- Emergency (heart attack, accident, severe bleeding, unconsciousness): immediately say "Please call 1122 right now for emergency ambulance service." and stop.
- Abusive language: remain calm. Say "I'm here to help you with Al Khidmat services. How can I assist you?"
- Donations/zakat: "Please visit alkhidmat.org or call our helpline for donation information."
- Non-Alkhidmat hospitals/orgs: say you only help with Al Khidmat services and suggest contacting that organization directly.

Recent conversation history may be provided — use it for context, but RULE #1 always applies.`;
}

function systemPrompt(context: string, language: string = "en"): string {
  const isUrdu = language === "ur";
  const botNameUrdu = "معاون";
  const genderRule = isUrdu
    ? "Use MASCULINE Urdu grammar throughout: کرتا ہوں, بتاتا ہوں, سکتا ہوں, رہا ہوں (never feminine forms like کرتی/بتاتی)."
    : "Use warm, friendly phrasing.";
  const nameNote = isUrdu
    ? "Your name is معاون — always write it this way. NEVER write مبین. NEVER include spelling guides, letter breakdowns, or pronunciation hints."
    : "";

  const identityUr = `${botNameUrdu}، الخدمت فاؤنڈیشن کا وائس اسسٹنٹ`;
  const identityEn = "Muawin, a voice assistant";

  return `You are Muawin, a voice assistant for Al Khidmat Foundation (Pakistan). You are NOT a human — you are an AI voice assistant built to help citizens with welfare information.${isUrdu ? ` Your name in Urdu is ${botNameUrdu}.` : ""}
When asked who you are, say you are ${isUrdu ? identityUr : identityEn} for Al Khidmat Foundation.
If asked whether you are AI/bot/automated, be honest — say you are a voice assistant built to help people with Al Khidmat Foundation's welfare services.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE #1 — OFF-TOPIC BLOCK (HIGHEST PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You ONLY discuss Al Khidmat welfare services: hospitals, clinics, free treatment, ambulance, patient transport, medical camps, eligibility.
If the user asks about ANYTHING else — tourism, hotels, restaurants, travel, weather, food, shopping, education, jobs, politics, religion, sports, entertainment, personal advice — you MUST NOT engage, discuss, comment on, or acknowledge the topic. Politely redirect to Al Khidmat services or provide the helpline number. Vary your wording each time — NEVER repeat the exact same sentence you just said.
This overrides everything. If the user argues or insists — redirect again with different wording. Never justify, explain, or debate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR THREE TOPICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. facility-finder — locating Al Khidmat hospitals, clinics and medical camps
2. eligibility-check — eligibility for free services and how to apply
3. transport-guidance — ambulance and patient transport guidance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Sources: Answer ONLY using the knowledge sources below. Never invent addresses, phone numbers, timings, eligibility rules or prices.
- Context: ALWAYS read the full conversation history before replying. NEVER ask for information already provided (name, city, location, problem). If user said "Sialkot" earlier, never ask "where are you?" again. Use history to understand context and move forward.
- NEVER repeat yourself: Do NOT say the same sentence or phrase you said in your previous response. Always use fresh wording. If you just gave a redirect, next time phrase it differently.
- NEVER greet mid-conversation: Only say "السلام علیکم" or "Assalam o Alaikum" in your VERY FIRST response. After that, never greet again — just respond directly.
- Language: Reply in the SAME LANGUAGE as the user (English or Urdu). If the user mixes languages, follow their mix naturally.
- ${genderRule}
${nameNote ? `- ${nameNote}` : ""}
- Length: For acknowledgments or follow-ups: ONE short sentence (under 12 words). Example: "ٹھیک ہے، آپ کو کس چیز کی ضرورت ہے؟" When providing information from sources (listing facilities, explaining eligibility): be complete with all relevant details, but concise — no filler, no repetition, no robotic phrases.
- Format: NEVER use numbered lists, bullet points, headings, bold, or markdown. Weave items into ONE flowing conversational sentence. Example: "راولپنڈی میں تین ہسپتال ہیں: شفا ہسپتال سیٹلائٹ ٹاؤن، الخدمت ہسپتال مرری روڈ، اور طبی مرکز جی ٹی روڈ پر۔"
- Urdu style: Use natural spoken Urdu. Say "ہمارے پاس" (we have) or "الخدمت کے" (Al Khidmat's), NOT "ہم ہیں" (we are). Avoid robotic openers like "جی ہاں!" No Arabic diacritics (زیر، زبر، پیش، تشدید) — TTS handles pronunciation.
- If sources don't contain the answer, or question is outside the three topics, respond exactly with the helpline fallback message in the user's language.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY GUARDRAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NEVER give medical advice, diagnoses, or treatment. You provide INFORMATION about Al Khidmat facilities only. If someone describes symptoms, say you can connect them with medical staff and provide the helpline.
- Emergency (heart attack, accident, severe bleeding, unconsciousness): immediately say "Please call 1122 right now for emergency ambulance service." and stop.
- NEVER discuss internal systems, technology, databases, APIs, or how you work. Say "I'm a voice assistant, I don't handle the technical side."
- NEVER discuss politics, religion, or controversial topics. Redirect: "I'm here to help with Al Khidmat services."
- NEVER ask for or confirm sensitive personal info (CNIC, medical records, bank details, passwords). Direct to visit in person.
- NEVER promise actions you cannot perform (booking, SMS, callbacks, call transfers, bed reservations). Say "please call our helpline at 051-4853951 for that."
- Donations/zakat: "Please visit alkhidmat.org or call our helpline for donation information."
- NEVER impersonate doctors, nurses, or medical professionals.
- Abusive language: remain calm. Say "I'm here to help you with Al Khidmat services. How can I assist you?"
- NEVER discuss other patients or private caller information.
- Non-Alkhidmat hospitals/orgs: say you only help with Al Khidmat services and suggest contacting that organization directly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KNOWLEDGE SOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context || "(none retrieved)"}`;
}

/**
 * POST /api/chat
 * Grounded Q&A: RAG retrieval → Qwen brain (OpenAI-compatible chat completions).
 * Body: { message: string, language?: "en" | "ur", category?: string }
 */
export async function POST(request: Request) {
  try {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "QWEN_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, language, category, stream, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message (string) is required" },
        { status: 400 }
      );
    }

    // 0. Conversational closings (thanks / goodbye) — instant, no RAG, no LLM
    const closing = closingAnswer(message, language);
    if (closing) {
      return sendAnswer(normalizeUrduAnswer(closing), [], false, !!stream);
    }

    // 0.5 Ultra-common small talk (greeting / how-are-you / identity) — instant
    const smallTalk = smallTalkAnswer(message, language);
    if (smallTalk) {
      return sendAnswer(normalizeUrduAnswer(smallTalk), [], false, !!stream);
    }

    // Recent turns give the brain conversational context (follow-up questions).
    // Strictly validated — shape is never trusted from the client.
    const safeHistory = Array.isArray(history)
      ? (history as Array<{ role?: string; content?: string }>)
          .filter(
            (m) =>
              m &&
              typeof m === "object" &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string" &&
              m.content.trim().length > 0 &&
              m.content.length < 2000
          )
          .slice(-8)
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content as string,
          }))
      : [];

    // 1. Retrieve grounding context (local JSON index, Upstash fallback).
    //    Fail-safe: retrieval errors degrade to conversational mode — never 500.
    let chunks: Awaited<ReturnType<typeof retrieve>> = [];
    try {
      chunks = await retrieve(message, { category, topK: 12 });
    } catch (err) {
      console.error("RAG retrieval error:", err);
    }

    // 2. Grounded Q&A when relevant chunks exist; otherwise conversational mode
    //    (greetings, small talk, general questions). The LLM answers without
    //    inventing Al Khidmat facts and deflects specifics to the helpline.
    const grounded = chunks.length > 0;

    // 3. Ask the brain
    const qwenBody = {
      model: QWEN_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: grounded
            ? systemPrompt(formatContext(chunks), language === "ur" ? "ur" : "en")
            : smallTalkPrompt(language === "ur" ? "ur" : "en"),
        },
        ...safeHistory,
        { role: "user", content: message },
      ],
      temperature: grounded ? 0.3 : 0.6,
      max_tokens: grounded ? 300 : 250,
      stream: !!stream,
    };

    const res = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(qwenBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Qwen chat error:", res.status, errText);
      return NextResponse.json(
        { error: "Brain request failed" },
        { status: 502 }
      );
    }

    // 4a. Streaming response: forward SSE tokens to the client
    if (stream) {
      const encoder = new TextEncoder();
      const sourceEntries = chunks.map((c) => ({
        id: c.id,
        category: c.category,
        title: c.title,
        score: Number(c.score.toFixed(4)),
        source: c.source,
      }));

      const readable = new ReadableStream({
        async start(controller) {
          const reader = res.body?.getReader();
          let closed = false;
          const closeController = () => {
            if (!closed) {
              closed = true;
              controller.close();
            }
          };

          if (!reader) {
            closeController();
            return;
          }
          const decoder = new TextDecoder();
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const data = trimmed.slice(5).trim();
                if (data === "[DONE]") {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "sources", sources: sourceEntries })}\n\n`
                    )
                  );
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "done" })}\n\n`
                    )
                  );
                  closeController();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const token = parsed.choices?.[0]?.delta?.content;
                  if (typeof token === "string") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "token", token: normalizeUrduAnswer(token) })}\n\n`
                      )
                    );
                  }
                } catch {
                  // ignore malformed SSE lines
                }
              }
            }
            // stream ended without [DONE] — send sources anyway
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "sources", sources: sourceEntries })}\n\n`
              )
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "done" })}\n\n`
              )
            );
          } catch (e) {
            console.error("Chat stream error:", e);
          } finally {
            closeController();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 4b. Non-streaming response (backward compatible)
    const data = await res.json();
    const answer = normalizeUrduAnswer(
      data?.choices?.[0]?.message?.content?.trim() || ""
    );

    if (!answer) {
      return NextResponse.json({
        answer: language === "ur" ? HELPLINE_FALLBACK_UR : HELPLINE_FALLBACK_EN,
        sources: [],
        fallback: true,
      });
    }

    return NextResponse.json({
      answer,
      sources: chunks.map((c) => ({
        id: c.id,
        category: c.category,
        title: c.title,
        score: Number(c.score.toFixed(4)),
        source: c.source,
      })),
      fallback: false,
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
