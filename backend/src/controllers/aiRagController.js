import asyncHandler from "../middlewares/asyncHandler.js";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 500;
const DEFAULT_TOP_K = 5;
const MIN_TOP_K = 1;
const MAX_TOP_K = 20;

function normalizeQuery(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function parseTopK(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TOP_K;
  return Math.min(MAX_TOP_K, Math.max(MIN_TOP_K, parsed));
}

export const ragQueryV1 = asyncHandler(async (req, res) => {
  const rawQuery = req.body?.query;
  const query = normalizeQuery(rawQuery);

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "query is required",
    });
  }

  if (query.length < MIN_QUERY_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `query must be at least ${MIN_QUERY_LENGTH} characters`,
    });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `query must be at most ${MAX_QUERY_LENGTH} characters`,
    });
  }

  const options = req.body?.options || {};
  const topK = parseTopK(options.topK);
  const includePantryContext = options.includePantryContext !== false;

  return res.status(200).json({
    success: true,
    message: "RAG V1 commit1 skeleton ready",
    data: {
      answer:
        "[commit1] Endpoint contract is ready. Retrieval and LLM generation will be implemented in next commits.",
      sources: [],
      retrievedContext: [],
      llmUsed: false,
      retrievalUsed: false,
      stage: "skeleton",
    },
    meta: {
      version: "rag-v1-commit1",
      query,
      topK,
      includePantryContext,
      userId: req.user?._id || null,
      timestamp: new Date().toISOString(),
    },
  });
});
