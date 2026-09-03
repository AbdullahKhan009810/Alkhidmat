import Image from "next/image";
import { FOOTER_COPYRIGHT, FOOTER_LINKS } from "@/lib/constants";

/**
 * Page footer with branding, copyright notice and policy links.
 */
export default function Footer() {
  return (
    <footer className="mt-12 pb-8 text-center">
      {/* ── Branding ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Image
            src="/alkhidmat-logo.png"
            alt="Al Khidmat Foundation"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">×</span>
            <span className="text-lg font-bold text-gray-700">Muawin</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          AI-Voice Powered by Aridian Technologies
        </p>
      </div>

      {/* ── Copyright ────────────────────────────────────── */}
      <p className="mt-10 text-xs text-gray-400">{FOOTER_COPYRIGHT}</p>

      {/* ── Links ────────────────────────────────────────── */}
      <div className="mt-2 flex items-center justify-center gap-3 text-xs text-gray-400">
        {FOOTER_LINKS.map((link) => (
          <span key={link.label}>
            <a href={link.href} className="transition-colors hover:text-gray-600">
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
