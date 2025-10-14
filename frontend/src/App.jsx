import React, { Suspense } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
      <AuthProvider>
        <Suspense
          fallback={<div className="text-center mt-10">Đang tải...</div>}
        >
          <AppContent />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
