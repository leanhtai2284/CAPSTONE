import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const ForgotPasswordForm = lazy(() => import("../pages/auth/ForgotPasswordForm"));
const ResetPasswordForm = lazy(() => import("../pages/auth/ResetPasswordForm"));
const LoginSuccessRedirect = lazy(() => import("../components/auth/LoginSuccessRedirect"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const NewsPage = lazy(() => import("../pages/NewsPage"));
const NewsDetailPage = lazy(() => import("../pages/NewsDetailPage"));

export const publicRoutes = [
  { path: "/", element: <HomePage /> },

  { path: "/auth/login", element: <AuthPage /> },
  { path: "/auth/register", element: <AuthPage /> },
  { path: "/forgot-password", element: <ForgotPasswordForm /> },
  { path: "/reset-password/:token", element: <ResetPasswordForm /> },
  { path: "/login-success", element: <LoginSuccessRedirect /> },
  { path: "/auth", element: <Navigate to="/auth/login" replace /> },
  { path: "/about", element: <AboutPage /> },

  // News routes
  { path: "/news", element: <NewsPage /> },
  { path: "/news/:id", element: <NewsDetailPage /> },

  // fallback: redirect unknown routes to home (or replace with a NotFound page)
  { path: "*", element: <Navigate to="/" replace /> },
];
