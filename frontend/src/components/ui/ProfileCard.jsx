import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // ✅ Lấy logout và user từ context

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // ✅ Giả lập gọi API user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Giả lập gọi API — bạn có thể thay URL bằng API thật sau này
        const fakeApiData = {
          name: user?.name || "Nguyễn Văn A",
          email: user?.email || "nguyenvana@example.com",
          height: 170,
          weight: 65,
          goal: "Giảm cân",
          nutrition: {
            calories: 1800,
            protein: 120,
            carbs: 180,
          },
        };

        // Giả delay API
        setTimeout(() => {
          setUserData(fakeApiData);
        }, 400);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    logout(); // ✅ clear user & token
    navigate("/auth"); // ✅ điều hướng về trang đăng nhập
  };

  if (!userData) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <FiUser className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-600">{userData.name}</h3>
            <p className="text-sm text-gray-400">{userData.email}</p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Chiều cao:</span>
            <span className="font-medium">{userData.height} cm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cân nặng:</span>
            <span className="font-medium">{userData.weight} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mục tiêu:</span>
            <span className="font-medium text-green-600">{userData.goal}</span>
          </div>
        </div>

        {/* Nutrition */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Mục tiêu dinh dưỡng hàng ngày
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Calo</span>
              <span className="font-bold text-green-700">
                {userData.nutrition.calories} kcal
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Protein</span>
              <span className="font-bold text-blue-700">
                {userData.nutrition.protein} g
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Carbs</span>
              <span className="font-bold text-amber-700">
                {userData.nutrition.carbs} g
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => navigate("/profile")}
            className="block text-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            Xem hồ sơ đầy đủ
          </button>

          {/* ✅ Nút đăng xuất */}
          <button
            onClick={handleLogout}
            className="block text-center text-sm font-medium text-red-600 hover:text-red-700 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
