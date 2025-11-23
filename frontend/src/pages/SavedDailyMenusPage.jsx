import React, { useEffect, useState } from "react";
import { Trash2, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import MealSetSection from "../components/section/MealSetSection";
import { dailyMenuService } from "../services/dailyMenuService";

const SavedDailyMenusPage = () => {
  const [savedDailyMenus, setSavedDailyMenus] = useState([]);

  const loadSavedMenus = async () => {
    try {
      const menus = await dailyMenuService.getAll();

      // Chuẩn hoá id để dùng menu.id cho key, delete...
      const normalized = menus.map((m) => ({
        ...m,
        id: m._id || m.id,
      }));

      const sortedMenus = normalized.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
      });

      setSavedDailyMenus(sortedMenus);
    } catch (err) {
      console.error("Error loading saved menus:", err);
      toast.error(err.message || "Không thể tải thực đơn đã lưu!");
    }
  };

  useEffect(() => {
    loadSavedMenus();
  }, []);

  const handleDeleteMenu = async (menuId) => {
    try {
      await dailyMenuService.delete(menuId);

      const updatedMenus = savedDailyMenus.filter((menu) => menu.id !== menuId);
      setSavedDailyMenus(updatedMenus);

      toast.success("Đã xóa thực đơn!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Error deleting menu:", err);
      toast.error(err.message || "Không thể xóa thực đơn. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const normalizeMealsFromApi = (list) => {
    const breakfast = list.filter((m) =>
      (m.meal_types || []).includes("breakfast")
    );
    const lunch = list.filter((m) => (m.meal_types || []).includes("lunch"));
    const dinner = list.filter((m) => (m.meal_types || []).includes("dinner"));
    const arr = [];
    if (breakfast.length)
      arr.push({ mealType: "breakfast", dishes: breakfast });
    if (lunch.length) arr.push({ mealType: "lunch", dishes: lunch });
    if (dinner.length) arr.push({ mealType: "dinner", dishes: dinner });
    return arr.length ? arr : [{ mealType: "gợi ý", dishes: list }];
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen container px-4 md:px-10 py-10 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Thực đơn đã lưu
        </h1>
        {savedDailyMenus.length > 0 && (
          <div className="w-24 h-1 bg-primary rounded-full mt-3" />
        )}
      </div>

      {/* Nội dung */}
      {savedDailyMenus.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Bạn chưa lưu thực đơn nào cả 😢
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Hãy tạo thực đơn và lưu lại để xem sau nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedDailyMenus.map((menu) => {
            const mealSets = normalizeMealsFromApi(menu.meals || []);
            return (
              <div
                key={menu.id}
                className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-300 dark:border-gray-800 shadow-sm"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {menu.dayName || "Thực đơn"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Lưu lúc: {formatDate(menu.createdAt || menu.date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="p-2 rounded-md text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors"
                    aria-label="Xóa thực đơn"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Meal Sets */}
                <div className="space-y-4">
                  {mealSets.map((mealSet, index) => (
                    <MealSetSection
                      key={`${menu.id}-${mealSet.mealType}-${index}`}
                      mealSet={mealSet}
                      onSwapMeal={null}
                      isSwapping={false}
                      showSwapButton={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedDailyMenusPage;
