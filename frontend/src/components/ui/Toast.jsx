import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

/**
 * Component Toast linh hoạt:
 * @param {string} message - Nội dung hiển thị
 * @param {string} type - Loại toast ("success" | "error" | "info" | "warning")
 * @param {boolean} autoShow - Tự động hiển thị khi render
 * @param {boolean} showButton - Có hiển thị nút bấm không
 * @param {number} duration - Thời gian toast tự tắt
 */
export function Toast({
  message = "Thông báo mặc định",
  type = "info",
  autoShow = false,
  showButton = true,
  duration = 3000,
}) {
  //  Tự động hiển thị nếu autoShow = true
  useEffect(() => {
    if (autoShow) {
      toast[type](message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }, [autoShow, message, type, duration]);

  //  Hiển thị toast khi click
  const handleClick = () => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  };

  return (
    <>
      {showButton && (
        <button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-105"
        >
          Hiển thị Toast
        </button>
      )}
      <ToastContainer />
    </>
  );
}
