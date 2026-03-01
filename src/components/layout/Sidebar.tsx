import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Settings,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface NavItem {
  to?: string;
  icon: React.ReactNode;
  label: string;
  requiredRoles?: ("admin" | "moderator")[];
  children?: SubNavItem[];
  badge?: string;
}

interface SubNavItem {
  to: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    to: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    label: "Deportes",
    children: [
      { to: "/admin/sports", label: "Deportes" },
      { to: "/admin/sports/types", label: "Tipos de Deportes" },
      { to: "/admin/sports/categories", label: "Categorías" },
    ],
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Instituciones",
    children: [
      { to: "/admin/institutions", label: "Instituciones" },
      { to: "/admin/institutions/athletes", label: "Atletas" },
    ],
  },
  {
    to: "/admin/companies",
    icon: <Building2 className="h-5 w-5" />,
    label: "Organizaciones",
  },
  {
    to: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    label: "Configuración",
    requiredRoles: ["admin"],
  },
];

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const { hasPermission } = useAuthStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Deportes",
    "Instituciones",
  ]);

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => location.pathname === child.to,
        );
        if (isChildActive && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requiredRoles) return true;
    return hasPermission(item.requiredRoles);
  });

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname === child.to);
  };

  return (
    <>
      {/* Overlay móvil con blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 z-30
          glass border-r border-white/20 shadow-strong
          transition-all duration-300 overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-16 w-72" : "w-72"}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="hidden lg:flex items-center justify-end px-2 py-2 border-b border-white/20">
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navegación scrollable */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 no-scrollbar">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const isParentActive = hasActiveChild(item);

                return (
                  <li key={item.label}>
                    {item.children ? (
                      <div>
                        {/* Ítem con submenú */}
                        <button
                          onClick={() => {
                            if (!isCollapsed) toggleExpanded(item.label);
                          }}
                          title={isCollapsed ? item.label : undefined}
                          className={`
                            flex items-center w-full px-3 py-3 rounded-xl
                            text-sm font-semibold transition-all group
                            ${
                              isParentActive
                                ? "bg-blue-50/80 text-blue-700"
                                : "text-slate-700 hover:bg-white/60 hover:text-slate-900"
                            }
                            ${isCollapsed ? "justify-center" : "justify-between"}
                          `}
                        >
                          <div
                            className={`flex items-center ${
                              isCollapsed ? "" : "gap-3"
                            }`}
                          >
                            <span
                              className={`flex-shrink-0 transition-colors ${
                                isParentActive
                                  ? "text-blue-600"
                                  : "text-slate-600 group-hover:text-blue-600"
                              }`}
                            >
                              {item.icon}
                            </span>
                            {!isCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </div>
                          {!isCollapsed && (
                            <ChevronDown
                              className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform ${
                                expandedItems.includes(item.label)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          )}
                        </button>

                        {/* Subítems — ocultos cuando está colapsado */}
                        {!isCollapsed && expandedItems.includes(item.label) && (
                          <ul className="mt-1 ml-9 space-y-1 animate-slide-down">
                            {item.children.map((child) => (
                              <li key={child.to}>
                                <NavLink
                                  to={child.to}
                                  end
                                  onClick={() => onClose()}
                                  className={({ isActive }) =>
                                    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                      isActive
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                                    }`
                                  }
                                >
                                  {child.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      /* Ítem simple sin submenú */
                      <NavLink
                        to={item.to!}
                        end
                        onClick={() => onClose()}
                        title={isCollapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-3 rounded-xl
                          text-sm font-semibold transition-all group
                          ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : "text-slate-700 hover:bg-white/60 hover:text-slate-900"
                          }
                          ${isCollapsed ? "justify-center" : "gap-3"}`
                        }
                      >
                        <span className="flex-shrink-0 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div
            className={`border-t border-white/20 bg-gradient-to-r from-slate-50/50 to-blue-50/30 transition-all duration-300 ${
              isCollapsed ? "p-2" : "p-4"
            }`}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                <span className="text-xs font-bold text-slate-600">FS</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-slate-600 font-bold">FormatoSoft</p>
                <p className="text-xs text-slate-400 mt-0.5">v1.0.0 • 2026</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
