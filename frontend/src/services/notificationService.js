const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const notificationService = {
  async getMyNotifications() {
    const res = await fetch(`${API_BASE}/api/notifications/me`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể lấy thông báo");
    }
    return res.json();
  },

  async markAsRead(ids) {
    const res = await fetch(`${API_BASE}/api/notifications/read`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể cập nhật thông báo");
    }
    return res.json();
  },

  async deleteNotifications(ids) {
    const res = await fetch(`${API_BASE}/api/notifications/delete`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể xóa thông báo");
    }
    return res.json();
  },
};
