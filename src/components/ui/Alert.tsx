import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import type { HTMLAttributes } from "react";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onClose?: () => void;
  closable?: boolean;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  closable = false,
  className = "",
  ...props
}: AlertProps) {
  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: "text-blue-900",
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-900",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: "text-green-900",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-900",
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      title: "text-yellow-900",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      title: "text-red-900",
    },
  };

  const config = variants[variant];

  return (
    <div
      className={`rounded-xl border p-4 ${config.container} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{config.icon}</div>

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-bold mb-1 ${config.title}`}>
              {title}
            </h3>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
