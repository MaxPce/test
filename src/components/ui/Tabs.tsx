import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Tab {
  label: string;
  to: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors`
            }
          >
            {tab.icon && <span className="mr-2 h-5 w-5">{tab.icon}</span>}
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
