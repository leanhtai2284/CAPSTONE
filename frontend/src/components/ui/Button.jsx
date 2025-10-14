import React from "react";
import { Link } from "react-router-dom";

export default function Button({
  to,
  onClick,
  children,
  variant = "primary", // mặc định dùng màu primary
  size = "md",
  icon,
  className = "",
  disabled = false,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-full font-bold select-none transition-all duration-300";

  // Các kiểu nút (variant)
  const variants = {
    primary: `
      bg-[var(--color-primary)]
      text-black
      hover:brightness-110
      dark:bg-[var(--color-primary)]
      dark:text-gray-100
    `,
    secondary: `
      bg-[var(--color-secondary)]
      text-black
      hover:brightness-110
      dark:bg-[var(--color-secondary)]
      dark:text-gray-100
    `,
    outline: `
      border-2 border-[var(--color-primary)]
      text-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-black
      dark:text-[var(--color-primary)]
      dark:border-[var(--color-primary)]
      dark:hover:bg-[var(--color-primary)] dark:hover:text-black
    `,
    ghost: `
      bg-transparent text-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-black
    `,
    danger: `
      bg-red-500 text-white hover:bg-red-400
      dark:bg-red-600 dark:hover:bg-red-500
    `,
  };

  // Kích thước
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Gộp class thủ công
  const classes = `
    ${base}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${
      disabled
        ? "opacity-60 cursor-not-allowed"
        : "hover:scale-[1.05] active:scale-[0.97]"
    }
    shadow-sm hover:shadow-md
    ${className}
  `.replace(/\s+/g, " ");

  const content = (
    <>
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
