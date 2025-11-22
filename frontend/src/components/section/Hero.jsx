import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowRight } from "react-icons/fa";
import { Flame, Drumstick, Clock } from "lucide-react";

const Hero = ({ onMealClick }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📡 Fetch API từ backend bằng axios
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/recipes"); // 🔧 đổi URL nếu cần
        console.log("📦 API trả về:", res.data);

        // ✅ Lấy danh sách món ăn từ res.data.items
        const mealsArray = Array.isArray(res.data.items) ? res.data.items : [];
        const validMeals = mealsArray.filter((meal) => meal.image_url);
        setMeals(validMeals);
      } catch (err) {
        console.error("Lỗi khi fetch món ăn:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // 🎲 Random 5 món bất kỳ
  const randomMeals = useMemo(() => {
    const shuffled = [...meals].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [meals]);

  if (loading) {
    return (
      <section className="flex items-center justify-center h-[600px]">
        <p className="text-gray-500">Đang tải dữ liệu món ăn...</p>
      </section>
    );
  }

  if (!meals.length) {
    return (
      <section className="flex items-center justify-center h-[600px]">
        <p className="text-gray-500">Không có món ăn nào trong dữ liệu API.</p>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[600px] overflow-hidden">
      <div className="container mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={randomMeals.length > 1}
          className="h-full rounded-2xl overflow-hidden"
        >
          {randomMeals.map((meal) => {
            const totalTime =
              (meal.prep_time_min || 0) + (meal.cook_time_min || 0);

            return (
              <SwiperSlide key={meal._id || meal.id}>
                <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
                  <img
                    src={meal.image_url}
                    alt={meal.name_vi || meal.name_en || "Món ăn"}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-[1]" />

                  <div className="absolute inset-0 flex items-center p-6 md:p-12 z-10">
                    <div className="max-w-xl bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 dark:border-white/10">
                      <span className="inline-block bg-red-500 text-white text-sm font-bold py-1 px-4 rounded-full mb-4">
                        {meal.region === "Bắc"
                          ? "Tinh hoa ẩm thực miền Bắc"
                          : meal.region === "Trung"
                          ? "Đậm đà vị miền Trung thương nhớ"
                          : "Ngọt ngào, phóng khoáng hồn Nam Bộ"}
                      </span>

                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 font-serif text-white">
                        {meal.name_vi || meal.name_en}
                      </h1>

                      <p className="text-base md:text-lg mb-8 italic font-serif text-gray-100 line-clamp-3">
                        {meal.description || "Một món ăn ngon bạn nên thử!"}
                      </p>

                      {/* Thông tin dinh dưỡng */}
                      <div className="flex items-center flex-wrap gap-6 mb-8 text-gray-800 dark:text-gray-100">
                        {[
                          {
                            label: "Kcal",
                            value: meal.nutrition?.calories,
                            icon: <Flame className="w-4 h-4 text-orange-500" />,
                          },
                          {
                            label: "Protein",
                            value: `${meal.nutrition?.protein_g || 0}g`,
                            icon: (
                              <Drumstick className="w-4 h-4 text-amber-500" />
                            ),
                          },
                          {
                            label: `${totalTime} phút`,
                            value: null,
                            icon: <Clock className="w-4 h-4 text-green-500" />,
                          },
                        ].map(({ label, value, icon }, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-white/20 dark:bg-white/5 px-3 py-2 rounded-xl 
                              backdrop-blur-sm border border-white/10 shadow-sm hover:bg-white/30 
                              transition-all duration-300"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-white/10">
                              {icon}
                            </div>
                            <div className="flex flex-col leading-tight">
                              {value && (
                                <span className="text-sm font-semibold text-white">
                                  {value}
                                </span>
                              )}
                              <span className="text-xs text-white">
                                {label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 👇 Nút xem chi tiết */}
                      <button
                        onClick={() => onMealClick(meal)}
                        className="relative flex items-center gap-2 px-6 py-3 rounded-full 
                        bg-gradient-to-r from-emerald-500 to-green-600 text-white 
                        font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105
                        transition-all duration-300 group"
                      >
                        <span>Xem chi tiết công thức</span>
                        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default Hero;
