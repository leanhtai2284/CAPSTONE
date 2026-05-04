# 📘 SmartMeal — AI RAG API Documentation

> **Base URL:** `http://localhost:5000/api/ai`
> **Auth:** Tất cả endpoint đều yêu cầu JWT token trong header.
> ```
> Authorization: Bearer <token>
> ```

---

## Danh sách endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/ai/rag/status` | Kiểm tra trạng thái RAG index |
| `POST` | `/api/ai/rag/query` | Hỏi AI (có hỗ trợ conversation history) |
| `POST` | `/api/ai/rag/rebuild` | Force rebuild RAG index (admin/dev) |

---

## 1. GET `/api/ai/rag/status`

Kiểm tra xem RAG index đã được build chưa. FE có thể dùng để hiển thị trạng thái "AI đang sẵn sàng" hay chưa.

### Request
Không có body.

### Response — Index đã build
```json
{
  "success": true,
  "data": {
    "built": true,
    "builtAt": "2026-04-24T11:00:00.000Z",
    "fingerprint": "recipes.csv:20955637:1714000000000|...",
    "docsDir": "C:/...CAPSTONE/backend/data/rag/papers",
    "documentCount": 3,
    "chunkCount": 1842,
    "chunkSize": 900,
    "chunkOverlap": 120,
    "embeddingModel": "text-embedding-3-small",
    "scoreMode": "similarity",
    "fresh": true,
    "ttlMs": 600000
  },
  "meta": {
    "version": "rag-v1-langchain",
    "timestamp": "2026-04-24T11:38:00.000Z"
  }
}
```

### Response — Index chưa build (server mới khởi động, chưa có query nào)
```json
{
  "success": true,
  "data": {
    "built": false,
    "builtAt": null,
    "documentCount": 0,
    "chunkCount": 0,
    "fresh": false
  },
  "meta": { ... }
}
```

### Gợi ý dùng
- Khi mở chatbot page: gọi `/status` để check. Nếu `built: false` → hiển thị skeleton/loading "AI đang khởi động...".
- Index sẽ tự build lần đầu khi có query đầu tiên. TTL mặc định 10 phút.

---

## 2. POST `/api/ai/rag/query`

Gửi câu hỏi, nhận câu trả lời từ AI dựa trên knowledge base của SmartMeal.

### Request Body

```json
{
  "query": "Phở bò có bao nhiêu calories?",

  "history": [
    { "role": "user",      "content": "Tôi muốn ăn ít carb" },
    { "role": "assistant", "content": "Bạn có thể thử các món keto như..." }
  ],

  "options": {
    "topK": 5,
    "scoreThreshold": 0.2,
    "includePantryContext": false
  }
}
```

### Giải thích từng field

| Field | Type | Bắt buộc | Default | Mô tả |
|-------|------|----------|---------|-------|
| `query` | `string` | ✅ | — | Câu hỏi của user. Min 2 ký tự, max 500. |
| `history` | `array` | ❌ | `[]` | Lịch sử hội thoại. Mỗi item có `role` (`"user"` hoặc `"assistant"`) và `content`. Max 6 tin gần nhất (3 lượt hỏi-đáp). **FE tự giữ state, BE không lưu.** |
| `options.topK` | `number` | ❌ | `12` | Số lượng chunk retrieve từ vector store. Mặc định là 12 để đảm bảo quét đủ cả 400+ món ăn lẫn cẩm nang dinh dưỡng. |
| `options.scoreThreshold` | `number` | ❌ | `0.2` | Ngưỡng similarity score. Range: -1 đến 1. Càng cao càng strict. |
| `options.includePantryContext` | `boolean` | ❌ | `false` | Nếu `true`, AI sẽ đọc pantry của user và dùng làm context khi trả lời (VD: "tôi nấu được gì?"). |

### Response — Thành công

