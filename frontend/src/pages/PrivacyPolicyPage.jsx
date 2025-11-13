import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Footer from "../components/layout/Footer.jsx";
import foodBg from "../assets/bg-sml.jpeg";
const PrivacyPolicyPage = () => {
  const [openSection, setOpenSection] = useState(0);

  const sections = [
    {
      title: "Thông tin chúng tôi thu thập",
      content: [
        "Thông tin cá nhân: Họ tên, email, số điện thoại khi bạn đăng ký tài khoản.",
        "Thông tin sở thích: Các món ăn yêu thích, chế độ ăn kiêng, dị ứng thực phẩm.",
        "Dữ liệu sử dụng: Lịch sử tìm kiếm, món ăn đã xem, thời gian truy cập.",
        "Thông tin thiết bị: Địa chỉ IP, loại trình duyệt, hệ điều hành.",
      ],
    },
    {
      title: "Cách chúng tôi sử dụng thông tin",
      content: [
        "Cá nhân hóa trải nghiệm: Gợi ý món ăn phù hợp với sở thích và nhu cầu của bạn.",
        "Cải thiện dịch vụ: Phân tích hành vi người dùng để tối ưu hóa tính năng.",
        "Gửi thông báo: Cập nhật món ăn mới, chương trình khuyến mãi (nếu bạn đồng ý).",
        "Bảo mật tài khoản: Xác thực danh tính và ngăn chặn gian lận.",
      ],
    },
    {
      title: "Quyền của người dùng",
      content: [
        "Quyền truy cập: Bạn có quyền yêu cầu xem thông tin cá nhân mà chúng tôi lưu trữ.",
        "Quyền chỉnh sửa: Bạn có thể cập nhật hoặc sửa đổi thông tin cá nhân bất kỳ lúc nào.",
        "Quyền xóa dữ liệu: Bạn có thể yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.",
        "Quyền từ chối: Bạn có thể từ chối nhận email marketing hoặc thông báo quảng cáo.",
      ],
    },
    {
      title: "Bảo mật và lưu trữ dữ liệu",
      content: [
        "Mã hóa dữ liệu: Chúng tôi sử dụng SSL/TLS để bảo vệ dữ liệu trong quá trình truyền tải.",
        "Lưu trữ an toàn: Dữ liệu được lưu trữ trên máy chủ có biện pháp bảo mật cao.",
        "Không chia sẻ: Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba.",
        "Thời gian lưu trữ: Dữ liệu được giữ cho đến khi bạn yêu cầu xóa hoặc theo quy định pháp luật.",
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-12 relative">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={foodBg}
            alt="Vietnamese Food Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <ShieldCheckIcon className="w-12 h-12 " />
            <h1 className="text-5xl md:text-6xl font-bold ">
              Chính sách bảo mật
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl "
          >
            SmartMealVN cam kết bảo vệ quyền riêng tư và thông tin cá nhân của
            bạn
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8"
          >
            <p className=" leading-relaxed">
              Chính sách bảo mật này giải thích cách SmartMealVN thu thập, sử
              dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ của
              chúng tôi. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết
              bảo vệ dữ liệu cá nhân một cách an toàn nhất.
            </p>
          </motion.div>

          {/* Accordion */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800  rounded-2xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenSection(openSection === index ? null : index)
                  }
                  className="w-full px-8 py-6 flex items-center justify-between hover:text-primary transition-colors"
                >
                  <h3 className="text-xl font-bold  text-left">
                    {section.title}
                  </h3>
                  {openSection === index ? (
                    <ChevronUpIcon className="w-6 h-6 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-6 h-6  flex-shrink-0" />
                  )}
                </button>

                {openSection === index && (
                  <div className="px-8 pb-6">
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 bg-white dark:bg-slate-800   rounded-2xl p-6 text-center"
          >
            <p>
              <span className="font-semibold">Cập nhật lần cuối:</span>{" "}
              01/01/2024
            </p>
            <p className=" mt-2">
              Xem thêm{" "}
              <a
                href="/terms"
                className="text-primary hover:underline font-semibold"
              >
                Điều khoản sử dụng
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
