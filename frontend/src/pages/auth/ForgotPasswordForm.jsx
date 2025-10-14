import React, { useState } from "react";
import { AtSignIcon, LoaderIcon, AlertCircleIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export function ForgotPasswordForm() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validate
    if (!validateForm()) return;

    try {
      await forgotPassword(email);
      toast.success("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn!");
      setEmail("");
    } catch (err) {
      console.error("Forgot password failed:", err);
      const errorMessage =
        err.message || "Không thể gửi yêu cầu đặt lại mật khẩu.";
      toast.error(errorMessage);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!email) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email không hợp lệ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Thông báo lỗi chung */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <AtSignIcon className="h-5 w-5 text-white" />
        </div>
        <input
          type="email"
          placeholder="Email"
          className={`w-full py-3 pl-10 pr-3 border-b-2 text-gray-200 ${
            formErrors?.email
              ? "border-red-500"
              : "border-gray-200 focus:border-green-500"
          } focus:outline-none transition-colors bg-transparent`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formErrors?.email) {
              setFormErrors({ ...formErrors, email: undefined });
            }
          }}
          required
        />
        {formErrors?.email && (
          <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
        )}
      </div>

      {/* Nút gửi */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors disabled:bg-green-400"
      >
        {loading ? (
          <LoaderIcon className="h-5 w-5 animate-spin" />
        ) : (
          <span>GỬI YÊU CẦU ĐẶT LẠI MẬT KHẨU</span>
        )}
      </button>
    </form>
  );
}
