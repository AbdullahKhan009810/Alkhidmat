import { NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── TTS engines ──
const UPLIFTAI_BASE_URL = "https://api.upliftai.org/v1";
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// Simple in-memory cache (key = hash of raw text + language → Buffer)
const audioCache = new Map<string, { buffer: Buffer; mimeType: string; ts: number }>();
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const CACHE_MAX_SIZE = 50;

function cacheKey(text: string, language: string): string {
  let hash = 0;
  const str = text + "|" + language;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function getFromCache(text: string, language: string): { buffer: Buffer; mimeType: string } | null {
  const key = cacheKey(text, language);
  const entry = audioCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_MAX_AGE_MS) {
    audioCache.delete(key);
    return null;
  }
  return { buffer: entry.buffer, mimeType: entry.mimeType };
}

function setInCache(text: string, language: string, buffer: Buffer, mimeType: string) {
  if (audioCache.size >= CACHE_MAX_SIZE) {
    const oldest = audioCache.keys().next().value;
    if (oldest) audioCache.delete(oldest);
  }
  audioCache.set(cacheKey(text, language), { buffer, mimeType, ts: Date.now() });
}

function readEnvValue(name: string): string | undefined {
  const cached = getEnvCache();
  return cached[name] ?? process.env[name];
}

/* ── .env cache (avoids re-reading disk on every TTS request) ── */
let envCache: { mtime: number; values: Record<string, string> } | null = null;

function getEnvCache(): Record<string, string> {
  try {
    const envPath = join(process.cwd(), ".env");
    const mtime = statSync(envPath).mtimeMs;
    if (envCache && mtime === envCache.mtime) return envCache.values;

    const values: Record<string, string> = {};
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      values[t.slice(0, i)] = t
        .slice(i + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
    }
    envCache = { mtime, values };
    return values;
  } catch {
    return {};
  }
}

function getUpliftApiKey(): string | undefined {
  return readEnvValue("UPLIFTAI_API_KEY") || process.env.UPLIFTAI_API_KEY;
}

function getElevenLabsApiKey(): string | undefined {
  return readEnvValue("ELEVENLABS_API_KEY") || process.env.ELEVENLABS_API_KEY;
}

function getElevenLabsDictId(): string | undefined {
  return readEnvValue("ELEVENLABS_PRONUNCIATION_DICT_ID") || process.env.ELEVENLABS_PRONUNCIATION_DICT_ID;
}

/** Wrap raw 16-bit mono PCM bytes in a WAV header so browsers can play it */
function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

/** Preprocess text to fix TTS pronunciation issues (all engines) */
function preprocessForTTS(text: string, language: string): string {
  let processed = text;

  // ── Step 1: Convert Urdu/Arabic numerals to Latin digits ──
  // LLM often outputs ۰۵۱-۴۸۵۳۹۵۱ instead of 051-4853951
  const urduDigitMap: Record<string, string> = {
    "\u06F0": "0", "\u06F1": "1", "\u06F2": "2", "\u06F3": "3", "\u06F4": "4",
    "\u06F5": "5", "\u06F6": "6", "\u06F7": "7", "\u06F8": "8", "\u06F9": "9",
    // Arabic-Indic digits (also used in Urdu text)
    "\u0660": "0", "\u0661": "1", "\u0662": "2", "\u0663": "3", "\u0664": "4",
    "\u0665": "5", "\u0666": "6", "\u0667": "7", "\u0668": "8", "\u0669": "9",
  };
  processed = processed.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (d) => urduDigitMap[d] || d);

  // ── Step 2: Spell out common acronyms so TTS reads letter-by-letter ──
  processed = processed.replace(/\bCNIC\b/g, "C N I C");
  processed = processed.replace(/\bBISP\b/g, "B I S P");
  processed = processed.replace(/\bOPD\b/g, "O P D");
  processed = processed.replace(/\bICU\b/g, "I C U");
  processed = processed.replace(/\bNICU\b/g, "N I C U");
  processed = processed.replace(/\bALS\b/g, "A L S");
  processed = processed.replace(/\bCPR\b/g, "C P R");
  processed = processed.replace(/\bCKD\b/g, "C K D");
  processed = processed.replace(/\bIV\b/g, "I V");
  processed = processed.replace(/\bBP\b/g, "B P");

  // ── Step 3: Phone numbers & emergency digits — digit-by-digit with pauses ──
  // "1122" → "1 1, 2 2"
  processed = processed.replace(/\b1122\b/g, "1 1, 2 2");
  // Phone numbers with dashes: NNN-NNNNNNN+ (e.g. 051-4853951)
  // Group digits in 3s with commas for natural pausing
  processed = processed.replace(/\b(\d{2,})-(\d{4,})\b/g, (_m, a: string, b: string) => {
    const groupDigits = (s: string) => {
      const digits = s.split("");
      const groups: string[] = [];
      for (let i = 0; i < digits.length; i += 3) {
        groups.push(digits.slice(i, i + 3).join(" "));
      }
      return groups.join(", ");
    };
    return groupDigits(a) + ", " + groupDigits(b);
  });
  // Standalone long digit sequences (e.g. 03001234567)
  processed = processed.replace(/\b(\d{6,})\b/g, (_m, d: string) => {
    const digits = d.split("");
    const groups: string[] = [];
    for (let i = 0; i < digits.length; i += 3) {
      groups.push(digits.slice(i, i + 3).join(" "));
    }
    return groups.join(", ");
  });

  // ── Step 4: Language-specific replacements ──
  if (language === "ur") {
    processed = processed.replace(/24\s*[\/]\s*7/g, "چوبیس گھنٹے");
    processed = processed.replace(/\bDr\./g, "ڈاکٹر");
    processed = processed.replace(/\bMr\./g, "مسٹر");
    processed = processed.replace(/\bRs\./g, "روپے");
  } else {
    processed = processed.replace(/24\s*[\/]\s*7/g, "twenty-four seven");
    processed = processed.replace(/\bDr\./g, "Doctor");
    processed = processed.replace(/\bMr\./g, "Mister");
    processed = processed.replace(/\bRs\./g, "rupees");
  }
  return processed;
}

