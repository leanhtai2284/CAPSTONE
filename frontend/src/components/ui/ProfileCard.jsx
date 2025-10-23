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
import { useAuth } from "../../hooks/useAuth";

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy user mock từ localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUserData(storedUser);
    setLoading(false);
  }, []);

  // ✅ Điều hướng logout
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // ✅ Các điều hướng khác
  const handleProfileClick = () => navigate("/profile");
  const handleDashboardClick = () => navigate("/dashboard");
  const handleSavedMenusClick = () => navigate("/saved-menus");
  const handleNutritionClick = () => navigate("/nutrition-report");
  const handleSettingsClick = () => navigate("/settings");
  const handleHelpClick = () => navigate("/help");

  if (loading) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4 text-center text-gray-500">
        Không thể tải dữ liệu người dùng.
      </div>
    );
  }

  return (
    <div
      className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg py-2 z-50 
                  bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 
                  border border-gray-200 dark:border-gray-800 transition-colors"
    >
      {/* Header - User Info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
            <User className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Chào, {userData.name}!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userData.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-2">
        {[
          { icon: User, label: "Quản lý Hồ sơ", onClick: handleProfileClick },
          {
            icon: LayoutDashboard,
            label: "Trang Quản lý Cá nhân",
            onClick: handleDashboardClick,
          },
          {
            icon: BookmarkIcon,
            label: "Thực đơn đã Lưu",
            onClick: handleSavedMenusClick,
          },
          {
            icon: PieChart,
            label: "Báo cáo Dinh dưỡng",
            onClick: handleNutritionClick,
          },
          {
            icon: Settings,
            label: "Cài đặt Tài khoản",
            onClick: handleSettingsClick,
          },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full px-4 py-2 flex items-center text-left 
                     hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-800 
                     transition-colors"
          >
            <Icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 py-2">
        <button
          onClick={handleHelpClick}
          className="w-full px-4 py-2 flex items-center text-left 
                   hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-800 transition-colors"
        >
          <HelpCircle className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
          <span>Trợ giúp & Phản hồi</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 flex items-center text-left 
                   text-red-500 hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
