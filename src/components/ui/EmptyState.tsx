import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
          <Icon className="h-10 w-10 text-slate-400" />
        </div>
      )}
      
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-slate-600 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
