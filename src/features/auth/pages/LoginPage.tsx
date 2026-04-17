import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useLogin } from "../api/auth.mutations";
import { Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const from = (location.state as any)?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ username, password });
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 relative">

      <div className="w-full max-w-md relative z-10">

        {/* Logos header */}
        <div className="text-center mb-8">

          {/* Logo FEDUP — institución organizadora */}
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-xl shadow-sm px-5 py-3">
              <img
                src="/fedup_brand.png"
                alt="FEDUP"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Separador con texto */}
          <div className="flex items-center gap-3 px-8 mb-4">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              powered by
            </span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>

          {/* Logo Haylli's — el sistema */}
          <Link to="/" className="inline-block group">
            <div className="bg-white rounded-xl shadow-sm px-5 py-3 group-hover:shadow-md transition-shadow duration-200">
              <img
                src="/hayllis.png"
                alt="Haylli's Software Deportivo"
                className="h-14 w-auto object-contain mx-auto group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          </Link>

        </div>

        {/* Card de login con glassmorphism */}
        <div className="glass rounded-2xl shadow-strong border border-white/20 p-8 backdrop-blur-xl animate-slide-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Bienvenido
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Ingrese sus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Recordarme y olvidé contraseña */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                  Recordarme
                </span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Error message */}
            {login.isError && (
              <div className="flex items-start gap-3 p-4 text-sm text-red-800 bg-red-50 border-2 border-red-200 rounded-xl animate-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error de autenticación</p>
                  <p className="text-red-700 mt-0.5">
                    Credenciales inválidas. Por favor, intente nuevamente.
                  </p>
                </div>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={login.isPending}
              className="group relative w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              {/* Efecto de brillo */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              {login.isPending ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 relative">
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          
        </div>

      </div>
    </div>
  );
}