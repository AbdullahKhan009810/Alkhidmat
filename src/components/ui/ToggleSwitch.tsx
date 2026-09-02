import type { ToggleSwitchProps } from "@/types";

/**
 * Accessible toggle switch with a text label.
 * Renders a blue track when checked, gray when unchecked.
 */
export default function ToggleSwitch({
  label,
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <label dir="ltr" className="flex items-center gap-3 cursor-pointer select-none">
      <span className="text-sm font-medium text-gray-700">{label}</span>

      {/* Track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-[#0F5CC3]" : "bg-gray-300"
        }`}
      >
        {/* Thumb */}
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
