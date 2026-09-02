import type { Language } from "@/types";

/* ── Translation strings for the call-card area ────────── */
const translations = {
  en: {
    readyToAssist: "READY TO ASSIST",
    listening: "LISTENING...",
    startCall: "Start Call",
    endCall: "End Call",
    liveTranscript: "Live Transcript",
    transcriptEmpty:
      "Transcript will appear here once the call starts.",
    listeningForSpeech: "Listening for speech...",
    mute: "Mute",
    unmute: "Unmute",
  },
  ur: {
    readyToAssist: "مدد کے لیے تیار",
    listening: "سن رہا ہے...",
    startCall: "کال شروع کریں",
    endCall: "کال ختم کریں",
    liveTranscript: "لائیو ٹرانسکرپٹ",
    transcriptEmpty:
      "کال شروع ہونے کے بعد ٹرانسکرپٹ یہاں ظاہر ہوگی۔",
    listeningForSpeech: "تقریر سن رہا ہے...",
    mute: "میوٹ",
    unmute: "ان میوٹ",
  },
} as const;

/** Resolved translation shape for one locale */
export type Translations = (typeof translations)[Language];

/** Return the translation object for the given locale */
export function getTranslations(locale: Language): Translations {
  return translations[locale];
}

export default translations;
