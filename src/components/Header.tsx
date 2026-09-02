"use client";

import { Headphones } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { BRAND_NAME, HEADER_STATUS_ITEMS } from "@/lib/constants";

/**
 * Top navigation bar with blue background.
 * Left: logo + brand name. Right: status badges.
 */
export default function Header() {
  return (
    <header className="w-full bg-[#0060ae]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ── Left: Logo + Brand ─────────────────────────── */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Headphones className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
        </div>

        {/* ── Right: Status items ────────────────────────── */}
        <nav className="hidden items-center gap-6 md:flex">
          {HEADER_STATUS_ITEMS.map((item) => (
            <Badge
              key={item.label}
              label={item.label}
              active={item.active}
              underline={item.active}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
