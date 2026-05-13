import axiosInstance from "./axiosInstance";

export const marketService = {
  async getStores(params = {}) {
    const res = await axiosInstance.get("/market/stores", { params });
    return res.data;
  },

  async getMyStores() {
    const res = await axiosInstance.get("/market/stores/my");
    return res.data;
  },

  async getProducts(params = {}) {
    const res = await axiosInstance.get("/market/products", { params });
    return res.data;
  },

  async createStore(payload) {
    const res = await axiosInstance.post("/market/stores", payload);
    return res.data;
  },

  async createProduct(storeId, payload) {
    const res = await axiosInstance.post(
      `/market/stores/${storeId}/products`,
      payload,
    );
    return res.data;
  },

  async uploadProductImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axiosInstance.post("/market/products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async updateProduct(id, payload) {
    const res = await axiosInstance.put(`/market/products/${id}`, payload);
    return res.data;
  },

  async deleteProduct(id) {
    const res = await axiosInstance.delete(`/market/products/${id}`);
    return res.data;
  },

  async getProductById(id) {
    const res = await axiosInstance.get(`/market/products/${id}`);
    return res.data;
  },

  async createOrder(payload) {
    const res = await axiosInstance.post("/market/orders", payload);
    return res.data;
  },

  async getStoreOrders(storeId, params = {}) {
    const res = await axiosInstance.get(`/market/orders/store/${storeId}`, { params });
    return res.data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await axiosInstance.patch(`/market/orders/${orderId}/status`, {
      status,
    });
    return res.data;
  },

  async getStoreRevenue(storeId, params = {}) {
    const res = await axiosInstance.get(
      `/market/orders/store/${storeId}/revenue`,
      {
        params,
      },
    );
    return res.data;
  },
};
