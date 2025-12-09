import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/logo/LOGO2.png";
import DarkModeToggle from "../ui/DarkModeToggle";
import UserMenu from "../ui/UserMenu";
import SearchBar from "../ui/SearchBar";
import NotificationBell from "../ui/NotificationBell";
import MailDropdown from "../ui/MailDropdown";
import { useAuth } from "../../hooks/useAuth";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation(); // 🔥 Lấy đường dẫn hiện tại
  const { user } = useAuth(); // Get user info

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Hàm kiểm tra đang ở trang nào
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-lg text-gray-950 dark:text-gray-100 shadow-md transition-colors duration-300 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              window.location.reload();
            }
          }}
          className="flex items-center h-14 space-x-2"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-full w-auto object-contain scale-150 md:scale-200"
          />
          <span className="hidden md:inline text-2xl font-bold whitespace-nowrap">
            <span className="text-red-600">Smart</span>
            <span className="text-red-600">Meal</span>
            <span className="text-yellow-300">VN</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex flex-1 justify-center space-x-6 text-gray-600 dark:text-gray-300 text-nowrap">
          <Link
            to="/"
            className={`p-3 font-semibold text-xl font-serif rounded-lg transition-all ${
              isActive("/")
                ? "bg-green-400 text-white dark:bg-green-400 shadow-md"
                : "hover:text-green-500"
            }`}
          >
            Trang Chủ
          </Link>
          <Link
            to="/foryou"
            className={`p-3 font-semibold text-xl font-serif rounded-lg transition-all ${
              isActive("/foryou")
                ? "bg-green-400 text-white dark:bg-green-400 shadow-md"
                : "hover:text-green-500"
            }`}
          >
            Dành Cho Bạn
          </Link>
          <Link
            to="/news"
            className={`p-3 font-semibold text-xl font-serif rounded-lg transition-all ${
              isActive("/news")
                ? "bg-yellow-400 text-black dark:bg-yellow-500 shadow-md"
                : "hover:text-green-500"
            }`}
          >
            Tin tức
          </Link>
          {/* Admin link - only show if user is admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`p-3 font-semibold text-xl font-serif rounded-lg transition-all ${
                location.pathname.startsWith("/admin")
                  ? "bg-green-400 text-white dark:bg-green-400 shadow-md"
                  : "hover:text-green-500"
              }`}
            >
              Quản Trị Viên
            </Link>
          )}
        </nav>

        {/* Right side (Desktop) */}
        <div className="hidden md:flex items-center space-x-4 text-gray-600 dark:text-gray-300">
          <SearchBar />
          <DarkModeToggle />
          <NotificationBell />
          <MailDropdown />
          <UserMenu />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex items-center p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/70 transition"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Card */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 w-full px-4 pb-4 md:hidden animate-slideDown"
        >
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 mt-2 backdrop-blur-md">
            {/* Search */}
            <div className="mb-3">
              <SearchBar />
            </div>

            {/* Nav Links */}
            <div className="flex flex-col space-y-2 mb-3 text-nowrap">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-lg font-semibold transition  ${
                  isActive("/")
                    ? "bg-green-400 text-white dark:bg-green-500 shadow-md"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Trang Chủ
              </Link>
              <Link
                to="/foryou"
                onClick={() => setMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-lg font-semibold transition ${
                  isActive("/foryou")
                    ? "bg-yellow-400 text-black dark:bg-yellow-500 shadow-md"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Dành Cho Bạn
              </Link>
              <Link
                to="/news"
                onClick={() => setMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-lg font-semibold transition ${
                  isActive("/news")
                    ? "bg-yellow-400 text-black dark:bg-yellow-500 shadow-md"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Tin tức
              </Link>
              {/* Admin link in mobile menu */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 rounded-lg text-lg font-semibold transition ${
                    location.pathname.startsWith("/admin")
                      ? "bg-green-400 text-white dark:bg-green-500 shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Quản Trị Viên
                </Link>
              )}
            </div>

            {/* Icons */}
            <div className="flex justify-around items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <DarkModeToggle />
              <NotificationBell />
              <MailDropdown />
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
