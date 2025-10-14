import React, { useEffect, useState, createContext, useContext } from "react";

// Tạo context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra nếu người dùng đã đăng nhập trước đó
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Mock API Register
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Giả lập delay API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Kiểm tra người dùng đã tồn tại chưa
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        throw new Error("Email đã được sử dụng");
      }

      // Thêm người dùng mới (chỉ mock — không nên lưu plain text trong thực tế)
      const newUser = { name, email, password };
      localStorage.setItem("users", JSON.stringify([...users, newUser]));

      // Đăng nhập luôn sau khi đăng ký
      const userData = { name, email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock API Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Email hoặc mật khẩu không chính xác");
      }

      const userData = { name: foundUser.name, email: foundUser.email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Xóa lỗi
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
