// backend/src/fetch_wiki_simple.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

// ================== CONFIG ==================
const WIKI_URL =
  "https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_m%C3%B3n_%C4%83n_Vi%E1%BB%87t_Nam";
const OUTPUT_DIR = path.resolve(process.cwd(), "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "wikipedia_vn_dishes_filtered.csv");
const DEFAULT_COUNT = 200;

// ================== HELPERS ==================
function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function hasAny(text, kws) {
  const t = (text || "").toLowerCase();
  return kws.some((k) => t.includes(k));
}
function norm(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\[\d+\]/g, "");
}

// Map vùng
const NORTH_KW = [
  "miền bắc",
  "hà nội",
  "nam định",
  "ninh bình",
  "hải phòng",
  "quảng ninh",
  "thái bình",
  "bắc ninh",
  "bắc giang",
  "lạng sơn",
  "cao bằng",
  "hà giang",
  "phú thọ",
  "vĩnh phúc",
  "hoà bình",
];
const CENTRAL_KW = [
  "miền trung",
  "huế",
  "thừa thiên huế",
  "đà nẵng",
  "quảng nam",
  "quảng ngãi",
  "quảng trị",
  "nghệ an",
  "hà tĩnh",
  "thanh hoá",
  "nha trang",
  "khánh hoà",
  "bình định",
  "phú yên",
  "gia lai",
  "kon tum",
  "đắk lắk",
  "tây nguyên",
  "trung du",
];
const SOUTH_KW = [
  "miền nam",
  "sài gòn",
  "tp.hcm",
  "hồ chí minh",
  "cần thơ",
  "đbscl",
  "đồng bằng sông cửu long",
  "vĩnh long",
  "cà mau",
  "bạc liêu",
  "sóc trăng",
  "an giang",
  "kiên giang",
  "đồng tháp",
  "tiền giang",
  "bến tre",
  "trà vinh",
  "tây ninh",
  "bình dương",
  "đồng nai",
  "bà rịa",
  "vũng tàu",
  "long an",
  "hậu giang",
];

function guessRegion(locality, name, desc) {
  const t = [locality, name, desc].filter(Boolean).join(" ").toLowerCase();
  if (hasAny(t, NORTH_KW)) return "Bắc";
  if (hasAny(t, CENTRAL_KW)) return "Trung";
  if (hasAny(t, SOUTH_KW)) return "Nam";
  return ""; // sẽ cân bằng sau
}

const CAT_RULES = [
  {
    cat: "soup",
    keys: [
      "canh ",
      "phở",
      "phở",
      "cháo",
      "lẩu",
      "bún bò huế",
      "bún cá",
      "bún riêu",
      "bún mắm",
      "súp",
    ],
  },
  {
    cat: "main",
    keys: [
      "cơm",
      "bún ",
      "hủ tiếu",
      "mì ",
      "miến",
      "cao lầu",
      "bánh canh",
      "bánh hỏi",
      "bún chả",
      "bún thịt",
      "bún đậu",
    ],
  },
  { cat: "salad", keys: ["gỏi", "nộm"] },
  {
    cat: "snack",
    keys: [
      "bánh xèo",
      "bánh khọt",
      "bánh căn",
      "bánh mì",
      "bánh cuốn",
      "bánh ít",
      "bánh bèo",
      "bánh nậm",
      "bánh lọc",
      "bánh tằm",
    ],
  },
  {
    cat: "dessert",
    keys: [
      "chè",
      "rau câu",
      "bánh flan",
      "bánh chuối",
      "bánh da lợn",
      "tráng miệng",
    ],
  },
  {
    cat: "drink",
    keys: ["sữa đậu nành", "nước mía", "trà tắc", "trà sữa", "đồ uống"],
  },
];

