import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "react-toastify";
import { favoriteService } from "../../services/favoriteService";

/**
 * SaveButton
 * - Hiển thị icon Bookmark (rỗng hoặc vàng)
 * - Lưu / xoá món ăn trong localStorage["savedMeals"]
 * - Có hiệu ứng nhỏ khi click + toast thông báo
 * - onToggleSave: callback được gọi sau khi toggle (optional)
 */
const SaveButton = ({ meal, onToggleSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  // Dùng id làm định danh chính — đảm bảo trùng dữ liệu với SavedMenusPage
  const recipeId = meal?.id ?? meal?._id ?? meal?.uniqueKey ?? null;

  // Khi load component, kiểm tra món này có trong localStorage không
  useEffect(() => {
    if (!recipeId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setIsSaved(false);
      return;
    }

    (async () => {
      try {
        const favorites = await favoriteService.getAll();
        const exists = favorites.some(
          (m) =>
            m.id === recipeId ||
            m._id === recipeId ||
            m.recipeId === recipeId ||
            m.uniqueKey === recipeId
        );
        setIsSaved(exists);
      } catch (err) {
        console.error("Error checking favorite:", err);
      }
    })();
  }, [meal, recipeId]);

  // Toggle lưu / bỏ lưu
  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!recipeId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để lưu món ăn!");
      return;
    }

    try {
      if (isSaved) {
        // Bỏ lưu
        await favoriteService.removeByRecipeId(recipeId);
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
        // Lưu món
        await favoriteService.add({
          ...meal,
          // bảo đảm luôn có id để nhận diện
          id: meal.id || meal._id || recipeId,
        });
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

      const newSavedState = !isSaved;
      setIsSaved(newSavedState);

      if (onToggleSave) {
        onToggleSave(meal, newSavedState);
      }
    } catch (err) {
      console.error("Error toggle favorite:", err);
      toast.error(err.message || "Không thể cập nhật lưu món ăn!");
    }
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
