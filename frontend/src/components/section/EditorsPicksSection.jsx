import React from "react";
import MealCard from "../ui/MealCard";

const EditorsPicksSection = () => {
  const editorsPicks = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1576577445504-6af96477db52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      title: "Phở Bò Truyền Thống",
      cookTime: "60 phút",
      quantityUser: "2-3 người",
      likes: 1245,
      badges: ["Bắc Bộ"],
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1567337710282-00832b415979?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1930&q=80",
      title: "Gỏi Cuốn Tôm Thịt",
      cookTime: "30 phút",
      quantityUser: "2 người",
      likes: 892,
      badges: ["Miền Nam"],
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      title: "Bánh Xèo Miền Trung",
      cookTime: "45 phút",
      quantityUser: "4 người",
      likes: 756,
      badges: ["Miền Trung"],
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1970&q=80",
      title: "Bún Chả Hà Nội",
      cookTime: "50 phút",
      quantityUser: "1 người",
      likes: 1103,
      badges: ["Miền Bắc"],
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Lựa chọn của Biên tập viên
        </h2>
        <a
          href="#"
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          Xem tất cả
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {editorsPicks.map((meal) => (
          <MealCard
            key={meal.id}
            image={meal.image}
            title={meal.title}
            cookTime={meal.cookTime}
            quantityUser={meal.quantityUser}
            likes={meal.likes}
            badges={meal.badges}
          />
        ))}
      </div>
    </section>
  );
};

export default EditorsPicksSection;
