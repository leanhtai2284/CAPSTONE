import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeIcon, UtensilsIcon, SearchIcon } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  flex items-center justify-center px-4 overflow-hidden relative">
      {/* Floating food particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {["🍜", "🥢", "🍱", "🌿", "🔥"][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated 404 with bowl illustration */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative inline-block"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Oops! Trang không tìm thấy
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-slate-400 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Trang bạn tìm không tồn tại, có thể do địa chỉ đã thay đổi hoặc lỗi
          đánh máy.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={() => navigate("/")}
            className="group bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HomeIcon className="w-5 h-5" />
            <span>Về Trang Chủ</span>
          </motion.button>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          className="mt-12 text-left bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
            <UtensilsIcon className="w-5 h-5 mr-2" />
            Có thể bạn đang tìm:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Thực đơn hôm nay", path: "/foryou" },
              { label: "Công thức nấu ăn", path: "/search" },
              { label: "Hồ sơ cá nhân", path: "/profile" },
              { label: "Báo cáo dinh dưỡng", path: "/nutrition-report" },
            ].map((item, index) => (
              <motion.button
                key={index}
                onClick={() => navigate(item.path)}
                className="text-left px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-green-400 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                → {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
