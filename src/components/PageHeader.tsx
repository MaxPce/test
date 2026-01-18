import { ReactNode } from "react";

interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
  gradient?: "blue" | "green" | "purple" | "red";
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  action,
  gradient = "blue",
}: PageHeaderProps) {
  const gradients = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    purple: "from-purple-600 to-purple-700",
    red: "from-red-600 to-red-700",
  };

  return (
    <div
      className={`bg-gradient-to-r ${gradients[gradient]} rounded-2xl shadow-lg p-6 text-white`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">
              {description}
            </p>
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
