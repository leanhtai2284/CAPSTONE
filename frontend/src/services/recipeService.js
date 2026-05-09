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
  async searchRecipes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${API_BASE}/api/recipes${query ? `?${query}` : ""}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Không thể tìm công thức");
    }
    return res.json();
  },
  // Get all recipes (for admin)
  async getAllRecipes() {
    const res = await fetch(`${API_BASE}/api/recipes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.error || err.message || "Không thể lấy danh sách công thức",
      );
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
    // Check if recipeData is FormData (for video upload)
    const isFormData = recipeData instanceof FormData;
    
    const res = await fetch(`${API_BASE}/api/recipes`, {
      method: "POST",
      headers: isFormData ? 
        { Authorization: `Bearer ${localStorage.getItem("token")}` } : 
        getAuthHeaders(),
      body: isFormData ? recipeData : JSON.stringify(recipeData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('CreateRecipe error response:', err);
      console.error('Response status:', res.status);
      throw new Error(err.message || err.error || "Không thể tạo công thức");
    }
    return res.json();
  },

  // Create UGC (user-submitted) with media (FormData)
  async createUGC(formData) {
    const API = `${API_BASE}/api/recipes/ugc`;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(API, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể gửi UGC");
    }
    return res.json();
  },

  // Update recipe (admin only)
  async updateRecipe(id, recipeData) {
    // Check if recipeData is FormData (for video upload)
    const isFormData = recipeData instanceof FormData;
    
    const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
      method: "PUT",
      headers: isFormData ? 
        { Authorization: `Bearer ${localStorage.getItem("token")}` } : 
        getAuthHeaders(),
      body: isFormData ? recipeData : JSON.stringify(recipeData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || err.error || "Không thể cập nhật công thức",
      );
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

  // Get pending user-submitted recipes (UGC) for admin review
  async getPendingUGC(params = {}) {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${API_BASE}/api/admin/recipes/ugc${query ? `?${query}` : ""}`,
      {
        headers,
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || err.error || "Không thể lấy danh sách UGC",
      );
    }
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : data;
  },

  // Approve a pending UGC recipe
  async approveUGC(id) {
    const res = await fetch(`${API_BASE}/api/admin/recipes/ugc/${id}/approve`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể phê duyệt UGC");
    }
    return res.json();
  },

  // Reject a pending UGC recipe with a reason
  async rejectUGC(id, reason) {
    const res = await fetch(`${API_BASE}/api/admin/recipes/ugc/${id}/reject`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể từ chối UGC");
    }
    return res.json();
  },
};
