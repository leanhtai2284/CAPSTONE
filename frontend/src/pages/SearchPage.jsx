import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MealCard from "../components/ui/MealCard";
import { Loader2, RotateCcw } from "lucide-react";
import { useMealSelection } from "../context/MealSelectionContext";
import MealSection from "../components/section/MealSection";
import { mealService } from "../services/mealService";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recommendMeals, setRecommendMeals] = useState([]);

  // 🧠 Lấy dữ liệu từ URL
  const text = searchParams.get("text") || "";
  const region = searchParams.get("region") || "";
  const diet_tags = searchParams.get("diet_tags") || "";
  const category = searchParams.get("category") || "";
  const minCal = searchParams.get("min_calories") || "";
  const maxCal = searchParams.get("max_calories") || "";
  const { handleMealClick } = useMealSelection();

  // 🧩 Fetch dữ liệu từ BE
  useEffect(() => {
    if (!text) return;
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams({
          text,
          ...(region && { region }),
          ...(diet_tags && { diet_tags }),
          ...(category && { category }),
          ...(minCal && { min_calories: minCal }),
          ...(maxCal && { max_calories: maxCal }),
        }).toString();

        const res = await fetch(`http://localhost:5000/api/recipes?${query}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Không thể tải dữ liệu");
        setRecipes(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [text, region, diet_tags, category, minCal, maxCal]);

  // 🧩 Fetch dữ liệu cho “Gợi ý cho riêng bạn”
  useEffect(() => {
    const fetchRecommendMeals = async () => {
      try {
        const meals = await mealService.getMeals("?recommended=true");
        // Lấy ngẫu nhiên 6–12 món
        const shuffled = [...meals].sort(() => 0.5 - Math.random());
        setRecommendMeals(shuffled.slice(0, Math.floor(Math.random() * 6) + 6));
      } catch (err) {
        console.error("❌ Lỗi tải gợi ý:", err);
      }
    };

    fetchRecommendMeals();
  }, []);

  // 🧭 Thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(name, value);
    else newParams.delete(name);
    setSearchParams(newParams);
  };

  // 🔁 Reset bộ lọc
  const handleResetFilters = () => {
    const newParams = new URLSearchParams();
    if (text) newParams.set("text", text);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* 🧩 Mobile: Bộ lọc ở trên */}
      <div className="block md:hidden mb-6">
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-md p-5 border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Vùng miền */}
            <div>
              <label className="block mb-1 font-medium">Vùng miền</label>
              <select
                name="region"
                value={region}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="Bắc">Miền Bắc</option>
                <option value="Trung">Miền Trung</option>
                <option value="Nam">Miền Nam</option>
              </select>
            </div>

            {/* Chế độ ăn */}
            <div>
              <label className="block mb-1 font-medium">Chế độ ăn</label>
              <select
                name="diet_tags"
                value={diet_tags}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="light">Nhẹ</option>
                <option value="balanced">Cân bằng</option>
                <option value="vegetarian">Ăn chay</option>
              </select>
            </div>

            {/* Loại món */}
            <div>
              <label className="block mb-1 font-medium">Loại món</label>
              <select
                name="category"
                value={category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="main">Món chính</option>
                <option value="dessert">Tráng miệng</option>
                <option value="salad">Salad</option>
                <option value="snack">Ăn vặt</option>
                <option value="soup">Canh / Súp</option>
              </select>
            </div>

            {/* Giới hạn kcal */}
            <div>
              <label className="block mb-1 font-medium">Giới hạn kcal</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  name="min_calories"
                  value={minCal}
                  onChange={handleFilterChange}
                  className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  name="max_calories"
                  value={maxCal}
                  onChange={handleFilterChange}
                  className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={handleResetFilters}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300
              dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium py-2 rounded-lg transition-all"
          >
            <RotateCcw size={16} />
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* 🧩 Desktop layout */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-8">
        {/* Bộ lọc bên trái (ẩn trên mobile) */}
        <aside
          className="hidden md:block md:col-span-1 xl:col-span-1.5 bg-white dark:bg-gray-950 
          rounded-2xl shadow-md p-5 sticky top-20 h-fit"
          style={{ minWidth: "260px" }}
        >
          <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
          <div className="space-y-4 text-sm">
            {/* Vùng miền */}
            <div>
              <label className="block mb-1 font-medium">Vùng miền</label>
              <select
                name="region"
                value={region}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="Bắc">Miền Bắc</option>
                <option value="Trung">Miền Trung</option>
                <option value="Nam">Miền Nam</option>
              </select>
            </div>

            {/* Chế độ ăn */}
            <div>
              <label className="block mb-1 font-medium">Chế độ ăn</label>
              <select
                name="diet_tags"
                value={diet_tags}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="light">Nhẹ</option>
                <option value="balanced">Cân bằng</option>
                <option value="vegetarian">Ăn chay</option>
              </select>
            </div>

            {/* Loại món */}
            <div>
              <label className="block mb-1 font-medium">Loại món</label>
              <select
                name="category"
                value={category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="main">Món chính</option>
                <option value="dessert">Tráng miệng</option>
                <option value="salad">Salad</option>
                <option value="snack">Ăn vặt</option>
                <option value="soup">Canh / Súp</option>
              </select>
            </div>

            {/* kcal */}
            <div>
              <label className="block mb-1 font-medium">Giới hạn kcal</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  name="min_calories"
                  value={minCal}
                  onChange={handleFilterChange}
                  className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  name="max_calories"
                  value={maxCal}
                  onChange={handleFilterChange}
                  className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <button
              onClick={handleResetFilters}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300
                dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium py-2 rounded-lg transition-all"
            >
              <RotateCcw size={16} />
              Đặt lại bộ lọc
            </button>
          </div>
        </aside>

        {/* Kết quả bên phải */}
        <main className="md:col-span-3 xl:col-span-4">
          <h1 className="text-2xl font-bold mb-5">
            Kết quả cho <span className="text-primary">“{text}”</span>
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : recipes.length === 0 ? (
            <div className="bg-white dark:bg-gray-950 rounded-2xl p-12 text-center border dark:border-gray-800 border-gray-300 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold mb-2">
                Không tìm thấy món nào phù hợp
              </h2>
              <p className="text-gray-600">
                Thử điều chỉnh bộ lọc hoặc từ khóa khác
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((item) => (
                <MealCard
                  key={item._id}
                  meal={item}
                  onClick={() => handleMealClick(item)}
                />
              ))}
            </div>
          )}
          {/* 🧩 Gợi ý cho riêng bạn */}
          {recommendMeals.length > 0 && (
            <section className="mt-16">
              <div className="-mx-12">
                {" "}
                {/* ✅ bù trừ padding để thẳng hàng */}
                <MealSection
                  title="Gợi ý cho riêng bạn"
                  meals={recommendMeals}
                  onMealClick={handleMealClick}
                />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchPage;
