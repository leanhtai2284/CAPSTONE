/**
 * 🔐 Change Password Service
 * Xử lý gọi API đổi mật khẩu
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const changePasswordService = {
  /**
   * Đổi mật khẩu người dùng
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   * @param {string} confirmNewPassword - Xác nhận mật khẩu mới
   * @returns {Promise<Object>} Response từ API
   */
  async changePassword(currentPassword, newPassword, confirmNewPassword) {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Không tìm thấy token, vui lòng đăng nhập lại");
    }

    const response = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể đổi mật khẩu");
    }

    return data;
  },
};
