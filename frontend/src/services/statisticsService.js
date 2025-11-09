const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const statisticsService = {
  // Get comprehensive statistics
  async getStatistics() {
    const res = await fetch(`${API_BASE}/api/admin/statistics`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể lấy thống kê");
    }
    return res.json();
  },

  // Get recipe statistics
  async getRecipeStatistics() {
    const res = await fetch(`${API_BASE}/api/admin/statistics/recipes`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể lấy thống kê công thức");
    }
    return res.json();
  },

  // Get user statistics
  async getUserStatistics() {
    const res = await fetch(`${API_BASE}/api/admin/statistics/users`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể lấy thống kê người dùng");
    }
    return res.json();
  },
};

