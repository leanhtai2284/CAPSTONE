import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { publicRoutes } from "./routes/publicRoutes";
import { privateRoutes } from "./routes/privateRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoadingModal from "./components/ui/LoadingModal";

// 🌀 Component loading hiển thị trong lúc tải chậm
const LoadingFallback = () => (
  <div className="text-center mt-10 text-gray-600 animate-pulse">
    Đang tải trang...
  </div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingModal isOpen={true} />}>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Private routes (cần đăng nhập) */}
        {privateRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute element={element} />}
          />
        ))}
      </Routes>
    </Suspense>
  );
}
