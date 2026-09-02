import { retrieve } from "../src/lib/rag/retriever";

async function main() {
  const query = "کیا مجھے بتا سکتے ہیں پنڈی میں کہاں پر ہے ان کی ہاسپٹل اور خدمت کی";
  const chunks = await retrieve(query, { topK: 5, minScore: 0.0 });
  console.log(`\nQuery: ${query}\n`);
  for (const c of chunks) {
    console.log(`score=${c.score.toFixed(3)} cat=${c.category} lang=${c.language}`);
    console.log(`text: ${c.text.slice(0, 200).replace(/\n/g, " ")}…\n`);
  }

  console.log("\n--- With default threshold 0.35 ---");
  const chunks2 = await retrieve(query, { topK: 5 });
  console.log(`retrieved ${chunks2.length} chunks`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
