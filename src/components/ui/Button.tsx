import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "ghost"
    | "outline"
    | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      icon,
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-soft active:scale-[0.98] relative overflow-hidden group";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 hover:shadow-medium",
      secondary:
        "bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 hover:shadow-medium",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 hover:shadow-medium",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-medium",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400 shadow-none",
      outline:
        "bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500",
      gradient:
        "bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 text-white hover:shadow-glow-blue focus:ring-blue-500 bg-size-200 hover:bg-pos-0",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {/* Efecto de brillo al hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && icon && <span>{icon}</span>}
        <span className="relative">{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
