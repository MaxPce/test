import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({
  title,
  description,
  showBack = false,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8 animate-in">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm mb-4">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {crumb.href ? (
                <button
                  onClick={() => navigate(crumb.href!)}
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-400 font-medium">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <span className="text-slate-300">/</span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 transition-all hover:shadow-soft"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
              {title}
            </h1>
            {description && (
              <p className="text-slate-600 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
