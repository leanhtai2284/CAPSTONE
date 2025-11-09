import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ForYouPage from "./pages/ForYouPage";
import AuthPage from "./pages/AuthPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRecipeManagement from "./pages/AdminRecipeManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminReportsPage from "./pages/AdminReportsPage";
import RecipeForm from "./components/admin/RecipeForm";
import { ForgotPasswordForm } from "./pages/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "./pages/auth/ResetPasswordForm";
import { LoginSuccessRedirect } from "./components/auth/LoginSuccessRedirect";
import { LoginForm } from "./pages/auth/LoginForm";
import { RegisterForm } from "./pages/auth/RegisterForm";
import SavedMenusPage from "./pages/SavedMenusPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import HelpFeedback from "./pages/HelpFeedback";
import SearchPage from "./pages/SearchPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/foryou" element={<ForYouPage />} />
      <Route path="/auth">
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
      </Route>
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
      <Route path="/login-success" element={<LoginSuccessRedirect />} />

      <Route path="/saved-menus" element={<SavedMenusPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/nutrition-report" element={<ReportsPage />} />
      <Route path="/help" element={<HelpFeedback />} />
      <Route path="/search" element={<SearchPage />} />
      {/* Admin area */}
      <Route path="/admin">
        <Route index element={<AdminDashboard />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="recipes" element={<AdminRecipeManagement />} />
        <Route path="recipes/new" element={<RecipeForm />} />
        <Route path="recipes/:id/edit" element={<RecipeForm />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
