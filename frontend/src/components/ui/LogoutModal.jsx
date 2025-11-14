import React from "react";
import { motion } from "framer-motion";
import { LogOutIcon } from "lucide-react";

function LogoutModal({ onClose, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <LogOutIcon className="w-8 h-8 text-red-500" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Bạn có chắc muốn đăng xuất không?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Dữ liệu và hồ sơ của bạn vẫn được lưu an toàn 🔒
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
          >
            Đăng xuất ngay
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LogoutModal;
