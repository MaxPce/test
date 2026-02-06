import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface GradientCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  gradient?: "blue" | "purple" | "emerald" | "amber" | "red";
  children?: ReactNode;
  onClick?: () => void;
}

export function GradientCard({
  title,
  description,
  icon: Icon,
  gradient = "blue",
  children,
  onClick,
}: GradientCardProps) {
  const gradients = {
    blue: "from-blue-600 to-blue-700",
    purple: "from-purple-600 to-purple-700",
    emerald: "from-emerald-600 to-emerald-700",
    amber: "from-amber-600 to-amber-700",
    red: "from-red-600 to-red-700",
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[gradient]} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            {description && (
              <p className="text-white/80 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {Icon && (
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
    </div>
  );
}
