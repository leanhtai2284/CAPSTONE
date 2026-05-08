const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const trackingService = {
  /**
   * Mark a recipe as cooked
   * Automatically deducts ingredients from pantry and adds nutrition to daily tracking
   */
  async markAsCooked(recipeId) {
    if (!recipeId) {
      throw new Error("recipeId is required");
    }

    const res = await fetch(`${API_BASE}/api/tracking/mark-as-cooked`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipeId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message ||
          err.error ||
          "Không thể ghi nhận bữa ăn. Vui lòng thử lại.",
      );
    }

    return res.json();
  },

  /**
   * Get tracking data for today
   * Returns daily totals, meals eaten, and progress towards daily calorie target
   */
  async getTodayTracking() {
    const res = await fetch(`${API_BASE}/api/tracking/today`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message ||
          err.error ||
          "Không thể lấy dữ liệu theo dõi ngày hôm nay.",
      );
    }

    return res.json();
  },

  /**
   * Get tracking history for specified number of days
   * @param {number} days - Number of days to retrieve (default 7, max 30)
   */
  async getTrackingHistory(days = 7) {
    if (days < 1 || days > 30) {
      throw new Error("days must be between 1 and 30");
    }

    const query = new URLSearchParams({ days }).toString();
    const res = await fetch(`${API_BASE}/api/tracking/history?${query}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message ||
          err.error ||
          "Không thể lấy lịch sử theo dõi. Vui lòng thử lại.",
      );
    }

    return res.json();
  },
};
