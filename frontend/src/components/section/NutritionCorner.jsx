import React from "react";
import { ArrowRight } from "lucide-react"; // 🔹 import icon từ lucide-react

const NutritionCorner = () => {
  // Mock data bài viết
  const articles = [
    {
      id: 1,
      title: "5 Nguyên Tắc Cân Bằng Dinh Dưỡng Trong Bữa Cơm Việt",
      excerpt:
        "Khám phá cách xây dựng bữa ăn cân bằng theo triết lý ẩm thực truyền thống Việt Nam.",
      image:
        "https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Mẹo Tiết Kiệm Khi Đi Chợ Mùa Cao Điểm",
      excerpt:
        "Những bí quyết giúp bạn mua sắm thông minh và tiết kiệm ngân sách gia đình.",
      image:
        "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Thực Phẩm Việt Nam Giàu Chất Chống Oxy Hóa",
      excerpt:
        "Danh sách các loại thực phẩm bản địa Việt Nam chứa nhiều chất chống oxy hóa tốt cho sức khỏe.",
      image:
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-16 bg-gray-100 dark:bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 ">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Góc Dinh Dưỡng VN Meal
          </h2>
          <p className="text-gray-600 dark:text-white max-w-2xl mx-auto">
            Kiến thức dinh dưỡng và mẹo hữu ích cho bữa ăn gia đình Việt
          </p>
        </div>

        {/* Grid bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-900/90 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-200 mb-4">
                  {article.excerpt}
                </p>
                <a
                  href="#"
                  className="text-green-600 font-medium hover:text-green-700 inline-flex items-center"
                >
                  Đọc tiếp
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Nút xem tất cả */}
        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-block bg-white text-green-600 font-medium py-2 px-6 rounded-full border border-green-600 hover:bg-green-50 transition duration-300"
          >
            Xem Tất Cả Bài Viết
          </a>
        </div>
      </div>
    </section>
  );
};

export default NutritionCorner;
