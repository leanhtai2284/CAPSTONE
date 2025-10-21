import { useState, useEffect } from "react";
import { AuthContext } from "./auth";
import { authService } from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

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

      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.login({ email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Kiểm tra user khi mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
      }
    }

    // Lắng nghe thay đổi localStorage từ tab khác
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginWithGoogle = async (credential) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.loginWithGoogle(credential);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Đăng nhập bằng Google thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      setError(err.message || "Gửi yêu cầu đặt lại mật khẩu thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.resetPassword(token, newPassword);
      return data;
    } catch (err) {
      setError(err.message || "Đặt lại mật khẩu thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        forgotPassword,
        resetPassword,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
