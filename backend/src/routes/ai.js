import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  ragQueryV1,
  ragStatusV1,
  ragRebuildV1,
} from '../controllers/aiRagController.js';

const router = express.Router();

// GET  /api/ai/rag/status  — kiểm tra trạng thái RAG index (đã build chưa, bao nhiêu docs, ...)
router.get('/rag/status', protect, ragStatusV1);

// POST /api/ai/rag/query   — truy vấn RAG, trả lời câu hỏi dựa trên knowledge base
router.post('/rag/query', protect, ragQueryV1);

// POST /api/ai/rag/rebuild — force rebuild index ngay (dùng khi thêm file mới vào papers/)
router.post('/rag/rebuild', protect, ragRebuildV1);

export default router;