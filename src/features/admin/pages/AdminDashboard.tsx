import { Link } from "react-router-dom";
import {
  Calendar,
  Trophy,
  Users,
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  Medal,
  Clock,
  Sparkles,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { GradientCard } from "@/components/ui/GradientCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function AdminDashboard() {
  // Datos de ejemplo - estos vendrían de tu API
  const stats = [
    {
      title: "Eventos Activos",
      value: "12",
      icon: Calendar,
      trend: { value: 8, isPositive: true },
      color: "blue" as const,
    },
    {
      title: "Total Atletas",
      value: "1,248",
      icon: Users,
      trend: { value: 12, isPositive: true },
      color: "emerald" as const,
    },
    {
      title: "Instituciones",
      value: "45",
      icon: Building2,
      trend: { value: 5, isPositive: true },
      color: "purple" as const,
    },
    {
      title: "Deportes",
      value: "28",
      icon: Trophy,
      trend: { value: 2, isPositive: false },
      color: "amber" as const,
    },
  ];

  const recentEvents = [
    {
      title: "Juegos Deportivos Nacionales 2026",
      status: "En Curso",
      date: "15 Feb - 25 Feb 2026",
      participants: 450,
    },
    {
      title: "Campeonato Regional de Atletismo",
      status: "Programado",
      date: "1 Mar - 5 Mar 2026",
      participants: 280,
    },
    {
      title: "Copa Intercolegiada de Fútbol",
      status: "En Curso",
      date: "10 Feb - 20 Feb 2026",
      participants: 320,
    },
  ];

  const quickActions = [
    {
      label: "Crear Evento",
      icon: <Calendar className="h-6 w-6" />,
      href: "/admin/events",
      color: "blue" as const,
    },
    {
      label: "Registrar Atleta",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/institutions/athletes",
      color: "emerald" as const,
    },
    {
      label: "Agregar Deporte",
      icon: <Trophy className="h-6 w-6" />,
      href: "/admin/sports",
      color: "purple" as const,
    },
    {
      label: "Nueva Institución",
      icon: <Building2 className="h-6 w-6" />,
      href: "/admin/institutions",
      color: "amber" as const,
    },
  ];

  const recentActivity = [
    {
      action: "Nueva inscripción",
      description: "Juan Pérez se inscribió en Natación 100m",
      time: "Hace 5 min",
      icon: <Users className="h-4 w-4" />,
      color: "blue",
    },
    {
      action: "Resultado registrado",
      description: "Final de Atletismo 200m completada",
      time: "Hace 15 min",
      icon: <Medal className="h-4 w-4" />,
      color: "emerald",
    },
    {
      action: "Evento actualizado",
      description: "Horarios del Campeonato Regional modificados",
      time: "Hace 1 hora",
      icon: <Clock className="h-4 w-4" />,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-8 animate-in">
      {/* Header premium con gradiente */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-purple-600 rounded-2xl shadow-strong p-8 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-16 -translate-x-16"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Panel de Control</h1>
              <p className="text-blue-100 text-sm font-medium">
                FormatoSoft • Sistema de Gestión Deportiva
              </p>
            </div>
          </div>
          <p className="text-white/90 text-lg max-w-2xl mt-4">
            Bienvenido al centro de administración. Gestione eventos, atletas e
            instituciones desde aquí.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Acciones Rápidas
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Accesos directos a funciones principales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.href}>
              <QuickActionCard {...action} />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Eventos Recientes
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Competencias activas y próximas
                  </p>
                </div>
                <Link
                  to="/admin/events"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {recentEvents.map((event, idx) => (
                  <EventCard key={idx} {...event} />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Actividad Reciente
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <ActivityItem key={idx} {...activity} />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradientCard
          title="Rendimiento del Sistema"
          description="Estadísticas y métricas de uso de la plataforma"
          icon={BarChart3}
          gradient="blue"
        >
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm font-medium mb-1">
                Eventos este mes
              </p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm font-medium mb-1">
                Nuevos atletas
              </p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard
          title="Alertas y Notificaciones"
          description="Información importante que requiere atención"
          icon={AlertCircle}
          gradient="amber"
        >
          <div className="space-y-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <p className="text-white text-sm font-medium flex-1">
                3 eventos pendientes de aprobación
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <p className="text-white text-sm font-medium flex-1">
                12 inscripciones por validar
              </p>
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}

// Helper Components
function QuickActionCard({
  label,
  icon,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "purple" | "amber";
}) {
  const colors = {
    blue: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
    emerald:
      "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
    purple:
      "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
    amber:
      "from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800",
  };

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${colors[color]} rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}
    >
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
    </div>
  );
}

function EventCard({
  title,
  status,
  date,
  participants,
}: {
  title: string;
  status: string;
  date: string;
  participants: number;
}) {
  const statusConfig = {
    "En Curso": { color: "success", dot: true },
    Programado: { color: "primary", dot: false },
    Finalizado: { color: "default", dot: false },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig["Programado"];

  return (
    <div className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-all cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
          {title}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {date}
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {participants} participantes
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <Badge variant={config.color as any} dot={config.dot}>
          {status}
        </Badge>
      </div>
    </div>
  );
}

function ActivityItem({
  action,
  description,
  time,
  icon,
  color,
}: {
  action: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{action}</p>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
