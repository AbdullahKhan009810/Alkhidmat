/**
 * scripts/export-kb.ts
 *
 * Exports knowledge-base entries from the Supabase database
 * and writes them to data/kb/<category>.json — the local JSON source of truth
 * used by the RAG embedding pipeline (see AI-Architecture.md §5).
 *
 * Run: npm run kb:export
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data", "kb");

interface KBEntry {
  id: string;
  title: string;
  titleUr: string;
  category: string;
  language: string;
  status: string;
  contentEn: string;
  contentUr: string;
}

async function main() {
  const prisma = new PrismaClient();

  const entries = await prisma.knowledgeBaseEntry.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  console.log(` Found ${entries.length} active entries in database`);

  await prisma.$disconnect();

  const byCategory = new Map<string, KBEntry[]>();

  for (const e of entries) {
    const category = e.category;
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push({
      id: e.id,
      title: e.title || "",
      titleUr: e.titleUr || "",
      category,
      language: e.language || "both",
      status: e.status || "active",
      contentEn: e.contentEn || "",
      contentUr: e.contentUr || "",
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  byCategory.forEach((list, category) => {
    const file = path.join(OUT_DIR, `${category}.json`);
    fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf-8");
    console.log(`✅ ${category}.json — ${list.length} entries`);
  });

  console.log(`\n📁 Written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
