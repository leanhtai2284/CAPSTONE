import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';

//Markdown renderer đơn giản
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Tiêu đề
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-2 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-bold text-sm mt-2 mb-1">{line.slice(3)}</h2>);
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex items-start gap-1 my-0.5">
          <span className="mt-1 text-green-500 flex-shrink-0">•</span>
          <span>{formatInlineMarkdown(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      elements.push(
        <div key={i} className="flex items-start gap-1 my-0.5">
          <span className="font-bold text-green-600 flex-shrink-0 min-w-[16px]">{match[1]}.</span>
          <span>{formatInlineMarkdown(match[2])}</span>
        </div>
      );
    }
    // Dòng trống
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    }
    // Đoạn văn thường
    else {
      elements.push(<p key={i} className="my-0.5">{formatInlineMarkdown(line)}</p>);
    }
    i++;
  }
  return elements;
}

function formatInlineMarkdown(text) {
  // Bold **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

//Recipe Card hiển thị món ăn được nhắc đến 
function RecipeCard({ recipe }) {
  const slug = recipe.slug || recipe._id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-green-100 rounded-xl p-3 shadow-sm flex items-center gap-3 mt-2 hover:shadow-md transition-shadow"
    >
      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
        🍽️
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">{recipe.name_vi}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {recipe.calories && (
            <span className="text-xs text-orange-500 font-medium">🔥 {recipe.calories} calo</span>
          )}
          {recipe.price_min && (
            <span className="text-xs text-blue-500">💰 {(recipe.price_min / 1000).toFixed(0)}k</span>
          )}
          {recipe.prep_time_min && (
            <span className="text-xs text-gray-400">⏱ {recipe.prep_time_min} phút</span>
          )}
        </div>
      </div>
      {/* Nút Xem công thức */}
      <a
        href={`/recipe/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap"
        onClick={e => e.stopPropagation()}
      >
        Xem →
      </a>
    </motion.div>
  );
}

//Bubble mở chatbot - AI brain icon
const ChatbotBubble = ({ onClick }) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl"
        aria-label="Mở AI Trợ Lý Smart Chef"
      >
        {/* Brain / AI icon */}
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5C8.5 5 6 7.5 6 10c0 1.5.7 2.8 1.8 3.7C7 14.5 6.5 15.7 6.5 17c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5 0-1.3-.5-2.5-1.3-3.3C17.3 12.8 18 11.5 18 10c0-2.5-2.5-5-6-5z" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="9" y1="12" x2="9" y2="15" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <line x1="15" y1="12" x2="15" y2="15" />
        </svg>
        {/* Live dot */}
        <span className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white">
          <span className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />
        </span>
      </motion.button>
    </motion.div>
  );
};

//Giao diện chat chính 
const QUICK_REPLIES = [
  { label: 'Gợi ý bữa trưa', text: 'Gợi ý món ăn cho bữa trưa hôm nay?' },
  { label: 'Ít calo', text: 'Món ăn nào ít calo, tốt cho giảm cân?' },
  { label: 'Tủ lạnh tôi', text: 'Tôi có thể nấu gì từ nguyên liệu trong tủ lạnh?' },
  { label: 'Dinh dưỡng', text: 'Tôi cần bổ sung dinh dưỡng gì cho sức khoẻ?' },
];

// Map URL path → pageContext
function buildPageContext(pathname) {
  if (pathname.includes('/pantry')) return { currentPage: 'pantry' };
  if (pathname.includes('/for-you')) return { currentPage: 'for-you' };
  if (pathname.includes('/search')) return { currentPage: 'search' };
  if (pathname.includes('/tracking')) return { currentPage: 'tracking' };
  if (pathname.includes('/recipe')) return { currentPage: 'recipe' };
  return { currentPage: 'home' };
}

const INITIAL_MESSAGE = {
  id: 1,
  text: 'Xin chào! Tôi là **Smart Chef** — AI tư vấn của SmartMeal.\n\nTôi có thể giúp bạn:\n- Gợi ý thực đơn phù hợp\n- Tư vấn dinh dưỡng cá nhân\n- Tìm món từ nguyên liệu sẵn có\n\nBạn cần hỗ trợ gì hôm nay?',
  sender: 'bot',
  timestamp: new Date(),
  suggestedQuestions: [],
  mentionedRecipes: [],
};

const ChatbotInterface = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hàm xoá lịch sử chat, reset về tin nhắn chào mừng ban đầu
  const clearHistory = () => {
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
    setInputValue('');
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const queryText = text || inputValue;
    if (!queryText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: queryText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 1)
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const pageContext = buildPageContext(location.pathname);

      const response = await axiosInstance.post('/ai/rag/query', {
        query: queryText,
        history,
        options: { includePantryContext: true },
        pageContext,
      });

      const data = response.data?.data || {};

      const botMessage = {
        id: Date.now() + 1,
        text: data.answer || 'Xin lỗi, tôi không thể trả lời lúc này.',
        sender: 'bot',
        timestamp: new Date(),
        suggestedQuestions: data.suggestedQuestions || [],
        mentionedRecipes: data.mentionedRecipes || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errMsg,
        sender: 'bot',
        timestamp: new Date(),
        suggestedQuestions: [],
        mentionedRecipes: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop click to close */}
        <div
          className="absolute inset-0 pointer-events-auto"
          onClick={onClose}
        />

        {/* Chat window */}
        <motion.div
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col pointer-events-auto border border-gray-100 dark:border-gray-800"
          style={{ height: '580px' }}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-t-2xl flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base">🤖</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm leading-tight">Smart Chef AI</h3>
              <p className="text-xs text-green-100">Trợ lý dinh dưỡng thông minh</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-xs text-green-100">Online</span>
            </div>
            {/* Nút xoá lịch sử chat */}
            <button
              onClick={clearHistory}
              title="Xoá lịch sử chat"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Xoá lịch sử"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
            {/* Quick replies — chỉ hiện ở đầu */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_REPLIES.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qr.text)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1.5 transition-colors font-medium"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  {/* Avatar bot */}
                  {message.sender === 'bot' && (
                    <div className="flex items-end gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <span className="text-xs">🤖</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {/* Bubble */}
                        <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 rounded-2xl rounded-bl-md text-sm leading-relaxed">
                          {renderMarkdown(message.text)}
                        </div>

                        {/* Recipe Cards — Mức 2 */}
                        {message.mentionedRecipes?.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400 px-1">Món được đề cập:</p>
                            {message.mentionedRecipes.map((recipe) => (
                              <RecipeCard key={String(recipe._id)} recipe={recipe} />
                            ))}
                          </div>
                        )}

                        {/* Suggested Questions — Mức 1 */}
                        {message.suggestedQuestions?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {message.suggestedQuestions.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                disabled={isLoading}
                                className="text-xs bg-white border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 rounded-full px-2.5 py-1 transition-all disabled:opacity-50 text-left"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="text-xs text-gray-400 px-1">
                          {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* User message */}
                  {message.sender === 'user' && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-3 py-2 rounded-2xl rounded-br-md text-sm">
                        {message.text}
                      </div>
                      <p className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none max-h-24 leading-relaxed"
                disabled={isLoading}
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-all flex-shrink-0 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-1.5">
              Smart Chef AI · Powered by Hybrid GraphRAG
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export { ChatbotBubble, ChatbotInterface };