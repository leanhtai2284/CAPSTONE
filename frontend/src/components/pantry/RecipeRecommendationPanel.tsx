import React from "react";
import { X, Clock, ChefHat } from "lucide-react";
import { PantryItem, Recipe } from "../../types/pantry";

interface RecipeRecommendationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: PantryItem | null;
  ingredientNames?: string[];
  recipes: Recipe[];
  loading?: boolean;
  error?: string;
  onRecipeClick?: (recipe: Recipe) => void;
}

export function RecipeRecommendationPanel({
  isOpen,
  onClose,
  ingredient,
  ingredientNames = [],
  recipes,
  loading = false,
  error = "",
  onRecipeClick,
}: RecipeRecommendationPanelProps) {
  if (!isOpen || !ingredient) return null;

  const extraIngredientCount = Math.max(
    0,
    ingredientNames.filter((name) => name !== ingredient.name).length,
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-white shadow-xl transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Ý tưởng công thức</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <ChefHat className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sử dụng {ingredient.name}
                {extraIngredientCount > 0
                  ? ` + ${extraIngredientCount} nguyên liệu khác`
                  : ""}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Dưới đây là một số ý tưởng công thức sử dụng nguyên liệu này
            </p>
            {ingredientNames.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {ingredientNames.map((name) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-6 text-sm text-gray-500">
              Đang tải gợi ý công thức...
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-6 text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onRecipeClick?.(recipe)}
                >
                  <div className="flex space-x-3">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {recipe.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {recipe.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {recipe.prepTime}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {recipe.matchPercentage}% match
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && recipes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Không có món nào phù hợp với nguyên liệu đã chọn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
