import type { BadgeProps } from "@/types";

/**
 * Small status-pill badge used in the header navigation.
 * Shows a radio-dot indicator before the label text.
 */
export default function Badge({ label, active = false, underline = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm ${
        active ? "font-bold text-white" : "text-white/80"
      } ${underline ? "underline underline-offset-4" : ""}`}
    >
      {/* Radio-dot indicator */}
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full border-2 ${
          active
            ? "border-white bg-white"
            : "border-white/60 bg-transparent"
        }`}
      />
      {label}
    </span>
  );
}
