"use client";

import { useRef, useEffect } from "react";
import { Circle, Bot, User } from "lucide-react";
import type { TranscriptPanelProps } from "@/types";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

/**
 * Right column of the main content card.
 * Shows a scrollable transcript of user ↔ bot messages.
 */
export default function TranscriptPanel({
  transcriptEnabled,
  onToggleTranscript,
  callActive,
  locale,
  t,
  messages,
  interimText,
  streamingText,
}: TranscriptPanelProps) {
  const isUrdu = locale === "ur";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages or live text changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText, streamingText]);

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`flex h-full flex-col gap-4 py-6 px-5 ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      {/* ── Toggle ───────────────────────────────────────── */}
      <ToggleSwitch
        label={t.liveTranscript}
        checked={transcriptEnabled}
        onChange={onToggleTranscript}
      />

      {/* ── Transcript area (scrollable) ─────────────────── */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col overflow-y-auto rounded-2xl bg-[#EEF1F8] px-4 py-4"
        style={{ maxHeight: "380px", minHeight: "260px" }}
      >
        {messages.length === 0 && !interimText && !streamingText ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Circle className="mb-3 h-5 w-5 text-gray-300" />
            <p className="text-center text-sm text-gray-400">
              {callActive && transcriptEnabled
                ? t.listeningForSpeech
                : t.transcriptEmpty}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  msg.role === "user"
                    ? isUrdu
                      ? "justify-start"
                      : "justify-end"
                    : isUrdu
                      ? "justify-end"
                      : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F5CC3]">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-[#0F5CC3] text-white"
                      : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={`text-[10px] ${
                        msg.role === "user" ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-3.5 w-3.5 text-[#0F5CC3]" />
                  </div>
                )}
              </div>
            ))}

            {/* User interim (still speaking) */}
            {interimText && (
              <div
                className={`flex gap-2 ${
                  isUrdu ? "justify-start" : "justify-end"
                }`}
              >
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#0F5CC3] px-3.5 py-2.5 text-sm leading-relaxed text-white opacity-70">
                  <p className="whitespace-pre-line">{interimText}</p>
                </div>
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-3.5 w-3.5 text-[#0F5CC3]" />
                </div>
              </div>
            )}

            {/* Bot streaming (typing) */}
            {streamingText && (
              <div
                className={`flex gap-2 ${
                  isUrdu ? "justify-end" : "justify-start"
                }`}
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F5CC3]">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm">
                  <p className="whitespace-pre-line">{streamingText}</p>
                  <span className="mt-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#0F5CC3]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