```json
{
  "success": true,
  "message": "RAG LangChain pipeline is ready",
  "data": {
    "answer": "Phở bò có khoảng 400–500 kcal cho một tô tiêu chuẩn (wikipedia_vn_dishes_filtered#12).",
    "sources": [
      {
        "source": "wikipedia_vn_dishes_filtered.csv",
        "chunks": [12, 13],
        "topScore": 0.8731
      }
    ],
    "retrievedContext": [
      {
        "source": "wikipedia_vn_dishes_filtered.csv",
        "chunkIndex": 12,
        "totalChunks": 456,
        "score": 0.8731,
        "text": "row 12: name_vi: Phở bò | calories: 450 | ..."
      }
    ],
    "llmUsed": true,
    "retrievalUsed": true,
    "stage": "retrieval+generation"
  },
  "meta": {
    "version": "rag-v1-langchain",
    "query": "Phở bò có bao nhiêu calories?",
    "topK": 5,
    "scoreThreshold": 0.2,
    "includePantryContext": false,
    "pantryItemsUsed": 0,
    "retrievalQueryMode": "query_only",
    "embeddingModel": "text-embedding-3-small",
    "chatModel": "gpt-4o-mini",
    "retrievalLatencyMs": 312,
    "generationLatencyMs": 1540,
    "scoreMode": "similarity",
    "indexBuiltAt": "2026-04-24T11:00:00.000Z",
    "corpus": {
      "docsDir": "...",
      "documentCount": 3,
      "chunkCount": 1842,
      "chunkSize": 900,
      "chunkOverlap": 120
    },
    "historyLength": 2,
    "userId": "664abc123...",
    "timestamp": "2026-04-24T11:38:20.000Z"
  }
}
```

### Response — Không tìm thấy thông tin

```json
{
  "success": true,
  "data": {
    "answer": "Tôi không tìm thấy thông tin này trong dữ liệu hiện có.",
    "sources": [],
    "retrievedContext": [],
    "llmUsed": false,
    "stage": "retrieval"
  }
}
```

### Response — Lỗi (thiếu query)

```json
{
  "success": false,
  "message": "query is required"
}
```

### Response — Lỗi (OpenAI key sai / service down)

```json
{
  "success": false,
  "message": "OPENAI_API_KEY is missing. Please configure it in backend/.env"
}
```
HTTP status: `503`

---

## 3. POST `/api/ai/rag/rebuild`

Force rebuild toàn bộ RAG index từ đầu. Dùng khi admin thêm/sửa file trong `data/rag/papers/` mà muốn server đọc dữ liệu mới ngay, không cần restart.

> ⚠️ **Cảnh báo:** Rebuild tốn thời gian (30–60 giây tùy data). OpenAI sẽ charge phí embed cho toàn bộ chunks. Không gọi liên tục.

### Request
Không có body.

### Response — Thành công

```json
{
  "success": true,
  "message": "RAG index đã được rebuild thành công",
  "data": {
    "documentCount": 3,
    "chunkCount": 1842,
    "embeddingModel": "text-embedding-3-small",
    "chunkSize": 900,
    "chunkOverlap": 120,
    "docsDir": "C:/...CAPSTONE/backend/data/rag/papers",
    "builtAt": "2026-04-24T12:00:00.000Z"
  },
  "meta": {
    "version": "rag-v1-langchain",
    "rebuildLatencyMs": 42300,
    "userId": "664abc123...",
    "timestamp": "2026-04-24T12:00:42.000Z"
  }
}
```

---

## 📋 Hướng dẫn implement chatbot UI (cho FE team)

### State cần giữ

```javascript
const [messages, setMessages] = useState([]);
// messages = [
//   { role: "user",      content: "Phở bò có bao nhiêu cal?" },
//   { role: "assistant", content: "Phở bò có khoảng 450 kcal..." },
//   ...
// ]
```

### Cách gọi API (Sử dụng Axios trong React)

