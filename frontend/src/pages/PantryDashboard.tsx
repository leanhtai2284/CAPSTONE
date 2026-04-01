import React, { useState, useEffect } from "react";
import { Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { PantryItem, PantryListResponse, PantrySummary } from "../types/pantry";
import { PantryCard } from "../components/pantry/PantryCard";
import { AddIngredientModal } from "../components/pantry/AddIngredientModal";
import { RecipeRecommendationPanel } from "../components/pantry/RecipeRecommendationPanel";
import { EmptyState } from "../components/pantry/EmptyState";
import { pantryService } from "../services/pantryService";
export function PantryDashboard() {
  // Data states
  const [items, setItems] = useState<PantryItem[]>([]);
  const [summary, setSummary] = useState<PantrySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // Panel states
  const [selectedIngredient, setSelectedIngredient] =
    useState<PantryItem | null>(null);

  // Load data on mount and whenever page/search changes
  useEffect(() => {
    loadPantryItems();
    loadSummary();
  }, [currentPage, searchQuery]);

  const loadPantryItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20,
        days: 3, // Default expiring days
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();

      const response: PantryListResponse = await pantryService.getItems(params);

      setItems(response.data);
      setTotalPages(response.meta.pages);
      setTotalItems(response.meta.total);
    } catch (err) {
      setError("Failed to load pantry items");
      console.error("Error loading pantry items:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await pantryService.getSummary(3);
      setSummary(response.data);
    } catch (err) {
      console.error("Error loading pantry summary:", err);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadPantryItems();
      } else {
        setCurrentPage(1); // Reset to first page when searching
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  const filteredItems = items; // Items are already filtered by API
  const handleSaveIngredient = async (newItemData: Omit<PantryItem, "id">) => {
    try {
      if (editingItem) {
        await pantryService.updateItem(editingItem._id!, newItemData);
        toast.success("Nguyên liệu đã được cập nhật thành công");
      } else {
        await pantryService.createItem(newItemData);
        toast.success("Nguyên liệu đã được thêm vào kho");
      }

      // Reload data
      await loadPantryItems();
      await loadSummary();

      setIsAddModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error("Không thể lưu nguyên liệu");
      console.error("Error saving ingredient:", err);
    }
  };
  const handleDeleteIngredient = async (id: string) => {
    try {
      await pantryService.deleteItem(id);
      toast.success("Nguyên liệu đã được xóa");

      // Reload data
      await loadPantryItems();
      await loadSummary();

      if (selectedIngredient?._id === id) {
        setSelectedIngredient(null);
      }
    } catch (err) {
      toast.error("Không thể xóa nguyên liệu");
      console.error("Error deleting ingredient:", err);
    }
  };
  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };
  const openAddModal = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pb-20">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Kho nguyên liệu của tôi
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Quản lý nguyên liệu và nấu ăn thông minh hơn
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm nguyên liệu
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors sm:text-sm"
                />
              </div>
              <button
                onClick={() => loadPantryItems()}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {summary && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {summary.total}
              </div>
              <div className="text-sm text-gray-600">Tổng số</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {summary.expired}
              </div>
              <div className="text-sm text-red-600">Đã hết hạn</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.expiring}
              </div>
              <div className="text-sm text-yellow-600">Sắp hết hạn</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {summary.fresh}
              </div>
              <div className="text-sm text-green-600">Tươi</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">
              Đang tải kho nguyên liệu...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                loadPantryItems();
                loadSummary();
              }}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAddClick={openAddModal} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Không tìm thấy nguyên liệu nào phù hợp với bộ lọc
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
              }}
              className="mt-4 text-green-600 font-medium hover:text-green-700"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <PantryCard
                  key={item._id}
                  item={item}
                  onClick={setSelectedIngredient}
                  onEdit={openEditModal}
                  onDelete={handleDeleteIngredient}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages} ({totalItems} items)
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals & Panels */}
      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveIngredient}
        editItem={editingItem}
      />

      <RecipeRecommendationPanel
        isOpen={selectedIngredient !== null}
        onClose={() => setSelectedIngredient(null)}
        ingredient={selectedIngredient}
        recipes={[
          {
            id: "r1",
            name: "Công thức mẫu 1",
            description: "Một công thức ngon sử dụng nguyên liệu này.",
            matchPercentage: 85,
            prepTime: "20 phút",
            imageUrl:
              "https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?auto=format&fit=crop&q=80&w=800",
          },
          {
            id: "r2",
            name: "Công thức mẫu 2",
            description: "Ý tưởng công thức tuyệt vời khác.",
            matchPercentage: 70,
            prepTime: "15 phút",
            imageUrl:
              "https://images.unsplash.com/photo-1510693062525-8f1980ce713e?auto=format&fit=crop&q=80&w=800",
          },
        ]}
      />
    </div>
  );
}

export default PantryDashboard;
