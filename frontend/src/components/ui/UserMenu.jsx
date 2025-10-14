import React, { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import ProfileCard from "./ProfileCard";
import { useAuth } from "../../context/AuthContext";
const UserMenu = () => {
  const { user } = useAuth(); // lấy user từ AuthContext
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
    };

    if (showProfileCard) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileCard]);

  // Nếu chưa đăng nhập → không render gì cả
  if (!user) return null;

  return (
    <div className="relative" ref={profileRef}>
      <button
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition hover:text-secondary relative"
        onClick={() => setShowProfileCard((prev) => !prev)}
        aria-label="User menu"
      >
        <User
          size={28}
          className={`transition-colors ${
            showProfileCard ? "text-green-500" : "hover:text-green-500"
          }`}
        />
      </button>

      {/* Profile card (dropdown user info) */}
      {showProfileCard && <ProfileCard />}
    </div>
  );
};

export default UserMenu;
