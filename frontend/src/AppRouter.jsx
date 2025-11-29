import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { publicRoutes } from "./routes/publicRoutes";
import { privateRoutes } from "./routes/privateRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoadingModal from "./components/ui/LoadingModal";
import AccountSettings from "./pages/AccountSettings";

// Admin pages (kept as explicit routes)
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRecipeManagement from "./pages/AdminRecipeManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminReportsPage from "./pages/AdminReportsPage";
import RecipeForm from "./components/admin/RecipeForm";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";

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

        {/* Admin area - explicit nested routes */}
        <Route path="/admin">
          <Route index element={<AdminDashboard />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="recipes" element={<AdminRecipeManagement />} />
          <Route path="recipes/new" element={<RecipeForm />} />
          <Route path="recipes/:id/edit" element={<RecipeForm />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
        </Route>

        {/* Fallback - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
