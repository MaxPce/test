import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  Medal,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to?: string;
  icon: React.ReactNode;
  label: string;
  requiredRoles?: ("admin" | "moderator")[];
  children?: SubNavItem[];
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
    to: "/admin/events",
    icon: <Calendar className="h-5 w-5" />,
    label: "Eventos",
  },

  {
    to: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    label: "Configuración",
    requiredRoles: ["admin"],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasPermission } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Deportes",
    "Instituciones",
  ]);

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

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - starts below navbar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 shadow-lg lg:shadow-none overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Navigation - scrollable */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 transition-transform ${
                            expandedItems.includes(item.label)
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                      {expandedItems.includes(item.label) && (
                        <ul className="mt-1 ml-9 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.to}>
                              <NavLink
                                to={child.to}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                    <NavLink
                      to={item.to!}
                      end={item.to === "/admin"}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer - fixed at bottom */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <p className="text-xs text-slate-500 text-center font-medium">
              FormatoSoft v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
