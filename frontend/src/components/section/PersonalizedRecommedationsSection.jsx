import React, { useRef } from "react";
import MealCard from "../ui/MealCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PersonalizedRecommendationsSection = () => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -800, // cuộn tương ứng khoảng 4 thẻ
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 800,
        behavior: "smooth",
      });
    }
  };

  const personalizedMeals = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Cơm Gà Hội An",
      calories: "480 Kcal",
      author: "Nguyễn Thị Hoa",
      likes: 687,
      badges: ["Phù hợp với bạn"],
    },
    {
      id: 2,
      image:
        "https://vietnamesetypography.com/samples/canh-chua-ca-loc/img/canh-chua.jpg",
      title: "Canh Chua Cá Lóc",
      calories: "320 Kcal",
      author: "Trần Văn Minh",
      likes: 542,
      badges: ["Giàu vitamin"],
    },
    {
      id: 3,
      image:
        "https://cdn.tgdd.vn/Files/2017/03/24/964495/cach-nau-bun-bo-hue-gio-heo-ngon-cong-thuc-chuan-vi-202208251617593627.jpg",
      title: "Bún Bò Huế",
      calories: "520 Kcal",
      author: "Lê Thị Hồng",
      likes: 823,
      badges: ["Đã thử món này?"],
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
      title: "Chả Giò",
      calories: "410 Kcal",
      author: "Phan Văn Đức",
      likes: 612,
      badges: ["Ít carb"],
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1591814252471-007cc864938c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
      title: "Bánh Mì Thịt Nướng",
      calories: "490 Kcal",
      author: "Võ Thị Lan",
      likes: 754,
      badges: ["Bữa sáng"],
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Cá Kho Tộ",
      calories: "550 Kcal",
      author: "Đặng Văn Hiếu",
      likes: 921,
      badges: ["Giàu protein"],
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1591814252471-007cc864938c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
      title: "Bánh Mì Thịt Nướng",
      calories: "490 Kcal",
      author: "Võ Thị Lan",
      likes: 754,
      badges: ["Bữa sáng"],
    },
    {
      id: 8,
      image:
        "https://cdnv2.tgdd.vn/mwg-static/common/Common/05052025%20-%202025-05-09T154044.858.jpg",
      title: "Cá Kho Tộ",
      calories: "550 Kcal",
      author: "Đặng Văn Hiếu",
      likes: 921,
      badges: ["Giàu protein"],
    },
    {
      id: 9,
      image:
        "https://dienlanhsanaky.com/fileman/Uploads/banh_mi_thit_nuong.jpg",
      title: "Bánh Mì Thịt Nướng",
      calories: "490 Kcal",
      author: "Võ Thị Lan",
      likes: 754,
      badges: ["Bữa sáng"],
    },
    {
      id: 10,
      image:
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Cá Kho Tộ",
      calories: "550 Kcal",
      author: "Đặng Văn Hiếu",
      likes: 921,
      badges: ["Giàu protein"],
    },
    {
      id: 11,
      image:
        "https://images.unsplash.com/photo-1591814252471-007cc864938c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
      title: "Bánh Mì Thịt Nướng",
      calories: "490 Kcal",
      author: "Võ Thị Lan",
      likes: 754,
      badges: ["Bữa sáng"],
    },
    {
      id: 12,
      image:
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Cá Kho Tộ",
      calories: "550 Kcal",
      author: "Đặng Văn Hiếu",
      likes: 921,
      badges: ["Giàu protein"],
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Gợi ý riêng cho bạn
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-950 hover:bg-gray-200 text-gray-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-950 hover:bg-gray-200 text-gray-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-8 pb-4 scroll-smooth scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {personalizedMeals.map((meal) => (
          <div
            key={meal.id}
            className="flex-shrink-0 w-full sm:w-[48%] lg:w-[23%] snap-start"
          >
            <MealCard
              image={meal.image}
              title={meal.title}
              calories={meal.calories}
              author={meal.author}
              likes={meal.likes}
              badges={meal.badges}
              isPersonalized={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PersonalizedRecommendationsSection;
