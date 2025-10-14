import React, { useState, useEffect } from "react";
import {
  AtSignIcon,
  KeyIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  LoaderIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const { login, loading, error, clearError, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // ✅ Nếu user đã đăng nhập (ví dụ reload lại trang) → về Home luôn
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // ✅ Validate form
  const validateForm = () => {
    const errors = {};

    if (!email) errors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email không hợp lệ";

    if (!password) errors.password = "Mật khẩu không được để trống";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    await login(email, password);

    // ⚡ Nếu login thành công → điều hướng ngay
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/"); // ✅ Chuyển về HomePage liền
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Hiển thị lỗi */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Email */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AtSignIcon className="h-5 w-5 text-gray-100" />
          </div>
          <input
            type="email"
            placeholder="Email"
            className={`w-full py-3 pl-10 pr-3 border-b-2 text-gray-200 ${
              formErrors.email
                ? "border-red-500"
                : "border-gray-200 focus:border-green-500"
            } focus:outline-none transition-colors bg-transparent`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email)
                setFormErrors({ ...formErrors, email: undefined });
            }}
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeyIcon className="h-5 w-5 text-gray-100" />
          </div>
          <input
            type="password"
            placeholder="Mật khẩu"
            className={`w-full py-3 pl-10 pr-3 border-b-2 text-gray-200 ${
              formErrors.password
                ? "border-red-500"
                : "border-gray-200 focus:border-green-500"
            } focus:outline-none transition-colors bg-transparent`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password)
                setFormErrors({ ...formErrors, password: undefined });
            }}
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
          )}
        </div>
      </div>

      {/* Nút đăng nhập */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors disabled:bg-green-400"
      >
        {loading ? (
          <LoaderIcon className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>ĐĂNG NHẬP</span>
            <ArrowRightIcon className="h-5 w-5" />
          </>
        )}
      </button>

      {/* Quên mật khẩu */}
      <div className="flex justify-end">
        <a
          href="#"
          className="text-sm text-green-600 hover:text-green-700 transition-colors"
        >
          Quên mật khẩu?
        </a>
      </div>

      {/* Đăng nhập MXH */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-300 text-sm">
          hoặc đăng nhập với
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          className="w-1/2 py-2.5 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          <span className="text-sm text-white">Google</span>
        </button>

        <button
          type="button"
          className="w-1/2 py-2.5 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.svgrepo.com/show/448224/facebook.svg"
            alt="Facebook"
            className="h-5 w-5 mr-2"
          />
          <span className="text-sm text-white">Facebook</span>
        </button>
      </div>
    </form>
  );
}
