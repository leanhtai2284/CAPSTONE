import React from "react";
import { Clock, Heart, User } from "lucide-react";

const MealCard = ({
  image,
  title,
  cookTime,
  calories,
  quantityUser,
  likes,
  badges = [],
}) => {
  return (
    <div className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Image container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <span
              key={index}
              className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded"
            >
              {badge}
            </span>
          ))}
          {cookTime && (
            <span className="bg-blue-400/90 text-gray-800 text-xs font-medium px-2 py-1 rounded flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {cookTime}
            </span>
          )}
          {calories && (
            <span className="bg-red-400/90 text-white text-xs font-medium px-2 py-1 rounded">
              {calories}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm text-black/60 dark:text-gray-300">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{quantityUser}</span>
          </div>
          <div className="flex items-center">
            <span>{likes}</span>
            <Heart className="w-4 h-4 ml-1 text-red-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
