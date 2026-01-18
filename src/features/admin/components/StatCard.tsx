import { Card, CardBody } from "@/components/ui/Card";
import type { LucideProps } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<LucideProps>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "indigo";
}

const colorClasses = {
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
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    gradient: "from-indigo-500 to-indigo-600",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatCardProps) {
  return (
    <Card hover className="overflow-hidden">
      <CardBody className="relative">
        {/* Decorative gradient background */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${colorClasses[color].gradient}`}
          ></div>
        </div>

        <div className="flex items-start justify-between relative">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

            {trend && (
              <div className="mt-3 flex items-center gap-1.5">
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
                <span className="text-sm text-slate-500">vs. mes anterior</span>
              </div>
            )}
          </div>

          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color].gradient} shadow-lg`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
