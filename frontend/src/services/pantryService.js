const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const pantryService = {
  // Get pantry items with optional filters
  async getItems(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.status) queryParams.append("status", params.status);
    if (params.days) queryParams.append("days", params.days);
    if (params.q) queryParams.append("q", params.q);
    if (params.category) queryParams.append("category", params.category);
    if (params.storageLocation)
      queryParams.append("storageLocation", params.storageLocation);

    const url = `${API_BASE}/api/pantry${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải danh sách pantry");
    }

    return await res.json();
  },

  // Get pantry summary
  async getSummary(days = 3) {
    const res = await fetch(`${API_BASE}/api/pantry/summary?days=${days}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải thống kê pantry");
    }

    return await res.json();
  },

  // Get single pantry item
  async getItem(id) {
    const res = await fetch(`${API_BASE}/api/pantry/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải thông tin pantry item");
    }

    return await res.json();
  },

  // Create new pantry item
  async createItem(itemData) {
    const res = await fetch(`${API_BASE}/api/pantry`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tạo pantry item");
    }

    return await res.json();
  },

  // Update pantry item
  async updateItem(id, itemData) {
    const res = await fetch(`${API_BASE}/api/pantry/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể cập nhật pantry item");
    }

    return await res.json();
  },

  // Delete pantry item
  async deleteItem(id) {
    const res = await fetch(`${API_BASE}/api/pantry/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể xóa pantry item");
    }

    return await res.json();
  },

  // Bulk update pantry quantities
  async bulkUpdateQuantities(items) {
    const res = await fetch(`${API_BASE}/api/pantry/bulk/quantity`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể cập nhật số lượng hàng loạt");
    }

    return await res.json();
  },

  // Bulk delete pantry items
  async bulkDelete(ids) {
    const res = await fetch(`${API_BASE}/api/pantry/bulk/delete`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể xóa hàng loạt pantry item");
    }

    return await res.json();
  },

  // Recipe cookability check
  /**
   * @param {string} recipeId
   * @param {number | null | undefined} servings
   * @param {number} days
   */
  async recipeCheck(recipeId, servings = undefined, days = 3) {
    const params = new URLSearchParams();
    params.append("days", String(days));

    const payload = { recipeId };
    if (servings !== null && servings !== undefined) {
      payload.servings = servings;
    }

    const res = await fetch(
      `${API_BASE}/api/pantry/recipe-check?${params.toString()}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể kiểm tra công thức với pantry");
    }

    return await res.json();
  },
};
