import React, { useState, useEffect } from "react";
import {
  User,
  LayoutDashboard,
  BookmarkIcon,
  Calendar,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLogoutModal } from "../../context/LogoutModalContext";

const Sidebar = ({ onToggle }) => {
  const { openLogoutModal } = useLogoutModal();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Khi state collapsed thay đổi → báo cho App.jsx biết
  useEffect(() => {
    if (onToggle) onToggle(collapsed);
  }, [collapsed, onToggle]);

  // Những route được phép hiển thị Sidebar
  const visibleRoutes = [
    "/profile",
    "/dashboard",
    "/saved-menus",
    "/saved-daily-menus",
    "/nutrition-report",
    "/settings",
    "/help",
  ];
  const shouldShowSidebar = visibleRoutes.includes(location.pathname);
  if (!shouldShowSidebar) return null;

  const menuItems = [
    { icon: User, label: "Quản lý Hồ sơ", path: "/profile" },
    {
      icon: LayoutDashboard,
      label: "Trang Quản lý Cá nhân",
      path: "/dashboard",
    },
    { icon: BookmarkIcon, label: "Món ăn đã Lưu", path: "/saved-menus" },
    { icon: Calendar, label: "Thực đơn đã Lưu", path: "/saved-daily-menus" },
    { icon: PieChart, label: "Báo cáo Dinh dưỡng", path: "/nutrition-report" },
    { icon: Settings, label: "Cài đặt Tài khoản", path: "/settings" },
  ];

  return (
    <aside
      className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-primary dark:bg-slate-950 dark:hover:bg-primary transition-colors"
        >
          {collapsed ? <Menu size={25} /> : <ChevronLeft size={25} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-colors group ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-primary dark:bg-secondary text-white dark:text-green-300"
                  : "hover:bg-white dark:hover:bg-slate-950 text-gray-700 dark:text-gray-200"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-white "
                    : "text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary"
                }`}
              />
              {!collapsed && (
                <span
                  className={`ml-3 font-medium ${
                    isActive
                      ? "text-white "
                      : "text-gray-700 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary"
                  }`}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <button
          onClick={() => navigate("/help")}
          className={`flex items-center w-full px-4 py-2 rounded-xl transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            location.pathname === "/help"
              ? "text-green-700 dark:text-green-300"
              : "text-gray-700 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Trợ giúp & Phản hồi</span>}
        </button>

        <button
          onClick={() =>
            openLogoutModal(() => {
              logout();
              navigate("/auth");
            })
          }
          className={`flex items-center w-full px-4 py-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
