"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon: React.ReactNode;
  showPasswordToggle?: boolean;
}

/**
 * Text input with a left icon and optional password eye toggle.
 */
export default function TextInput({
  label,
  leftIcon,
  showPasswordToggle = false,
  type = "text",
  className = "",
  ...rest
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {/* Left icon */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {leftIcon}
        </span>

        <input
          type={inputType}
          className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-${
            showPasswordToggle ? "10" : "4"
          } text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#0F5CC3] focus:ring-1 focus:ring-[#0F5CC3] ${className}`}
          {...rest}
        />

        {/* Password eye toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
