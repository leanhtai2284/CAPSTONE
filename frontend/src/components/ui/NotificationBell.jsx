import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { useAuth } from "../../hooks/useAuth";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const { user } = useAuth();

  // Load notifications khi user đã đăng nhập
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await notificationService.getMyNotifications();
        if (isMounted && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error("Không thể tải thông báo", err);
      }
    };

    loadNotifications();

    // SSE: listen for incoming notifications for realtime updates
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
    let es;
    if (token) {
      try {
        es = new EventSource(
          `${API_BASE}/api/notifications/stream?token=${token}`
        );

        es.addEventListener("notification", (e) => {
          try {
            const data = JSON.parse(e.data);
            // prepend new notification
            setNotifications((prev) => [data, ...prev]);
          } catch (err) {
            console.error("Failed parsing SSE notification", err);
          }
        });

        // optional connected event
        es.addEventListener("connected", () => {
          // console.log('SSE connected');
        });
      } catch (err) {
        console.error("EventSource error", err);
      }
    }

    return () => {
      isMounted = false;
      if (es) es.close();
    };
  }, [user]);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (!nextOpen) return;
    if (!notifications.length) return;

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
    if (!unreadIds.length) return;

    try {
      await notificationService.markAsRead(unreadIds);
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n._id) ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Không thể đánh dấu đã đọc", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotifications([id]);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Không thể xóa thông báo", err);
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 text-gray-600 transition hover:text-secondary relative"
        onClick={handleToggle}
      >
        <Bell size={28} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? "99+" : unreadCount}
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
                  key={n._id}
                  className="flex justify-between items-start gap-2 p-3 text-sm hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-700"
                >
                  <div className="flex-1 cursor-pointer">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {n.title || "Thông báo"}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {n.message}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {n.createdAt &&
                        new Date(n.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="text-xs text-red-500 hover:text-red-600 px-1"
                    title="Xóa thông báo"
                  >
                    ✕
                  </button>
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
