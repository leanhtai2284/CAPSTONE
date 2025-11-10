import React from "react";
import { Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/AuthPage";
import { ForgotPasswordForm } from "../pages/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "../pages/auth/ResetPasswordForm";
import { LoginSuccessRedirect } from "../components/auth/LoginSuccessRedirect";
import AboutPage from "../pages/AboutPage";

export const publicRoutes = [
  { path: "/", element: <HomePage /> },

  { path: "/auth/login", element: <AuthPage /> },
  { path: "/auth/register", element: <AuthPage /> },
  { path: "/forgot-password", element: <ForgotPasswordForm /> },
  { path: "/reset-password/:token", element: <ResetPasswordForm /> },
  { path: "/login-success", element: <LoginSuccessRedirect /> },
  { path: "/auth", element: <Navigate to="/auth/login" replace /> },
  { path: "/about", element: <AboutPage /> },
];
