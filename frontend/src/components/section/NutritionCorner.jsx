import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "lucide-react";

const NutritionCorner = () => {
  // Mock data bài viết
  const articles = [
    {
      id: 1,
      title: "10 Món Ăn Việt Nam Tốt Cho Sức Khỏe",
      excerpt:
        "Khám phá những món ăn truyền thống Việt Nam giàu dinh dưỡng và tốt cho sức khỏe của bạn.",
      date: "15/01/2024",
      readTime: "5 phút",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      category: "Dinh dưỡng",
    },
    {
      id: 2,
      title: "Bí Quyết Nấu Phở Ngon Như Quán",
      excerpt:
        "Hướng dẫn chi tiết cách nấu nước dùng phở thơm ngon, đậm đà như các quán phở nổi tiếng.",
      date: "14/01/2024",
      readTime: "8 phút",
      image:
        "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
      category: "Công thức",
    },
    {
      id: 3,
      title: "Chế Độ Ăn Eat Clean Theo Phong Cách Việt",
      excerpt:
        "Áp dụng chế độ ăn eat clean với các món ăn Việt Nam truyền thống và hiện đại.",
      date: "13/01/2024",
      readTime: "6 phút",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
      category: "Sức khỏe",
    },
    {
      id: 4,
      title: "Món Ăn Miền Trung: Đặc Sản Và Văn Hóa",
      excerpt:
        "Tìm hiểu về những món ăn đặc trưng của miền Trung và câu chuyện văn hóa đằng sau.",
      date: "12/01/2024",
      readTime: "7 phút",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
      category: "Văn hóa",
    },
    {
      id: 5,
      title: "Cách Tính Lượng Calo Trong Món Ăn Việt",
      excerpt:
        "Hướng dẫn cách tính toán và theo dõi lượng calo trong các món ăn Việt Nam phổ biến.",
      date: "11/01/2024",
      readTime: "5 phút",
      image:
        "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
      category: "Dinh dưỡng",
    },
    {
      id: 6,
      title: "Thực Đơn Giảm Cân Với Món Việt",
      excerpt:
        "Gợi ý thực đơn giảm cân hiệu quả với các món ăn Việt Nam lành mạnh và ngon miệng.",
      date: "10/01/2024",
      readTime: "6 phút",
      image:
        "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
      category: "Sức khỏe",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {" "}
        {/* Thêm text-center để căn giữa */}
        {/* Tiêu đề chính: Dùng màu sắc và kích thước nổi bật hơn */}
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Khám Phá Sức Khỏe Việt
        </h2>
        {/* Mô tả: Tăng độ tương phản và căn giữa tối ưu */}
        <p className="text-lg  max-w-3xl mx-auto mb-12">
          Bí quyết cho bữa ăn gia đình Việt khỏe mạnh và đủ đầy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              className="group  backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
              initial={{
                opacity: 0,
                y: 50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              whileHover={{
                scale: 1.02,
              }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold">
                  {article.category}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold  mb-3 group-hover:text-green-400 transition-colors">
                  {article.title}
                </h2>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <button className="flex items-center space-x-2 text-green-400 font-medium group-hover:space-x-3 transition-all duration-200">
                  <span>Đọc thêm</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionCorner;
