"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import TextInput from "@/components/ui/TextInput";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Redirect to dashboard on success
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F2FF] px-4 py-12">
      {/* ── Login Card ──────────────────────────────────── */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white px-8 pt-10 pb-8 shadow-lg">
        {/* Decorative top-right circle */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-50/80" />

        {/* ── Brand + Heading ───────────────────────────── */}
        <div className="relative mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0F5CC3]">Muawin</h1>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to continue to Muawin
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────── */}
        <form onSubmit={handleLogin} className="relative space-y-5">
          <TextInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Error Message */}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F5CC3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4fa8] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
