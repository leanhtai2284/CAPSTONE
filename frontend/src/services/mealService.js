// src/services/mealService.js
import axiosInstance from "./axiosInstance";
import { mockMeals } from "../data/mockMeals";

export const mealService = {
  async getMeals(query = "") {
    try {
      // ✅ Encode query để tránh lỗi khi có ký tự đặc biệt
      const encodedQuery = encodeURI(query);
      const { data } = await axiosInstance.get(`/recipes${encodedQuery}`);

      // ✅ Linh hoạt nhận nhiều cấu trúc dữ liệu từ API
      const meals = data.items || data.data || data.recipes || data;

      // ✅ Trả về mock nếu backend trả về không phải mảng
      return Array.isArray(meals) ? meals : mockMeals;
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách món ăn:", error);
      return mockMeals; // fallback an toàn
    }
  },

  async getMealById(id) {
    try {
      if (!id) throw new Error("Thiếu ID món ăn!");
      const { data } = await axiosInstance.get(`/recipes/${id}`);
      return data;
    } catch (error) {
      console.error("❌ Lỗi khi tải chi tiết món ăn:", error);
      // ✅ Có thể xử lý cụ thể lỗi 404
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy món ăn!");
      }
      throw error;
    }
  },
};
