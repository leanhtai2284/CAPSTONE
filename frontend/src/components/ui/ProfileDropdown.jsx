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
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ✅ Mảng cấu hình các mục menu
const MENU_ITEMS = [
  {
    label: "Quản lý Hồ sơ",
    icon: User,
    action: "profile",
  },
  {
    label: "Trang Quản lý Cá nhân",
    icon: LayoutDashboard,
    action: "dashboard",
  },
  {
    label: "Thực đơn đã Lưu",
    icon: BookmarkIcon,
  },
  {
    label: "Báo cáo Dinh dưỡng",
    icon: PieChart,
  },
  {
    label: "Cài đặt Tài khoản",
    icon: Settings,
  },
];

const SYSTEM_ITEMS = [
  {
    label: "Trợ giúp & Phản hồi",
    icon: HelpCircle,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
    color: "text-red-500",
    action: "logout",
  },
];

export default function ProfileDropdown({ isOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // ✅ Giả lập lấy dữ liệu user
  useEffect(() => {
    const fetchUser = async () => {
      const fakeUser = {
        name: user?.name || "Nguyễn Văn A",
        email: user?.email || "nguyenvana@example.com",
      };
      setTimeout(() => setUserData(fakeUser), 300);
    };
    fetchUser();
  }, [user]);

  const handleAction = (action) => {
    if (action === "logout") {
      logout();
      navigate("/auth");
    } else if (action === "profile") {
      navigate("/profile");
    } else if (action === "dashboard") {
      navigate("/dashboard");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Chào, {userData?.name || "Người dùng"}!
                </p>
                <p className="text-sm text-gray-500">
                  {userData?.email || "Đang tải..."}
                </p>
              </div>
            </div>
          </div>

          {/* Menu chính */}
          <div className="py-2">
            {MENU_ITEMS.map(({ label, icon: Icon, action }, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className="w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 mr-3 text-gray-600" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Footer - System links */}
          <div className="border-t border-gray-100 py-2">
            {SYSTEM_ITEMS.map(({ label, icon: Icon, color, action }, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className={`w-full px-4 py-2 flex items-center text-left hover:bg-gray-50 transition-colors ${
                  color || "text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
