import React, { useState, useEffect } from "react";
import { X, Search, Clock, Users, ChefHat } from "lucide-react";
import { recipeService } from "../../services/recipeService";
import { toast } from "sonner";

export default function AddMealModal({ isOpen, onClose, groupId, onAddMeal }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [note, setNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen, currentPage, searchTerm]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        groupId,
        ...(searchTerm && { search: searchTerm }),
      };
      const data = await recipeService.getRecipesForGroupMenu(params);
      
      // Extract recipes from the correct nested structure
      const recipesList = Array.isArray(data.data?.items) ? data.data.items : 
                          Array.isArray(data.items) ? data.items : 
                          Array.isArray(data) ? data : [];
      
      setRecipes(recipesList);
      setTotalPages(data.data?.pagination?.totalPages || data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("❌ Error loading recipes:", error);
      toast.error("❌ Không thể tải danh sách công thức: " + (error.message || "Vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleAddMeal = async () => {
    if (!selectedRecipe) {
      toast.error("❌ Vui lòng chọn một công thức");
      return;
    }

    try {
      await onAddMeal(groupId, selectedRecipe._id, { note });
      toast.success("✅ Đã thêm công thức vào menu!");
      setSelectedRecipe(null);
      setNote("");
      onClose();
    } catch (error) {
      console.error("❌ Error adding meal:", error);
      toast.error("❌ Lỗi khi thêm công thức: " + (error.message || "Vui lòng thử lại"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thêm công thức vào menu
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Recipe List */}
          <div className="flex-1 overflow-y-auto p-6 border-r dark:border-gray-700">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm công thức..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Recipe Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className={`cursor-pointer rounded-lg border-2 transition-all ${
                      selectedRecipe?._id === recipe._id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.name_vi}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <ChefHat className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {recipe.name_vi}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              {recipe.prep_time_min + recipe.cook_time_min || 30} phút
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Users className="w-3 h-3" />
                              {recipe.servings || 1} người
                            </span>
                          </div>
                          {recipe.nutrition && (
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="text-orange-600 dark:text-orange-400">
                                {recipe.nutrition.calories || 0} calo
                              </span>
                              <span className="text-blue-600 dark:text-blue-400">
                                {recipe.nutrition.protein_g || 0}g protein
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* Selected Recipe Details */}
          <div className="w-96 p-6 bg-gray-50 dark:bg-gray-900">
            {selectedRecipe ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Chi tiết công thức
                </h4>
                
                {selectedRecipe.image_url && (
                  <img
                    src={selectedRecipe.image_url}
                    alt={selectedRecipe.name_vi}
                    className="w-full h-48 rounded-lg object-cover"
                  />
                )}

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    {selectedRecipe.name_vi}
                  </h5>
                  {selectedRecipe.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {selectedRecipe.description}
                    </p>
                  )}
                </div>

                {/* Nutrition Info */}
                {selectedRecipe.nutrition && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h6 className="font-medium text-gray-900 dark:text-white mb-3">
                      Thông tin dinh dưỡng
                    </h6>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Calo:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-2">
                          {selectedRecipe.nutrition.calories || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Protein:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-2">
                          {selectedRecipe.nutrition.protein_g || 0}g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Carbs:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-2">
                          {selectedRecipe.nutrition.carbs_g || 0}g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Fat:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-2">
                          {selectedRecipe.nutrition.fat_g || 0}g
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Note Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Thêm ghi chú về công thức này..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {note.length}/200 ký tự
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <ChefHat className="w-12 h-12 mx-auto mb-3" />
                <p>Chọn một công thức để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleAddMeal}
            disabled={!selectedRecipe}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm vào menu
          </button>
        </div>
      </div>
    </div>
  );
}
