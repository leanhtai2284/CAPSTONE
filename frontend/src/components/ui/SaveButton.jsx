import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "react-toastify";

/**
 * SaveButton
 * - Hiển thị icon Bookmark (rỗng hoặc vàng)
 * - Lưu / xoá món ăn trong localStorage["savedMeals"]
 * - Có hiệu ứng nhỏ khi click + toast thông báo
 */
const SaveButton = ({ meal }) => {
  const [isSaved, setIsSaved] = useState(false);

  const uniqueKey = `${meal?.id || ""}_${meal?.title || ""}_${
    meal?.image || ""
  }`;

  // Kiểm tra xem món này đã được lưu chưa khi load trang
  useEffect(() => {
    if (!uniqueKey) return;
    const savedMeals = JSON.parse(localStorage.getItem("savedMeals")) || [];
    setIsSaved(savedMeals.some((m) => m.uniqueKey === uniqueKey));
  }, [uniqueKey]);

  // Xử lý khi bấm lưu / bỏ lưu
  const toggleSave = () => {
    if (!uniqueKey) return;

    const savedMeals = JSON.parse(localStorage.getItem("savedMeals")) || [];
    let updatedMeals;

    if (isSaved) {
      updatedMeals = savedMeals.filter((m) => m.uniqueKey !== uniqueKey);
      toast.info("Đã bỏ lưu món ăn!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
    } else {
      updatedMeals = [...savedMeals, { ...meal, uniqueKey }];
      toast.success("Đã lưu món ăn!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
    }

    localStorage.setItem("savedMeals", JSON.stringify(updatedMeals));
    setIsSaved(!isSaved);
  };

  return (
    <button
      onClick={toggleSave}
      className={`absolute top-3 right-3 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-sm 
        transition-transform duration-200 hover:scale-110 ${
          isSaved ? "animate-bounce-once" : ""
        }`}
    >
      <Bookmark
        className={`w-5 h-5 transition-colors duration-300 ${
          isSaved ? "fill-yellow-500 text-yellow-500" : "text-gray-600"
        }`}
      />
    </button>
  );
};

export default SaveButton;
