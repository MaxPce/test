import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { type ReactNode } from "react";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  icon,
}: AlertProps) {
  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      icon: "text-blue-600",
      defaultIcon: <Info className="h-5 w-5" />,
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: "text-emerald-600",
      defaultIcon: <CheckCircle2 className="h-5 w-5" />,
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: "text-amber-600",
      defaultIcon: <AlertCircle className="h-5 w-5" />,
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      icon: "text-red-600",
      defaultIcon: <XCircle className="h-5 w-5" />,
    },
  };

  const config = variants[variant];

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-xl border-2 ${config.container} animate-in`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.icon}`}>
        {icon || config.defaultIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-bold mb-1">{title}</h4>
        )}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${config.icon}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
