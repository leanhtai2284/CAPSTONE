import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import csvParser from "csv-parser";
import { Document } from "@langchain/core/documents";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const require = createRequire(import.meta.url);

let pdfParse = null;
try {
  pdfParse = require("pdf-parse");
} catch {
  pdfParse = null;
}

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".txt", ".md", ".markdown", ".csv"]);

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_TOP_K = 5;
const DEFAULT_SCORE_THRESHOLD = 0.2;
const DEFAULT_INDEX_TTL_MS = 10 * 60 * 1000;
const DEFAULT_CSV_MAX_ROWS = 2000;
const DEFAULT_CSV_MAX_COLUMNS = 12;
const DEFAULT_CSV_VALUE_MAX_LENGTH = 180;

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-large";
const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

const SCORE_MODE_SIMILARITY = "similarity";
const SCORE_MODE_DISTANCE = "distance";

const CSV_PRIORITY_FIELDS = [
  "id",
  "name_vi",
  "name",
  "description",
  "region",
  "category",
  "meal_types",
  "diet_tags",
  "allergens",
  "ingredients",
  "steps",
  "calories",
  "protein_g",
  "carbs_g",
  "fat_g",
  "sugar_g",
  "fiber_g",
  "price_est_vnd_min",
  "price_est_vnd_max",
  "suitable_for",
  "avoid_for",
];

// System prompt chứa rules cho LLM.
// Context sẽ được append vào runtime cùng với history.
const SYSTEM_RULES = [
  "You are a strict, citation-focused nutrition and food assistant for SmartMeal.",
  "RULES:",
  "1) Use ONLY the provided context to answer.",
  '2) If the answer is not clearly contained in context, answer exactly: "Tôi không tìm thấy thông tin này trong dữ liệu hiện có."',
  "3) Do NOT use outside knowledge or guess.",
  "4) If possible, cite sources as (source#chunk).",
  "5) Answer in Vietnamese.",
  "6) Use conversation history to understand follow-up questions and pronouns referencing previous topics.",
].join("\n");

let indexCache = null;
let indexBuildPromise = null;

export class RagRetrievalError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "RagRetrievalError";
    this.statusCode = statusCode;
  }
}

function normalizeText(value) {
  return String(value || "").replace(/\r/g, "").trim();
}

function toPosixPath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function parseInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseFloatNumber(value, fallback, min, max) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function truncateText(value, maxLength) {
  const text = normalizeText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function getOpenAiApiKey() {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw new RagRetrievalError(
      "OPENAI_API_KEY is missing. Please configure it in backend/.env",
      503
    );
  }
  return apiKey;
}

function getEmbeddingModelName() {
  return String(process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL).trim();
}

function getChatModelName() {
  return String(process.env.OPENAI_CHAT_MODEL || DEFAULT_CHAT_MODEL).trim();
}

function getScoreMode() {
  const mode = String(process.env.RAG_SCORE_MODE || SCORE_MODE_SIMILARITY)
    .trim()
    .toLowerCase();
  if (mode === SCORE_MODE_DISTANCE) return SCORE_MODE_DISTANCE;
  return SCORE_MODE_SIMILARITY;
}

function getChunkSettings() {
  let chunkSize = parseInteger(process.env.RAG_CHUNK_SIZE, DEFAULT_CHUNK_SIZE, 200, 5000);
  let chunkOverlap = parseInteger(
    process.env.RAG_CHUNK_OVERLAP,
    DEFAULT_CHUNK_OVERLAP,
    0,
    1000
  );

  if (chunkOverlap >= chunkSize) {
    chunkOverlap = Math.floor(chunkSize / 5);
  }

  return { chunkSize, chunkOverlap };
}

