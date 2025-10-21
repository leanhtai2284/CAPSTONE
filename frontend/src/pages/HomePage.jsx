import React from "react";
import Hero from "../components/section/Hero";
import Footer from "../components/layout/Footer";
import EditorsPicksSection from "../components/section/EditorsPicksSection";
import PersonalizedRecommendationsSection from "../components/section/PersonalizedRecommedationsSection";
import NutritionCorner from "../components/section/NutritionCorner";
import { FinalCTA } from "../components/section/FinalCTA";
import { useAuth } from "../hooks/useAuth";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* hero section */}
      <Hero />
      {/* lựa chọn của biên tập viên */}
      <EditorsPicksSection />
      {/* gợi ý cá nhân */}
      <PersonalizedRecommendationsSection />
      {/* góc dinh dưỡng */}
      <NutritionCorner />
      {/* kêu gọi hành động cuối trang */}
      {!user && <FinalCTA />} {/*  Chỉ hiển thị khi chưa đăng nhập */}
      {/* footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
