import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recipeService } from "../services/recipeService";
import RecipeList from "../components/admin/RecipeList";
import AdminNavBar from "../components/layout/AdminNavBar";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const AdminRecipeManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/admin/login");
      return;
    }
    loadRecipes();
  }, [user, navigate]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAllRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Không thể tải danh sách công thức");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công thức này?")) {
      return;
    }

    try {
      await recipeService.deleteRecipe(id);
      toast.success("Xóa công thức thành công!");
      loadRecipes(); // Reload list
    } catch (error) {
      toast.error(error.message || "Không thể xóa công thức");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Đang tải danh sách công thức...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex">
      <AdminNavBar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quản lý Công Thức Nấu Ăn
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tổng số công thức:{" "}
              <span className="font-semibold">{recipes.length}</span>
            </p>
          </div>
          <RecipeList recipes={recipes} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default AdminRecipeManagement;
