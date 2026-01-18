import { Card, CardBody } from "./ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "yellow" | "red";
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "blue",
}: StatsCardProps) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      gradient: "from-green-500 to-green-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      gradient: "from-yellow-500 to-yellow-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      gradient: "from-red-500 to-red-600",
    },
  };

  return (
    <Card hover>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

            {trend && (
              <div className="mt-2 flex items-center gap-1.5">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-sm text-slate-500">vs. anterior</span>
              </div>
            )}
          </div>

          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${colors[color].gradient} shadow-md`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
