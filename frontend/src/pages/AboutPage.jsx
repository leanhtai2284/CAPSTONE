import React from "react";
import { motion } from "framer-motion";
import { TargetIcon, SparklesIcon, UsersIcon } from "lucide-react";
import Footer from "../components/layout/Footer";
import foodBg from "../assets/bg-sml.jpeg";

const AboutPage = () => {
  const features = [
    {
      icon: TargetIcon,
      title: "Mục tiêu dự án",
      description:
        "Giúp người Việt dễ dàng chọn món ăn ngon, đủ dinh dưỡng, phù hợp ngân sách và sở thích cá nhân. Kết nối truyền thống ẩm thực ba miền với phong cách sống hiện đại.",
    },
    {
      icon: SparklesIcon,
      title: "Tính năng nổi bật",
      description:
        "Gợi ý thực đơn thông minh theo sở thích, vùng miền, chế độ ăn kiêng. Tìm kiếm món ăn với bộ lọc chi tiết về calories, giá cả, thời gian nấu và độ cay.",
    },
    {
      icon: UsersIcon,
      title: "Đội ngũ phát triển",
      description:
        "Được phát triển bởi nhóm sinh viên đam mê công nghệ và ẩm thực Việt Nam, với mục tiêu mang đến trải nghiệm tốt nhất cho người dùng.",
    },
  ];

  return (
    <div className="w-full min-h-screen ">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={foodBg}
            alt="Vietnamese Food Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold  mb-6"
          >
            Giới thiệu
            <span className="hidden md:inline whitespace-nowrap">
              <span className="text-red-600"> Smart</span>
              <span className="text-red-600">Meal</span>
              <span className="text-yellow-300">VN</span>
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl leading-relaxed"
          >
            Khám phá ẩm thực Việt Nam một cách thông minh, hiện đại và đầy cảm
            hứng. SmartMealVN là người bạn đồng hành đáng tin cậy trong hành
            trình ẩm thực của bạn.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 ">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold  mb-4">{feature.title}</h3>
                <p className=" leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold  mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Những người đam mê ẩm thực và công nghệ
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-800  rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="flex justify-center items-center gap-8 mb-8">
              {["👨", "👨", "👨", "🧑", "👨"].map((icon, index) => (
                <div
                  key={index}
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl shadow-md"
                >
                  <span>{icon}</span>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold  mb-4">Nhóm Sinh Viên C1SE.81</h3>
            <p className=" max-w-2xl mx-auto leading-relaxed">
              Chúng tôi là nhóm sinh viên đam mê công nghệ và yêu thích ẩm thực
              Việt Nam. Với mong muốn kết nối truyền thống và hiện đại, chúng
              tôi tạo ra SmartMealVN để giúp mọi người dễ dàng khám phá và
              thưởng thức những món ăn Việt tuyệt vời.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
