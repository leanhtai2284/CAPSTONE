import React, { useEffect, useState } from "react";
import {
  User,
  BookmarkIcon,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // ✅ Giả lập gọi API user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fakeApiData = {
          name: user?.name || "Nguyễn Văn A",
          email: user?.email || "nguyenvana@example.com",
          height: 170,
          weight: 65,
          goal: "Giảm cân",
        };

        // Giả delay API
        setTimeout(() => setUserData(fakeApiData), 400);
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

  const handleProfileClick = () => navigate("/profile");
  const handleDashboardClick = () => navigate("/dashboard");

  if (!userData) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
      {/* Header - User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Chào, {userData.name}!</p>
            <p className="text-sm text-gray-500">{userData.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-2 ">
        <button
          onClick={handleProfileClick}
          className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
        >
          <User className="w-5 h-5 mr-3 text-gray-600" />
          <span>Quản lý Hồ sơ</span>
        </button>

        <button
          onClick={handleDashboardClick}
          className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
        >
          <LayoutDashboard className="w-5 h-5 mr-3 text-gray-600" />
          <span>Trang Quản lý Cá nhân</span>
        </button>

        <a
          href="#"
          className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
        >
          <BookmarkIcon className="w-5 h-5 mr-3 text-gray-600" />
          <span>Thực đơn đã Lưu</span>
        </a>

        <a
          href="#"
          className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
        >
          <PieChart className="w-5 h-5 mr-3 text-gray-600" />
          <span>Báo cáo Dinh dưỡng</span>
        </a>

        <a
          href="#"
          className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-5 h-5 mr-3 text-gray-600" />
          <span>Cài đặt Tài khoản</span>
        </a>
      </div>

      {/* Footer - System Links */}
      <div className="border-t border-gray-100 py-2">
        <a
          href="#"
          className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
        >
          <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
          <span>Trợ giúp & Phản hồi</span>
        </a>

        {/* ✅ Giữ nguyên nút Đăng xuất hoạt động thật */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 flex items-center text-left text-red-500 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
