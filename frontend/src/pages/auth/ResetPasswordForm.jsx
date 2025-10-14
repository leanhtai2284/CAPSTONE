import React, { useState } from "react";
import {
  KeyIcon,
  LoaderIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";

export function ResetPasswordForm() {
  const { resetPassword, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validate
    if (!validateForm()) return;

    try {
      await resetPassword(token, password);
      toast.success("Mật khẩu đã được đặt lại thành công!");

      // Điều hướng về trang đăng nhập
      navigate("/auth");
    } catch (err) {
      console.error("Reset password failed:", err);
      const errorMessage = err.message || "Không thể đặt lại mật khẩu.";
      toast.error(errorMessage);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Mật khẩu phải chứa chữ hoa, chữ thường và số";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
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

      {/* Mật khẩu mới */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <KeyIcon className="h-5 w-5 text-white" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu mới"
          className={`w-full py-3 pl-10 pr-10 border-b-2 text-gray-200 ${
            formErrors?.password
              ? "border-red-500"
              : "border-gray-200 focus:border-green-500"
          } focus:outline-none transition-colors bg-transparent`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (formErrors?.password) {
              setFormErrors({ ...formErrors, password: undefined });
            }
          }}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-white"
        >
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
        {formErrors?.password && (
          <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
        )}
      </div>

      {/* Xác nhận mật khẩu mới */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <KeyIcon className="h-5 w-5 text-white" />
        </div>
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Xác nhận mật khẩu mới"
          className={`w-full py-3 pl-10 pr-10 border-b-2 text-gray-200 ${
            formErrors?.confirmPassword
              ? "border-red-500"
              : "border-gray-200 focus:border-green-500"
          } focus:outline-none transition-colors bg-transparent`}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (formErrors?.confirmPassword) {
              setFormErrors({ ...formErrors, confirmPassword: undefined });
            }
          }}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-white"
        >
          {showConfirm ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
        {formErrors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {formErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Nút đặt lại mật khẩu */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors disabled:bg-green-400"
      >
        {loading ? (
          <LoaderIcon className="h-5 w-5 animate-spin" />
        ) : (
          <span>ĐẶT LẠI MẬT KHẨU</span>
        )}
      </button>
    </form>
  );
}
