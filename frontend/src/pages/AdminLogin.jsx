import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      const user = data.user || data?.user || data?.user || data?.user;
      // Auth provider sets user in context; but login returns data.user-like object
      const loggedUser = JSON.parse(localStorage.getItem("user")) || user;
      if (!loggedUser || loggedUser.role !== "admin") {
        toast.error("Bạn không có quyền truy cập quản trị viên");
        // ensure logout
        await logout();
        setLoading(false);
        return;
      }

      toast.success("Đăng nhập quản trị viên thành công");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Make the form background more opaque and text dark for readability */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Đăng nhập Quản trị viên</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          >
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    </div>
  );
}
