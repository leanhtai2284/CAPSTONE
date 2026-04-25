import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(
  __dirname,
  "../../data/wikipedia_vn_dishes_filtered.csv"
);

// Hàm parse CSV đúng cách (xử lý quotes)
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Hàm tính giá mới - phân bổ đều cho 3 nhóm: Thấp, Trung bình, Cao
function calculateNewPrice(difficulty, index, total) {
  let newMin, newMax;

  // Phân bổ đều: 33% thấp, 33% trung bình, 34% cao
  const position = index / total;

  if (position < 0.33) {
    // 33% món đầu: Giá THẤP 12k-35k
    newMin = Math.floor(Math.random() * (35000 - 12000) + 12000);
    newMax = newMin + Math.floor(Math.random() * (15000 - 8000) + 8000);
  } else if (position < 0.66) {
    // 33% tiếp theo: Giá TRUNG BÌNH 35k-55k
    newMin = Math.floor(Math.random() * (55000 - 35000) + 35000);
    newMax = newMin + Math.floor(Math.random() * (20000 - 12000) + 12000);
  } else {
    // 34% cuối: Giá CAO 55k-85k
    newMin = Math.floor(Math.random() * (85000 - 55000) + 55000);
    newMax = newMin + Math.floor(Math.random() * (30000 - 18000) + 18000);
  }

  // Làm tròn đến 1000
  newMin = Math.round(newMin / 1000) * 1000;
  newMax = Math.round(newMax / 1000) * 1000;

  // Đảm bảo min < max và cả 2 > 0
  if (newMin <= 0) newMin = 10000;
  if (newMax <= newMin) newMax = newMin + 10000;

  return { newMin, newMax };
}

// Đọc file CSV
const content = fs.readFileSync(csvPath, "utf-8");
const lines = content.split("\n").filter((line) => line.trim());
const header = lines[0];
const headerCols = parseCSVLine(header);

// Tìm index các cột cần thiết
const difficultyIndex = headerCols.indexOf("difficulty");
const priceMinIndex = headerCols.indexOf("price_est_vnd_min");
const priceMaxIndex = headerCols.indexOf("price_est_vnd_max");

console.log(` Tổng số món: ${lines.length - 1}`);
console.log(
  ` Cột difficulty: ${difficultyIndex}, price_min: ${priceMinIndex}, price_max: ${priceMaxIndex}\n`
);

// Parse và cập nhật từng dòng
const updatedLines = [header];
const dataLines = lines.slice(1);
const totalRecipes = dataLines.length;

dataLines.forEach((line, index) => {
  const columns = parseCSVLine(line);

  if (columns.length < headerCols.length) {
    updatedLines.push(line);
    return;
  }

  const difficulty = columns[difficultyIndex];
  const { newMin, newMax } = calculateNewPrice(difficulty, index, totalRecipes);

  // Cập nhật giá mới
  columns[priceMinIndex] = newMin.toString();
  columns[priceMaxIndex] = newMax.toString();

  // Rebuild line với quotes khi cần
  const rebuiltLine = columns
    .map((col, i) => {
      // Thêm quotes nếu có dấu phẩy hoặc quotes trong nội dung
      if (col.includes(",") || col.includes('"') || col.includes("\n")) {
        return `"${col.replace(/"/g, '""')}"`;
      }
      return col;
    })
    .join(",");

  updatedLines.push(rebuiltLine);
});

// Backup file cũ
const backupPath = csvPath.replace(".csv", "_backup.csv");
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(csvPath, backupPath);
  console.log(` Đã backup file gốc: ${backupPath}`);
}

// Ghi file mới
fs.writeFileSync(csvPath, updatedLines.join("\n"), "utf-8");
console.log(` Đã cập nhật giá cho ${dataLines.length} món\n`);

// Thống kê
let lowPrice = 0,
  midPrice = 0,
  highPrice = 0;
dataLines.forEach((line, index) => {
  const columns = parseCSVLine(line);
  if (columns.length >= priceMinIndex) {
    const minPrice = parseInt(columns[priceMinIndex]) || 0;
    if (minPrice < 35000) lowPrice++;
    else if (minPrice < 55000) midPrice++;
    else highPrice++;
  }
});

console.log(" Phân bố giá mới:");
console.log(
  `   Giá THẤP (< 35k): ${lowPrice} món (${Math.round(
    (lowPrice / dataLines.length) * 100
  )}%)`
);
console.log(
  `   Giá TRUNG BÌNH (35k-55k): ${midPrice} món (${Math.round(
    (midPrice / dataLines.length) * 100
  )}%)`
);
console.log(
  `   Giá CAO (≥ 55k): ${highPrice} món (${Math.round(
    (highPrice / dataLines.length) * 100
  )}%)`
);
console.log(`   Tổng: ${lowPrice + midPrice + highPrice} món\n`);
