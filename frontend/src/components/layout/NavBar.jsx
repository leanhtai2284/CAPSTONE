import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "../../assets/logo/LOGO2.png";
import DarkModeToggle from "../ui/DarkModeToggle";
import UserMenu from "../ui/UserMenu";
import SearchBar from "../ui/SearchBar";
import NotificationBell from "../ui/NotificationBell";
import MailDropdown from "../ui/MailDropdown";
import { useAuth } from "../../hooks/useAuth";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [forYouOpen, setForYouOpen] = useState(false);
  const menuRef = useRef(null);
  const forYouRef = useRef(null);
  const location = useLocation(); // 🔥 Lấy đường dẫn hiện tại
  const { user } = useAuth(); // Get user info

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (forYouRef.current && !forYouRef.current.contains(event.target)) {
        setForYouOpen(false);
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
                ? "bg-primary text-white shadow-md"
                : "hover:text-green-500"
            }`}
          >
            Trang Chủ
          </Link>

          <div ref={forYouRef} className="relative z-40">
            <button
              type="button"
              onClick={() => setForYouOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-2 font-semibold text-xl font-serif rounded-lg border border-transparent transition-all ${
                isActive("/foryou") ||
                isActive("/pantry") ||
                isActive("/groups") ||
                location.pathname.startsWith("/groups/")
                  ? "bg-primary text-white shadow-md"
                  : "hover:text-green-500 hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              Dành Cho Bạn
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  forYouOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <div
              aria-hidden={!forYouOpen}
              className={`absolute left-0 right-0 top-full mt-0 border-t border-gray-200 bg-white/80 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-neutral-900/80 z-50 transform-gpu transition-all duration-300 ease-out whitespace-normal ${
                forYouOpen
                  ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="w-full px-8 py-10">
                <div className="flex flex-row items-stretch gap-12">
                  <div
                    className={`flex-1 min-w-[180px] h-full space-y-3 rounded-xl border border-transparent bg-white/70 px-5 py-4 transition dark:bg-neutral-900/40 ${
                      isActive("/foryou")
                        ? "border-green-200 bg-green-100 text-green-800 dark:border-green-800/50 dark:bg-green-900/40 dark:text-green-100"
                        : "hover:border-green-200 hover:bg-green-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="text-lg font-semibold">Gợi ý thực đơn</div>
                    <Link
                      to="/foryou"
                      onClick={() => setForYouOpen(false)}
                      className="block text-sm"
                    >
                      Xem đề xuất thực đơn
                    </Link>
                  </div>
                  <div
                    className={`flex-1 min-w-[180px] h-full space-y-3 rounded-xl border border-transparent bg-white/70 px-5 py-4 transition dark:bg-neutral-900/40 ${
                      isActive("/pantry")
                        ? "border-green-200 bg-green-100 text-green-800 dark:border-green-800/50 dark:bg-green-900/40 dark:text-green-100"
                        : "hover:border-green-200 hover:bg-green-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="text-lg font-semibold">
                      Nguyên liệu có sẵn
                    </div>
                    <Link
                      to="/pantry"
                      onClick={() => setForYouOpen(false)}
                      className="block text-sm"
                    >
                      Quản lý tủ nguyên liệu
                    </Link>
                  </div>
                  <div
                    className={`flex-1 min-w-[180px] h-full space-y-3 rounded-xl border border-transparent bg-white/70 px-5 py-4 transition dark:bg-neutral-900/40 ${
                      isActive("/groups") ||
                      location.pathname.startsWith("/groups/")
                        ? "border-green-200 bg-green-100 text-green-800 dark:border-green-800/50 dark:bg-green-900/40 dark:text-green-100"
                        : "hover:border-green-200 hover:bg-green-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="text-lg font-semibold">Nhóm</div>
                    <Link
                      to="/groups"
                      onClick={() => setForYouOpen(false)}
                      className="block text-sm"
                    >
                      Lập nhóm và chia sẻ menu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/news"
            className={`p-3 font-semibold text-xl font-serif rounded-lg transition-all ${
              isActive("/news")
                ? "bg-primary text-white shadow-md"
                : "hover:text-green-500"
            }`}
          >
            Tin tức
          </Link>
          {/* Admin link - only show if user is admin */}
          {user?.role === "admin" && (
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Dành Cho Bạn
                </div>
                <Link
                  to="/foryou"
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 text-lg font-semibold transition ${
                    isActive("/foryou")
                      ? "bg-yellow-400 text-black dark:bg-yellow-500 shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Gợi ý thực đơn
                </Link>
                <Link
                  to="/pantry"
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 text-lg font-semibold transition ${
                    isActive("/pantry")
                      ? "bg-yellow-400 text-black dark:bg-yellow-500 shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Nguyên liệu có sẵn
                </Link>
                <Link
                  to="/groups"
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 text-lg font-semibold transition ${
                    isActive("/groups") ||
                    location.pathname.startsWith("/groups/")
                      ? "bg-yellow-400 text-black dark:bg-yellow-500 shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Nhóm
                </Link>
              </div>
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
              {user?.role === "admin" && (
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
