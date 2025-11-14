import React from "react";
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
import { useLogoutModal } from "../../context/LogoutModalContext";

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openLogoutModal } = useLogoutModal();

  if (!user) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-50 p-4 text-center text-gray-500">
        Không thể tải dữ liệu người dùng.
      </div>
    );
  }

  // Navigation links
  const navItems = [
    { icon: User, label: "Quản lý Hồ sơ", path: "/profile" },
    {
      icon: LayoutDashboard,
      label: "Trang Quản lý Cá nhân",
      path: "/dashboard",
    },
    { icon: BookmarkIcon, label: "Thực đơn đã Lưu", path: "/saved-menus" },
    { icon: PieChart, label: "Báo cáo Dinh dưỡng", path: "/nutrition-report" },
    { icon: Settings, label: "Cài đặt Tài khoản", path: "/settings" },
  ];

  const handleLogout = () => {
    openLogoutModal(() => {
      logout();
      navigate("/auth");
    });
  };

  return (
    <div
      className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg py-2 z-50 
      bg-white dark:bg-slate-900/80 text-gray-800 dark:text-gray-100 
      border border-gray-200 dark:border-gray-800"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
            <User className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Chào, {user.name}!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="w-full px-4 py-2 flex items-center text-left 
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 py-2">
        <button
          onClick={() => navigate("/help")}
          className="w-full px-4 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <HelpCircle className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
          <span>Trợ giúp & Phản hồi</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 transition"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
