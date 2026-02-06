import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: "default" | "modern" | "glass";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      variant = "default",
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400";

    const variants = {
      default:
        "bg-white border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300",
      modern:
        "bg-slate-50 border-2 border-transparent text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 hover:bg-slate-100/50",
      glass:
        "bg-white/50 backdrop-blur-sm border-2 border-white/20 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20",
    };

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    const iconPadding = icon ? "pl-11" : "";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${errorStyles} ${iconPadding} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 font-medium animate-in">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
