import React, { Suspense, useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthProvider";
import { MealSelectionProvider } from "./context/MealSelectionContext"; // 🧩 dùng context modal toàn cục
import NavBar from "./components/layout/NavBar";
import Sidebar from "./components/layout/Sidebar";
import AppRouter from "./AppRouter";
import { motion, AnimatePresence } from "framer-motion";

function AppContent() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const HIDE_NAVBAR_PATHS = ["/auth"];
  const hideNavbar = HIDE_NAVBAR_PATHS.some((path) =>
    location.pathname.startsWith(path)
  );

  const SIDEBAR_VISIBLE_PATHS = [
    "/profile",
    "/dashboard",
    "/saved-menus",
    "/nutrition",
    "/settings",
    "/help",
  ];
  const showSidebar = SIDEBAR_VISIBLE_PATHS.some((path) =>
    location.pathname.startsWith(path)
  );

  const sidebarPadding = showSidebar
    ? isSidebarCollapsed
      ? 80 // tương đương w-20
      : 256 // tương đương w-64
    : 0;

  return (
    <>
      {!hideNavbar && <NavBar />}
      {showSidebar && (
        <Sidebar onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      )}

      <motion.div
        animate={{ paddingLeft: sidebarPadding }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="pt-[64px] min-h-screen"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
          >
            <AppRouter />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          {/* 🧠 Đặt Provider này ngoài cùng để modal bao trùm toàn app */}
          <MealSelectionProvider>
            <Suspense
              fallback={<div className="text-center mt-10">Đang tải...</div>}
            >
              <AppContent />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </Suspense>
          </MealSelectionProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
