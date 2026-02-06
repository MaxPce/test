import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "gradient";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-semibold rounded-full transition-all duration-200";

  const variants = {
    default:
      "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
    primary:
      "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200",
    success:
      "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200",
    warning:
      "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200",
    danger:
      "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200",
    info: "bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200",
    gradient:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotColor: Record<typeof variant, string> = {
    default: "bg-slate-500",
    primary: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-sky-500",
    gradient: "bg-white",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor[variant]} animate-pulse`}
        />
      )}
      {children}
    </span>
  );
}
