"use client";

import { CircleDot, Mic, MicOff } from "lucide-react";
import type { CallPanelProps } from "@/types";
import Button from "@/components/ui/Button";

/**
 * Left column of the main content card.
 * Shows a sound-wave orbit icon, call-status label, and a Start/End Call button.
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

  /** Status label resolves to the correct translated string */
  const statusLabel =
    status === "listening" ? t.listening : t.readyToAssist;

  /** Button label toggles between Start / End */
  const buttonLabel = status === "listening" ? t.endCall : t.startCall;

  /** Mute label toggles based on muted state */
  const muteLabel = muted ? t.unmute : t.mute;

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`flex h-full flex-col items-center justify-center gap-6 py-10 px-6 ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      {/* ── Sound-wave orbit icon ────────────────────────── */}
      <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-blue-100 bg-[#EEF0FB]">
        <div className="flex items-center gap-[5px]">
          <span className="block h-6 w-[5px] rounded-full bg-[#0F5CC3]" />
          <span className="block h-10 w-[5px] rounded-full bg-[#0F5CC3]" />
          <span className="block h-14 w-[5px] rounded-full bg-[#0F5CC3]" />
          <span className="block h-10 w-[5px] rounded-full bg-[#0F5CC3]" />
          <span className="block h-6 w-[5px] rounded-full bg-[#0F5CC3]" />
        </div>
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
