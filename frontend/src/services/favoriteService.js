const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const favoriteService = {
  // Lấy danh sách món đã lưu (trả về mảng meal để FE dùng luôn)
  async getAll() {
    const res = await fetch(`${API_BASE}/api/favorites`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải danh sách món đã lưu");
    }

    const json = await res.json();
    const favorites = json.data || [];

    // Trả về list meal (kèm 1 số meta nếu cần)
    return favorites.map((f) => ({
      ...f.meal,
      favoriteId: f._id,
      recipeId: f.recipeId,
    }));
  },

  // Lưu món
  async add(meal) {
    const recipeId = meal.id || meal._id || meal.uniqueKey;
    if (!recipeId) {
      throw new Error("Thiếu recipeId để lưu món");
    }

    const res = await fetch(`${API_BASE}/api/favorites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipeId, meal }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể lưu món ăn");
    }

    const json = await res.json();
    return json.data;
  },

  // Bỏ lưu món
  async removeByRecipeId(recipeId) {
    const res = await fetch(`${API_BASE}/api/favorites/by-recipe/${recipeId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể bỏ lưu món ăn");
    }

    return true;
  },
};
