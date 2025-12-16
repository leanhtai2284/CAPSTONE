import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Search,
  Eye,
  Calendar,
  User,
  Flame,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
} from "lucide-react";
import Footer from "../components/layout/Footer";
import { useAuth } from "../hooks/useAuth";
import newsService from "../services/newsService";
import { toast } from "react-toastify";

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedNews, setSelectedNews] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentContent, setCommentContent] = useState("");
  const { user } = useAuth();

  const categories = [
    { value: "all", label: "Tất cả", icon: "🍽️" },
    { value: "recipe", label: "Công thức nấu ăn", icon: "👨‍🍳" },
    { value: "nutrition", label: "Dinh dưỡng", icon: "🥗" },
    { value: "cooking-tips", label: "Mẹo nấu ăn", icon: "💡" },
    { value: "health", label: "Sức khỏe", icon: "❤️" },
    { value: "culture", label: "Văn hóa ẩm thực", icon: "🏮" },
  ];

  // Fetch featured news
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await newsService.getFeaturedNews(3);
        setFeaturedNews(response.data || []);
      } catch (error) {
        console.error("Fetch featured error:", error);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch news with pagination & filter
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 6 };
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const response = await newsService.getNews(params);
        setNewsList(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } catch (error) {
        console.error("Fetch news error:", error);
        toast.error("Không thể tải tin tức");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [page, selectedCategory, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchTerm]);

  const handleLike = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thích tin tức");
      return;
    }

    try {
      const response = await newsService.likeNews(id);
      const updatedNews = response.data;

      setNewsList((prev) =>
        prev.map((item) => (item._id === id ? updatedNews : item))
      );
      setFeaturedNews((prev) =>
        prev.map((item) => (item._id === id ? updatedNews : item))
      );

      if (selectedNews && selectedNews._id === id) {
        setSelectedNews(updatedNews);
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error("Không thể thích tin tức");
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!commentContent.trim()) {
      toast.warning("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      const response = await newsService.addComment(
        selectedNews._id,
        commentContent
      );
      setSelectedNews(response.data);
      setCommentContent("");
      toast.success("Đã thêm bình luận");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Không thể thêm bình luận");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const isLikedByUser = (news) => {
    return (
      user &&
      news.likes?.some((like) => like === user._id || like._id === user._id)
    );
  };

  return (
    <div className="w-full min-h-screen ">
      {/* Hero Header */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              📰 Tin tức ẩm thực
            </h1>
            <p className="text-red-100 text-lg md:text-xl max-w-2xl">
              Cập nhật công thức, mẹo nấu ăn, dinh dưỡng và văn hóa ẩm thực Việt
              Nam
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredNews.length > 0 && (
        <section className="bg-white py-12 border-b-2 border-red-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Flame className="text-red-600" size={28} />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Tin tức nổi bật
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((news, idx) => (
                <motion.article
                  key={news._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedNews(news)}
                  className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 border border-red-100"
                >
                  <div className="h-48 bg-gradient-to-br from-red-400 to-orange-400 relative overflow-hidden">
                    {news.imageUrl ? (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-6xl">🍜</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ Nổi bật
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                        {categories.find((c) => c.value === news.category)
                          ?.icon || "📄"}
                        {
                          categories.find((c) => c.value === news.category)
                            ?.label
                        }
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Eye size={14} /> {news.views}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 text-gray-800 group-hover:text-red-600 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {news.description}
                    </p>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(news.createdAt)}
                      </span>
                      <button
                        onClick={(e) => handleLike(news._id, e)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all ${
                          isLikedByUser(news)
                            ? "bg-red-600 text-white"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        <Heart
                          size={14}
                          fill={isLikedByUser(news) ? "currentColor" : "none"}
                        />
                        {news.likes?.length || 0}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="bg-white/80 backdrop-blur-sm sticky top-16 z-40 shadow-md py-4 border-b">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-6 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium bg-white cursor-pointer transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* News Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
            <p className="mt-4 text-gray-500 font-medium">
              Đang tải tin tức...
            </p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">Không tìm thấy tin tức</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {newsList.map((news, idx) => (
                <motion.article
                  key={news._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedNews(news)}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="h-52 bg-gradient-to-br from-red-400 to-orange-400 relative overflow-hidden">
                    {news.imageUrl ? (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-7xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {
                          categories.find((c) => c.value === news.category)
                            ?.icon
                        }{" "}
                        {
                          categories.find((c) => c.value === news.category)
                            ?.label
                        }
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2 text-gray-800 hover:text-red-600 transition-colors">
                      {news.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {news.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User size={14} /> {news.author?.name || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} /> {news.views}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs">
                        <Calendar size={14} /> {formatDate(news.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleLike(news._id, e)}
                        className={`flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isLikedByUser(news)
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 hover:bg-red-50 text-gray-700"
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={isLikedByUser(news) ? "currentColor" : "none"}
                        />
                        {news.likes?.length || 0}
                      </button>
                      <button className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all">
                        <MessageCircle size={16} />
                        {news.comments?.length || 0}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition font-medium shadow-md"
                >
                  <ChevronLeft size={18} /> Trước
                </motion.button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-11 h-11 rounded-xl font-semibold transition-all shadow-sm ${
                          page === pageNum
                            ? "bg-red-600 text-white scale-110"
                            : "bg-white border-2 border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition font-medium shadow-md"
                >
                  Sau <ChevronRight size={18} />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {
                      categories.find((c) => c.value === selectedNews.category)
                        ?.icon
                    }
                    {
                      categories.find((c) => c.value === selectedNews.category)
                        ?.label
                    }
                  </span>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {selectedNews.imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={selectedNews.imageUrl}
                      alt={selectedNews.title}
                      className="w-full h-72 object-cover"
                    />
                  </div>
                )}

                <h1 className="text-4xl font-bold mb-4 text-gray-900">
                  {selectedNews.title}
                </h1>

                <div className="flex flex-wrap gap-6 mb-8 text-gray-600 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <User size={18} /> {selectedNews.author?.name || "Admin"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} /> {formatDate(selectedNews.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={18} /> {selectedNews.views} lượt xem
                  </div>
                </div>

                <div className="prose prose-lg max-w-none mb-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedNews.content}
                </div>

                <div className="flex gap-4 py-4 border-t border-b mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLike(selectedNews._id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                      isLikedByUser(selectedNews)
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 hover:bg-red-50 text-gray-700"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={
                        isLikedByUser(selectedNews) ? "currentColor" : "none"
                      }
                    />
                    {selectedNews.likes?.length || 0} Thích
                  </motion.button>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all shadow-md">
                    <MessageCircle size={20} />
                    {selectedNews.comments?.length || 0} Bình luận
                  </button>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                    Bình luận ({selectedNews.comments?.length || 0})
                  </h3>

                  {user && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-red-100">
                      <textarea
                        placeholder="Chia sẻ ý kiến của bạn..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        rows="3"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                      />
                      <button
                        onClick={handleAddComment}
                        className="mt-3 flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-md"
                      >
                        <Send size={18} />
                        Gửi bình luận
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedNews.comments &&
                    selectedNews.comments.length > 0 ? (
                      selectedNews.comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="p-5 border-2 border-gray-100 rounded-xl hover:border-red-100 transition bg-white"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center text-white font-bold">
                              {comment.user?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">
                                {comment.user?.name || "Anonymous"}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed pl-13">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 py-8">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default NewsPage;