function guessCategory(name, section, typeCell) {
  const base =
    (
      (name || "") +
      " " +
      (section || "") +
      " " +
      (typeCell || "")
    ).toLowerCase() + " ";
  for (const r of CAT_RULES) if (hasAny(base, r.keys)) return r.cat;
  if ((section || "").toLowerCase().includes("tráng miệng")) return "dessert";
  if ((section || "").toLowerCase().includes("món cuốn")) return "main";
  return "main";
}

function guessMealTypes(name, category) {
  const n = (name || "").toLowerCase();
  if (category === "dessert" || hasAny(n, ["chè", "tráng miệng", "flan"]))
    return "dinner,lunch";
  if (hasAny(n, ["bánh mì", "xôi", "cháo", "phở", "bún"]))
    return "breakfast,lunch";
  if (category === "soup") return "lunch,dinner";
  return "lunch,dinner";
}

const ALLERGEN_DICT = [
  { key: "shrimp", kws: ["tôm", "ruốc", "mắm tôm", "tép"] },
  { key: "peanuts", kws: ["đậu phộng", "lạc"] },
  { key: "fish_sauce", kws: ["nước mắm", "mắm"] },
  {
    key: "soy",
    kws: ["đậu nành", "đậu hũ", "đậu phụ", "xì dầu", "nước tương"],
  },
  { key: "egg", kws: ["trứng"] },
  { key: "gluten", kws: ["bánh mì", "mì", "bột mì"] },
];
function guessAllergens(text) {
  const out = new Set();
  for (const a of ALLERGEN_DICT) if (hasAny(text, a.kws)) out.add(a.key);
  return [...out];
}

function guessDietTags(text, category) {
  const s = new Set();
  const t = (text || "").toLowerCase();
  if (hasAny(t, ["đậu hũ", "đậu phụ", "nấm", "rau", "chay"]))
    s.add("vegetarian");
  if (category === "salad" || hasAny(t, ["gỏi", "cuốn", "luộc", "hấp"]))
    s.add("light");
  if (!s.size) s.add("balanced");
  return [...s];
}

function estimateNutrition(category, name = "") {
  const base = {
    calories: 500,
    protein_g: 20,
    carbs_g: 60,
    fat_g: 15,
    fiber_g: 3,
    sodium_mg: 900,
    sugar_g: 5,
  };
  if (category === "dessert")
    return {
      calories: 280,
      protein_g: 5,
      carbs_g: 50,
      fat_g: 6,
      fiber_g: 1,
      sodium_mg: 150,
      sugar_g: 25,
    };
  if (category === "salad")
    return {
      calories: 250,
      protein_g: 14,
      carbs_g: 28,
      fat_g: 8,
      fiber_g: 4,
      sodium_mg: 450,
      sugar_g: 6,
    };
  if (category === "soup")
    return {
      calories: 420,
      protein_g: 18,
      carbs_g: 55,
      fat_g: 10,
      fiber_g: 3,
      sodium_mg: 900,
      sugar_g: 4,
    };
  if (hasAny(name.toLowerCase(), ["cơm tấm", "cơm"]))
    return {
      calories: 700,
      protein_g: 32,
      carbs_g: 90,
      fat_g: 22,
      fiber_g: 3,
      sodium_mg: 1300,
      sugar_g: 8,
    };
  return base;
}
function estimatePrice(category) {
  if (category === "dessert") return { min: 15000, max: 30000 };
  if (category === "salad") return { min: 25000, max: 45000 };
  if (category === "soup") return { min: 30000, max: 60000 };
  if (category === "main") return { min: 35000, max: 65000 };
  if (category === "snack") return { min: 20000, max: 40000 };
  if (category === "drink") return { min: 10000, max: 30000 };
  return { min: 30000, max: 60000 };
}

function pickImageHref($imgLink) {
  const href = $imgLink?.attr("href"); // "/wiki/Tập_tin:..."
  if (!href) return "";
  const titlePart = decodeURIComponent(href.split(":").slice(1).join(":"));
  if (!titlePart) return "";
  return `http://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    titlePart
  )}`;
}