function createEmbeddingModel() {
  return new OpenAIEmbeddings({
    apiKey: getOpenAiApiKey(),
    model: getEmbeddingModelName(),
  });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveDocsDirectory() {
  const serviceDir = path.dirname(fileURLToPath(import.meta.url));
  const envDir = String(process.env.RAG_DOCS_DIR || "").trim();

  const candidates = [];
  if (envDir) {
    if (path.isAbsolute(envDir)) {
      candidates.push(envDir);
    } else {
      candidates.push(path.resolve(process.cwd(), envDir));
      candidates.push(path.resolve(process.cwd(), "backend", envDir));
    }
  }

  candidates.push(path.resolve(process.cwd(), "backend", "data", "rag", "papers"));
  candidates.push(path.resolve(process.cwd(), "data", "rag", "papers"));
  candidates.push(path.resolve(serviceDir, "../../data/rag/papers"));

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

async function collectFilesRecursive(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const allFiles = [];
  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await collectFilesRecursive(absolutePath);
      allFiles.push(...nestedFiles);
      continue;
    }

    allFiles.push(absolutePath);
  }

  return allFiles;
}

async function getDocumentFiles(docsDir) {
  if (!(await pathExists(docsDir))) {
    throw new RagRetrievalError(
      `RAG docs directory not found: ${docsDir}. Create it and add files first.`,
      400
    );
  }

  const allFiles = await collectFilesRecursive(docsDir);
  const documentFiles = [];

  for (const absolutePath of allFiles) {
    const ext = path.extname(absolutePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const stats = await fs.stat(absolutePath);
    documentFiles.push({
      absolutePath,
      relativePath: toPosixPath(path.relative(docsDir, absolutePath)),
      size: stats.size,
      mtimeMs: Math.floor(stats.mtimeMs),
    });
  }

  documentFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  if (!documentFiles.length) {
    throw new RagRetrievalError(
      `No supported documents found in ${docsDir}. Add .pdf, .txt, .md, or .csv files.`,
      400
    );
  }

  return documentFiles;
}

function buildFingerprint(documentFiles) {
  return documentFiles
    .map((file) => `${file.relativePath}:${file.size}:${file.mtimeMs}`)
    .join("|");
}

function getNonEmptyCsvPairs(row) {
  const pairs = [];
  for (const [key, value] of Object.entries(row || {})) {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) continue;
    pairs.push({ key: normalizeText(key), value: normalizedValue });
  }
  return pairs;
}

function prioritizeCsvPairs(pairs) {
  const byKey = new Map();

  for (const pair of pairs) {
    const key = pair.key.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, pair);
    }
  }

  const prioritized = [];
  for (const field of CSV_PRIORITY_FIELDS) {
    const matched = byKey.get(field.toLowerCase());
    if (matched) prioritized.push(matched);
  }

  return prioritized.length ? prioritized : pairs;
}

function formatCsvRow(row, rowNumber) {
  const pairs = getNonEmptyCsvPairs(row);
  if (!pairs.length) return "";

  const maxColumns = parseInteger(
    process.env.RAG_CSV_MAX_COLUMNS,
    DEFAULT_CSV_MAX_COLUMNS,
    2,
    30
  );

  const maxValueLength = parseInteger(
    process.env.RAG_CSV_VALUE_MAX_LENGTH,
    DEFAULT_CSV_VALUE_MAX_LENGTH,
    50,
    600
  );

  const serialized = prioritizeCsvPairs(pairs)
    .slice(0, maxColumns)
    .map(({ key, value }) => `${key}: ${truncateText(value, maxValueLength)}`)
    .join(" | ");

  if (!serialized) return "";
  return `row ${rowNumber}: ${serialized}`;
}

async function readCsvAsText(fileInfo) {
  const maxRows = parseInteger(process.env.RAG_CSV_MAX_ROWS, DEFAULT_CSV_MAX_ROWS, 10, 100000);
  const lines = [];
  let rowIndex = 0;

  await new Promise((resolve, reject) => {
    createReadStream(fileInfo.absolutePath)
      .pipe(csvParser())
      .on("data", (row) => {
        if (rowIndex >= maxRows) return;

        const line = formatCsvRow(row, rowIndex + 1);
        rowIndex += 1;
        if (line) lines.push(line);
      })
      .on("end", resolve)
      .on("error", (error) => {
        reject(
          new RagRetrievalError(
            `Failed to parse CSV file ${fileInfo.relativePath}: ${error.message}`,
            400
          )
        );
      });
  });

  return normalizeText(lines.join("\n"));
}

