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

  // Dùng id làm định danh chính — đảm bảo trùng dữ liệu với SavedMenusPage
  const uniqueKey = meal?.id ?? meal?.uniqueKey ?? null;

  // Khi load component, kiểm tra món này có trong localStorage không
  useEffect(() => {
    if (!uniqueKey) return;
    const savedMeals = JSON.parse(localStorage.getItem("savedMeals")) || [];
    const exists = savedMeals.some(
      (m) => m.id === meal.id || m.uniqueKey === uniqueKey
    );
    setIsSaved(exists);
  }, [meal, uniqueKey]);

  // Toggle lưu / bỏ lưu
  const toggleSave = (e) => {
    e.stopPropagation(); // tránh click lan lên thẻ cha
    if (!uniqueKey) return;

    const savedMeals = JSON.parse(localStorage.getItem("savedMeals")) || [];
    let updatedMeals;

    if (isSaved) {
      // ❌ Bỏ lưu
      updatedMeals = savedMeals.filter(
        (m) => m.id !== meal.id && m.uniqueKey !== uniqueKey
      );
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
      // ✅ Lưu mới
      const mealToSave = {
        ...meal,
        uniqueKey: uniqueKey || Date.now(), // tạo key nếu chưa có
      };
      updatedMeals = [...savedMeals, mealToSave];
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
