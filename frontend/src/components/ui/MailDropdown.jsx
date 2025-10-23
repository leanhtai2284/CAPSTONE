import React, { useState, useRef } from "react";
import { Mail } from "lucide-react";

const FAKE_MAILS = [
  {
    id: 1,
    senderName: "Admin SmartMeal",
    preview: "Chào bạn, hệ thống vừa cập nhật món mới...",
    time: "2 phút trước",
  },
  {
    id: 2,
    senderName: "Chef Mai",
    preview: "Bạn đã thử món phở bò đặc biệt chưa?",
    time: "1 giờ trước",
  },
];

function MailDropdown() {
  const [open, setOpen] = useState(false);
  const mailRef = useRef(null);

  // Click ngoài đóng dropdown
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (mailRef.current && !mailRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={mailRef}>
      <button
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 text-gray-600 transition hover:text-secondary"
        onClick={() => setOpen(!open)}
      >
        <Mail size={30} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg z-50">
          <div className="p-3 font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700">
            Tin nhắn
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {FAKE_MAILS.length === 0 ? (
              <li className="p-3 text-sm text-gray-500 text-center">
                Không có tin nhắn
              </li>
            ) : (
              FAKE_MAILS.map((msg) => (
                <li
                  key={msg.id}
                  className="p-3 hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {msg.senderName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {msg.preview}
                  </div>
                  <div className="text-xs text-gray-400">{msg.time}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
export default MailDropdown;
