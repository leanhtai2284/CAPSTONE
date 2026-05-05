import React, { useState, useEffect, useRef } from "react";
import {
  XIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChefHatIcon,
  AlertTriangleIcon,
  MinusIcon,
  PlusIcon,
  ChefHat,
  Loader2,
} from "lucide-react";
import { FaMoneyBillWave } from "react-icons/fa";
import SaveButton from "./SaveButton";
import { NutritionChart } from "./NutritionChart";
import { motion } from "framer-motion";
import CookingStepsView from "./CookingStepsView";

const MealDetailModal = ({ meal, onClose, userPreferences }) => {
  const [servings, setServings] = useState(userPreferences?.servings || 1);
  const [mealData, setMealData] = useState(meal);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("details"); // 'details' or 'cooking'
  const cacheRef = useRef({});
  const debounceTimer = useRef(null);
  const hasAllergenWarning = meal?.allergens?.length > 0;
  const totalTime = (meal?.prep_time_min || 0) + (meal?.cook_time_min || 0);
  const effectiveMeal = mealData || meal;
  const priceEstimate =
    effectiveMeal?.price_estimate || meal?.price_estimate || {};
  const priceMin = Number(priceEstimate.min);
  const priceMax = Number(priceEstimate.max);
  const basePrice =
    Number.isFinite(priceMin) && priceMin > 0
      ? priceMin
      : Number.isFinite(priceMax) && priceMax > 0
        ? priceMax
        : Number(effectiveMeal?.cost_estimate || meal?.cost_estimate || 0);
  const displayPrice = basePrice * servings;

  const scaleNutrition = (nutrition, multiplier) => {
    if (!nutrition) return nutrition;
    const factor = Number(multiplier) || 1;
    return {
      ...nutrition,
      calories: (Number(nutrition.calories) || 0) * factor,
      protein_g: (Number(nutrition.protein_g) || 0) * factor,
      carbs_g: (Number(nutrition.carbs_g) || 0) * factor,
      fat_g: (Number(nutrition.fat_g) || 0) * factor,
      fiber_g: (Number(nutrition.fiber_g) || 0) * factor,
      sodium_mg: (Number(nutrition.sodium_mg) || 0) * factor,
      sugar_g: (Number(nutrition.sugar_g) || 0) * factor,
    };
  };

  const scaledNutrition = scaleNutrition(
    effectiveMeal?.nutrition || meal?.nutrition,
    servings,
  );

  useEffect(() => {
    const nextServings = Number(userPreferences?.servings) || 1;
    setServings(nextServings);
  }, [userPreferences?.servings, meal?.id, meal?._id]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      const key = `${mealData.id || mealData._id}_${servings}`;

      // ✅ Nếu đã có cache → dùng ngay, không fetch lại
      if (cacheRef.current[key]) {
        setMealData((prev) => ({
          ...prev,
          ingredients: cacheRef.current[key].ingredients,
          nutrition: cacheRef.current[key].nutrition,
        }));
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/recipes/${
            mealData.id || mealData._id
          }?servings=${servings}`,
        );
        const data = await res.json();

        // ✅ Cache lại
        cacheRef.current[key] = data;

        // ✅ Chỉ update phần ingredients và nutrition (giữ nguyên ảnh + text)
        setMealData((prev) => ({
          ...prev,
          ingredients: data.ingredients || prev.ingredients,
          nutrition: data.nutrition || prev.nutrition,
        }));
      } catch (err) {
        console.error("❌ Lỗi tải món:", err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [servings]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleStartCooking = () => {
    setViewMode("cooking");
  };

  const handleBackToDetails = () => {
    setViewMode("details");
  };

  // If cooking mode, show CookingStepsView instead
  if (viewMode === "cooking") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center md:items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-gray-100/80 dark:bg-gray-900/80 w-full md:max-w-4xl md:h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col">
          <CookingStepsView
            meal={mealData}
            onClose={onClose}
            onBackToDetails={handleBackToDetails}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center md:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal container */}
      <div
        className="bg-gray-100/80 dark:bg-gray-900/80 w-full md:max-w-4xl md:max-h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden md:overflow-hidden flex flex-col animate-slide-up"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* 🌀 Loading overlay (hiển thị khi fetch servings) */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div className="relative flex flex-col max-h-[90vh] w-full md:max-w-4xl rounded-t-3xl overflow-hidden">
          {/* Header (ảnh + overlay info + nút X + SaveButton) */}
          <div className="relative flex-shrink-0">
            <img
              src={meal.image_url}
              alt={meal.name_vi}
              className="w-full h-52 sm:h-60 object-cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition z-10"
              aria-label="Đóng"
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>

            {/* SaveButton - đặt fixed dưới nút đóng */}
            <SaveButton
              meal={mealData || meal}
              className="absolute bottom-4 right-3 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-sm transition-transform duration-200 hover:scale-110 z-10"
            />

            {/* Tag dinh dưỡng */}
            <div className="absolute top-0 left-0 p-5 space-y-2">
              {(meal.diet_tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 mr-2 bg-green-500/90 backdrop-blur-sm text-white text-lg items-center font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black/70 via-black/40 to-transparent">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-semibold leading-tight drop-shadow">
                  {" "}
                  {meal.name_vi}{" "}
                </h2>
                {/* Đánh giá */}{" "}
                {/* {meal.rating && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm shadow-sm">
                    {" "}
                    <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />{" "}
                    <span className="text-sm sm:text-base font-medium">
                      {" "}
                      {meal.rating}{" "}
                    </span>{" "}
                  </div>
                )} */}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {/* Thời gian */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm shadow-sm">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span className="text-sm sm:text-base">{totalTime} phút</span>
                </div>

                {/* Giá */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm shadow-sm">
                  <FaMoneyBillWave className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span className="text-sm sm:text-base">
                    {((displayPrice || 0) / 1000).toFixed(0)}
                    .000&nbsp;VNĐ{" "}
                    <span className="text-gray-200 text-lg sm:text-sm font-bold">
                      / {servings} người
                    </span>
                  </span>
                </div>

                {/* Vùng */}
                {meal.region && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm shadow-sm">
                    <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span className="text-sm sm:text-base">
                      Miền {meal.region}
                    </span>
                  </div>
                )}

                {/* Độ khó */}
                {meal.difficulty && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm shadow-sm">
                    <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span className="text-sm sm:text-base font-medium">
                      {meal.difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nội dung có thể cuộn */}
          <div
            className="overflow-y-auto px-5 py-6 space-y-8"
            style={{ maxHeight: "calc(90vh - 250px)" }}
          >
            <section>
              <h3 className="text-xl font-bold ">Dụng cụ cần chuẩn bị</h3>

              <div className="flex flex-wrap gap-3 mt-3">
                {meal.utensils?.map((utensil, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-white/30 dark:bg-white/10 rounded-xl border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-200"
                  >
                    {utensil}
                  </div>
                ))}
              </div>
            </section>

            {/* Ingredients */}
            <section className="space-y-4">
              {/* 🧩 Section 1: Cảnh báo dị ứng */}
              <div className="w-full">
                {hasAllergenWarning && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-500/40 rounded-xl mt-2 backdrop-blur-sm">
                    <AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-lg text-red-500 font-bold">
                        Cảnh báo dị ứng
                      </h3>
                      <p className="text-red-500 text-sm mt-1">
                        Món ăn này chứa: {meal.allergens.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 🧩 Section 2: Điều chỉnh khẩu phần ăn */}
              <section className="bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 w-full">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <div className="ml-3">
                      <h3 className="text-lg font-bold mb-1">Số người ăn</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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
              </section>

              {/* 🧩 Section 3: Danh sách nguyên liệu + nút mua sắm */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Nguyên liệu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mealData.ingredients?.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-between p-3 bg-white/40 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                    >
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {item.name}
                      </span>
                      <span className="px-2 py-1 text-sm font-bold text-green-00 dark:text-green-500 ">
                        {item.amount} {item.unit}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Nutrition */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold ">Dinh dưỡng</h3>
              <NutritionChart nutrition={scaledNutrition} />
            </section>

            {/* Suitable / Avoid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Phù hợp cho</h3>
                <div className="flex flex-wrap gap-2">
                  {(meal.suitable_for || []).map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-2 bg-green-400/20 text-green-600 rounded-lg text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              {meal.avoid_for?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Nên tránh</h3>
                  <div className="flex flex-wrap gap-2">
                    {meal.avoid_for.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-2 bg-red-400/20 text-red-500 rounded-lg text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className=" bg-white/30 dark:bg-white/10 border-t border-gray-300 p-5 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartCooking}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-primary  font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#22C55E]/30"
                >
                  <ChefHatIcon className="w-5 h-5" />
                  Bắt đầu nấu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
