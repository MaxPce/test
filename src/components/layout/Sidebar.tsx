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
      { to: "/admin/institutions/teams", label: "Equipos" },
    ],
  },
  {
    to: "/admin/events",
    icon: <Calendar className="h-5 w-5" />,
    label: "Eventos",
  },
  {
    to: "/admin/competitions",
    icon: <Medal className="h-5 w-5" />,
    label: "Competencias",
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
        : [...prev, label]
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-white border-r border-gray-200`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menú</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {filteredNavItems.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    // Item with submenu
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedItems.includes(item.label)
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                      {expandedItems.includes(item.label) && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.to}>
                              <NavLink
                                to={child.to}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                  `block px-3 py-2 rounded-md text-sm transition-colors ${
                                    isActive
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                    // Simple item
                    <NavLink
                      to={item.to!}
                      end={item.to === "/admin"}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              FormatoSoft v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
