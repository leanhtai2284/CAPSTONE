import React, { useState } from "react";
import { motion } from "framer-motion";
import { SendIcon, MailIcon, PhoneIcon, BookOpenIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { feedbackService } from "../services/feedbackService";

const HelpFeedback = () => {
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.warn("Vui lòng nhập nội dung phản hồi 🌿", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        theme: "colored",
      });
      return;
    }

    setSubmitted(true);

    try {
      await feedbackService.sendFeedback({
        type: feedbackType,
        message,
      });

      toast.success("Cảm ơn bạn đã gửi phản hồi 🌿", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setMessage("");
    } catch (error) {
      toast.error(error.message || "Không thể gửi phản hồi, vui lòng thử lại", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto relative">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold  mb-2">
          Góp ý để SmartMealVN hiểu bạn hơn 💚
        </h1>
        <p className="text-gray-600 dark:text-gray-300  ">
          Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ
        </p>
      </motion.div>

      <motion.form
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium  mb-3">
            Loại phản hồi
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "suggestion", label: "Góp ý" },
              { value: "bug", label: "Báo lỗi" },
              { value: "feature", label: "Tính năng mới" },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFeedbackType(type.value)}
                className={`px-4 py-3 rounded-xl transition-all ${
                  feedbackType === type.value
                    ? "bg-[#1C7C4A] text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium  mb-2">
            Nội dung phản hồi
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Chia sẻ suy nghĩ của bạn với chúng tôi..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1C7C4A] focus:ring-2 focus:ring-[#1C7C4A]/20 transition-all outline-none resize-none"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={submitted}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
            submitted
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-[#1C7C4A] to-[#2DA968] text-white hover:shadow-lg"
          }`}
        >
          <SendIcon className="w-5 h-5" />
          {submitted ? "Đang gửi..." : "Gửi phản hồi"}
        </motion.button>
      </motion.form>

      {/* 🧩 Toast container để hiển thị thông báo */}
      <ToastContainer />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="dark:bg-slate-950 bg-white rounded-2xl p-8 border  shadow-sm "
      >
        <h3 className="text-xl font-bold  mb-6">Thông tin liên hệ</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 ">
            <MailIcon className="w-5 h-5 text-primary" />
            <span>support@smartmealvn.com</span>
          </div>
          <div className="flex items-center gap-3 ">
            <PhoneIcon className="w-5 h-5 text-primary" />
            <span>1900 xxxx</span>
          </div>
          <button className="flex items-center gap-3 text-primary hover:text-primary transition-colors">
            <BookOpenIcon className="w-5 h-5" />
            <span className="font-medium">Xem hướng dẫn sử dụng</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpFeedback;
