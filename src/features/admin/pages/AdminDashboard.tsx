import { Calendar, Trophy, Users, Medal } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al panel de administración
        </p>
      </div>

      {/* Stats Grid */}
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
        <StatCard title="Competencias" value={32} icon={Medal} color="yellow" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Eventos Recientes
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <EventItem
                title="Campeonato Nacional 2026"
                status="En Curso"
                date="15 - 17 Mar"
              />
              <EventItem
                title="Torneo Regional Lima"
                status="Programado"
                date="22 - 24 Mar"
              />
              <EventItem
                title="Copa Juvenil"
                status="Finalizado"
                date="8 - 10 Mar"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Accesos Rápidos
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                label="Crear Evento"
                icon={<Calendar className="h-5 w-5" />}
              />
              <QuickActionButton
                label="Nuevo Deporte"
                icon={<Trophy className="h-5 w-5" />}
              />
              <QuickActionButton
                label="Registrar Atleta"
                icon={<Users className="h-5 w-5" />}
              />
              <QuickActionButton
                label="Nueva Competencia"
                icon={<Medal className="h-5 w-5" />}
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
    "En Curso": "bg-green-100 text-green-800",
    Programado: "bg-blue-100 text-blue-800",
    Finalizado: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
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
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="text-blue-600 mb-2">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}
