"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  X,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  FileText,
  Building2,
  ClipboardCheck,
  Ambulance,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";

/* ── Types ─────────────────────────────────────────────── */
interface KBEntry {
  id: string;
  title: string;
  titleUr: string;
  category: string;
  language: string;
  status: string;
  contentEn: string;
  contentUr: string;
  fileUrl?: string;
  fileName?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Use Cases (3 only) ────────────────────────────────── */
const USE_CASES = [
  {
    id: "facility-finder",
    label: "Facility & Medical Camp Finder",
    icon: Building2,
  },
  {
    id: "eligibility-check",
    label: "Free-Service Eligibility Check",
    icon: ClipboardCheck,
  },
  {
    id: "transport-guidance",
    label: "Transport & Ambulance Guidance",
    icon: Ambulance,
  },
];

/* ── Entry Detail Modal ────────────────────────────────── */
function EntryModal({
  entry,
  onClose,
}: {
  entry: KBEntry;
  onClose: () => void;
}) {
  const useCase = USE_CASES.find((c) => c.id === entry.category);
  const isUrdu = entry.language === "ur" || entry.language === "both";
  const isEnglish = entry.language === "en" || entry.language === "both";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              {useCase && <useCase.icon className="h-4 w-4 text-[#005A9E]" />}
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {useCase?.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  entry.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {entry.status}
              </span>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              {entry.title}
            </h3>
            <p className="font-urdu text-sm text-gray-500">{entry.titleUr}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[55vh] overflow-y-auto px-6 py-4 space-y-4">
          {/* Urdu Content */}
          {isUrdu && entry.contentUr && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                اردو
              </p>
              <div
                className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 font-urdu"
                dir="rtl"
              >
                <p className="whitespace-pre-line">{entry.contentUr}</p>
              </div>
            </div>
          )}

          {/* English Content */}
          {isEnglish && entry.contentEn && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                English
              </p>
              <div className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                <p className="whitespace-pre-line">{entry.contentEn}</p>
              </div>
            </div>
          )}

          {/* File attachment */}
          {entry.fileUrl && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
              <FileText className="h-5 w-5 text-[#005A9E]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {entry.fileName || "Attached File"}
                </p>
                <a
                  href={entry.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#005A9E] hover:underline"
                >
                  View File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(entry.lastUpdated).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {entry.language}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#005A9E] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a82]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Knowledge Base Page ──────────────────────────────── */
export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch("/api/knowledge-base");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        // Temporarily show all data to see what's in Supabase
        setEntries(data);
      } catch (err) {
        console.error("Error fetching knowledge base:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const filtered = entries.filter((entry) => {
    const matchSearch =
      search === "" ||
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.titleUr.includes(search) ||
      entry.id.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "all" || entry.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const getCount = (catId: string) =>
    entries.filter((e) => e.category === catId).length;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCategory || !uploadTitle || !uploadFile) return;

    setUploading(true);
    try {
      // Upload file first
      const formData = new FormData();
      formData.append("file", uploadFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url, fileName, extractedText } = await uploadRes.json();

      // Create KB entry — use extracted PDF text as content, fall back to manual textarea
      const contentForEntry = extractedText || uploadContent;

      const createRes = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          titleUr: "",
          category: uploadCategory,
          language: "both",
          status: "active",
          contentEn: contentForEntry,
          contentUr: "",
          fileUrl: url,
          fileName: fileName,
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create entry");

      // Reset and refresh
      setShowUpload(false);
      setUploadCategory("");
      setUploadFile(null);
      setUploadTitle("");
      setUploadContent("");

      // Refresh entries
      const res = await fetch("/api/knowledge-base");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminShell
      pageTitle="Knowledge Base"
      pageSubtitle="Train the AI with documents for the 3 use cases"
    >
      {/* ── Use Case Cards ─────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-xl border p-4 text-center transition-colors ${
            activeCategory === "all"
              ? "border-[#005A9E] bg-[#005A9E]/5"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">
            {loading ? "..." : entries.length}
          </p>
          <p className="text-xs text-gray-500">All Entries</p>
        </button>
        {USE_CASES.map((useCase) => (
          <button
            key={useCase.id}
            onClick={() => setActiveCategory(useCase.id)}
            className={`rounded-xl border p-4 text-center transition-colors ${
              activeCategory === useCase.id
                ? "border-[#005A9E] bg-[#005A9E]/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#005A9E]">
              <useCase.icon className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {loading ? "..." : getCount(useCase.id)}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2">
              {useCase.label.replace("Abdullah Office: ", "")}
            </p>
          </button>
        ))}
      </div>

      {/* ── Search + Upload Button ─────────────────────── */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-[#005A9E] focus:ring-1 focus:ring-[#005A9E]"
          />
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#005A9E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004a82]"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* ── Entries Table ──────────────────────────────── */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white">
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
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Use Case</th>
                  <th className="px-6 py-3">File</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Updated</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const useCase = USE_CASES.find((c) => c.id === entry.category);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                        {entry.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {entry.title}
                        </p>
                        {entry.titleUr && (
                          <p className="font-urdu text-xs text-gray-400">
                            {entry.titleUr}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {useCase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#005A9E]">
                            <useCase.icon className="h-3 w-3" />
                            {useCase.label.replace("Abdullah Office: ", "")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {entry.fileName ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <FileText className="h-3.5 w-3.5" />
                            {entry.fileName.slice(0, 20)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {entry.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(entry.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-[#005A9E] hover:text-[#004a82]"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No entries found matching your search.
          </div>
        )}
      </div>

      {/* ── Upload Modal ───────────────────────────────── */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUpload(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Knowledge Base Document
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6">
              {/* Use Case Dropdown */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Use Case *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#005A9E] focus:ring-1 focus:ring-[#005A9E]"
                >
                  <option value="">Select a use case...</option>
                  {USE_CASES.map((uc) => (
                    <option key={uc.id} value={uc.id}>
                      {uc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter document title"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#005A9E] focus:ring-1 focus:ring-[#005A9E]"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Content (Optional)
                </label>
                <textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Enter text content (optional)"
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#005A9E] focus:ring-1 focus:ring-[#005A9E]"
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  PDF File *
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 transition-colors hover:border-[#005A9E]">
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-gray-400" />
                      <p className="mt-1 text-xs text-gray-500">
                        {uploadFile ? uploadFile.name : "Click to upload PDF"}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Max file size: 10MB
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading || !uploadCategory || !uploadTitle || !uploadFile}
                className="w-full rounded-lg bg-[#005A9E] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004a82] disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Entry Detail Modal ────────────────────────── */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </AdminShell>
  );
}
