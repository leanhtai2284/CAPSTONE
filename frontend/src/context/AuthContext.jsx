import React, { useEffect, useState, createContext, useContext } from "react";

// ---------------------------
// Tạo AuthContext
// ---------------------------
const AuthContext = createContext();

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
  // Mock API Register
  // ---------------------------
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 800)); // giả lập API delay

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) throw new Error("Email đã được sử dụng");

      const newUser = { name, email, password };
      localStorage.setItem("users", JSON.stringify([...users, newUser]));

      // Giả lập token
      const fakeToken = `token-${Date.now()}`;

      const userData = { name, email };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", fakeToken);
      setUser(userData);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Mock API Login
  // ---------------------------
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) throw new Error("Email hoặc mật khẩu không chính xác");

      const fakeToken = `token-${Date.now()}`;

      const userData = { name: foundUser.name, email: foundUser.email };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", fakeToken);
      setUser(userData);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Đăng xuất
  // ---------------------------
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
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
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------
// Custom hook để dùng context
// ---------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
  return context;
};
