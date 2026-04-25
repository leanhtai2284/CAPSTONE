import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const TITLE_CANDIDATES = ["title", "name_vi", "name", "recipe_name", "recipe"];
const INGREDIENT_CANDIDATES = [
  "cleaned_ingredients",
  "ingredients",
  "recipeingredientparts",
  "ingredient_parts",
  "ingredient",
];
const INSTRUCTION_CANDIDATES = [
  "instructions",
  "steps",
  "recipeinstructions",
  "directions",
  "method",
];
const IMAGE_CANDIDATES = ["image_name", "image", "images", "image_url", "photo"];

function parseArgs(argv) {
  const args = {};
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("-")) {
      positional.push(token);
      continue;
    }

    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eqIndex = body.indexOf("=");
      if (eqIndex >= 0) {
        const key = body.slice(0, eqIndex);
        const value = body.slice(eqIndex + 1);
        args[key] = value;
        continue;
      }

      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        args[body] = next;
        i += 1;
      } else {
        args[body] = "true";
      }
      continue;
    }

    if (token === "-i") {
      args.input = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === "-o") {
      args.output = argv[i + 1];
      i += 1;
    }
  }

  if (!args.input && positional[0]) {
    args.input = positional[0];
  }

  if (!args.output && positional[1]) {
    args.output = positional[1];
  }

  return args;
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function toInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function cleanText(value) {
  return String(value || "").replace(/\r/g, "").trim();
}

