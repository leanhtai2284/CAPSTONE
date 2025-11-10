import React from "react";
import { motion } from "framer-motion";
import { AlertTriangleIcon } from "lucide-react";

const SafetyNotice = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="relative bg-gradient-to-br from-orange-400 to-yellow-400 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 shadow-xl"
    >
      <div className="flex gap-3">
        <AlertTriangleIcon className="w-5 h-5 dark:text-yellow-400 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold dark:text-yellow-400 text-yellow-400 mb-1">
            Important Notice
          </h4>
          <p className="text-sm text-white leading-relaxed">
            Hệ thống chỉ cung cấp hướng dẫn giáo dục & tham khảo, không thay thế
            tư vấn y tế cá nhân hóa của chuyên gia.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyNotice;
