import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

  // Fake socket: mỗi 10 giây thêm 1 thông báo mới
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        message: `Món ăn mới được thêm vào lúc ${new Date().toLocaleTimeString()}`,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }, 3000000);

    return () => clearInterval(interval);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 text-gray-600 transition hover:text-secondary relative"
        onClick={() => setOpen(!open)}
      >
        <Bell size={28} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold ring-2 ring-white dark:ring-gray-900">
            {notifications.length > 99 ? "99+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2 font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700">
            Thông báo
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-3 text-sm text-gray-500 text-center">
                Không có thông báo nào
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className="p-3 text-sm hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {n.message}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
export default NotificationBell;
