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
