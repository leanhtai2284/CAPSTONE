import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { toast } from "react-toastify";

export function LoginSuccessRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      toast.success(" Đăng nhập thành công!");
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