function normalizeForDedupe(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function escapeCsv(value) {
  const text = String(value || "");
  return `"${text.replace(/"/g, '""')}"`;
}

function resolvePath(inputValue) {
  if (!inputValue) return "";
  if (path.isAbsolute(inputValue)) return path.normalize(inputValue);
  return path.resolve(process.cwd(), inputValue);
}

function findHeader(headers, target) {
  const normalizedTarget = normalizeHeader(target);
  if (!normalizedTarget) return "";

  for (const header of headers) {
    if (normalizeHeader(header) === normalizedTarget) {
      return header;
    }
  }

  return "";
}

function resolveColumn(headers, explicitName, candidates, required = true) {
  if (explicitName) {
    const found = findHeader(headers, explicitName);
    if (!found && required) {
      throw new Error(`Requested column not found: ${explicitName}`);
    }
    return found;
  }

  for (const candidate of candidates) {
    const found = findHeader(headers, candidate);
    if (found) return found;
  }

  if (!required) return "";
  throw new Error(
    `Could not auto-detect required column. Tried: ${candidates.join(", ")}`
  );
}

function printUsage() {
  console.log("Usage:");
  console.log(
    "  node src/scripts/curate_rag_csv.js --input <raw.csv> [--output <papers.csv>] [--maxRows 15000] [--dedupe true]"
  );
  console.log("");
  console.log("Optional column mapping:");
  console.log("  --titleCol <columnName>");
  console.log("  --ingredientsCol <columnName>");
  console.log("  --instructionsCol <columnName>");
  console.log("  --imageCol <columnName>");
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const inputArg = args.input;

  if (!inputArg) {
    printUsage();
    process.exit(1);
  }

  const inputPath = resolvePath(inputArg);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input CSV not found: ${inputPath}`);
  }

  const inputName = path.basename(inputPath, path.extname(inputPath));
  const defaultOutput = path.resolve(
    process.cwd(),
    "data",
    "rag",
    "papers",
    `${inputName}_curated.csv`
  );
  const outputPath = resolvePath(args.output || defaultOutput);

  const maxRows = toInteger(args.maxRows, Number.MAX_SAFE_INTEGER, 1, Number.MAX_SAFE_INTEGER);
  const dedupe = toBoolean(args.dedupe, true);
  const overwrite = toBoolean(args.overwrite, true);
  const minInstructionChars = toInteger(args.minInstructionChars, 1, 0, 10000);

  if (fs.existsSync(outputPath) && !overwrite) {
    throw new Error(`Output file already exists. Use --overwrite true to replace: ${outputPath}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const readStream = fs.createReadStream(inputPath);
  const parser = csvParser({
    mapHeaders: ({ header }) => String(header || "").replace(/^\uFEFF/, "").trim(),
  });
  const writeStream = fs.createWriteStream(outputPath, { encoding: "utf8" });

  let sourceRows = 0;
  let scannedRows = 0;
  let keptRows = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  let skippedTooShort = 0;
  let selectedColumns = null;
  const seenKeys = new Set();

  writeStream.write("Title,Cleaned_Ingredients,Instructions,Image_Name,Source_Row\n");

  await new Promise((resolve, reject) => {
    const stopWithError = (error) => {
      readStream.destroy();
      parser.destroy();
      reject(error);
    };

    readStream.on("error", stopWithError);
    parser.on("error", stopWithError);
    writeStream.on("error", reject);

    parser.on("data", (row) => {
      sourceRows += 1;
      if (scannedRows >= maxRows) return;
      scannedRows += 1;

      if (!selectedColumns) {
        const headers = Object.keys(row || {});
        selectedColumns = {
          title: resolveColumn(headers, args.titleCol, TITLE_CANDIDATES, true),
          ingredients: resolveColumn(
            headers,
            args.ingredientsCol,
            INGREDIENT_CANDIDATES,
            false
          ),
          instructions: resolveColumn(
            headers,
            args.instructionsCol,
            INSTRUCTION_CANDIDATES,
            true
          ),
          image: resolveColumn(headers, args.imageCol, IMAGE_CANDIDATES, false),
        };
      }

      const title = cleanText(row[selectedColumns.title]);
      const ingredients = cleanText(
        selectedColumns.ingredients ? row[selectedColumns.ingredients] : ""
      );
      const instructions = cleanText(row[selectedColumns.instructions]);
      const imageName = cleanText(selectedColumns.image ? row[selectedColumns.image] : "");

      if (!title || !instructions) {
        skippedMissing += 1;
        return;
      }

      if (instructions.length < minInstructionChars) {
        skippedTooShort += 1;
        return;
      }

      if (dedupe) {
        const dedupeKey = [
          normalizeForDedupe(title),
          normalizeForDedupe(ingredients),
          normalizeForDedupe(instructions),
        ].join("|");

        if (seenKeys.has(dedupeKey)) {
          skippedDuplicate += 1;
          return;
        }
        seenKeys.add(dedupeKey);
      }

      const line = [
        escapeCsv(title),
        escapeCsv(ingredients),
        escapeCsv(instructions),
        escapeCsv(imageName),
        escapeCsv(String(sourceRows)),
      ].join(",");

      const canContinue = writeStream.write(`${line}\n`);
      keptRows += 1;

      if (!canContinue) {
        parser.pause();
        writeStream.once("drain", () => parser.resume());
      }
    });

    parser.on("end", resolve);

    readStream.pipe(parser);
  });

  await new Promise((resolve, reject) => {
    writeStream.on("error", reject);
    writeStream.end(resolve);
  });

  const outputSizeBytes = fs.statSync(outputPath).size;

  console.log("CURATION_DONE=true");
  console.log(`INPUT=${inputPath}`);
  console.log(`OUTPUT=${outputPath}`);
  console.log(`SCANNED_ROWS=${scannedRows}`);
  console.log(`SOURCE_ROWS=${sourceRows}`);
  console.log(`KEPT_ROWS=${keptRows}`);
  console.log(`SKIPPED_MISSING_REQUIRED=${skippedMissing}`);
  console.log(`SKIPPED_SHORT_INSTRUCTIONS=${skippedTooShort}`);
  console.log(`SKIPPED_DUPLICATES=${skippedDuplicate}`);
  console.log(`OUTPUT_SIZE_MB=${(outputSizeBytes / (1024 * 1024)).toFixed(2)}`);

  if (selectedColumns) {
    console.log("SELECTED_COLUMNS:");
    console.log(`  title=${selectedColumns.title}`);
    console.log(`  ingredients=${selectedColumns.ingredients || "(none)"}`);
    console.log(`  instructions=${selectedColumns.instructions}`);
    console.log(`  image=${selectedColumns.image || "(none)"}`);
  }
}

run().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
