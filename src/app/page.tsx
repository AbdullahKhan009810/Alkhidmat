"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Language, CallStatus, ChatMessage } from "@/types";
import { getTranslations } from "@/lib/translations";
import Header from "@/components/Header";
import LanguageToggle from "@/components/LanguageToggle";
import CallPanel from "@/components/CallPanel";
import TranscriptPanel from "@/components/TranscriptPanel";
import Footer from "@/components/Footer";
import Toast, { type ToastType } from "@/components/ui/Toast";
import { HERO_HEADING, HERO_SUBHEADING } from "@/lib/constants";

/** Split buffered text into complete sentences, leaving the rest unflushed. */
function flushSentences(buffer: string): { sentences: string[]; remaining: string } {
  const terminators = /[.!?۔؟]/;
  const sentences: string[] = [];
  let remaining = buffer;
  while (true) {
    const idx = remaining.search(terminators);
    if (idx === -1) break;
    const end = idx + 1;
    const sentence = remaining.slice(0, end).trim();
    if (sentence) sentences.push(sentence);
    remaining = remaining.slice(end).trimStart();
  }
  return { sentences, remaining };
}

/** Fix common Urdu misspellings the LLM makes (e.g. الکھدمت → الخدمت, مبین → معاون) */
function normalizeUrdu(text: string): string {
  return text
    .replace(/الکھدمت/g, "الخدمت")
    .replace(/کھدمت/g, "خدمت")
    .replace(/مبین/g, "معاون");
}

/** Greeting spoken when a call starts (masculine Urdu for male voice, feminine English for female voice) */
const GREETINGS: Record<Language, string> = {
  en: "Assalam o Alaikum! This is Fatima from Al Khidmat Foundation. How can I help you?",
  ur: "السلام علیکم! میں الخدمت فاؤنڈیشن سے بات کر رہا ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟",
};

