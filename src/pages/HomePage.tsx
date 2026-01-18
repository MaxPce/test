import { Link } from "react-router-dom";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Shield, ChevronRight } from "lucide-react";

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header profesional */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">FormatoSoft</h1>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Sistema de Gestión de
              <span className="block text-blue-600 mt-2">
                Competencias Deportivas
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              Plataforma profesional para la administración integral de eventos
              deportivos, atletas, instituciones y resultados en tiempo real.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <div className="text-center">
                  <p className="mb-6 text-slate-700">
                    Bienvenido,{" "}
                    <span className="font-semibold">{user?.fullName}</span>
                  </p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                  >
                    Acceder al Panel
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
                  Iniciar Sesión
                  <ChevronRight className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Features grid */}
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: "Gestión Integral",
                desc: "Control completo de eventos y competencias",
              },
              {
                title: "Resultados en Tiempo Real",
                desc: "Actualizaciones instantáneas de marcadores",
              },
              {
                title: "Reportes Detallados",
                desc: "Análisis y estadísticas profesionales",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
