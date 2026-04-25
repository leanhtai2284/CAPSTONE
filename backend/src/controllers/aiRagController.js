import asyncHandler from "../middlewares/asyncHandler.js";
import Pantry from "../models/Pantry.js";
import {
  RagRetrievalError,
  generateAnswerFromContext,
  getRagDefaults,
  retrieveRelevantChunks,
  getIndexStatus,
  forceRebuildIndex,
} from "../services/ragRetrievalService.js";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 500;
const MIN_TOP_K = 1;
const MAX_TOP_K = 50;
const MAX_CONTEXT_PREVIEW_LENGTH = 900;
// Giới hạn số tin nhắn lịch sử được gửi lên (= 3 lượt hỏi-đáp)
const MAX_HISTORY_MESSAGES = 6;
// Giới hạn độ dài mỗi tin nhắn trong history để tránh đầy token
const MAX_HISTORY_MESSAGE_LENGTH = 800;

const RAG_DEFAULTS = getRagDefaults();

function normalizeQuery(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function parseTopK(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return RAG_DEFAULTS.topK;
  return Math.min(MAX_TOP_K, Math.max(MIN_TOP_K, parsed));
}

function parseScoreThreshold(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return RAG_DEFAULTS.scoreThreshold;
  return Math.min(1, Math.max(-1, parsed));
}

function parseIncludePantryContext(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

/**
 * Parse và validate history từ FE.
 * - Chỉ chấp nhận role "user" hoặc "assistant"
 * - Giới hạn MAX_HISTORY_MESSAGES tin gần nhất
 * - Truncate nội dung quá dài
 */
function parseHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const role = String(item.role || "").trim();
      const content = String(item.content || "").trim();
      return (role === "user" || role === "assistant") && content.length > 0;
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: String(item.role).trim(),
      content: String(item.content || "").trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH),
    }));
}

function trimPreview(value, maxLength = MAX_CONTEXT_PREVIEW_LENGTH) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function buildSources(retrievedItems) {
  const sourceMap = new Map();

  for (const item of retrievedItems) {
    const key = item.source;
    const existing = sourceMap.get(key);

    if (!existing) {
      sourceMap.set(key, {
        source: item.source,
        chunks: [item.chunkIndex],
        topScore: item.score,
      });
      continue;
    }

    if (!existing.chunks.includes(item.chunkIndex)) {
      existing.chunks.push(item.chunkIndex);
      existing.chunks.sort((a, b) => a - b);
    }

    existing.topScore = Math.max(existing.topScore, item.score);
  }

  return Array.from(sourceMap.values()).sort((a, b) => b.topScore - a.topScore);
}