```javascript
import axios from "axios";

// Hàm xử lý khi user bấm "Gửi"
async function sendMessage(userInput) {
  // 1. Thêm tin nhắn user vào màn hình ngay lập tức cho mượt
  const newMessages = [...messages, { role: "user", content: userInput }];
  setMessages(newMessages);

  try {
    // 2. Gửi request kèm theo mảng history (những tin TRƯỚC câu hỏi hiện tại)
    const response = await axios.post("http://localhost:5000/api/ai/rag/query", {
      query: userInput,
      history: messages, // Truyền nguyên state messages hiện tại
      options: {
        includePantryContext: isPantryEnabled // Biến state từ công tắc (Toggle)
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const answer = response.data.data.answer;

    // 3. Thêm câu trả lời của bot vào màn hình
    setMessages([...newMessages, { role: "assistant", content: answer }]);
  } catch (error) {
    console.error("Lỗi khi gọi Bot:", error);
  }
}
```

### 💡 Mẹo làm UI cho tính năng Tủ Lạnh (Pantry Context)
Khuyến nghị FE nên thiết kế một cái **Công tắc gạt (Toggle Button)** phía trên khung chat với dòng chữ: *"🔍 Gợi ý món ăn từ Tủ lạnh của tôi"*.
- Khi công tắc **Tắt**: `isPantryEnabled = false`. Bot trả lời kiến thức chung.
- Khi công tắc **Bật**: `isPantryEnabled = true`. Bot sẽ tự mò vào tủ lạnh của user để thiết kế thực đơn phù hợp với nguyên liệu đang có.

### 🐛 Cách xử lý khi Bot báo "Không tìm thấy thông tin"
Nếu câu hỏi quá chung chung và trùng lặp từ khóa (Ví dụ: "Ức gà"), có thể Bot sẽ chỉ tìm thấy các công thức món ăn mà lỡ mất thông tin lượng calo. Mặc định BE đã tăng độ rộng tìm kiếm (`topK = 12`) để khắc phục việc này. Nếu vẫn gặp lỗi, hãy khuyên user đặt câu hỏi dài và cụ thể hơn.

---

## 📁 Files liên quan (BE)

| File | Vai trò |
|------|---------|
| `backend/src/routes/ai.js` | Định nghĩa 3 routes |
| `backend/src/controllers/aiRagController.js` | Logic xử lý request |
| `backend/src/services/ragRetrievalService.js` | RAG pipeline (embed, retrieve, generate) |
| `backend/data/rag/papers/` | Thư mục chứa knowledge base (CSV, MD) |
| `backend/.env` | Cấu hình API keys và RAG params |

---

# API Tracking & Pantry Deduction (Phase 2)

Khi user bấm **"Đã Nấu"** trên giao diện, hệ thống sẽ tự động thực hiện **2 việc đồng thời**:
1. **Trừ nguyên liệu** khỏi Tủ lạnh (Pantry) theo công thức đã nấu.
2. **Cộng dinh dưỡng** (calo, protein...) vào bảng theo dõi hôm nay (DailyTracking).

> **Base URL:** `http://localhost:5000/api/tracking`
> **Auth:** Tất cả endpoint đều yêu cầu JWT token.

---

## 1. POST `/api/tracking/mark-as-cooked`
Đánh dấu đã nấu 1 món. Tự động trừ tủ lạnh và cộng calo.

### Headers
- `Authorization`: `Bearer <token>`

### Body (JSON)
```json
{
  "recipeId": "69c64444c1d478708447dac6"
}
```
*Lấy `recipeId` từ kết quả trả về của `/api/recipes/suggest` hoặc `/api/recipes/suggest-weekly`.*

