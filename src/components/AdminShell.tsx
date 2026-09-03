"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  LayoutGrid,
  Database,
  LogOut,
  Menu,
  Phone,
  MessageCircle,
  Settings,
  Building2,
  ChevronDown,
} from "lucide-react";

/* ── Nav items ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Knowledge Base", href: "/admin/knowledge-base", icon: Database },
  { label: "Telephony Management", href: "/admin/telephony", icon: Phone },
  { label: "WhatsApp Management", href: "/admin/whatsapp", icon: MessageCircle },
  { label: "Agent Settings", href: "/admin/agent-settings", icon: Settings },
  { label: "Tenant Management", href: "/admin/tenants", icon: Building2 },
];

/* ── Props ─────────────────────────────────────────────── */
interface AdminShellProps {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle: string;
}

export default function AdminShell({
  children,
  pageTitle,
  pageSubtitle,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ── Mobile overlay ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-[#005A9E] transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <button
          onClick={() => router.push("/")}
          className="flex w-full items-center gap-2 px-5 pt-5 pb-2 transition-opacity hover:opacity-80"
        >
          <Image
            src="/awaz-mark.png"
            alt="Muawin"
            width={28}
            height={28}
            className="rounded-lg bg-white p-0.5"
          />
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold text-white">Muawin</span>
            <p className="text-[11px] text-blue-200">Al Khidmat Foundation</p>
          </div>
        </button>

        {/* Nav */}
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-left text-sm font-medium leading-snug transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Spacer + Logout */}
        <div className="mt-auto border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main wrapper ───────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-[#005A9E] px-4 lg:px-6">
          <button
            className="text-white/70 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Right: User profile */}
          <div className="relative ml-auto">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-400">
                <span className="text-xs font-bold text-white">MA</span>
              </div>
              <span className="text-sm font-medium text-white">
                Muhammad Asad
              </span>
              <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content (scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Page heading */}
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{pageSubtitle}</p>

          {children}
        </main>
      </div>
    </div>
  );
}
