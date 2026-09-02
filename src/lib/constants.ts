/* ── Brand & header ────────────────────────────────────── */
export const BRAND_NAME = "Muawin";

export const HEADER_STATUS_ITEMS = [
  { label: "Secure by Design", active: false },
  { label: "Multilingual Support", active: false },
  { label: "Demo Assistant", active: true },
] as const;

/* ── Hero ──────────────────────────────────────────────── */
export const HERO_HEADING = "Muawin";
export const HERO_SUBHEADING =
  "Voice-powered welfare assistance in English and Urdu";

/* ── Language toggle ───────────────────────────────────── */
export const LANGUAGE_OPTIONS = [
  { value: "ur" as const, label: "اردو" },
  { value: "en" as const, label: "English" },
] as const;

/* ── Call / Transcript panel strings ──────────────────────
   Moved to lib/translations.ts for i18n support.          */

/* ── Footer ────────────────────────────────────────────── */
export const FOOTER_COPYRIGHT = "© 2024 Al Khidmat Foundation. All rights reserved.";

export const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Contact Support",
] as const;
