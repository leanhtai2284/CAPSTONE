const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const userService = {
  // Get all users (admin only)
  async getAllUsers(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.role) queryParams.append("role", params.role);

    const url = `${API_BASE}/api/admin/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || err.error || "Không thể lấy danh sách người dùng"
      );
    }
    return res.json();
  },

  // Get user by ID (admin only)
  async getUserById(id) {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || err.error || "Không thể lấy thông tin người dùng"
      );
    }
    return res.json();
  },

  // Update user (admin only)
  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || err.error || "Không thể cập nhật người dùng"
      );
    }
    return res.json();
  },

  // Delete user (admin only)
  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể xóa người dùng");
    }
    return res.json();
  },

  // Update user role (admin only)
  async updateUserRole(id, role) {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể cập nhật role");
    }
    return res.json();
  },

  // Get user statistics (admin only)
  async getUserStats() {
    const res = await fetch(`${API_BASE}/api/admin/users/stats`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể lấy thống kê");
    }
    return res.json();
  },

  // Get current user profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message || err.error || "Không thể lấy thông tin hồ sơ"
      );
    }
    return res.json();
  },

  // Update current user profile
  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Không thể cập nhật hồ sơ");
    }
    return res.json();
  },
};
