import React, { useState } from "react";
import {
  UserIcon,
  AtSignIcon,
  KeyIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function RegisterForm() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  //  Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    try {
      await register(name, email, password, confirmPassword);

      toast.success(" Đăng ký thành công!");
      //  Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);

      //  Điều hướng thẳng vào trang hồ sơ để nhập thông tin
      navigate("/auth/login");
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  //  Validate form
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) errors.name = "Họ và tên không được để trống";

    if (!email) errors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email không hợp lệ";

    if (!password) errors.password = "Mật khẩu không được để trống";
    else if (password.length < 8)
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      errors.password = "Mật khẩu phải chứa chữ hoa, chữ thường và số";

    if (!confirmPassword) errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (confirmPassword !== password)
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";

    if (!acceptTerms) errors.terms = "Bạn phải đồng ý với điều khoản sử dụng";

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

      <div className="space-y-4">
        {/* Họ và tên */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <input
            type="text"
            placeholder="Họ và tên"
            className={`w-full py-3 pl-10 pr-3 border-b-2 text-gray-200 ${
              formErrors?.name
                ? "border-red-500"
                : "border-gray-200 focus:border-green-500"
            } focus:outline-none transition-colors bg-transparent`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (formErrors?.name)
                setFormErrors({ ...formErrors, name: undefined });
            }}
            required
          />
          {formErrors?.name && (
            <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>

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
              if (formErrors?.email)
                setFormErrors({ ...formErrors, email: undefined });
            }}
            required
          />
          {formErrors?.email && (
            <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeyIcon className="h-5 w-5 text-white" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            className={`w-full py-3 pl-10 pr-10 border-b-2 text-gray-200 ${
              formErrors?.password
                ? "border-red-500"
                : "border-gray-200 focus:border-green-500"
            } focus:outline-none transition-colors bg-transparent`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors?.password)
                setFormErrors({ ...formErrors, password: undefined });
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

        {/* Xác nhận mật khẩu */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeyIcon className="h-5 w-5 text-white" />
          </div>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            className={`w-full py-3 pl-10 pr-10 border-b-2 text-gray-200 ${
              formErrors?.confirmPassword
                ? "border-red-500"
                : "border-gray-200 focus:border-green-500"
            } focus:outline-none transition-colors bg-transparent`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (formErrors?.confirmPassword)
                setFormErrors({ ...formErrors, confirmPassword: undefined });
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
      </div>

      {/* Checkbox điều khoản */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              if (formErrors?.terms)
                setFormErrors({ ...formErrors, terms: undefined });
            }}
          />
        </div>
        <div className="ml-2">
          <label htmlFor="terms" className="text-sm text-white">
            Tôi đồng ý với{" "}
            <a href="#" className="text-green-600 hover:text-green-700">
              Điều khoản
            </a>{" "}
            và{" "}
            <a href="#" className="text-green-600 hover:text-green-700">
              Chính sách bảo mật
            </a>
          </label>
          {formErrors?.terms && (
            <p className="mt-1 text-sm text-red-500">{formErrors.terms}</p>
          )}
        </div>
      </div>

      {/* Nút đăng ký */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors disabled:bg-green-400"
      >
        {loading ? (
          <LoaderIcon className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>ĐĂNG KÝ</span>
            <ArrowRightIcon className="h-5 w-5" />
          </>
        )}
      </button>

      {/* Mạng xã hội */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-white text-sm">
          hoặc đăng ký với
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
