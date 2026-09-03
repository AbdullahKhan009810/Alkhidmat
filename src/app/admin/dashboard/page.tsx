"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  FileText,
  Eye,
  Clock,
  User,
  Bot,
  X,
  Loader2,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";

/* ── Types ─────────────────────────────────────────────── */
interface ConversationMessage {
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  language: string;
  status: string;
  createdAt: string;
  messages: ConversationMessage[];
}

/* ── Transcript Modal Component ───────────────────────── */
function TranscriptModal({
  conversation,
  onClose,
}: {
  conversation: Conversation;
  onClose: () => void;
}) {
  const isUrdu = conversation.language === "ur";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transcript — {conversation.sessionId}
            </h3>
            <p className="text-xs text-gray-400">
              Session ID: {conversation.sessionId}
              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                {conversation.language === "ur" ? "Urdu" : "English"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className={`max-h-[60vh] overflow-y-auto px-6 py-4 ${isUrdu ? "font-urdu" : ""}`}
          dir={isUrdu ? "rtl" : "ltr"}
        >
          <div className="flex flex-col gap-4">
            {conversation.messages.map((msg, i) => {
              const time = new Date(msg.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user"
                      ? isUrdu
                        ? "justify-start"
                        : "justify-end"
                      : isUrdu
                        ? "justify-end"
                        : "justify-start"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005A9E]">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? isUrdu
                          ? "rounded-bl-sm bg-[#005A9E] text-white"
                          : "rounded-br-sm bg-[#005A9E] text-white"
                        : "rounded-br-sm bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-50" />
                      <span
                        className={`text-[10px] ${
                          msg.role === "user" ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {time}
                      </span>
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-4 w-4 text-[#005A9E]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
          <span className="text-xs text-gray-400">
            {conversation.messages.length} messages
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#005A9E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#004a82]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ───────────────────────────────────── */
export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  const getPreview = (conv: Conversation) => {
    const firstMsg = conv.messages.find((m) => m.role === "user");
    if (!firstMsg) return "No messages";
    const text = firstMsg.content.slice(0, 60);
    return `"${text}${firstMsg.content.length > 60 ? "..." : ""}"`;
  };

  const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE);
  const paginatedConversations = conversations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminShell
      pageTitle="Dashboard"
      pageSubtitle="Manage welfare cases and voice assistant transcripts"
    >
      {/* ── Two cards row ──────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Cases card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#005A9E]" />
            <span className="text-lg font-semibold text-gray-900">Total Calls</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            View and manage welfare assistance requests
          </p>
          <div className="mt-5 text-center">
            {/* <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Cases
            </p> */}
            <p className="mt-1 text-3xl font-bold text-[#005A9E]">
              {loading ? "..." : conversations.length}
            </p>
          </div>
        </div>
        {/* Last Call card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#005A9E]" />
              <span className="text-lg font-semibold text-gray-900">
                Last Call
              </span>
            </div>
            {conversations.length > 0 && (
              <button
                onClick={() => setSelectedTranscript(conversations[0])}
                className="text-gray-400 transition-colors hover:text-[#005A9E]"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
          </div>
          {loading ? (
            <div className="mt-4 flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#005A9E]" />
            </div>
          ) : conversations.length > 0 ? (
            <>
              <div
                className="mt-4 rounded-lg bg-blue-50/60 p-4 font-urdu text-sm leading-relaxed text-gray-600"
                dir="rtl"
              >
                <p>
                  <span className="font-medium text-gray-800">صارف:</span>{" "}
                  {conversations[0].messages.find((m) => m.role === "user")
                    ?.content.slice(0, 50) || "No messages"}
                  ...
                </p>
                <p className="mt-2">
                  <span className="font-medium text-gray-800">بوٹ:</span>{" "}
                  {conversations[0].messages.find((m) => m.role === "bot")
                    ?.content.slice(0, 80) || "No messages"}
                  ...
                </p>
              </div>
              <p className="mt-3 text-right text-xs text-gray-400">
                Session ID: {conversations[0].sessionId}
              </p>
            </>
          ) : (
            <div className="mt-4 py-6 text-center text-sm text-gray-400">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Conversations table ─────────────── */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Conversations
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#005A9E]" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Transcript Preview</th>
                  <th className="px-6 py-3">Language</th>
                  <th className="px-6 py-3">Messages</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedConversations.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                      {row.sessionId}
                    </td>
                    <td
                      className={`px-6 py-4 text-gray-500 italic ${
                        row.language === "ur" ? "font-urdu" : ""
                      }`}
                    >
                      {getPreview(row)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase text-gray-600">
                        {row.language === "ur" ? "Urdu" : "English"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {row.messages.length}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-[#005A9E] hover:text-[#004a82]"
                        onClick={() => setSelectedTranscript(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <p className="text-xs text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, conversations.length)} of{" "}
              {conversations.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    page === currentPage
                      ? "bg-[#005A9E] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No conversations found. Run the seed script to populate data.
          </div>
        )}
      </div>

      {/* ── Transcript Modal ────────────────────────────── */}
      {selectedTranscript && (
        <TranscriptModal
          conversation={selectedTranscript}
          onClose={() => setSelectedTranscript(null)}
        />
      )}
    </AdminShell>
  );
}