### Response — Thành công
```json
{
  "success": true,
  "message": "Đã ghi nhận bạn vừa nấu \"Thịt bò kho tiêu xanh với bí ngòi\"",
  "data": {
    "pantry_deducted": [
      {
        "name": "Thịt bò",
        "action": "updated",
        "before": 500,
        "after": 300,
        "unit": "g"
      },
      {
        "name": "Bơ lạt",
        "action": "removed",
        "reason": "Đã dùng hết"
      }
    ],
    "today_totals": {
      "calories": 526,
      "protein_g": 28,
      "carbs_g": 4,
      "fat_g": 43,
      "fiber_g": 3,
      "sodium_mg": 401,
      "sugar_g": 3
    },
    "progress": {
      "calorie_target": 2000,
      "calories_consumed": 526,
      "calories_remaining": 1474,
      "calories_pct": 26,
      "status": "under"
    }
  }
}
```

*Ghi chú:*
- `pantry_deducted`: Danh sách nguyên liệu bị trừ. FE có thể dùng để hiển thị thông báo "Đã dùng hết X".
- `today_totals`: Tổng dinh dưỡng tích lũy **cả ngày hôm nay**.
- `progress.calorie_target`: Mục tiêu calo ngày, tự tính theo `goal` trong Profile user.
  - `lose` → 1700 calo, `maintain` → 2000 calo, `gain` → 2500 calo
- `progress.status`: `"under"` (< 60%), `"on_track"` (60–109%), `"over"` (≥ 110%)
- Nếu nguyên liệu trong tủ lạnh không đủ unit khớp → tự động bỏ qua (không báo lỗi).

---

## 2. GET `/api/tracking/today`
Lấy tổng dinh dưỡng và danh sách các món đã nấu hôm nay.

### Headers
- `Authorization`: `Bearer <token>`

### Response
```json
{
  "success": true,
  "data": {
    "date": "2026-04-27T00:00:00.000Z",
    "meals_eaten": [
      {
        "recipeId": "69c64444c1d478708447dac6",
        "name_vi": "Thịt bò kho tiêu xanh với bí ngòi",
        "eaten_at": "2026-04-27T09:30:00.000Z",
        "nutrition": { "calories": 526, "protein_g": 28, ... }
      }
    ],
    "daily_totals": {
      "calories": 526,
      "protein_g": 28,
      "carbs_g": 4,
      "fat_g": 43,
      "fiber_g": 3,
      "sodium_mg": 401,
      "sugar_g": 3
    },
    "progress": {
      "calorie_target": 2000,
      "calories_consumed": 526,
      "calories_remaining": 1474,
      "calories_pct": 26,
      "status": "under"
    }
  }
}
```

---

## 3. GET `/api/tracking/history?days=7`
Lấy lịch sử tracking theo số ngày gần nhất (tối đa 30 ngày).

### Headers
- `Authorization`: `Bearer <token>`

### Query Params
- `days`: Số ngày muốn xem (mặc định 7, tối đa 30).

