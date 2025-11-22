import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Calendar, Tag } from "lucide-react";
import { newsService } from "../services/newsService";
import LoadingModal from "../components/ui/LoadingModal";
import Footer from "../components/layout/Footer";

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await newsService.getNewsById(id);
        if (!mounted) return;

        if (!data) {
          setError("Không tìm thấy bài viết.");
          setNews(null);
          return;
        }

        setNews(data);

        // Tải tin liên quan theo category (nếu có)
        if (data.category) {
          try {
            const related = await newsService.getAllNews(data.category, "");
            if (!mounted) return;
            const items = Array.isArray(related.items) ? related.items : [];
            setRelatedNews(
              items.filter((item) => String(item.id) !== String(id)).slice(0, 3)
            );
          } catch (e) {
            // không block trang nếu fetch related bị lỗi
            console.warn("Không tải được tin liên quan:", e);
          }
        } else {
          setRelatedNews([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải tin tức:", err);
        setError(err?.message || "Có lỗi khi tải bài viết.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNews();

    return () => {
      mounted = false;
    };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingModal isOpen={true} />;
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {error || "Không tìm thấy bài viết"}
          </h2>
          <button
            onClick={() => navigate("/news")}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Quay lại trang tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/news")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
      </div>

      <article className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            {news.category && (
              <span className="inline-block px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full mb-4">
                {news.category}
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {news.title || "Tiêu đề không có"}
            </h1>

            {news.summary && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
                {news.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(news.publishedAt)}</span>
              </div>
              {news.readTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{news.readTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{Number(news.views || 0).toLocaleString()} lượt xem</span>
              </div>
              {news.author && (
                <div className="flex items-center gap-2">
                  <span>Bởi {news.author}</span>
                </div>
              )}
            </div>
          </header>

          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl bg-gray-100 dark:bg-gray-900">
            <img
              src={
                news.image ||
                "https://via.placeholder.com/1200x600?text=News+Image"
              }
              alt={news.title || "News image"}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/1200x600?text=News+Image";
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {(news.tags || []).map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6 text-base md:text-lg">
              {/* Nếu content là HTML: sử dụng dangerouslySetInnerHTML, ngược lại hiển thị text */}
              {typeof news.content === "string" &&
              /<\/?[a-z][\s\S]*>/i.test(news.content) ? (
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
              ) : (
                <p>{news.content || news.summary || "Nội dung không có."}</p>
              )}

              {/* Nếu muốn thêm nội dung tĩnh / mô tả, giữ ngắn gọn */}
              <p>
                Ẩm thực Việt Nam luôn phong phú và đa dạng. Khám phá thêm các bài
                viết khác để hiểu rõ hơn về văn hóa ẩm thực và dinh dưỡng.
              </p>
            </div>
          </div>

          {relatedNews.length > 0 && (
            <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Tin Tức Liên Quan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={
                          item.image ||
                          "https://via.placeholder.com/800x400?text=News+Image"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/800x400?text=News+Image";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold mb-2 line-clamp-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