// ================== FETCH & PARSE ==================
async function fetchHtmlWithRetry(url, maxTry = 3) {
  let lastErr;
  for (let i = 0; i < maxTry; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "smartmeal/1.0",
          "Accept-Language": "vi,en;q=0.9",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

function detectColumns($table) {
  // Tìm dòng header (th)
  const headerCells = $table.find("tr").first().find("th");
  const headers = headerCells
    .map((i, th) => norm(cheerio.load(th).text()).toLowerCase())
    .get();

  // Từ khóa linh hoạt
  const nameIdx = headers.findIndex((h) => /tên|món/i.test(h));
  const imgIdx = headers.findIndex((h) => /hình|ảnh/i.test(h));
  const regionIdx = headers.findIndex((h) =>
    /(địa phương|vùng|xuất xứ|tỉnh|khu vực)/i.test(h)
  );
  const typeIdx = headers.findIndex((h) => /(phân loại|loại)/i.test(h));
  const descIdx = headers.findIndex((h) =>
    /(miêu tả|mô tả|giới thiệu)/i.test(h)
  );

  // ít nhất phải có tên + mô tả hoặc tên + (địa phương|vùng)
  const ok =
    nameIdx !== -1 && (descIdx !== -1 || regionIdx !== -1 || typeIdx !== -1);
  if (!ok) return null;
  return { nameIdx, imgIdx, regionIdx, typeIdx, descIdx };
}

function parsePage(html, targetCount) {
  const $ = cheerio.load(html);
  const rows = [];

  $("table.wikitable").each((ti, table) => {
    const $table = $(table);
    const cols = detectColumns($table);
    if (!cols) return;

    $table
      .find("tr")
      .slice(1)
      .each((ri, tr) => {
        const $tds = $(tr).find("td");
        if ($tds.length === 0) return;

        const name =
          cols.nameIdx !== -1 ? norm($tds.eq(cols.nameIdx).text()) : "";
        if (!name) return;

        const id = slugify(name);
        const $imgLink =
          cols.imgIdx !== -1
            ? $tds.eq(cols.imgIdx).find("a.image").first()
            : null;
        const image_url = pickImageHref($imgLink);
        const locality =
          cols.regionIdx !== -1 ? norm($tds.eq(cols.regionIdx).text()) : "";
        const typeCell =
          cols.typeIdx !== -1 ? norm($tds.eq(cols.typeIdx).text()) : "";
        const desc =
          cols.descIdx !== -1 ? norm($tds.eq(cols.descIdx).text()) : "";

        const sectionTitle = $(table).prevAll("h2").first().text().trim();

        const region = guessRegion(locality, name, desc);
        const category = guessCategory(name, sectionTitle, typeCell);
        const meal_types = guessMealTypes(name, category);
        const allergens = guessAllergens(`${name} ${desc}`).join(",");
        const diet_tags = guessDietTags(`${name} ${desc}`, category).join(",");
        const nutri = estimateNutrition(category, name);
        const price = estimatePrice(category);

        rows.push({
          id,
          name_vi: name,
          name_en: "",
          region,
          category,
          meal_types,
          prep_time_min: 20,
          cook_time_min: 20,
          difficulty: "medium",
          calories: nutri.calories,
          protein_g: nutri.protein_g,
          carbs_g: nutri.carbs_g,
          fat_g: nutri.fat_g,
          fiber_g: nutri.fiber_g,
          sodium_mg: nutri.sodium_mg,
          sugar_g: nutri.sugar_g,
          price_est_vnd_min: price.min,
          price_est_vnd_max: price.max,
          diet_tags,
          allergens,
          taste_profile: "savory,umami",
          spice_level: 1,
          servings: 1,
          image_url,
          description: desc,
          ingredients: "",
          utensils: "",
          steps: "",
          suitable_for: "",
          avoid_for: "",
        });
      });
  });

  // Dedup theo slug
  const seen = new Set();
  const uniq = [];
  for (const r of rows) {
    if (!r.id || seen.has(r.id)) continue;
    seen.add(r.id);
    uniq.push(r);
  }

  // Cân bằng vùng
  const unknown = uniq.filter((r) => !r.region);
  const known = uniq.filter((r) => !!r.region);
  const counts = {
    Bắc: known.filter((r) => r.region === "Bắc").length,
    Trung: known.filter((r) => r.region === "Trung").length,
    Nam: known.filter((r) => r.region === "Nam").length,
  };
  for (const r of unknown) {
    const minRegion = Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0];
    r.region = minRegion;
    counts[minRegion] += 1;
  }

  // Cắt theo count nhưng cố giữ cân bằng
  const target = targetCount || DEFAULT_COUNT;
  let out = uniq;
  if (out.length > target) {
    const per = Math.floor(target / 3);
    const b = out.filter((r) => r.region === "Bắc").slice(0, per);
    const t = out.filter((r) => r.region === "Trung").slice(0, per);
    const n = out.filter((r) => r.region === "Nam").slice(0, per);
    let picked = [...b, ...t, ...n];
    if (picked.length < target) {
      const remain = out
        .filter((r) => !picked.includes(r))
        .slice(0, target - picked.length);
      picked = picked.concat(remain);
    }
    out = picked.slice(0, target);
  }

  return out;
}

function toCSV(rows) {
  const header = [
    "id",
    "name_vi",
    "region",
    "category",
    "meal_types",
    "prep_time_min",
    "cook_time_min",
    "difficulty",
    "calories",
    "protein_g",
    "carbs_g",
    "fat_g",
    "fiber_g",
    "sodium_mg",
    "sugar_g",
    "price_est_vnd_min",
    "price_est_vnd_max",
    "diet_tags",
    "allergens",
    "taste_profile",
    "spice_level",
    "servings",
    "image_url",
    "description",
    "ingredients",
    "utensils",
    "steps",
    "suitable_for",
    "avoid_for",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    const obj = {
      id: r.id,
      name_vi: r.name_vi,
      region: r.region,
      category: r.category,
      meal_types: r.meal_types,
      prep_time_min: r.prep_time_min,
      cook_time_min: r.cook_time_min,
      difficulty: r.difficulty,
      calories: r.calories,
      protein_g: r.protein_g,
      carbs_g: r.carbs_g,
      fat_g: r.fat_g,
      fiber_g: r.fiber_g,
      sodium_mg: r.sodium_mg,
      sugar_g: r.sugar_g,
      price_est_vnd_min: r.price_est_vnd_min,
      price_est_vnd_max: r.price_est_vnd_max,
      diet_tags: r.diet_tags,
      allergens: r.allergens,
      taste_profile: r.taste_profile,
      spice_level: r.spice_level,
      servings: r.servings,
      image_url: r.image_url,
      description: r.description,
      ingredients: r.ingredients,
      utensils: r.utensils,
      steps: r.steps,
      suitable_for: r.suitable_for,
      avoid_for: r.avoid_for,
    };
    const row = Object.values(obj)
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
    lines.push(row);
  }
  return lines.join("\n");
}

// ================== MAIN ==================
async function main() {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf("--count");
  const count =
    idx !== -1 ? Math.max(1, parseInt(argv[idx + 1], 10)) : DEFAULT_COUNT;

  console.log("⬇  Fetching Wikipedia…");
  const html = await fetchHtmlWithRetry(WIKI_URL, 3);
  console.log("✅ Downloaded HTML");

  const rows = parsePage(html, count);
  console.log(`✅ Parsed ${rows.length} dishes`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, toCSV(rows), "utf8");
  console.log(`💾 CSV saved: ${OUTPUT_FILE}`);
  console.log("👉 Mở file để chỉnh nhanh (nếu muốn), rồi seed vào Mongo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
