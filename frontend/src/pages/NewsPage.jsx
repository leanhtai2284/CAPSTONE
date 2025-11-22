import React, { useState, useEffect } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import NewsCard from "../components/ui/NewsCard";
import { newsService } from "../services/newsService";
import LoadingModal from "../components/ui/LoadingModal";
import Footer from "../components/layout/Footer";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState(["Tất cả"]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [error, setError] = useState(null);

  // Load categories and featured once on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const cats = await newsService.getCategories();
        if (!mounted) return;
        setCategories(Array.isArray(cats) && cats.length ? cats : ["Tất cả"]);
      } catch (err) {
        console.warn("Không lấy được categories:", err);
      }

      try {
        const featured = await newsService.getFeaturedNews(3);
        if (!mounted) return;
        setFeaturedNews(Array.isArray(featured) ? featured : []);
      } catch (err) {
        console.warn("Không lấy được featured news:", err);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Load news when filters change
  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await newsService.getAllNews(
          selectedCategory === "Tất cả" ? null : selectedCategory,
          searchTerm
        );
        if (!mounted) return;
        setNews(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        console.error("Lỗi khi tải tin tức:", err);
        setError(err?.message || "Không thể tải tin tức");
        setNews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNews();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <LoadingModal isOpen={loading && news.length === 0} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Tin Tức & Blog
          </h1>
          <p className="text-xl text-center text-green-100 max-w-2xl mx-auto">
            Khám phá những bài viết mới nhất về ẩm thực, dinh dưỡng và sức khỏe
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured News Section */}
        {featuredNews.length > 0 && !loading && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Tin Nổi Bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((item) => (
                <NewsCard key={item.id} news={item} featured={true} />
              ))}
            </div>
          </section>
        )}

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                focus:ring-2 focus:ring-green-500 focus:border-transparent
                placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        {loading && news.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-green-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Không tìm thấy tin tức
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === "Tất cả" ? "Tất Cả Tin Tức" : selectedCategory}
              </h2>
              <span className="text-gray-600 dark:text-gray-400">
                {news.length} bài viết
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NewsPage;