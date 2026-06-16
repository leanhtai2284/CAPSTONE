import React from "react";
import { X, Clock, ChefHat, Sparkles, ArrowRight } from "lucide-react";
import SaveButton from "../ui/SaveButton";
import { PantryItem, Recipe } from "../../types/pantry";

const IMAGE_HEIGHTS = ["h-64", "h-72", "h-80"];

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
  ingredientNames,
  recipes,
  loading = false,
  error,
  onRecipeClick,
}: RecipeRecommendationPanelProps) {
  if (!isOpen || !ingredient) return null;

  const extraIngredientCount = Math.max(
    0,
    ingredientNames?.filter((name: string) => name !== ingredient.name)
      .length || 0,
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto animate-in fade-in duration-200">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <ChefHat className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-secondary tracking-tight">
                Ý tưởng công thức
              </h2>
              <h3 className="text-lg font-semibold text-gray-900">
                Sử dụng {ingredient.name}
                {extraIngredientCount > 0
                  ? ` + ${extraIngredientCount} nguyên liệu khác`
                  : ""}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close recipe recommendations"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-32 text-gray-500">
            Loading recipes...
          </div>
        ) : error ? (
          <div className="text-center py-32 text-red-500">{error}</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <ChefHat className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find any recipes for this ingredient. Try adding more
              ingredients to your pantry.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {recipes.map((recipe, index) => {
              const imageHeight = IMAGE_HEIGHTS[index % IMAGE_HEIGHTS.length];
              const mealPayload =
                recipe.raw ||
                ({
                  id: recipe.id,
                  name_vi: recipe.name,
                  image_url: recipe.imageUrl,
                  description: recipe.description,
                } as any);

              return (
                <article
                  key={recipe.id}
                  className="break-inside-avoid bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => onRecipeClick?.(recipe)}
                >
                  <div
                    className={`${imageHeight} w-full bg-gray-100 relative overflow-hidden`}
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-green-600 shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {recipe.matchPercentage}% Match
                    </div>

                    <SaveButton
                      meal={mealPayload}
                      className="absolute top-3 right-3"
                      onToggleSave={() => {}}
                    />

                    <button className="absolute bottom-3 right-3 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 hover:bg-secondary hover:text-white">
                      Cook now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {recipe.prepTime}
                      </div>
                      <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                        View recipe
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
