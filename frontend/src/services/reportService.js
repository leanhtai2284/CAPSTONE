import axios from "./axiosInstance";

export const reportService = {
  getUserNutritionReport: ({ period = "weekly", start, end } = {}) => {
    return axios.get("/reports/nutrition", {
      params: { period, start, end },
    });
  },
};

export default reportService;
