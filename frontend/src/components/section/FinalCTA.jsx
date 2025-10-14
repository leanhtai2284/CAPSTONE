import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export function FinalCTA() {
  return (
    <section className="py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-2xl p-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bạn đã sẵn sàng tiết kiệm tiền, thời gian và ăn ngon hơn?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Tham gia cùng hàng nghìn gia đình Việt đang tận hưởng bữa ăn ngon,
            tiết kiệm mỗi ngày
          </p>
          <div className="mb-10">
            <Button
              to="/auth"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
            >
              ĐĂNG KÝ MIỄN PHÍ NGAY!
            </Button>
            <ToastContainer />
          </div>
          <p className="text-sm opacity-80 max-w-lg mx-auto">
            Thông tin chỉ mang tính giáo dục và tham khảo, không thay thế tư vấn
            y tế. Luôn tham khảo ý kiến chuyên gia dinh dưỡng nếu bạn có nhu cầu
            đặc biệt.
          </p>
        </div>
      </div>
    </section>
  );
}
