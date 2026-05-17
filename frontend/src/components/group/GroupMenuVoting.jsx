import React, { useState } from "react";
import { ThumbsUp, X, Eye, UtensilsCrossed } from "lucide-react";
import { useGroup } from "../../hooks/useGroup";
import { toast } from "sonner";
import RecipeDetailModal from "./RecipeDetailModal";

export default function GroupMenuVoting({ groupId, meals, onRemove }) {
  const { voteMeal, logGroupMeal, loading } = useGroup();
  const [userVotes, setUserVotes] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [logLoading, setLogLoading] = useState({});

  const handleLogMeal = async (meal) => {
    const recipeId = meal._id || meal.meal?._id || meal.meal;
    if (!recipeId) {
      toast.error("❌ Không tìm thấy thông tin công thức");
      return;
    }
    try {
      setLogLoading((prev) => ({ ...prev, [meal._id]: true }));
      await logGroupMeal(groupId, recipeId);
      toast.success(
        `🍽️ Đã đồng bộ món "${meal.name || meal.name_vi || meal.title}" vào Nhật ký dinh dưỡng cá nhân hôm nay!`
      );
    } catch (error) {
      toast.error(error.message || "❌ Lỗi khi đồng bộ món ăn");
    } finally {
      setLogLoading((prev) => ({ ...prev, [meal._id]: false }));
    }
  };

  const handleVote = async (mealId) => {
    try {
      const currentVote = userVotes[mealId] ? null : true;
      await voteMeal(groupId, mealId, currentVote);
      setUserVotes((prev) => ({
        ...prev,
        [mealId]: currentVote,
      }));
      toast.success(currentVote ? "👍 Đã thích!" : "👎 Bỏ thích");
    } catch (error) {
      toast.error("❌ Lỗi khi bình chọn");
    }
  };

  const handleViewRecipe = (meal) => {
    // Try different ways to get recipe ID
    const recipeId = meal.meal?._id || meal._id || meal.meal;
    setSelectedRecipe(recipeId);
    setShowRecipeModal(true);
  };

  if (!meals || meals.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">🍽️</div>
        <p className="text-gray-700 dark:text-gray-300">
          Chưa có bữa ăn nào. Thêm một thực đơn để bắt đầu bình chọn!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
          >
            {/* Header with Meal Info */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {meal.name || meal.name_vi || meal.title}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {meal.suggestedBy && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Đề xuất bởi {meal.suggestedBy}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a1 1 0 011 1v3a1 1 0 011 1h1a1 1 0 001-1V6a1 1 0 011-1h2a1 1 0 011-1V3a1 1 0 00-1-1H6zM4 4a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011 1v1a1 1 0 011 1h6a1 1 0 001-1v-1a1 1 0 00-1-1H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(meal.addedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Voting & Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(meal._id)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      userVotes[meal._id]
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">
                      {meal.votes || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleViewRecipe(meal)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                    title="Xem chi tiết công thức"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Chi tiết</span>
                  </button>

                  <button
                    onClick={() => handleLogMeal(meal)}
                    disabled={logLoading[meal._id]}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow hover:shadow-md active:scale-95 disabled:opacity-50"
                    title="Đồng bộ món ăn này vào Nhật ký dinh dưỡng cá nhân của bạn"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="font-medium">Ăn món này</span>
                  </button>

                  {onRemove && (
                    <button
                      onClick={() => onRemove(meal._id)}
                      className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Xóa khỏi menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Note */}
              {meal.note && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Ghi chú:</span> {meal.note}
                  </p>
                </div>
              )}
            </div>

            {/* Nutrition Info */}
            {meal.nutrition && (
              <div className="px-4 pb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 text-lg font-bold">🔥</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Calo</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {meal.nutrition.calories || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-lg font-bold">💪</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Protein</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {meal.nutrition.protein || 0}g
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">🌾</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Carbs</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {meal.nutrition.carbs || 0}g
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-lg font-bold">🥑</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fat</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {meal.nutrition.fat || 0}g
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        recipeId={selectedRecipe}
      />
    </>
  );
}