async function buildPantryContext(userId) {
  if (!userId) {
    return { text: "", itemCount: 0 };
  }

  const pantryItems = await Pantry.find({ user: userId })
    .sort({ expiryDate: 1 })
    .limit(20)
    .lean();

  if (!pantryItems.length) {
    return { text: "", itemCount: 0 };
  }

  const lines = pantryItems.map((item, index) => {
    const name = item.name || "Unknown";
    const quantity = Number.isFinite(item.quantity) ? item.quantity : "?";
    const unit = item.unit || "";
    const category = item.category || "other";
    const storage = item.storageLocation || "unknown";
    return `${index + 1}. ${name} (${quantity}${unit}) | category=${category} | storage=${storage}`;
  });

  return {
    text: lines.join("\n"),
    itemCount: pantryItems.length,
  };
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
  const scoreThreshold = parseScoreThreshold(options.scoreThreshold);
  const includePantryContext = parseIncludePantryContext(
    options.includePantryContext
  );
  // History: FE tự giữ state và truyền lên mỗi request
  const history = parseHistory(req.body?.history);

  const pantryContext = includePantryContext
    ? await buildPantryContext(req.user?._id)
    : { text: "", itemCount: 0 };

  const retrievalQuery = pantryContext.text
    ? `${query}\n\nUser pantry context:\n${pantryContext.text}`
    : query;

  let retrieval;
  let generation;

  try {
    retrieval = await retrieveRelevantChunks({
      query: retrievalQuery,
      topK,
      scoreThreshold,
    });
    generation = await generateAnswerFromContext({
      query,
      retrievedItems: retrieval.items,
      history,
    });
  } catch (error) {
    if (error instanceof RagRetrievalError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        meta: {
          version: "rag-v1-langchain",
          query,
          topK,
          scoreThreshold,
          includePantryContext,
          userId: req.user?._id || null,
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw error;
  }

  const retrievedContext = retrieval.items.map((item) => ({
    source: item.source,
    chunkIndex: item.chunkIndex,
    totalChunks: item.totalChunks,
    score: item.score,
    text: trimPreview(item.text),
  }));

  const sources = buildSources(retrieval.items);
  const hasContext = retrievedContext.length > 0;

  return res.status(200).json({
    success: true,
    message: "RAG LangChain pipeline is ready",
    data: {
      answer: hasContext
        ? generation.answer
        : "Tôi không tìm thấy thông tin này trong dữ liệu hiện có.",
      sources,
      retrievedContext,
      llmUsed: generation.llmUsed,
      retrievalUsed: true,
      stage: generation.llmUsed ? "retrieval+generation" : "retrieval",
    },
    meta: {
      version: "rag-v1-langchain",
      query,
      topK,
      scoreThreshold,
      includePantryContext,
      pantryItemsUsed: pantryContext.itemCount,
      retrievalQueryMode: pantryContext.text ? "query_plus_pantry" : "query_only",
      embeddingModel: retrieval.meta.embeddingModel,
      chatModel: generation.chatModel,
      retrievalLatencyMs: retrieval.meta.retrievalLatencyMs,
      generationLatencyMs: generation.generationLatencyMs,
      scoreMode: retrieval.meta.scoreMode,
      indexBuiltAt: retrieval.meta.indexBuiltAt,
      corpus: retrieval.meta.corpus,
      historyLength: history.length,
      userId: req.user?._id || null,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/ai/rag/status
 * Kiểm tra trạng thái hiện tại của RAG index:
 * - index đã được build chưa?
 * - build lúc nào?
 * - bao nhiêu documents / chunks?
 * - model embedding nào?
 * - cache còn fresh hay hết TTL?
 * Dùng cho debug và FE hiển thị trạng thái AI.
 */
export const ragStatusV1 = asyncHandler(async (req, res) => {
  const status = getIndexStatus();

  return res.status(200).json({
    success: true,
    data: status,
    meta: {
      version: "rag-v1-langchain",
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/ai/rag/rebuild
 * Force rebuild RAG index ngay lập tức, bỏ qua TTL cache.
 * Dùng sau khi admin thêm/sửa/xóa file trong data/rag/papers/
 * mà muốn server đọc dữ liệu mới ngay, không cần restart.
 * Lưu ý: Rebuild có thể tốn 30–60 giây tùy khối lượng data và embed API.
 */
export const ragRebuildV1 = asyncHandler(async (req, res) => {
  const rebuildStart = Date.now();

  let index;
  try {
    index = await forceRebuildIndex();
  } catch (error) {
    if (error instanceof RagRetrievalError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        meta: {
          version: "rag-v1-langchain",
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "RAG index đã được rebuild thành công",
    data: {
      documentCount: index.documentCount,
      chunkCount: index.chunkCount,
      embeddingModel: index.embeddingModel,
      chunkSize: index.chunkSize,
      chunkOverlap: index.chunkOverlap,
      docsDir: index.docsDir,
      builtAt: index.builtAt,
    },
    meta: {
      version: "rag-v1-langchain",
      rebuildLatencyMs: Date.now() - rebuildStart,
      userId: req.user?._id || null,
      timestamp: new Date().toISOString(),
    },
  });
});
