import React, { useState } from "react";
import {
  XIcon,
  ClockIcon,
  Landmark,
  MapPinIcon,
  StarIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChefHatIcon,
  AlertTriangleIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import SaveButton from "./SaveButton";
import { NutritionChart } from "./NutritionChart";
import { motion } from "framer-motion";

const MealDetailModal = ({ meal, onClose, userPreferences }) => {
  const [servings, setServings] = useState(userPreferences?.servings || 1);
  const hasAllergenWarning = meal?.allergens?.length > 0;

  const calculateIngredient = (amount) => {
    const base = userPreferences?.servings || 1;
    return ((amount * servings) / base).toFixed(1);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal container */}
      <div
        className="bg-gray-100/80 dark:bg-gray-900/80 w-full md:max-w-4xl md:max-h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col animate-slide-up"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Header (ảnh + overlay info + nút X + SaveButton) */}
        <div className="relative">
          <img
            src={meal.image_url}
            alt={meal.dish_name}
            className="w-full h-52 sm:h-60 object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
            aria-label="Đóng"
          >
            <XIcon className="w-5 h-5 text-white" />
          </button>

          {/* SaveButton */}
          {/* <div className="absolute bottom-20 right-1">
            <SaveButton meal={meal} />
          </div> */}

          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
              {meal.dish_name}
            </h2>

            <div className="flex flex-wrap gap-4 text-sm sm:text-base text-gray-200">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[#22C55E]" />
                <span>{meal.cooking_time} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#22C55E]" />
                <span>
                  {((meal.cost_estimate * servings) / 1000).toFixed(0)}.000 VNĐ{" "}
                  <span className="text-gray-100 text-base">
                    /{servings} người
                  </span>
                </span>
              </div>
              {meal.region && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-[#22C55E]" />
                  <span>{meal.region}</span>
                </div>
              )}
              {meal.rating && (
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{meal.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nội dung có thể cuộn */}
        <div className="overflow-y-auto flex-1 px-5 py-6 space-y-8">
          {/* Ingredients */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="w-full">
                {hasAllergenWarning && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-500/40 rounded-xl mt-2 backdrop-blur-sm">
                    <AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 " />
                    <div className="ml-3">
                      <h3 className="text-lg text-red-600 font-bold">
                        Cảnh báo dị ứng
                      </h3>
                      <p className="text-red-500 text-sm mt-1">
                        Món ăn này chứa: {meal.allergens.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Servings Selector */}
              <div className="bg-white/30 dark:bg-white/10 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 w-full">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <div className="ml-3">
                      <h3 className="text-lg font-bold  mb-1">Số người ăn</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 ">
                        Điều chỉnh khẩu phần
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-10 h-10 rounded-full bg-white/50 hover:bg-red-500 flex items-center justify-center transition-colors"
                    >
                      <MinusIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </motion.button>

                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-100 w-12 text-center select-none">
                      {servings}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setServings(servings + 1)}
                      className="w-10 h-10 rounded-full bg-white/50 hover:bg-primary flex items-center justify-center transition-colors"
                    >
                      <PlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </motion.button>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold ">Nguyên liệu</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meal.ingredients?.map((i, idx) => (
                <div
                  key={idx}
                  className="flex justify-between p-3 bg-white/30 dark:bg-white/10 dark:border-white/10 rounded-xl border border-gray-300"
                >
                  <span className="text-gray-900 dark:text-gray-200">
                    {i.name}
                  </span>
                  <span className="text-[#22C55E] font-medium">
                    {calculateIngredient(i.amount)} {i.unit}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary text-white font-medium py-3 rounded-xl transition-all duration-300">
              <ShoppingCartIcon className="w-5 h-5" />
              Thêm vào danh sách mua sắm
            </button>
          </section>

          {/* Nutrition */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold ">Dinh dưỡng</h3>
            <NutritionChart nutrition={meal.nutrition} />
            <div className="p-4 bg-white/30 dark:bg-white/10 rounded-xl border border-gray-200 ">
              <p className=" text-sm">
                <span className="text-[#22C55E] font-medium">Đánh giá AI:</span>{" "}
                Món ăn này phù hợp với mục tiêu "
                {userPreferences?.goal || "Cân bằng"}" của bạn. Cung cấp đủ
                protein và cân bằng dinh dưỡng.
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">Cách làm</h3>
            <div className="space-y-3">
              {meal.cooking_steps?.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-white/30 dark:bg-white/10 rounded-xl border border-gray-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <p className=" flex-1">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className=" bg-white/30 dark:bg-white/10 border-t border-gray-300 p-5 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-primary  font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#22C55E]/30">
                <ChefHatIcon className="w-5 h-5" />
                Bắt đầu nấu
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/40 hover:bg-primary  font-medium py-4 rounded-xl border border-gray-300 hover:border-[#22C55E] transition-all duration-300">
                Thêm vào kế hoạch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
