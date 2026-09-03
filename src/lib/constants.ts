/* ── Brand & header ────────────────────────────────────── */
export const BRAND_NAME = "Muawin";

/* ── Hero ──────────────────────────────────────────────── */
export const HERO_HEADING = "Muawin";
export const HERO_SUBTITLE = "Demo Assistant";
export const HERO_SUBHEADING =
  "AI Voice-Powered welfare assistance in multiple languages";

/* ── Language toggle ───────────────────────────────────── */
export const LANGUAGE_OPTIONS = [
  { value: "ur" as const, label: "اردو" },
  { value: "en" as const, label: "English" },
] as const;

/* ── Call / Transcript panel strings ──────────────────────
   Moved to lib/translations.ts for i18n support.          */

/* ── Footer ────────────────────────────────────────────── */
export const FOOTER_COPYRIGHT = "© 2026 Muawin powered by Aridian Technologies. All rights reserved.";

export const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Contact Support", href: "/contact-support" },
] as const;
