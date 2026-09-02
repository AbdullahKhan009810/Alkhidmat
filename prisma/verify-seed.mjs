import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const kb = await p.knowledgeBaseEntry.count();
const convs = await p.conversation.count();
const msgs = await p.message.count();
const users = await p.user.count();

console.log("=== Row counts ===");
console.log(`KnowledgeBaseEntry: ${kb}`);
console.log(`Conversation:       ${convs}`);
console.log(`Message:            ${msgs}`);
console.log(`User:               ${users}`);

const kbByCategory = await p.$queryRawUnsafe(
  `SELECT category, COUNT(*)::int AS n FROM "KnowledgeBaseEntry" GROUP BY category ORDER BY n DESC`
);
console.log("\n=== KB entries by category ===");
for (const r of kbByCategory) console.log(`${r.category}: ${r.n}`);

const sample = await p.knowledgeBaseEntry.findFirst({
  select: { title: true, category: true, status: true, titleUr: true },
});
console.log("\n=== Sample KB entry ===");
console.log(sample);

await p.$disconnect();
