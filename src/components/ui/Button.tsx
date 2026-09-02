import type { ButtonProps } from "@/types";

/**
 * Reusable button with primary / ghost variants.
 * Styled entirely via Tailwind utility classes.
 */
export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2";

  const variants: Record<string, string> = {
    primary: "bg-[#0F5CC3] text-white hover:bg-[#0d4fa8]",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
