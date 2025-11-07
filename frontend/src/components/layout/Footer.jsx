import React from "react";
import { Link } from "react-router-dom";
// Import các biểu tượng từ thư viện 'lucide-react'
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "../../assets/logo/LOGO1.png";

// --- 1. Component con: SocialIcon ---
// Dùng để hiển thị các icon mạng xã hộiS
const SocialIcon = ({ icon }) => (
  <a
    href="#"
    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-950 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 transition"
    aria-label="Social Media Link" // Thêm accessibility
  >
    {icon}
  </a>
);

// --- 2. Component con: FooterLink ---
// Dùng để hiển thị các liên kết trong Footer
const FooterLink = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="text-gray-800 dark:text-gray-300 hover:text-secondary transition"
    >
      {children}
    </a>
  </li>
);

// --- 3. Component Chính: Footer ---
const Footer = () => {
  return (
    <footer className=" dark:bg-black text-gray-900 dark:text-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1 & 2: Thông tin giới thiệu và Mạng xã hội */}
          <div className="col-span-1 md:col-span-2">
            {/* Logo và Tên Ứng dụng */}
            <div className="flex items-center mb-3 space-x-4 flex-1 basis-3/12 min-w-fit">
              <Link to="/">
                <div className="flex items-center space-x-0 h-16">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-20 w-auto object-contain scale-200 md:scale-225"
                  />
                  <span className="hidden md:inline text-2xl font-bold whitespace-nowrap ml-1">
                    <span className="text-red-600">Smart</span>
                    <span className="text-red-600">Meal</span>
                    <span className="text-yellow-300">VN</span>
                  </span>
                </div>
              </Link>
            </div>
            <p className=" mb-4 max-w-md ">
              Ứng dụng sử dụng AI để tư vấn bữa ăn thuần Việt, giúp bạn có những
              bữa ăn ngon, đầy đủ dinh dưỡng và phù hợp với khẩu vị cá nhân.
            </p>
            <div className="flex space-x-4">
              {/* Sử dụng component SocialIcon và truyền icon vào prop 'icon' */}
              <SocialIcon icon={<Facebook className="w-6 h-6" />} />
              <SocialIcon icon={<Instagram className="w-6 h-6" />} />
              <SocialIcon icon={<Twitter className="w-6 h-6" />} />
              <SocialIcon icon={<Youtube className="w-6 h-6" />} />
            </div>
          </div>

          {/* Cột 3: Liên kết */}
          <div>
            <h3 className="font-medium mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <FooterLink href="/">Trang chủ</FooterLink>
              <FooterLink href="/search">Tìm kiếm công thức</FooterLink>
              <FooterLink href="/my-recipes">Công thức của tôi</FooterLink>
              <FooterLink href="/saved-menus">Thực đơn đã lưu</FooterLink>
            </ul>
          </div>

          {/* Cột 4: Về chúng tôi */}
          <div>
            <h3 className="font-medium mb-4">Về chúng tôi</h3>
            <ul className="space-y-2">
              <FooterLink href="/about">Giới thiệu</FooterLink>
              <FooterLink href="/contact">Liên hệ</FooterLink>
              <FooterLink href="/privacy">Chính sách bảo mật</FooterLink>
              <FooterLink href="/terms">Điều khoản sử dụng</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© 2025 Smart VN Meal. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
