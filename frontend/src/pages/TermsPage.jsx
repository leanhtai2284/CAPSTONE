import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Footer from "../components/layout/Footer.jsx";
import foodBg from "../assets/bg-sml.jpeg";

const TermsPage = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(0);

  const sections = [
    {
      title: "Giới thiệu và định nghĩa",
      content: [
        "SmartMealVN là nền tảng gợi ý món ăn Việt Nam, giúp người dùng khám phá và lựa chọn món ăn phù hợp.",
        "Người dùng: Bất kỳ cá nhân nào truy cập và sử dụng dịch vụ của SmartMealVN.",
        "Dịch vụ: Bao gồm tìm kiếm món ăn, gợi ý thực đơn, lưu trữ sở thích cá nhân.",
        "Nội dung: Tất cả thông tin, hình ảnh, công thức món ăn được hiển thị trên nền tảng.",
      ],
    },
    {
      title: "Quyền và nghĩa vụ của người dùng",
      content: [
        "Quyền sử dụng: Bạn có quyền truy cập và sử dụng miễn phí các tính năng của SmartMealVN.",
        "Trách nhiệm: Bạn phải cung cấp thông tin chính xác và không sử dụng dịch vụ cho mục đích bất hợp pháp.",
        "Bảo mật tài khoản: Bạn chịu trách nhiệm bảo vệ mật khẩu và thông tin đăng nhập của mình.",
        "Tuân thủ: Bạn đồng ý tuân thủ các quy định pháp luật Việt Nam khi sử dụng dịch vụ.",
      ],
    },
    {
      title: "Quyền và nghĩa vụ của SmartMealVN",
      content: [
        "Cung cấp dịch vụ: Chúng tôi cam kết duy trì và cải thiện chất lượng dịch vụ liên tục.",
        "Bảo mật thông tin: Chúng tôi bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật.",
        "Quyền thay đổi: Chúng tôi có quyền cập nhật, sửa đổi hoặc tạm ngưng dịch vụ khi cần thiết.",
        "Quyền từ chối: Chúng tôi có quyền từ chối hoặc chấm dứt tài khoản vi phạm điều khoản.",
      ],
    },
    {
      title: "Giới hạn trách nhiệm",
      content: [
        "Nội dung tham khảo: Thông tin món ăn chỉ mang tính chất tham khảo, không thay thế tư vấn chuyên môn.",
        "Độ chính xác: Chúng tôi không đảm bảo 100% độ chính xác của thông tin dinh dưỡng và công thức.",
        "Trách nhiệm người dùng: Bạn tự chịu trách nhiệm về quyết định ăn uống và sức khỏe của mình.",
        "Liên kết bên thứ ba: Chúng tôi không chịu trách nhiệm về nội dung từ các website liên kết.",
      ],
    },
    {
      title: "Thay đổi và hiệu lực của điều khoản",
      content: [
        "Quyền sửa đổi: SmartMealVN có quyền cập nhật điều khoản này bất kỳ lúc nào.",
        "Thông báo: Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc trên website.",
        "Hiệu lực: Điều khoản có hiệu lực ngay khi bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi.",
        "Chấp nhận: Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận điều khoản mới.",
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen ">
      {/* Hero Section */}
      <section className="pt-32 pb-12 overflow-hidden relative">
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
            <FileTextIcon className="w-12 h-12 " />
            <h1 className="text-5xl md:text-6xl font-bold ">
              Điều khoản sử dụng
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl "
          >
            Vui lòng đọc kỹ điều khoản trước khi sử dụng dịch vụ SmartMealVN
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
              Bằng việc truy cập và sử dụng SmartMealVN, bạn đồng ý tuân thủ các
              điều khoản và điều kiện được nêu dưới đây. Nếu bạn không đồng ý
              với bất kỳ phần nào của điều khoản này, vui lòng không sử dụng
              dịch vụ của chúng tôi.
            </p>
          </motion.div>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden"
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
                    <ChevronDownIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {openSection === index && (
                  <div className="px-8 pb-6">
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 mx-auto transition-all hover:scale-105 shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Quay lại trang chủ
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
