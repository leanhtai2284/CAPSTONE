const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Simple in-memory cache + in-flight promise coalescing to avoid
// issuing many identical GET requests when multiple components
// mount simultaneously (e.g., many SaveButton instances).
let _cache = null; // cached array of meals
let _inflight = null; // promise for ongoing fetch

export const favoriteService = {
  // Lấy danh sách món đã lưu (trả về mảng meal để FE dùng luôn)
  async getAll() {
    // Return cached value if present
    if (_cache) return _cache;

    // If a request is already in-flight, return the same promise
    if (_inflight) return _inflight;

    _inflight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/favorites`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể tải danh sách món đã lưu");
        }

        const json = await res.json();
        const favorites = json.data || [];

        const meals = favorites.map((f) => ({
          ...f.meal,
          favoriteId: f._id,
          recipeId: f.recipeId,
        }));

        _cache = meals;
        return meals;
      } finally {
        _inflight = null;
      }
    })();

    return _inflight;
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
    // Invalidate cache so subsequent callers get fresh data
    _cache = null;
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

    // Invalidate cache so subsequent callers get fresh data
    _cache = null;

    return true;
  },
};
