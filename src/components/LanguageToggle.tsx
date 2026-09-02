"use client";

import type { LanguageToggleProps } from "@/types";
import { LANGUAGE_OPTIONS } from "@/lib/constants";

/**
 * Pill-shaped segmented control to switch between English and Urdu.
 */
export default function LanguageToggle({
  activeLanguage,
  onChange,
}: LanguageToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-gray-100 p-1">
      {LANGUAGE_OPTIONS.map((opt) => {
        const isActive = opt.value === activeLanguage;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#0F5CC3] text-white shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
