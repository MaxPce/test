import {
  Calendar,
  Trophy,
  Users,
  Medal,
  Activity,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Panel de Control</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Bienvenido al sistema de gestión deportiva
        </p>
      </div>

      {/* Stats Grid mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Eventos Activos"
          value={5}
          icon={Calendar}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard title="Deportes" value={12} icon={Trophy} color="green" />
        <StatCard
          title="Atletas Registrados"
          value={248}
          icon={Users}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard title="Competencias" value={32} icon={Medal} color="indigo" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Eventos Recientes
                </h3>
              </div>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                Ver todos →
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <EventItem
                title="Campeonato Nacional 2026"
                status="En Curso"
                date="15 - 17 Ene"
              />
              <EventItem
                title="Torneo Regional Lima"
                status="Programado"
                date="22 - 24 Ene"
              />
              <EventItem
                title="Copa Juvenil"
                status="Finalizado"
                date="8 - 10 Ene"
              />
            </div>
          </CardBody>
        </Card>

        {/* Accesos Rápidos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Accesos Rápidos
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                label="Crear Evento"
                icon={<Calendar className="h-5 w-5" />}
                color="blue"
              />
              <QuickActionButton
                label="Nuevo Deporte"
                icon={<Trophy className="h-5 w-5" />}
                color="green"
              />
              <QuickActionButton
                label="Registrar Atleta"
                icon={<Users className="h-5 w-5" />}
                color="purple"
              />
              <QuickActionButton
                label="Nueva Competencia"
                icon={<Medal className="h-5 w-5" />}
                color="indigo"
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// Helper components
function EventItem({
  title,
  status,
  date,
}: {
  title: string;
  status: string;
  date: string;
}) {
  const statusColors = {
    "En Curso": "bg-green-100 text-green-800 border-green-200",
    Programado: "bg-blue-100 text-blue-800 border-blue-200",
    Finalizado: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer group">
      <div className="flex-1">
        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <p className="text-sm text-slate-500 mt-1">{date}</p>
      </div>
      <span
        className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
          statusColors[status as keyof typeof statusColors]
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function QuickActionButton({
  label,
  icon,
  color = "blue",
}: {
  label: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "indigo";
}) {
  const colors = {
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
    purple:
      "bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200",
    indigo:
      "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200",
  };

  return (
    <button
      className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all hover:shadow-md active:scale-95 ${colors[color]}`}
    >
      <div className="mb-3">{icon}</div>
      <span className="text-sm font-semibold text-center">{label}</span>
    </button>
  );
}
