import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import OpenAI from "openai";

const require = createRequire(import.meta.url);

let pdfParse = null;
try {
  pdfParse = require("pdf-parse");
} catch (error) {
  pdfParse = null;
}

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".txt", ".md", ".markdown"]);

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_TOP_K = 5;
const DEFAULT_SCORE_THRESHOLD = 0.2;
const DEFAULT_BATCH_SIZE = 64;
const DEFAULT_INDEX_TTL_MS = 10 * 60 * 1000;

let indexCache = null;
let indexBuildPromise = null;

export class RagRetrievalError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "RagRetrievalError";
    this.statusCode = statusCode;
  }
}

function toPosixPath(value) {
  return value.replace(/\\/g, "/");
}

function normalizeText(value) {
  return String(value || "").replace(/\r/g, "").trim();
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

function getEmbeddingModel() {
  return String(process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large").trim();
}

function getOpenAiClient() {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw new RagRetrievalError(
      "OPENAI_API_KEY is missing. Please configure it in backend/.env",
      503
    );
  }
  return new OpenAI({ apiKey });
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

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const stats = await fs.stat(filePath);
    documentFiles.push({
      absolutePath: filePath,
      relativePath: toPosixPath(path.relative(docsDir, filePath)),
      size: stats.size,
      mtimeMs: Math.floor(stats.mtimeMs),
    });
  }

  documentFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  if (!documentFiles.length) {
    throw new RagRetrievalError(
      `No supported documents found in ${docsDir}. Add .pdf, .txt, or .md files.`,
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

async function readSingleDocument(fileInfo) {
  const ext = path.extname(fileInfo.absolutePath).toLowerCase();

  if (ext === ".pdf") {
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

  const rawText = await fs.readFile(fileInfo.absolutePath, "utf8");
  return normalizeText(rawText);
}

function chunkText(text, chunkSize, overlap) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  if (normalized.length <= chunkSize) {
    return [normalized];
  }

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const breakAtNewline = normalized.lastIndexOf("\n", end);
      if (breakAtNewline > start + Math.floor(chunkSize * 0.6)) {
        end = breakAtNewline;
      } else {
        const breakAtSpace = normalized.lastIndexOf(" ", end);
        if (breakAtSpace > start + Math.floor(chunkSize * 0.6)) {
          end = breakAtSpace;
        }
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

async function buildChunks(documentFiles, chunkSize, overlap) {
  const chunks = [];

  for (const documentFile of documentFiles) {
    const content = await readSingleDocument(documentFile);
    if (!content) continue;

    const docChunks = chunkText(content, chunkSize, overlap);

    for (let i = 0; i < docChunks.length; i += 1) {
      chunks.push({
        id: `${documentFile.relativePath}#${i + 1}`,
        text: docChunks[i],
        metadata: {
          source: documentFile.relativePath,
          chunkIndex: i + 1,
          totalChunks: docChunks.length,
        },
      });
    }
  }

  return chunks;
}

async function createEmbeddings(client, texts, model, batchSize) {
  const allVectors = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model,
      input: batch,
    });

    for (const item of response.data) {
      allVectors.push(item.embedding);
    }
  }

  if (allVectors.length !== texts.length) {
    throw new RagRetrievalError(
      "Embedding generation returned mismatched vector count.",
      500
    );
  }

  return allVectors;
}

function cosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) return -1;
  if (vectorA.length === 0 || vectorA.length !== vectorB.length) return -1;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    const a = vectorA[i];
    const b = vectorB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return -1;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
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

    const chunks = await buildChunks(documentFiles, chunkSize, chunkOverlap);

    if (!chunks.length) {
      throw new RagRetrievalError(
        "All documents are empty after parsing. Please add readable text content.",
        400
      );
    }

    const client = getOpenAiClient();
    const embeddingModel = getEmbeddingModel();
    const batchSize = parseInteger(
      process.env.RAG_EMBEDDING_BATCH_SIZE,
      DEFAULT_BATCH_SIZE,
      1,
      128
    );

    const vectors = await createEmbeddings(
      client,
      chunks.map((chunk) => chunk.text),
      embeddingModel,
      batchSize
    );

    const entries = chunks.map((chunk, index) => ({
      ...chunk,
      vector: vectors[index],
    }));

    indexCache = {
      fingerprint,
      builtAtMs: Date.now(),
      builtAt: new Date().toISOString(),
      docsDir,
      embeddingModel,
      chunkSize,
      chunkOverlap,
      documentCount: documentFiles.length,
      chunkCount: entries.length,
      entries,
    };

    return indexCache;
  })();

  try {
    return await indexBuildPromise;
  } finally {
    indexBuildPromise = null;
  }
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

export async function retrieveRelevantChunks({ query, topK, scoreThreshold }) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    throw new RagRetrievalError("query is required for retrieval", 400);
  }

  const retrievalStart = Date.now();
  const index = await buildOrRefreshIndex(false);

  const client = getOpenAiClient();
  const [queryVector] = await createEmbeddings(client, [normalizedQuery], index.embeddingModel, 1);

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

  const scored = index.entries
    .map((entry) => ({
      ...entry,
      score: cosineSimilarity(queryVector, entry.vector),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score);

  const filtered =
    resolvedScoreThreshold <= -1
      ? scored
      : scored.filter((entry) => entry.score >= resolvedScoreThreshold);

  const selected = filtered.slice(0, resolvedTopK);

  return {
    items: selected.map((entry) => ({
      id: entry.id,
      text: entry.text,
      source: entry.metadata.source,
      chunkIndex: entry.metadata.chunkIndex,
      totalChunks: entry.metadata.totalChunks,
      score: Number(entry.score.toFixed(4)),
    })),
    meta: {
      retrievalLatencyMs: Date.now() - retrievalStart,
      topK: resolvedTopK,
      scoreThreshold: resolvedScoreThreshold,
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
