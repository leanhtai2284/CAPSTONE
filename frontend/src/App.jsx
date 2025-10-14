import React, { Suspense } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthProvider";
import NavBar from "./components/layout/NavBar";
import AppRouter from "./AppRouter";

const HIDE_NAVBAR_PATHS = ["/auth"];

function AppContent() {
  const location = useLocation();
  const hideNavbar = HIDE_NAVBAR_PATHS.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!hideNavbar && <NavBar />}
      <AppRouter />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
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
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
