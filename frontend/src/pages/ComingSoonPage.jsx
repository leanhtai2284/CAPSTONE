import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RocketIcon,
  ClockIcon,
  SparklesIcon,
  UtensilsIcon,
  BellIcon,
} from "lucide-react";

function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ scale: [0, 1, 0], opacity: [0, 0.5, 0] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <SparklesIcon className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-primary font-semibold">Đang Phát Triển</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="bg-gradient-to-r from-primary via-green-500 to-secondary bg-clip-text text-transparent">
            Tính năng sẽ có trong tương lai!
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Tính năng này đang được nhóm phát triển hoàn thiện.
          <span className="text-green-400 font-semibold">
            {" "}
            Quay lại sau nhé!
          </span>
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {[
            {
              icon: RocketIcon,
              label: "Tính năng mới",
              desc: "Đang hoàn thiện",
            },
            { icon: ClockIcon, label: "Sắp ra mắt", desc: "Chờ đón nhé" },
            { icon: BellIcon, label: "Thông báo", desc: "Khi sẵn sàng" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <item.icon className="w-6 h-6 text-green-400" />
              </motion.div>
              <h3 className="text-white font-semibold mb-1">{item.label}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <motion.button
            onClick={() => navigate("/")}
            className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UtensilsIcon className="w-5 h-5" />
            <span>Về trang chủ</span>
          </motion.button>
        </motion.div>

        {/* Progress */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Tiến độ phát triển</span>
            <span className="text-sm font-semibold text-green-400">75%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ delay: 1.7, duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Đang trong giai đoạn kiểm thử cuối cùng
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default ComingSoonPage;
