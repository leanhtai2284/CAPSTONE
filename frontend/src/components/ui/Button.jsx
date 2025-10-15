import React from "react";
import { Link } from "react-router-dom";

export default function Button({
  to,
  onClick,
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled = false,
  type = "button", // ✅ thêm type mặc định để tránh submit form ngoài ý muốn
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold select-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // 🎨 Các kiểu nút (variant)
  const variants = {
    primary: `
      bg-[var(--color-primary)]
      text-black
      hover:brightness-110
      dark:bg-[var(--color-primary)]
      dark:text-gray-100
      focus:ring-[var(--color-primary)]
    `,
    secondary: `
      bg-[var(--color-secondary)]
      text-black
      hover:brightness-110
      dark:bg-[var(--color-secondary)]
      dark:text-gray-100
      focus:ring-[var(--color-secondary)]
    `,
    outline: `
      border-2 border-[var(--color-primary)]
      text-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-black
      dark:border-[var(--color-primary)]
      dark:text-[var(--color-primary)]
      dark:hover:bg-[var(--color-primary)] dark:hover:text-black
      focus:ring-[var(--color-primary)]
    `,
    ghost: `
      bg-transparent text-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-black
      focus:ring-[var(--color-primary)]
    `,
    danger: `
      bg-red-500 text-white hover:bg-red-400
      dark:bg-red-600 dark:hover:bg-red-500
      focus:ring-red-500
    `,
  };

  // 📏 Kích thước
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // ✨ Gộp class Tailwind (gọn, không dùng clsx)
  const classes = `
    ${base}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${
      disabled
        ? "opacity-60 cursor-not-allowed"
        : "hover:scale-[1.02] active:scale-[0.98]"
    }
    shadow-sm hover:shadow-md
    ${className}
  `;

  // 📦 Nội dung
  const content = (
    <>
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </>
  );

  // 🔗 Nếu có `to`, render Link (và chặn click nếu disabled)
  if (to && !disabled) {
    return (
      <Link to={to} className={classes.trim()} {...rest}>
        {content}
      </Link>
    );
  }

  // 🧭 Còn lại thì là button
  return (
    <button
      type={type}
      onClick={!disabled ? onClick : undefined}
      className={classes.trim()}
      disabled={disabled}
      {...rest}
    >
      {content}
    </button>
  );
}
