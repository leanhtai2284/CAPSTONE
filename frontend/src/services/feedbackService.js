const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const feedbackService = {
  async sendFeedback({ type, message }) {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, message }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể gửi phản hồi, vui lòng thử lại");
    }

    return res.json();
  },
};
