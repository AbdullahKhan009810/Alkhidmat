import { FOOTER_COPYRIGHT, FOOTER_LINKS } from "@/lib/constants";

/**
 * Page footer with copyright notice and policy links.
 */
export default function Footer() {
  return (
    <footer className="mt-12 pb-8 text-center">
      {/* ── Copyright ────────────────────────────────────── */}
      <p className="text-xs text-gray-400">{FOOTER_COPYRIGHT}</p>

      {/* ── Links ────────────────────────────────────────── */}
      <div className="mt-2 flex items-center justify-center gap-3 text-xs text-gray-400">
        {FOOTER_LINKS.map((link) => (
          <span key={link}>
            <a href="#" className="transition-colors hover:text-gray-600">
              {link}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
