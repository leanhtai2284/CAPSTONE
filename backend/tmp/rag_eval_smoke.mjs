import "dotenv/config";
import { retrieveRelevantChunks, generateAnswerFromContext } from "../src/services/ragRetrievalService.js";

const hasKey = Boolean(String(process.env.OPENAI_API_KEY || "").trim());
console.log("HAS_OPENAI_KEY=" + hasKey);

const queries = [
  "chicken recipe with garlic",
  "low carb keto meal ideas",
  "vegetarian dinner with mushrooms",
  "how to cook salmon with butter",
  "quick high protein lunch",
  "salad with tuna and mayonnaise",
  "beef with broccoli stir fry",
  "shrimp with garlic butter",
  "recipe using asparagus",
  "healthy soup with broccoli"
];

let pass = 0;
let fail = 0;

for (const q of queries) {
  const started = Date.now();
  try {
    const retrieval = await retrieveRelevantChunks({
      query: q,
      topK: 4,
      scoreThreshold: -1
    });

    const gen = await generateAnswerFromContext({
      query: q,
      retrievedItems: retrieval.items,
    });

    const took = Date.now() - started;
    const topSource = retrieval.items[0]?.source || "(none)";
    const topScore = retrieval.items[0]?.score ?? "n/a";
    const answerLen = (gen.answer || "").length;
    const fallback = gen.answer === "Tôi không tìm thấy thông tin này trong dữ liệu hiện có.";

    if (retrieval.items.length > 0 && !fallback && answerLen > 30) {
      pass += 1;
    } else {
      fail += 1;
    }

    console.log("---");
    console.log("Q=" + q);
    console.log("TOP_K_RETURNED=" + retrieval.items.length);
    console.log("TOP_SOURCE=" + topSource);
    console.log("TOP_SCORE=" + topScore);
    console.log("LLM_USED=" + gen.llmUsed);
    console.log("ANSWER_LEN=" + answerLen);
    console.log("FALLBACK=" + fallback);
    console.log("TOOK_MS=" + took);
  } catch (err) {
    fail += 1;
    console.log("---");
    console.log("Q=" + q);
    console.log("ERROR=" + (err?.message || String(err)));
  }
}

console.log("===SUMMARY===");
console.log("PASS=" + pass);
console.log("FAIL=" + fail);
console.log("TOTAL=" + queries.length);
