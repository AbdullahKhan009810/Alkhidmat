"use client";

import { CircleDot, Mic, MicOff } from "lucide-react";
import type { CallPanelProps } from "@/types";
import Button from "@/components/ui/Button";

/** Animated SVG logo — jumping bars only, wave stays static */
function AnimatedVoiceLogo({ active }: { active: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <style>{`
        @keyframes jump1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes jump2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes jump3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes jump4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes jump5 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .bar { transform-origin: center bottom; }
        .bar1 { animation: jump1 0.8s ease-in-out infinite; }
        .bar2 { animation: jump2 0.8s 0.1s ease-in-out infinite; }
        .bar3 { animation: jump3 0.8s 0.2s ease-in-out infinite; }
        .bar4 { animation: jump4 0.8s 0.3s ease-in-out infinite; }
        .bar5 { animation: jump5 0.8s 0.4s ease-in-out infinite; }
      `}</style>

      {/* Wave on top — always static */}
      <path
        d="M28 22 C32 16, 36 28, 40 22 C44 16, 48 28, 52 22"
        stroke="#0F5CC3"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* 5 vertical bars */}
      <rect className={`bar ${active ? "bar1" : ""}`} x="22" y="34" width="5" height="16" rx="2.5" fill="#0F5CC3" opacity="0.5" />
      <rect className={`bar ${active ? "bar2" : ""}`} x="31" y="30" width="5" height="24" rx="2.5" fill="#0F5CC3" opacity="0.7" />
      <rect className={`bar ${active ? "bar3" : ""}`} x="40" y="26" width="5" height="32" rx="2.5" fill="#0F5CC3" />
      <rect className={`bar ${active ? "bar4" : ""}`} x="49" y="30" width="5" height="24" rx="2.5" fill="#0F5CC3" opacity="0.7" />
      <rect className={`bar ${active ? "bar5" : ""}`} x="58" y="34" width="5" height="16" rx="2.5" fill="#0F5CC3" opacity="0.5" />
    </svg>
  );
}

/**
 * Left column of the main content card.
 * Shows an animated orbit icon, call-status label, and a Start/End Call button.
 * All text is driven by the `t` translation prop; RTL + Urdu font
 * are applied conditionally when locale is "ur".
 */
export default function CallPanel({
  status,
  onStartCall,
  locale,
  t,
  muted,
  onToggleMute,
}: CallPanelProps) {
  const isUrdu = locale === "ur";
  const isActive = status === "listening";

  /** Status label resolves to the correct translated string */
  const statusLabel = isActive ? t.listening : t.readyToAssist;

  /** Button label toggles between Start / End */
  const buttonLabel = isActive ? t.endCall : t.startCall;

  /** Mute label toggles based on muted state */
  const muteLabel = muted ? t.unmute : t.mute;

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`flex h-full flex-col items-center justify-center gap-6 py-10 px-6 ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      {/* ── Orbit icon with animated logo ───────────────── */}
      <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-blue-100 bg-[#EEF0FB]">
        <AnimatedVoiceLogo active={isActive} />
      </div>

      {/* ── Status indicator ─────────────────────────────── */}
      <div
        className={`flex items-center gap-2 text-sm font-medium tracking-wide text-gray-500 ${
          isUrdu ? "flex-row-reverse" : ""
        }`}
      >
        <CircleDot
          className={`h-3 w-3 ${
            status === "listening" ? "text-green-500" : "text-gray-400"
          }`}
        />
        <span>{statusLabel}</span>
      </div>

      {/* ── Action buttons ───────────────────────────────── */}
      {status === "listening" ? (
        <div className="flex items-center gap-3">
          <Button onClick={onStartCall} icon={<CircleDot className="h-4 w-4" />}>
            {buttonLabel}
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleMute}
            icon={muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            className={muted ? "text-red-500 hover:bg-red-50" : ""}
          >
            {muteLabel}
          </Button>
        </div>
      ) : (
        <Button onClick={onStartCall} icon={<CircleDot className="h-4 w-4" />}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
