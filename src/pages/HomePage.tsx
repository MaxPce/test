import { Link } from "react-router-dom";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  Shield,
  ChevronRight,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  const features = [
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Gestión Integral",
      description: "Control completo de eventos, deportes y competencias",
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Resultados en Tiempo Real",
      description: "Actualizaciones instantáneas de marcadores y posiciones",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Reportes Detallados",
      description: "Análisis y estadísticas profesionales automatizadas",
      color: "from-purple-600 to-purple-700",
    },
  ];

  const benefits = [
    "Gestión de múltiples eventos simultáneos",
    "Registro de atletas e instituciones",
    "Sistema de inscripciones automatizado",
    "Generación de horarios y fixtures",
    "Tablas de posiciones en vivo",
    "Exportación de reportes PDF",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header profesional con glassmorphism */}
      <header className="glass border-b border-white/20 shadow-soft sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FormatoSoft
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Gestión Deportiva Profesional
                </p>
              </div>
            </div>

            {isAuthenticated && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <span>Panel Admin</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero section mejorado */}
      <div className="container mx-auto px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          {/* Badge premium */}
          <div className="flex justify-center mb-8 animate-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                Plataforma Profesional de Gestión Deportiva
              </span>
            </div>
          </div>

          <div className="text-center animate-slide-up">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
              Sistema de Gestión de
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Competencias Deportivas
              </span>
            </h2>

            <p className="mt-8 text-lg sm:text-xl leading-relaxed text-slate-600 max-w-3xl mx-auto">
              Plataforma integral para la administración profesional de eventos
              deportivos, gestión de atletas, instituciones y resultados en
              tiempo real.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <div className="text-center w-full sm:w-auto animate-in">
                  <p className="mb-4 text-slate-700">
                    Bienvenido,{" "}
                    <span className="font-bold text-blue-600">
                      {user?.fullName}
                    </span>
                  </p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:-translate-y-1 group"
                  >
                    <span>Acceder al Panel</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:-translate-y-1 group"
                  >
                    <span>Iniciar Sesión</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                </>
              )}
            </div>
          </div>

          {/* Features grid con animaciones */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl border border-slate-200 p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 card-glow"
              >
                {/* Icono con gradiente */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Indicador de hover */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Todo lo que necesitas en una{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  sola plataforma
                </span>
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Potencia tu gestión deportiva con herramientas profesionales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-white font-semibold">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Eventos", icon: <Calendar /> },
                { value: "10K+", label: "Atletas", icon: <Users /> },
                { value: "100+", label: "Instituciones", icon: <Shield /> },
                { value: "50+", label: "Deportes", icon: <Trophy /> },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FormatoSoft</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 FormatoSoft. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
