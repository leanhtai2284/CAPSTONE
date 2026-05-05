import React, { useState } from "react";
import { ThumbsUp, X } from "lucide-react";
import { useGroup } from "../../hooks/useGroup";
import { toast } from "sonner";

export default function GroupMenuVoting({ groupId, meals, onRemove }) {
  const { voteMeal, loading } = useGroup();
  const [userVotes, setUserVotes] = useState({});

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
    <div className="space-y-3">
      {meals.map((meal) => (
        <div
          key={meal._id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            {/* Meal Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {meal.name || meal.name_vi || meal.title}
              </h4>
              {meal.suggestedBy && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Đề xuất bởi {meal.suggestedBy}
                </p>
              )}
            </div>

            {/* Voting & Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote(meal._id)}
                disabled={loading}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                  userVotes[meal._id]
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {meal.votes || 0}
                </span>
              </button>

              {onRemove && (
                <button
                  onClick={() => onRemove(meal._id)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                  title="Xóa khỏi menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Nutrition Info */}
          {meal.nutrition && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Calo</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {meal.nutrition.calories || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Protein</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {meal.nutrition.protein || 0}g
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {meal.nutrition.carbs || 0}g
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
