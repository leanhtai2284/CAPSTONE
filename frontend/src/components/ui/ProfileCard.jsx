import React from "react";
import { FiUser } from "react-icons/fi";

const ProfileCard = () => (
  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
    <div className="p-4">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
          <FiUser className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-600">Nguyễn Văn A</h3>
          <p className="text-sm text-gray-400">nguyenvana@example.com</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Chiều cao:</span>
          <span className="font-medium">170 cm</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cân nặng:</span>
          <span className="font-medium">65 kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Mục tiêu:</span>
          <span className="font-medium text-green-600">Giảm cân</span>
        </div>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Mục tiêu dinh dưỡng hàng ngày
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Calo</span>
            <span className="font-bold text-green-700">1,800 kcal</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Protein</span>
            <span className="font-bold text-blue-700">120 g</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Carbs</span>
            <span className="font-bold text-amber-700">180 g</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <a
          href="#"
          className="block text-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          Xem hồ sơ đầy đủ
        </a>
      </div>
    </div>
  </div>
);

export default ProfileCard;
