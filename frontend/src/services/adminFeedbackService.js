const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const adminFeedbackService = {
  async getAll(params = {}) {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const query = new URLSearchParams(cleaned).toString();
    const res = await fetch(`${API_BASE}/api/feedback${query ? `?${query}` : ""}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải danh sách phản hồi");
    }
    return res.json();
  },

  async update(id, payload) {
    const res = await fetch(`${API_BASE}/api/feedback/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể cập nhật phản hồi");
    }
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/api/feedback/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể xoá phản hồi");
    }
    return res.json();
  },
};
