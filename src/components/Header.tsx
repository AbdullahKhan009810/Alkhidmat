"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Shield } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

/**
 * Top navigation bar with blue background.
 * Left: logo + brand name (clickable → always reloads home).
 * Right: Admin button (login if not authed, dashboard if authed).
 */
export default function Header() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.refresh();
    router.push("/");
  };

  const handleAdminClick = () => {
    router.push(isAdmin ? "/admin/dashboard" : "/admin");
  };

  return (
    <header className="w-full bg-[#0060ae]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/*  Left: Logo + Brand ─────────────────────────── */}
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-2">
          <span className="flex items-center justify-center rounded-lg bg-white p-1">
            <Image
              src="/awaz-mark.png"
              alt="Muawin"
              width={32}
              height={32}
            />
          </span>
          <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
        </a>

        {/* ─ Right: Admin Button ───────────────────────── */}
        <button
          onClick={handleAdminClick}
          className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
        >
          <Shield className="h-4 w-4" />
          {isAdmin ? "Dashboard" : "Admin"}
        </button>
      </div>
    </header>
  );
}
