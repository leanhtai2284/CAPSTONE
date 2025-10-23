import React, { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileCard from "./ProfileCard";
import Button from "./Button";
import { useAuth } from "../../hooks/useAuth";

const UserMenu = () => {
  const { user } = useAuth(); //  Gọi hook bên trong component
  const isLoggedIn = !!user;
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileCard]);

  if (!isLoggedIn) {
    return (
      <div className="flex gap-2">
        <Button to="/auth">Đăng ký ngay!</Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={profileRef}>
      <button
        className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 text-gray-600 transition`}
        onClick={() => setShowProfileCard((prev) => !prev)}
      >
        <User
          size={30}
          className={`transition-colors hover:text-secondary ${
            showProfileCard ? "text-secondary" : ""
          }`}
        />
      </button>
      {showProfileCard && <ProfileCard />}
    </div>
  );
};

export default UserMenu;
