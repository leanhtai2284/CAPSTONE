import { useState, useEffect } from "react";
import { AuthContext } from "./auth";
import { authService } from "../services/authService";

export function AuthProvider({ children }) {
  // Initialize user synchronously from localStorage to avoid a flash of unauthenticated state
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Error parsing stored user on init:", err);
      return null;
    }
  });

  // loading indicates ongoing auth network operations (login/logout/etc.)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const register = async (name, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);

      // 1) Đăng ký
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
    // Lắng nghe thay đổi localStorage từ tab khác
    const handleStorageChange = () => {
      try {
        const updatedUser = localStorage.getItem("user");
        if (updatedUser) {
          setUser(JSON.parse(updatedUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error parsing updated user from storage event:", err);
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

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      setError(err.message || "Đăng xuất thất bại");
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
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
