import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";

export function LoginSuccessRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user"); // Lấy dữ liệu user từ URL params

    if (token) {
      authService.setToken(token);

      // Parse và lưu user nếu có
      if (user) {
        try {
          const userData = JSON.parse(decodeURIComponent(user));
          authService.setUser(userData);
        } catch (err) {
          console.error("Lỗi khi parse dữ liệu user:", err);
        }
      }

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } else {
      toast.error("Đăng nhập thất bại");
      navigate("/auth");
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}
