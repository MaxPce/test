import { Menu, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useLogout } from "@/features/auth/api/auth.mutations";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white border-b border-slate-200 fixed w-full z-50 top-0 left-0 shadow-sm">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition lg:hidden flex-shrink-0"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  FormatoSoft
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="relative ml-3 flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-500 capitalize truncate">
                  {user?.role}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {user?.username}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md capitalize">
                      {user?.role}
                    </span>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