async function readPdfAsText(fileInfo) {
  if (!pdfParse) {
    throw new RagRetrievalError(
      "pdf-parse is not installed. Run npm install in backend to continue.",
      500
    );
  }

  const fileBuffer = await fs.readFile(fileInfo.absolutePath);
  const parsed = await pdfParse(fileBuffer);
  return normalizeText(parsed?.text);
}

async function readDocumentAsText(fileInfo) {
  const ext = path.extname(fileInfo.absolutePath).toLowerCase();

  if (ext === ".csv") {
    return readCsvAsText(fileInfo);
  }

  if (ext === ".pdf") {
    return readPdfAsText(fileInfo);
  }

  const text = await fs.readFile(fileInfo.absolutePath, "utf8");
  return normalizeText(text);
}

async function loadDocuments(documentFiles) {
  const documents = [];

  for (const fileInfo of documentFiles) {
    const content = await readDocumentAsText(fileInfo);
    if (!content) continue;

    documents.push(
      new Document({
        pageContent: content,
        metadata: {
          source: fileInfo.relativePath,
        },
      })
    );
  }

  if (!documents.length) {
    throw new RagRetrievalError(
      "All documents are empty after parsing. Please add readable text content.",
      400
    );
  }

  return documents;
}

function annotateChunkMetadata(chunks) {
  const totalBySource = new Map();

  for (const chunk of chunks) {
    const source = normalizeText(chunk.metadata?.source) || "unknown";
    totalBySource.set(source, (totalBySource.get(source) || 0) + 1);
  }

  const currentBySource = new Map();

  return chunks
    .map((chunk) => {
      const source = normalizeText(chunk.metadata?.source) || "unknown";
      const chunkIndex = (currentBySource.get(source) || 0) + 1;
      currentBySource.set(source, chunkIndex);

      return new Document({
        pageContent: normalizeText(chunk.pageContent),
        metadata: {
          ...chunk.metadata,
          source,
          chunkIndex,
          totalChunks: totalBySource.get(source) || chunkIndex,
        },
      });
    })
    .filter((chunk) => Boolean(chunk.pageContent));
}

function isCacheFresh(cache) {
  const ttlMs = parseInteger(
    process.env.RAG_INDEX_TTL_MS,
    DEFAULT_INDEX_TTL_MS,
    1_000,
    24 * 60 * 60 * 1_000
  );

  return Date.now() - cache.builtAtMs < ttlMs;
}

async function buildOrRefreshIndex(forceRebuild = false) {
  if (indexCache && !forceRebuild && isCacheFresh(indexCache)) {
    return indexCache;
  }

  if (indexBuildPromise && !forceRebuild) {
    return indexBuildPromise;
  }

  indexBuildPromise = (async () => {
    const docsDir = await resolveDocsDirectory();
    const documentFiles = await getDocumentFiles(docsDir);
    const fingerprint = buildFingerprint(documentFiles);

    if (
      indexCache &&
      !forceRebuild &&
      indexCache.fingerprint === fingerprint &&
      isCacheFresh(indexCache)
    ) {
      return indexCache;
    }

    const { chunkSize, chunkOverlap } = getChunkSettings();

    const documents = await loadDocuments(documentFiles);
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      addStartIndex: true,
    });

    const splitChunks = await splitter.splitDocuments(documents);
    const chunks = annotateChunkMetadata(splitChunks);

    if (!chunks.length) {
      throw new RagRetrievalError(
        "No chunks were created from the document set. Please review RAG_CHUNK_SIZE and input files.",
        400
      );
    }

    const embeddings = createEmbeddingModel();
    const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

    indexCache = {
      fingerprint,
      builtAtMs: Date.now(),
      builtAt: new Date().toISOString(),
      docsDir,
      documentCount: documentFiles.length,
      chunkCount: chunks.length,
      chunkSize,
      chunkOverlap,
      embeddingModel: getEmbeddingModelName(),
      vectorStore,
    };

    return indexCache;
  })();

  try {
    return await indexBuildPromise;
  } finally {
    indexBuildPromise = null;
  }
}

