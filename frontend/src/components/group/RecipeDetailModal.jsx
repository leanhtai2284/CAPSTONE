import React from "react";
import { X, Clock, Users, Flame, ChefHat, ShoppingCart } from "lucide-react";
import { recipeService } from "../../services/recipeService";

export default function RecipeDetailModal({ isOpen, onClose, recipeId }) {
  const [recipe, setRecipe] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && recipeId) {
      loadRecipeDetails();
    }
  }, [isOpen, recipeId]);

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipeById(recipeId);
      setRecipe(data.data || data);
    } catch (error) {
      console.error("Error loading recipe details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Không thể tải chi tiết công thức
          </div>
        </div>
      </div>
    );
  }

  const nutrition = recipe.nutrition || {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chi tiết công thức
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image and Basic Info */}
            <div>
              {recipe.image_url && (
                <div className="mb-6">
                  <img
                    src={recipe.image_url}
                    alt={recipe.name_vi || recipe.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {recipe.name_vi || recipe.name}
                </h3>

                {recipe.description && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {recipe.description}
                  </p>
                )}

                {/* Time and Servings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Thời gian</div>
                      <div>
                        {recipe.prep_time_min || 0} + {recipe.cook_time_min || 0} phút
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Khẩu phần</div>
                      <div>{recipe.servings || 1} người</div>
                    </div>
                  </div>
                </div>

                {/* Nutrition Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Thông tin dinh dưỡng
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                      <span className="ml-2 font-medium">{nutrition.calories || 0} kcal</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                      <span className="ml-2 font-medium">{nutrition.protein_g || 0}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                      <span className="ml-2 font-medium">{nutrition.carbs_g || 0}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fat:</span>
                      <span className="ml-2 font-medium">{nutrition.fat_g || 0}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fiber:</span>
                      <span className="ml-2 font-medium">{nutrition.fiber_g || 0}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Sodium:</span>
                      <span className="ml-2 font-medium">{nutrition.sodium_mg || 0}mg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Ingredients and Steps */}
            <div className="space-y-6">
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Nguyên liệu
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                        <span>
                          {typeof ingredient === 'string' 
                            ? ingredient 
                            : `${ingredient.name || ''}${ingredient.amount ? ` - ${ingredient.amount}` : ''}${ingredient.unit ? ` ${ingredient.unit}` : ''}`
                          }
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {recipe.steps && recipe.steps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Các bước thực hiện
                    </h4>
                  </div>
                  <ol className="space-y-3">
                    {recipe.steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span>
                          {typeof step === 'string' 
                            ? step 
                            : typeof step === 'object' 
                              ? step.description || step.step || JSON.stringify(step)
                              : String(step)
                          }
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
