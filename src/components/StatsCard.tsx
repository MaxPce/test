import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "emerald" | "purple" | "amber" | "red";
  description?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  description,
}: StatsCardProps) {
  const colors = {
    blue: {
      gradient: "from-blue-600 to-blue-700",
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-500/20",
    },
    emerald: {
      gradient: "from-emerald-600 to-emerald-700",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "ring-emerald-500/20",
    },
    purple: {
      gradient: "from-purple-600 to-purple-700",
      bg: "bg-purple-50",
      text: "text-purple-700",
      ring: "ring-purple-500/20",
    },
    amber: {
      gradient: "from-amber-600 to-amber-700",
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "ring-amber-500/20",
    },
    red: {
      gradient: "from-red-600 to-red-700",
      bg: "bg-red-50",
      text: "text-red-700",
      ring: "ring-red-500/20",
    },
  };

  const colorScheme = colors[color];

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 card-glow overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorScheme.gradient} opacity-5 rounded-full blur-3xl -translate-y-8 translate-x-8`}></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>

          {/* Icon con gradiente */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Trend o Description */}
        {trend && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-bold">
                {Math.abs(trend.value)}%
              </span>
            </div>
            <span className="text-sm text-slate-500">vs mes anterior</span>
          </div>
        )}

        {description && !trend && (
          <p className="text-sm text-slate-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}