function applyScoreThreshold(items, scoreThreshold) {
  if (scoreThreshold <= -1) return items;

  const mode = getScoreMode();
  if (mode === SCORE_MODE_DISTANCE) {
    return items.filter((item) => item.score <= scoreThreshold);
  }

  return items.filter((item) => item.score >= scoreThreshold);
}

function toSourceRelativePath(source) {
  return toPosixPath(normalizeText(source));
}

export function getRagDefaults() {
  return {
    topK: parseInteger(process.env.RAG_TOP_K_DEFAULT, DEFAULT_TOP_K, 1, 50),
    scoreThreshold: parseFloatNumber(
      process.env.RAG_SCORE_THRESHOLD,
      DEFAULT_SCORE_THRESHOLD,
      -1,
      1
    ),
  };
}

/**
 * Trả về thông tin hiện tại của RAG index cache.
 * Nếu chưa build thì built=false.
 */
export function getIndexStatus() {
  if (!indexCache) {
    return {
      built: false,
      builtAt: null,
      fingerprint: null,
      docsDir: null,
      documentCount: 0,
      chunkCount: 0,
      chunkSize: null,
      chunkOverlap: null,
      embeddingModel: getChatModelName ? null : null,
      scoreMode: getScoreMode(),
      ttlMs: parseInteger(
        process.env.RAG_INDEX_TTL_MS,
        DEFAULT_INDEX_TTL_MS,
        1_000,
        24 * 60 * 60 * 1_000
      ),
      fresh: false,
    };
  }

  return {
    built: true,
    builtAt: indexCache.builtAt,
    fingerprint: indexCache.fingerprint,
    docsDir: indexCache.docsDir,
    documentCount: indexCache.documentCount,
    chunkCount: indexCache.chunkCount,
    chunkSize: indexCache.chunkSize,
    chunkOverlap: indexCache.chunkOverlap,
    embeddingModel: indexCache.embeddingModel,
    scoreMode: getScoreMode(),
    fresh: isCacheFresh(indexCache),
    ttlMs: parseInteger(
      process.env.RAG_INDEX_TTL_MS,
      DEFAULT_INDEX_TTL_MS,
      1_000,
      24 * 60 * 60 * 1_000
    ),
  };
}

/**
 * Force rebuild RAG index ngay lập tức, bỏ qua TTL cache.
 * Dùng khi admin thêm/sửa file trong data/rag/papers.
 */
export async function forceRebuildIndex() {
  return buildOrRefreshIndex(true);
}

