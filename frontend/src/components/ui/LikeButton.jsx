import React from "react";
import { Heart } from "lucide-react";
import { useRecipeLikeState } from "../../state/useRecipeLikeState";

const LikeButton = ({ meal, onToggleLike, className }) => {
  const { isLiked, likesCount, isLoading, toggleLike } = useRecipeLikeState(
    meal,
    {
      initialLikesCount: meal?.likes_count ?? 0,
    }
  );

  const handleClick = async (e) => {
    e.stopPropagation();
    const result = await toggleLike();
    if (result && onToggleLike) {
      onToggleLike(meal, result.isLiked, result.likesCount);
    }
  };

  const defaultClassName =
    "absolute top-3 right-14 bg-white/80 backdrop-blur-md rounded-full px-2.5 py-2 shadow-sm transition-transform duration-200 hover:scale-110 flex items-center gap-1";
  const finalClassName = className || defaultClassName;

  return (
    <button
      onClick={handleClick}
      className={`${finalClassName} ${isLoading ? "opacity-70" : ""}`}
      title={isLiked ? "Bỏ thích món ăn" : "Thích món ăn"}
      disabled={isLoading}
    >
      <Heart
        className={`w-4 h-4 transition-colors duration-300 ${
          isLiked ? "fill-rose-500 text-rose-500" : "text-gray-600"
        }`}
      />
      <span className="text-xs font-semibold text-gray-700">{likesCount}</span>
    </button>
  );
};

export default LikeButton;
