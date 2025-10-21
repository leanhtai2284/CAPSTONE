const API_URL = "http://localhost:5000/api";

export const authService = {
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },

  // Đăng nhập với Google
  async loginWithGoogle(credential) {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra khi đăng nhập với Google");
    }
    this.setToken(data.data.token);
    this.setUser(data.data);
    return { token: data.data.token, user: data.data };
  },

  // Đăng ký
  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra khi đăng ký");
    }
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  // Đăng nhập
  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra khi đăng nhập");
    }
    this.setToken(data.data.token);
    this.setUser(data.data);
    return { token: data.data.token, user: data.data };
  },

  // Đăng xuất
  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra khi đăng xuất");
    }
    this.setToken(null);
    this.setUser(null);
    return data;
  },

  // Quên mật khẩu
  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || "Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu"
      );
    }
    return data;
  },

  // Đặt lại mật khẩu
  async resetPassword(resetToken, newPassword) {
    const response = await fetch(
      `${API_URL}/auth/reset-password/${resetToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
    }
    return data;
  },
};
