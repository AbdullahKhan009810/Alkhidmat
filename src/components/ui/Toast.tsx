"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X, Loader2 } from "lucide-react";

export type ToastType = "success" | "error" | "loading";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (type !== "loading" && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    loading: "bg-blue-500",
  }[type];

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    loading: Loader2,
  }[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${bgColor}`}>
        <Icon className={`h-5 w-5 ${type === "loading" ? "animate-spin" : ""}`} />
        <span className="text-sm font-medium">{message}</span>
        {type !== "loading" && (
          <button onClick={onClose} className="ml-2 rounded p-0.5 hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
