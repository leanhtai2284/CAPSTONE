import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Mock AI response for chronic condition management
  // In a real implementation, integrate with OpenAI, Google AI, or similar
  const responses = [
    'Tôi hiểu bạn đang gặp vấn đề với bệnh mãn tính. Bạn có thể mô tả chi tiết hơn về triệu chứng không?',
    'Để quản lý bệnh tốt hơn, tôi khuyên bạn nên theo dõi chế độ ăn uống và tập luyện đều đặn.',
    'Hãy nhớ uống thuốc đúng giờ và theo dõi sức khỏe định kỳ với bác sĩ.',
    'Bạn có thể chia sẻ thông tin về chế độ ăn hiện tại để tôi đưa ra gợi ý phù hợp.',
    'Quản lý stress và ngủ đủ giấc cũng rất quan trọng cho sức khỏe mãn tính.',
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  res.json({ response: randomResponse });
}));

export default router;