### Response
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-27T00:00:00.000Z",
      "daily_totals": { "calories": 1200, "protein_g": 80 },
      "meals_eaten": [...],
      "progress": {
        "calorie_target": 2000,
        "calories_consumed": 1200,
        "calories_remaining": 800,
        "calories_pct": 60,
        "status": "on_track"
      }
    },
    {
      "date": "2026-04-26T00:00:00.000Z",
      "daily_totals": { "calories": 2300, "protein_g": 95 },
      "meals_eaten": [...],
      "progress": {
        "calorie_target": 2000,
        "calories_consumed": 2300,
        "calories_remaining": 0,
        "calories_pct": 115,
        "status": "over"
      }
    }
  ]
}
```

---

## Luồng FE tích hợp Phase 2

```
1. FE hiển thị thực đơn từ /api/recipes/suggest-weekly
2. Mỗi món có nút "🍳 Đã Nấu"
3. User bấm "Đã Nấu" → FE gọi POST /api/tracking/mark-as-cooked { recipeId }
4. Nhận về today_totals → FE cập nhật thanh calo trên màn hình Tracking
5. Nhận về pantry_deducted → FE hiển thị toast "Đã trừ 200g Thịt bò khỏi Tủ lạnh"
```

## Files liên quan (BE)

| File | Vai trò |
|------|---------|
| `backend/src/models/DailyTracking.js` | Schema lưu tracking theo ngày |
| `backend/src/controllers/trackingController.js` | Logic mark-as-cooked, today, history |
| `backend/src/routes/tracking.js` | Định nghĩa 3 routes |

---

# API Shopping List (Phase 2 - Bổ sung)

Sau khi user có thực đơn tuần, hệ thống tự động tính toán nguyên liệu nào còn thiếu trong tủ lạnh và xuất danh sách cần đi mua.

> **Endpoint:** `POST /api/recipes/shopping-list`
> **Auth:** JWT token (tùy chọn — có token thì tự trừ đồ đang có trong Pantry)

## Body (JSON)
```json
{
  "recipeIds": [
    "69c64444c1d478708447dac6",
    "69c64444c1d478708447dac7",
    "69c64444c1d478708447dac8"
  ]
}
```
*Lấy `recipeIds` từ kết quả của `/api/recipes/suggest-weekly` (gom tất cả `_id` của các món trong tuần).*

## Response — Thành công
```json
{
  "success": true,
  "summary": {
    "total_ingredients": 15,
    "need_to_buy": 8,
    "already_have": 7
  },
  "shopping_list": [
    {
      "name": "Thịt bò",
      "need": 300,
      "unit": "g",
      "usedIn": ["Thịt bò kho tiêu xanh", "Bò xào rau củ"],
      "status": "insufficient"
    },
    {
      "name": "Trứng gà",
      "need": 6,
      "unit": "pcs",
      "usedIn": ["Trứng chiên cà chua"],
      "status": "missing"
    }
  ],
  "already_have": [
    { "name": "Dầu ăn", "have": 500, "unit": "ml" },
    { "name": "Hành tím", "have": 200, "unit": "g" }
  ]
}
```

*Ghi chú:*
- `status: "missing"` → Không có trong tủ lạnh, cần mua toàn bộ.
- `status: "insufficient"` → Có nhưng không đủ, cần mua thêm phần `need`.
- Nếu không có token → trả về full list (coi như chưa có gì trong tủ lạnh).

## FE cần làm gì?
1. Sau khi user xem thực đơn tuần → Thêm nút **"🛒 Tạo danh sách mua"**
2. Bấm nút → gom tất cả `recipeId` từ thực đơn → gọi `POST /api/recipes/shopping-list`
3. Hiển thị danh sách `shopping_list` ra màn hình (checkbox để user tích "đã mua")

---

# API Recipe Planning - Bộ lọc Dinh dưỡng Nâng cao (Phase 1)

Cả `/api/recipes/suggest` và `/api/recipes/suggest-weekly` đều hỗ trợ lọc dinh dưỡng chính xác.

## Tham số bổ sung trong Body
```json
{
  "goal": "weight_loss",
  "min_calories": 300,
  "max_calories": 500,
  "min_protein_g": 20,
  "max_protein_g": 40,
  "use_pantry": true
}
```

| Tham số | Kiểu | Ý nghĩa |
|---|---|---|
| `min_calories` | Number | Calo tối thiểu mỗi món |
| `max_calories` | Number | Calo tối đa mỗi món |
| `min_protein_g` | Number | Protein tối thiểu (g) mỗi món |
| `max_protein_g` | Number | Protein tối đa (g) mỗi món |
| `use_pantry` | Boolean | `true` = gợi ý theo tủ lạnh (mặc định), `false` = bỏ qua tủ lạnh |

*Tất cả tham số đều tùy chọn — không truyền thì không áp dụng lọc.*

## Logic Pantry thông minh (Expiry-first)
Khi `use_pantry: true`, engine tự động **ưu tiên nguyên liệu sắp hết hạn**:

| Điểm ưu tiên | Điều kiện |
|---|---|
| +15 | Hết hạn trong **≤ 3 ngày** (⚠️ Nguy cấp) |
| +10 | Hết hạn trong **≤ 7 ngày** (⏳ Sắp hết) |
| +5 | Còn tươi, nhưng vẫn ưu tiên hơn không có |

→ FE không cần làm gì thêm — kết quả suggest tự nhiên thông minh hơn.

---

# Tổng hợp tất cả API đã có

| API | Method | Mô tả |
|---|---|---|
| `/api/ai/chat` | POST | Chat với AI RAG Bot |
| `/api/ai/pantry-suggest` | POST | AI gợi ý món từ tủ lạnh |
| `/api/ai/nutrition-info` | POST | AI tra cứu dinh dưỡng |
| `/api/recipes/suggest` | POST | Gợi ý thực đơn 1 ngày |
| `/api/recipes/suggest-weekly` | POST | Gợi ý thực đơn 1 tuần |
| `/api/recipes/shopping-list` | POST | Tạo danh sách mua sắm từ thực đơn |
| `/api/recipes/swap-single-meal` | POST | Đổi 1 món trong thực đơn |
| `/api/tracking/mark-as-cooked` | POST | Bấm "Đã Nấu" → trừ tủ lạnh + cộng calo |
| `/api/tracking/today` | GET | Xem tổng calo hôm nay + progress TDEE |
| `/api/tracking/history` | GET | Xem lịch sử tracking 7-30 ngày |
| `/api/users/fitness-profile` | PUT | Cập nhật thông tin thể chất |
| `/api/users/tdee` | GET | Xem chỉ số TDEE, BMR, macro mục tiêu |
| `/api/pantry` | GET/POST/PUT/DELETE | Quản lý tủ lạnh |

---

# API TDEE & Hồ sơ Thể chất

Cho phép user nhập thông tin cơ thể → hệ thống tự tính mục tiêu calo/macro chính xác theo khoa học (công thức Mifflin-St Jeor).

> **Base URL:** `http://localhost:5000/api/users`
> **Auth:** Tất cả endpoint đều yêu cầu JWT token.

