import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ForYouPage from "./pages/ForYouPage";
import AuthPage from "./pages/AuthPage"; // thêm dòng này nếu có AuthPage

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/foryou" element={<ForYouPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default AppRouter;