export async function retrieveRelevantChunks({ query, topK, scoreThreshold }) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    throw new RagRetrievalError("query is required for retrieval", 400);
  }

  const retrievalStart = Date.now();
  const index = await buildOrRefreshIndex(false);

  const resolvedTopK = parseInteger(
    topK,
    parseInteger(process.env.RAG_TOP_K_DEFAULT, DEFAULT_TOP_K, 1, 50),
    1,
    50
  );

  const resolvedScoreThreshold = parseFloatNumber(
    scoreThreshold,
    parseFloatNumber(process.env.RAG_SCORE_THRESHOLD, DEFAULT_SCORE_THRESHOLD, -1, 1),
    -1,
    1
  );

  const fetchK = Math.max(resolvedTopK * 4, resolvedTopK);
  const searchResults = await index.vectorStore.similaritySearchWithScore(normalizedQuery, fetchK);

  const scoredItems = searchResults
    .map(([document, score], rowIndex) => {
      const source = toSourceRelativePath(document?.metadata?.source || "unknown");
      const chunkIndex = Number(document?.metadata?.chunkIndex || rowIndex + 1);
      const totalChunks = Number(document?.metadata?.totalChunks || chunkIndex);

      return {
        id: `${source}#${chunkIndex}`,
        text: normalizeText(document?.pageContent),
        source,
        chunkIndex,
        totalChunks,
        score: Number(Number(score || 0).toFixed(4)),
      };
    })
    .filter((item) => item.text.length > 0);

  const filtered = applyScoreThreshold(scoredItems, resolvedScoreThreshold).slice(0, resolvedTopK);

  return {
    items: filtered,
    meta: {
      retrievalLatencyMs: Date.now() - retrievalStart,
      topK: resolvedTopK,
      scoreThreshold: resolvedScoreThreshold,
      scoreMode: getScoreMode(),
      embeddingModel: index.embeddingModel,
      indexBuiltAt: index.builtAt,
      corpus: {
        docsDir: index.docsDir,
        documentCount: index.documentCount,
        chunkCount: index.chunkCount,
        chunkSize: index.chunkSize,
        chunkOverlap: index.chunkOverlap,
      },
    },
  };
}

function buildContextBlock(retrievedItems) {
  return retrievedItems
    .map(
      (item) =>
        `[${item.source}#${item.chunkIndex} | score=${item.score}]\n${normalizeText(item.text)}`
    )
    .join("\n\n");
}

/**
 * Tạo câu trả lời từ retrieved context + conversation history.
 * @param {string} query - Câu hỏi hiện tại của user.
 * @param {Array}  retrievedItems - Các chunk được retrieve từ vector store.
 * @param {Array}  history - Lịch sử hội thoại [{role: "user"|"assistant", content: string}].
 *                          FE tự giữ và truyền lên, BE không lưu.
 */
export async function generateAnswerFromContext({ query, retrievedItems, history = [] }) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    throw new RagRetrievalError("query is required for answer generation", 400);
  }

  if (!Array.isArray(retrievedItems) || !retrievedItems.length) {
    return {
      answer: "Tôi không tìm thấy thông tin này trong dữ liệu hiện có.",
      llmUsed: false,
      chatModel: getChatModelName(),
      generationLatencyMs: 0,
    };
  }

  const generationStart = Date.now();

  try {
    const chatOptions = {
      apiKey: getOpenAiApiKey(),
      model: getChatModelName(),
    };

    const configuredTemperatureRaw = String(
      process.env.OPENAI_CHAT_TEMPERATURE ?? ""
    ).trim();

    if (configuredTemperatureRaw) {
      chatOptions.temperature = parseFloatNumber(
        configuredTemperatureRaw,
        1,
        0,
        2
      );
    }

    const llm = new ChatOpenAI(chatOptions);

    // System message: rules + retrieved context
    const systemContent = [
      SYSTEM_RULES,
      "",
      "Context:",
      buildContextBlock(retrievedItems),
    ].join("\n");

    // Build messages: [system, ...history, current_question]
    // History giúp bot hiểu follow-up như "còn món đó thì sao?"
    const safeHistory = Array.isArray(history) ? history : [];
    const messages = [
      new SystemMessage(systemContent),
      ...safeHistory.map((msg) =>
        msg.role === "assistant"
          ? new AIMessage(normalizeText(msg.content))
          : new HumanMessage(normalizeText(msg.content))
      ),
      new HumanMessage(normalizedQuery),
    ];

    const response = await llm.invoke(messages);
    const answer = normalizeText(String(response?.content || ""));

    return {
      answer: answer || "Tôi không tìm thấy thông tin này trong dữ liệu hiện có.",
      llmUsed: true,
      chatModel: getChatModelName(),
      generationLatencyMs: Date.now() - generationStart,
    };
  } catch (error) {
    throw new RagRetrievalError(
      `Failed to generate answer with LangChain: ${error.message}`,
      503
    );
  }
}
