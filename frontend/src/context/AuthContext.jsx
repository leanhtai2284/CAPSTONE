import React, { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------
  // Load user từ localStorage khi app khởi động
  // ---------------------------
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(storedUser);
      }
    } catch (e) {
      console.warn("Lỗi khi đọc localStorage:", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  // ---------------------------
  // API Register
  // ---------------------------
  const register = async (name, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.register({
        name,
        email,
        password,
        confirmPassword,
      });

      // Lưu thông tin user và token vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setUser(data.user);

      return data; // Trả về data để component có thể xử lý thành công
    } catch (err) {
      setError(err.message);
      throw err; // Ném lỗi để component có thể bắt và hiển thị
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // API Login
  // ---------------------------
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.login({ email, password });

      // Lưu thông tin user và token vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setUser(data.user);

      return data; // Trả về data để component có thể xử lý thành công
    } catch (err) {
      setError(err.message);
      throw err; // Ném lỗi để component có thể bắt và hiển thị
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Đăng xuất
  // ---------------------------
  const logout = async () => {
    try {
      setLoading(true);
      const data = await authService.logout();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      return data; // Trả về data để component có thể xử lý thành công
    } catch (err) {
      setError(err.message);
      throw err; // Ném lỗi để component có thể bắt và hiển thị
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Quên mật khẩu
  // ---------------------------
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.forgotPassword(email);
      return data; // Trả về data để component có thể xử lý thành công
    } catch (err) {
      setError(err.message);
      throw err; // Ném lỗi để component có thể bắt và hiển thị
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Đặt lại mật khẩu
  // ---------------------------
  const resetPassword = async (resetToken, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.resetPassword(resetToken, newPassword);
      return data; // Trả về data để component có thể xử lý thành công
    } catch (err) {
      setError(err.message);
      throw err; // Ném lỗi để component có thể bắt và hiển thị
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Đăng nhập với Google
  // ---------------------------
  const loginWithGoogle = async (credential) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.loginWithGoogle(credential);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setUser(data.user);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Xóa lỗi
  // ---------------------------
  const clearError = () => setError(null);

  // ---------------------------
  // Giá trị context
  // ---------------------------
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
