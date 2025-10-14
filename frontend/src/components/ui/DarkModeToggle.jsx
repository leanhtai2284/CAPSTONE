import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      // Ưu tiên localStorage
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      // Nếu chưa có thì check system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return darkMode ? (
    <button
      onClick={handleToggleTheme}
      title="Chế độ sáng"
      className="flex items-center justify-center w-11 h-11 rounded-full 
               bg-gray-100  text-yellow-400 hover:text-yellow-300 
               hover:bg-gray-200  shadow-sm hover:shadow transition-all duration-200"
    >
      <FaSun size={22} />
    </button>
  ) : (
    <button
      onClick={handleToggleTheme}
      title="Chế độ tối"
      className="flex items-center justify-center w-10 h-10 rounded-full 
               bg-gray-100  text-gray-600 dark:text-gray-300 
               hover:text-blue-400 hover:bg-gray-200 
               shadow-sm hover:shadow transition-all duration-200"
    >
      <FaMoon size={22} />
    </button>
  );
};

export default DarkModeToggle;
