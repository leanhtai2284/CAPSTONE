import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ForYouPage from "./pages/ForYouPage";
import AuthPage from "./pages/AuthPage";
import { ForgotPasswordForm } from "./pages/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "./pages/auth/ResetPasswordForm";
import { LoginSuccessRedirect } from "./components/auth/LoginSuccessRedirect";
import { LoginForm } from "./pages/auth/LoginForm";
import { RegisterForm } from "./pages/auth/RegisterForm";

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
    </Routes>
  );
};

export default AppRouter;