/** Uplift AI TTS — native Urdu, ~1.3s warm (15s timeout covers cold start) */
async function synthesizeWithUplift(
  apiKey: string,
  voiceId: string,
  text: string,
  outputFormat: string,
  timeoutMs = 15000
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${UPLIFTAI_BASE_URL}/synthesis/text-to-speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voiceId,
        text,
        outputFormat,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.error("Uplift AI TTS timed out after", timeoutMs, "ms");
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** ElevenLabs TTS — Flash v2.5, ~550ms warm (fallback, 12s timeout) */
async function synthesizeWithElevenLabs(
  apiKey: string,
  model: string,
  voiceId: string,
  text: string,
  timeoutMs = 12000,
  dictId?: string
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    text,
    model_id: model,
    voice_settings: { stability: 0.5, similarity_boost: 0.8, speed: 0.85 },
  };

  if (dictId) {
    body.pronunciation_dictionary_locators = [
      { pronunciation_dictionary_id: dictId },
    ];
  }

  try {
    return await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.error("ElevenLabs TTS timed out after", timeoutMs, "ms");
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * POST /api/tts
 * Language-based routing: Urdu → Uplift AI (native), English → ElevenLabs (Eman).
 * Fallback: if primary engine fails, tries the other.
 * Body: { text: string, language?: "en" | "ur" }
 * Returns: Raw audio bytes with Content-Type header
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { text, language } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text (string) required" },
        { status: 400 }
      );
    }

    const lang = language || "en";

    // Check cache first
    const cached = getFromCache(text, lang);
    if (cached) {
      const elapsed = Date.now() - startTime;
      console.log(`TTS → cache | ${elapsed}ms | ${cached.buffer.length} bytes | lang=${lang}`);
      return new Response(new Uint8Array(cached.buffer), {
        headers: {
          "Content-Type": cached.mimeType,
          "Content-Length": cached.buffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const processedText = preprocessForTTS(text, lang);

    let res: Response | null = null;
    let usedEngine = "unknown";

    if (lang === "ur") {
      // ── Urdu → Uplift AI (native Urdu pronunciation) ──
      const upliftKey = getUpliftApiKey();
      const upliftVoice = readEnvValue("UPLIFTAI_TTS_VOICE") || "broadband-support";
      const upliftFormat = readEnvValue("UPLIFTAI_TTS_FORMAT") || "MP3_22050_128";
      usedEngine = "uplift";

      if (upliftKey) {
        res = await synthesizeWithUplift(upliftKey, upliftVoice, processedText, upliftFormat);
        if (res && !res.ok) {
          const errText = await res.text();
          console.error("Uplift AI TTS failed:", res.status, errText.slice(0, 200));
          res = null;
        }
      }

      // Fallback to ElevenLabs (Tisha) if Uplift failed
      if (!res) {
        usedEngine = "elevenlabs-fallback";
        const elevenKey = getElevenLabsApiKey();
        if (elevenKey) {
          const elevenModel = readEnvValue("ELEVENLABS_TTS_MODEL") || "eleven_flash_v2_5";
          const elevenVoice = readEnvValue("ELEVENLABS_TTS_VOICE") || "bDtMCYxVamQmyfwV5aqg";
          const elevenDictId = getElevenLabsDictId();
          res = await synthesizeWithElevenLabs(elevenKey, elevenModel, elevenVoice, processedText, 12000, elevenDictId);
          if (res && !res.ok) {
            console.error("ElevenLabs fallback failed:", res.status);
            res = null;
          }
        }
      }
    } else {
      // ── English → ElevenLabs (Eman voice, Flash v2.5) ──
      const elevenKey = getElevenLabsApiKey();
      usedEngine = "elevenlabs";

      if (elevenKey) {
        const elevenModel = readEnvValue("ELEVENLABS_TTS_MODEL") || "eleven_flash_v2_5";
        const elevenVoice = readEnvValue("ELEVENLABS_TTS_VOICE_EN") || "aQLnnbQ6J7JYyvxnNgjx";
        res = await synthesizeWithElevenLabs(elevenKey, elevenModel, elevenVoice, processedText);
        if (res && !res.ok) {
          const errText = await res.text();
          console.error("ElevenLabs English TTS failed:", res.status, errText.slice(0, 200));
          res = null;
        }
      }

      // Fallback to Uplift if ElevenLabs failed
      if (!res) {
        usedEngine = "uplift-fallback";
        const upliftKey = getUpliftApiKey();
        if (upliftKey) {
          const upliftFormat = readEnvValue("UPLIFTAI_TTS_FORMAT") || "MP3_22050_128";
          res = await synthesizeWithUplift(upliftKey, "broadband-support", processedText, upliftFormat);
          if (res && !res.ok) {
            console.error("Uplift fallback failed:", res.status);
            res = null;
          }
        }
      }
    }

    if (!res) {
      return NextResponse.json(
        { error: "TTS synthesis failed" },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    const audioBuffer = Buffer.from(await res.arrayBuffer());

    let finalBuffer: Buffer = audioBuffer;
    let mimeType = contentType.split(";")[0] || "audio/mpeg";

    // Convert PCM to WAV for browser playback (some engines return raw PCM)
    if (mimeType === "audio/pcm") {
      const rateMatch = contentType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      finalBuffer = pcmToWav(audioBuffer, sampleRate);
      mimeType = "audio/wav";
    }

    // Cache the result
    setInCache(text, lang, finalBuffer, mimeType);

    const elapsed = Date.now() - startTime;
    console.log(`TTS → ${usedEngine} | ${elapsed}ms | ${finalBuffer.length} bytes | lang=${lang}`);

    return new Response(new Uint8Array(finalBuffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": finalBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
