import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import logo from "../../assets/logo/LOGO2.png";

// Optimized LoadingModal:
// - Use portal to avoid layout thrashing inside parent
// - Use CSS animation (Tailwind) for the spinner to reduce JS work
// - Reduce heavy drop-shadows and sizes for better performance
// - Prevent body scroll while modal is open
// - Memoize (React.memo) at export to avoid unnecessary re-renders
function LoadingModal({ isOpen }) {
  // Lock body scroll while modal is open (hook must run unconditionally)
  useEffect(() => {
    if (!isOpen) return; // no-op when closed
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  // Don't render anything when closed
  if (!isOpen) return null; // 🔒 Không hiển thị khi isOpen = false

  // Modal content (rendered into portal)
  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
      {/* Modal chính */}
      <div className="relative w-44 h-44 rounded-full bg-white shadow-lg flex items-center justify-center">
        {/* Hiệu ứng loading xoay quanh - use Tailwind's animate with custom timing to reduce JS animation */}
        <div
          className="absolute inset-0 border-4 border-t-transparent border-orange-500 rounded-full will-change-transform animate-[spin_1.5s_linear_infinite]"
          style={{ transformOrigin: "50% 50%" }}
        />

        {/* Logo ở giữa - lighter shadow and async decoding to reduce initial jank */}
        <img
          src={logo}
          alt="Logo"
          className="w-30 h-30 drop-shadow-md transition-opacity duration-200"
          decoding="async"
          loading="eager"
        />
      </div>
    </div>
  );

  // Render to body to isolate from parent's layout and CSS
  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
}

export default React.memo(LoadingModal);
