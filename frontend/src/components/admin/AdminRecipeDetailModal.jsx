import React, { useState, useEffect } from "react";
import { recipeService } from "../../services/recipeService";

const AdminRecipeDetailModal = ({ recipe, onClose }) => {
  const [recipeData, setRecipeData] = useState(recipe || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFullDetails = async (recipeToLoad) => {
    if (!recipeToLoad) return;
    try {
      setLoading(true);
      setError(null);
      const recipeId = recipeToLoad._id || recipeToLoad.id;
      if (!recipeId) {
        console.error("Recipe ID not found");
        setError("Không tìm thấy ID công thức");
        return;
      }
      const fullRecipe = await recipeService.getRecipeById(recipeId);
      if (fullRecipe) {
        setRecipeData(fullRecipe);
      }
    } catch (error) {
      console.error("Error loading recipe details:", error);
      setError(error.message || "Không thể tải chi tiết công thức");
      // Keep showing the basic recipe data even if full load fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize recipeData when recipe changes
    if (recipe) {
      setRecipeData(recipe);
      setError(null);
      // Load full recipe details if we only have basic info
      if (!recipe.ingredients || !recipe.steps || !recipe.nutrition) {
        loadFullDetails(recipe);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe]);

  if (!recipe || !recipeData) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative flex-shrink-0">
          {recipeData?.image_url && (
            <img
              src={recipeData.image_url}
              alt={recipeData?.name_vi || "Công thức"}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {recipeData?.name_vi || "Công thức"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {recipeData?.region && (
                <span className="px-3 py-1 bg-blue-500/80 text-white rounded-full text-sm">
                  {recipeData.region}
                </span>
              )}
              {recipeData?.category && (
                <span className="px-3 py-1 bg-green-500/80 text-white rounded-full text-sm">
                  {recipeData.category}
                </span>
              )}
              {recipeData.difficulty && (
                <span className="px-3 py-1 bg-yellow-500/80 text-white rounded-full text-sm">
                  {recipeData.difficulty === "easy"
                    ? "Dễ"
                    : recipeData.difficulty === "medium"
                    ? "Trung bình"
                    : "Khó"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
              <button
                onClick={() => loadFullDetails(recipe)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipeData.prep_time_min && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Chuẩn bị</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {recipeData.prep_time_min} phút
                    </div>
                  </div>
                )}
                {recipeData.cook_time_min && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Nấu</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {recipeData.cook_time_min} phút
                    </div>
                  </div>
                )}
                {recipeData.servings && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Phần ăn</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {recipeData.servings}
                    </div>
                  </div>
                )}
                {recipeData.spice_level !== undefined && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Độ cay</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {recipeData.spice_level}/5
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {recipeData.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mô tả
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {recipeData.description}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {recipeData.ingredients && recipeData.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Nguyên liệu
                  </h3>
                  <ul className="space-y-2">
                    {recipeData.ingredients.map((ing, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {ing?.name || "Nguyên liệu"}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {ing?.amount || ""} {ing?.unit || ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {recipeData.steps && recipeData.steps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Các bước nấu
                  </h3>
                  <ol className="space-y-3">
                    {recipeData.steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white flex-1">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Nutrition */}
              {recipeData.nutrition && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Thông tin dinh dưỡng
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    {recipeData.nutrition.calories && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Calories</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {recipeData.nutrition.calories} kcal
                        </div>
                      </div>
                    )}
                    {recipeData.nutrition.protein_g && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {recipeData.nutrition.protein_g} g
                        </div>
                      </div>
                    )}
                    {recipeData.nutrition.carbs_g && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {recipeData.nutrition.carbs_g} g
                        </div>
                      </div>
                    )}
                    {recipeData.nutrition.fat_g && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Fat</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {recipeData.nutrition.fat_g} g
                        </div>
                      </div>
                    )}
                    {recipeData.nutrition.fiber_g && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Fiber</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {recipeData.nutrition.fiber_g} g
                        </div>
                      </div>
                    )}
                    {recipeData.nutrition.sodium_mg && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Sodium</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {recipeData.nutrition.sodium_mg} mg
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Estimate */}
              {recipeData.price_estimate &&
                (recipeData.price_estimate.min ||
                  recipeData.price_estimate.max) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ước tính giá
                    </h3>
                    <div className="text-gray-700 dark:text-gray-300">
                      {recipeData.price_estimate.min &&
                      recipeData.price_estimate.max
                        ? `${recipeData.price_estimate.min.toLocaleString()} - ${recipeData.price_estimate.max.toLocaleString()} ${recipeData.price_estimate.currency || "VND"}`
                        : recipeData.price_estimate.min
                        ? `Từ ${recipeData.price_estimate.min.toLocaleString()} ${recipeData.price_estimate.currency || "VND"}`
                        : `Đến ${recipeData.price_estimate.max.toLocaleString()} ${recipeData.price_estimate.currency || "VND"}`}
                    </div>
                  </div>
                )}

              {/* Tags and Arrays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipeData.diet_tags && recipeData.diet_tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Diet Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recipeData.diet_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recipeData.allergens && recipeData.allergens.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Allergens
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recipeData.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recipeData.meal_types && recipeData.meal_types.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bữa ăn phù hợp
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recipeData.meal_types.map((type, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                        >
                          {type === "breakfast"
                            ? "Sáng"
                            : type === "lunch"
                            ? "Trưa"
                            : "Tối"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recipeData.taste_profile && recipeData.taste_profile.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Hương vị
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recipeData.taste_profile.map((taste, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm"
                        >
                          {taste}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Utensils */}
              {recipeData.utensils && recipeData.utensils.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Dụng cụ cần thiết
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recipeData.utensils.map((utensil, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm"
                      >
                        {utensil}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suitable For / Avoid For */}
              {(recipeData.suitable_for?.length > 0 ||
                recipeData.avoid_for?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipeData.suitable_for?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                        Phù hợp cho
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recipeData.suitable_for.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipeData.avoid_for?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                        Tránh cho
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recipeData.avoid_for.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t dark:border-gray-700 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRecipeDetailModal;

