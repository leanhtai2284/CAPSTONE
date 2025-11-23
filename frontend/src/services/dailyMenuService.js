const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const dailyMenuService = {
  async getAll() {
    const res = await fetch(`${API_BASE}/api/menus/daily`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải thực đơn đã lưu");
    }

    const json = await res.json();
    return json.data || [];
  },

  async create(menu) {
    const res = await fetch(`${API_BASE}/api/menus/daily`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(menu),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể lưu thực đơn");
    }

    const json = await res.json();
    return json.data;
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/api/menus/daily/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể xóa thực đơn");
    }

    return true;
  },
};