export default function Home() {
  /* ── State ──────────────────────────────────────────── */
  const [language, setLanguage] = useState<Language>("en");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcriptEnabled, setTranscriptEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [muted, setMuted] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [streamingText, setStreamingText] = useState("");

  /* ── Refs for audio queue + recognition lifecycle ─── */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callActiveRef = useRef(false);
  const audioQueueRef = useRef<string[]>([]);
  const playingRef = useRef(false);
  const ttsChainRef = useRef<Promise<void>>(Promise.resolve());
  const audioGenerationRef = useRef(0);
  callActiveRef.current = callStatus === "listening" && !muted;

  /* Mirror of messages state — lets handleChat read the latest turns without
     a stale closure (same pattern as callActiveRef) */
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  /* ── Derived translations for current locale ───────── */
  const t = getTranslations(language);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /** Play queued audio clips one after another */
  const playNextAudio = useCallback(async () => {
    if (playingRef.current) return;
    const next = audioQueueRef.current.shift();
    if (!next) return;

    playingRef.current = true;
    try {
      const audio = new Audio(next);
      audioRef.current = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      if (next.startsWith("blob:")) {
        URL.revokeObjectURL(next);
      }
    } finally {
      playingRef.current = false;
      playNextAudio();
    }
  }, []);

  /** Fetch TTS audio in sentence order and enqueue it for sequential playback */
  const speak = useCallback((text: string, locale: Language) => {
    const generation = audioGenerationRef.current;

    const task = ttsChainRef.current.then(async () => {
      if (generation !== audioGenerationRef.current) return;

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: locale === "ur" ? "ur" : "en" }),
        });
        if (!res.ok || generation !== audioGenerationRef.current) return;
        
        // Get raw audio blob directly (no base64 overhead)
        const blob = await res.blob();
        if (generation !== audioGenerationRef.current) return;

        const url = URL.createObjectURL(blob);
        audioQueueRef.current.push(url);
        playNextAudio();
      } catch (err) {
        console.error("TTS playback failed:", err);
      }
    });

    ttsChainRef.current = task.catch(() => undefined);
    return task;
  }, [playNextAudio]);

  /** Append a finished user transcript line */
  const pushUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: text, timestamp: getCurrentTime() },
    ]);
  }, []);

  /** Append a bot answer line */
  const pushBotMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "bot" as const, content: text, timestamp: getCurrentTime() },
    ]);
  }, []);

  /** Stream the bot reply and speak complete sentences as they arrive */
  const handleChat = useCallback(async (text: string) => {
    try {
      // Recent turns give the brain context (follow-ups like "and in Pindi?")
      const prior = [...messagesRef.current];
      const lastMsg = prior[prior.length - 1];
      if (lastMsg && lastMsg.role === "user" && lastMsg.content === text) {
        prior.pop(); // current question is sent separately — never duplicate it
      }
      const history = prior.slice(-8).map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language, stream: true, history }),
      });
      if (!res.ok || !res.body) {
        console.error("Chat request failed:", res.status);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";
      let unspokenBuffer = "";
      setStreamingText("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(5).trim());
            if (parsed.type === "token") {
              fullAnswer += parsed.token;
              unspokenBuffer += parsed.token;
              setStreamingText(normalizeUrdu(fullAnswer));

              const flushed = flushSentences(unspokenBuffer);
              unspokenBuffer = flushed.remaining;
              for (const sentence of flushed.sentences) {
                speak(normalizeUrdu(sentence), language);
              }
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }

      // Speak anything left after the stream ends
      const final = unspokenBuffer.trim();
      if (final) {
        speak(normalizeUrdu(final), language);
      }
      if (fullAnswer.trim()) {
        pushBotMessage(normalizeUrdu(fullAnswer.trim()));
      }
      setStreamingText("");
    } catch (err) {
      console.error("Chat request failed:", err);
    }
  }, [language, speak, pushBotMessage]);

  /* ── Pre-generate greeting audio so playback is instant on click ── */
  const greetingCacheRef = useRef<Partial<Record<Language, string>>>({});
  const greetingPendingRef = useRef<Partial<Record<Language, boolean>>>({});

  /* ── Warm the embedding API + TTS engine while the user reads the UI ── */
  useEffect(() => {
    fetch("/api/warmup").catch(() => undefined);
  }, []);

  useEffect(() => {
    // Guard prevents duplicate fetches (incl. React dev-mode double effects)
    if (greetingCacheRef.current[language] || greetingPendingRef.current[language]) {
      return;
    }
    greetingPendingRef.current[language] = true;
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: GREETINGS[language],
        language: language === "ur" ? "ur" : "en",
      }),
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (blob) {
          greetingCacheRef.current[language] = URL.createObjectURL(blob);
        }
      })
      .catch((err) => console.error("Greeting pre-warm failed:", err))
      .finally(() => {
        greetingPendingRef.current[language] = false;
      });
  }, [language]);

  /* ── Live speech recognition while the call is active ───── */
  useEffect(() => {
    if (callStatus !== "listening" || muted) return;

    const SR =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setToast({
        message: "Voice input needs Chrome or Edge on this device.",
        type: "error",
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = language === "ur" ? "ur-PK" : "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      // Ignore all user speech while bot is speaking
      if (playingRef.current) return;

      const last = e.results[e.results.length - 1];
      const text = String(last[0]?.transcript || "").trim();

      if (!last?.isFinal) {
        setInterimText(text);
        return;
      }

      setInterimText("");
      if (!text) return;

      pushUserMessage(text);
      handleChat(text);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setToast({
          message: "Microphone access denied — allow mic permission and retry.",
          type: "error",
        });
      }
    };

    // Chrome stops after silence — keep restarting while the call is live
    rec.onend = () => {
      if (callActiveRef.current) {
        try {
          rec.start();
        } catch {
          /* restart race — ignore */
        }
      }
    };

    try {
      rec.start();
    } catch {
      /* ignore */
    }

    return () => {
      rec.onend = null;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };
  }, [callStatus, muted, language, handleChat, pushUserMessage]);

  /** Save conversation to database */
  const saveConversationToDB = useCallback(async () => {
    if (messages.length === 0) return;

    setToast({ message: "Saving conversation to database...", type: "loading" });

    try {
      const sessionId = `TR-${Date.now().toString(36).toUpperCase()}`;
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          language,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      setToast({ message: `Conversation saved! (${messages.length} messages)`, type: "success" });
    } catch (err) {
      console.error("Failed to save conversation:", err);
      setToast({ message: `Error: ${err instanceof Error ? err.message : "Failed to save"}`, type: "error" });
    }
  }, [language, messages]);

  /** Toggle between idle ↔ listening on each click */
  const handleStartCall = useCallback(() => {
    // Side effects live outside the state updater so they never run twice
    if (callStatus === "idle") {
      const greeting = GREETINGS[language];
      setMessages([
        { role: "bot", content: greeting, timestamp: getCurrentTime() },
      ]);
      const cached = greetingCacheRef.current[language];
      if (cached) {
        // Pre-generated audio — plays instantly
        const greetingAudio = new Audio(cached);
        audioRef.current = greetingAudio;
        greetingAudio
          .play()
          .catch((err) => console.error("Greeting playback failed:", err));
      } else {
        // Not pre-warmed yet — fetch live
        speak(greeting, language);
      }
      setCallStatus("listening");
    } else {
      // Ending call — stop audio, clear queue, save conversation to database
      audioGenerationRef.current += 1;
      ttsChainRef.current = Promise.resolve();
      audioRef.current?.pause();
      audioQueueRef.current = [];
      playingRef.current = false; // force-unblock playNextAudio
      saveConversationToDB();
      setCallStatus("idle");
    }
  }, [callStatus, language, speak, saveConversationToDB]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Header ──────────────────────────────────────── */}
      <Header />

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {HERO_HEADING}
          </h1>
          <p className="mt-3 text-base text-gray-500">{HERO_SUBHEADING}</p>
        </section>

        {/* Two-column card */}
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white md:min-h-[480px]">
          {/* ── Language toggle row (inside card, top) ──── */}
          <div className="flex justify-center border-b border-gray-200 py-4">
            <LanguageToggle
              activeLanguage={language}
              onChange={setLanguage}
            />
          </div>

          {/* ── Two-column content ──────────────────────── */}
          <div className="grid h-full grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
            {/* Left: Call panel */}
            <CallPanel
              status={callStatus}
              onStartCall={handleStartCall}
              locale={language}
              t={t}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />

            {/* Right: Transcript panel */}
            <TranscriptPanel
              transcriptEnabled={transcriptEnabled}
              onToggleTranscript={setTranscriptEnabled}
              callActive={callStatus === "listening"}
              locale={language}
              t={t}
              messages={messages}
              interimText={interimText}
              streamingText={streamingText}
            />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* ── Toast Notification ──────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
