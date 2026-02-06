interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" | "slate";
  label?: string;
}

export function Spinner({ size = "md", color = "blue", label }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colors = {
    blue: "text-blue-600",
    white: "text-white",
    slate: "text-slate-600",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizes[size]} rounded-full border-2 border-slate-200 animate-pulse`}
        ></div>
        {/* Inner spinner */}
        <svg
          className={`${sizes[size]} ${colors[color]} absolute inset-0 animate-spin`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {label && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