---

## 1. PUT `/api/users/fitness-profile`
Cập nhật thông tin thể chất. Có thể cập nhật từng field riêng lẻ.

### Headers
- `Authorization`: `Bearer <token>`

### Body (JSON)
```json
{
  "height_cm": 170,
  "weight_kg": 65,
  "age": 25,
  "gender": "male"
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `height_cm` | Number | ❌ | Chiều cao (cm), từ 50-300 |
| `weight_kg` | Number | ❌ | Cân nặng (kg), từ 1-500 |
| `age` | Number | ❌ | Tuổi, từ 1-120 |
| `gender` | String | ❌ | `"male"` hoặc `"female"` |

*Có thể gửi 1 field hoặc tất cả — chỉ field được gửi mới bị cập nhật.*

### Response — Thành công (đủ thông tin)
```json
{
  "success": true,
  "message": "Đã cập nhật thông tin thể chất",
  "data": {
    "fitnessProfile": {
      "height_cm": 170,
      "weight_kg": 65,
      "age": 25,
      "gender": "male"
    },
    "tdee": {
      "bmr": 1676,
      "tdee": 2305,
      "goal_adjustment": -400,
      "daily_calorie_target": 1905,
      "macro_targets": {
        "protein_g": 143,
        "fat_g": 53,
        "carbs_g": 214,
        "calories": 1905
      },
      "meal_calorie_targets": {
        "breakfast": 476,
        "lunch": 762,
        "dinner": 667
      }
    }
  }
}
```

---

## 2. GET `/api/users/tdee`
Xem chỉ số TDEE đã tính và mục tiêu macro.

### Headers
- `Authorization`: `Bearer <token>`

### Response — Có đủ thông tin
```json
{
  "success": true,
  "is_estimated": false,
  "data": {
    "bmr": 1676,
    "tdee": 2305,
    "goal_adjustment": -400,
    "daily_calorie_target": 1905,
    "macro_targets": {
      "protein_g": 143,
      "fat_g": 53,
      "carbs_g": 214,
      "calories": 1905
    },
    "meal_calorie_targets": {
      "breakfast": 476,
      "lunch": 762,
      "dinner": 667
    },
    "inputs": {
      "height_cm": 170,
      "weight_kg": 65,
      "age": 25,
      "gender": "male",
      "activity_level": "moderate",
      "goal": "lose"
    }
  }
}
```

### Response — Chưa đủ thông tin
```json
{
  "success": true,
  "is_estimated": true,
  "message": "Chưa đủ thông tin thể chất. Vui lòng cập nhật hồ sơ thể chất để có kết quả chính xác.",
  "data": {
    "daily_calorie_target": 1700,
    "missing_fields": ["height_cm (chiều cao)", "weight_kg (cân nặng)"]
  }
}
```

---

## Giải thích công thức TDEE

**BMR (Mifflin-St Jeor):**
```
Nam: BMR = 10×cân_nặng(kg) + 6.25×chiều_cao(cm) - 5×tuổi + 5
Nữ: BMR = 10×cân_nặng(kg) + 6.25×chiều_cao(cm) - 5×tuổi - 161
```

**TDEE = BMR × Hệ số hoạt động:**

| `activityLevel` | Hệ số | Ý nghĩa |
|---|---|---|
| `low` | 1.2 | Ít vận động (ngồi nhiều) |
| `moderate` | 1.375 | Vận động nhẹ 1-3 ngày/tuần |
| `high` | 1.55 | Vận động nhiều 4-5 ngày/tuần |

**Điều chỉnh theo mục tiêu:**

| `goal` | Điều chỉnh | Ý nghĩa |
|---|---|---|
| `lose` | −400 calo | Thâm hụt để giảm cân |
| `maintain` | 0 | Duy trì cân nặng |
| `gain` | +400 calo | Dư thừa để tăng cân |

**Phân bổ macro:** Protein 30% · Fat 25% · Carbs 45%

---

## Thay đổi trong Tracking API
Từ bây giờ tất cả 3 API tracking đều trả về `progress` đầy đủ hơn:

```json
"progress": {
  "calorie_target": 1905,
  "calories_consumed": 526,
  "calories_remaining": 1379,
  "calories_pct": 28,
  "status": "under",
  "is_estimated": false,
  "macro_targets": {
    "protein_g": 143,
    "fat_g": 53,
    "carbs_g": 214
  }
}
```

- `is_estimated: false` → tính từ TDEE thật (fitnessProfile đầy đủ)
- `is_estimated: true` → dùng số ước tính theo goal (chưa có fitnessProfile)
- `macro_targets: null` → khi chưa có fitnessProfile

## FE cần làm gì?
1. Màn hình **Profile** → Thêm form nhập chiều cao, cân nặng, tuổi, giới tính → gọi `PUT /api/users/fitness-profile`
2. Màn hình **Dashboard** → Gọi `GET /api/users/tdee` → Hiển thị BMR, TDEE, phân bổ macro, calo từng bữa
3. Khi `is_estimated: true` → Hiển thị banner nhắc nhở *"Hoàn thiện hồ sơ thể chất để có kết quả chính xác hơn 💡"*
4. Dùng `macro_targets` để vẽ thanh tiến độ Protein / Fat / Carbs

## Files liên quan (BE)

| File | Vai trò |
|---|---|
| `backend/src/utils/tdee.js` | Công thức Mifflin-St Jeor, tính macro |
| `backend/src/controllers/fitnessController.js` | Controller update & get TDEE |
| `backend/src/routes/user.js` | Thêm 2 routes mới |
| `backend/src/models/User.js` | Thêm field `fitnessProfile` |


