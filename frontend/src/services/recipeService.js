const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const recipeService = {
  // Get all recipes (for admin)
  async getAllRecipes() {
    const res = await fetch(`${API_BASE}/api/recipes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Không thể lấy danh sách công thức");
    }
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : data;
  },

  // Get recipe by ID
  async getRecipeById(id) {
    const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Không thể lấy công thức");
    }
    return res.json();
  },

  // Create new recipe (admin only)
  async createRecipe(recipeData) {
    const res = await fetch(`${API_BASE}/api/recipes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(recipeData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể tạo công thức");
    }
    return res.json();
  },

  // Update recipe (admin only)
  async updateRecipe(id, recipeData) {
    const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(recipeData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể cập nhật công thức");
    }
    return res.json();
  },

  // Delete recipe (admin only)
  async deleteRecipe(id) {
    const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể xóa công thức");
    }
    return res.json();
  },
};

