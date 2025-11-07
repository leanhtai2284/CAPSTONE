import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/auth";
import LoadingModal from "../components/ui/LoadingModal";

export default function ProtectedRoute({ element }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 🌀 Nếu vẫn đang đọc user từ localStorage => chờ
  if (loading) {
    return <LoadingModal isOpen={true} />;
  }

  useEffect(() => {
    if (!user && !loading) {
      toast.warn("Vui lòng đăng nhập để tiếp tục", {
        position: "top-right",
        autoClose: 2500,
      });
    }
  }, [user, loading, location.pathname]);

  // 🚫 Nếu không có user và đã load xong -> chuyển hướng
  if (!user && !loading) {
    return <Navigate to="/auth/login" replace />;
  }

  // ✅ Nếu có user -> render bình thường
  return element;
}
