import React from "react";
import { motion } from "framer-motion";
import logo from "../../assets/logo/LOGO2.png";

export default function LoadingModal({ isOpen }) {
  if (!isOpen) return null; // 🔒 Không hiển thị khi isOpen = false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      {/* Modal chính */}
      <motion.div
        className="relative w-50 h-50 rounded-full bg-white shadow-[0_0_50px_rgba(255,120,0,0.5)] flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Hiệu ứng loading xoay quanh */}
        <motion.div
          className="absolute inset-0 border-4 border-t-transparent border-orange-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Logo ở giữa */}
        <motion.img
          src={logo}
          alt="Logo"
          className="w-60 h-60 drop-shadow-[0_0_25px_rgba(255,120,0,0.8)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </div>
  );
}
