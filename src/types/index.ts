/** Supported UI languages */
export type Language = "en" | "ur";

/** Call status for the voice-assistant simulation */
export type CallStatus = "idle" | "listening";

/** Props for the reusable Button component */
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  icon?: React.ReactNode;
}

/** Props for the Badge / status-pill component */
export interface BadgeProps {
  label: string;
  active?: boolean;
  underline?: boolean;
}

/** Props for the ToggleSwitch component */
export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Props for the LanguageToggle segmented control */
export interface LanguageToggleProps {
  activeLanguage: Language;
  onChange: (lang: Language) => void;
}

/** Resolved translation strings (shape defined in lib/translations.ts) */
export interface Translations {
  readyToAssist: string;
  listening: string;
  startCall: string;
  endCall: string;
  liveTranscript: string;
  transcriptEmpty: string;
  listeningForSpeech: string;
  mute: string;
  unmute: string;
}

/** Props for the CallPanel */
export interface CallPanelProps {
  status: CallStatus;
  onStartCall: () => void;
  locale: Language;
  t: Translations;
  muted: boolean;
  onToggleMute: () => void;
}

/** Props for the TranscriptPanel */
export interface TranscriptPanelProps {
  transcriptEnabled: boolean;
  onToggleTranscript: (enabled: boolean) => void;
  callActive: boolean;
  locale: Language;
  t: Translations;
  messages: ChatMessage[];
  interimText?: string;
  streamingText?: string;
}

/** A single chat message */
export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  timestamp: string;
}
