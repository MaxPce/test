import { useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Users,
  Building2,
  Grid3x3,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { GradientCard } from "@/components/ui/GradientCard";
import { useEvent } from "../api/events.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function EventOverviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(Number(eventId));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando información del evento..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">
          No se pudo cargar la información del evento
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDuration = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      programado: {
        variant: "primary" as const,
        label: "Programado",
        dot: true,
      },
      en_curso: {
        variant: "success" as const,
        label: "En Curso",
        dot: true,
      },
      finalizado: {
        variant: "default" as const,
        label: "Finalizado",
        dot: false,
      },
    };
    return configs[status as keyof typeof configs] || configs.programado;
  };

  const statusConfig = getStatusConfig(event.status);
  const logoUrl = event.logoUrl ? getImageUrl(event.logoUrl) : null;

  // Mock statistics - Reemplazar con datos reales de tu API
  const stats = {
    categories: event.eventCategories?.length || 0,
    sports: new Set(event.eventCategories?.map((ec) => ec.category?.sport?.sportId)).size || 0,
    participants: event.eventCategories?.reduce(
      (sum, ec) => sum + (ec.registrations?.length || 0),
      0
    ) || 0,
    institutions: new Set(
      event.eventCategories?.flatMap((ec) =>
        ec.registrations?.map((r) => r.athlete?.institutionId || r.team?.institutionId)
      )
    ).size || 0,
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header con logo del evento */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl shadow-strong p-8 text-white">
        {/* Background pattern */}
        {logoUrl && (
          <>
            <img
              src={logoUrl}
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        )}

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo */}
            {logoUrl && (
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm p-4 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={event.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">{event.name}</h1>
                <Badge variant={statusConfig.variant} dot={statusConfig.dot}>
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">
                    {formatShortDate(event.startDate)} - {formatShortDate(event.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {getDuration()} {getDuration() === 1 ? "día" : "días"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Deportes"
          value={stats.sports}
          icon={Trophy}
          color="blue"
          description="Deportes disponibles"
        />
        <StatsCard
          title="Categorías"
          value={stats.categories}
          icon={Grid3x3}
          color="emerald"
          description="Categorías totales"
        />
        <StatsCard
          title="Participantes"
          value={stats.participants}
          icon={Users}
          color="purple"
          description="Atletas inscritos"
        />
        <StatsCard
          title="Instituciones"
          value={stats.institutions}
          icon={Building2}
          color="amber"
          description="Instituciones registradas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información General */}
        <Card variant="elevated">
          <CardBody>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Información General
              </h2>
            </div>

            <div className="space-y-5">
              <InfoRow
                icon={<Calendar className="h-5 w-5 text-blue-600" />}
                label="Fecha de Inicio"
                value={formatDate(event.startDate)}
                bgColor="bg-blue-50"
              />
              <InfoRow
                icon={<Calendar className="h-5 w-5 text-purple-600" />}
                label="Fecha de Finalización"
                value={formatDate(event.endDate)}
                bgColor="bg-purple-50"
              />
              <InfoRow
                icon={<Clock className="h-5 w-5 text-emerald-600" />}
                label="Duración"
                value={`${getDuration()} ${getDuration() === 1 ? "día" : "días"}`}
                bgColor="bg-emerald-50"
              />
              <InfoRow
                icon={<MapPin className="h-5 w-5 text-amber-600" />}
                label="Ubicación"
                value={event.location || "No especificada"}
                bgColor="bg-amber-50"
              />
            </div>
          </CardBody>
        </Card>

        {/* Progreso del evento */}
        <GradientCard
          title="Estado del Evento"
          description="Resumen del progreso y participación"
          icon={TrendingUp}
          gradient="emerald"
        >
          <div className="space-y-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">
                  Categorías Configuradas
                </span>
                <span className="text-white font-bold text-lg">
                  {stats.categories}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: stats.categories > 0 ? "100%" : "0%",
                  }}
                />
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">
                  Participantes Inscritos
                </span>
                <span className="text-white font-bold text-lg">
                  {stats.participants}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: stats.participants > 0 ? "75%" : "0%",
                  }}
                />
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">
                  Instituciones Participantes
                </span>
                <span className="text-white font-bold text-lg">
                  {stats.institutions}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: stats.institutions > 0 ? "60%" : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Deportes más populares */}
      {stats.sports > 0 && (
        <Card variant="elevated">
          <CardBody>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Resumen de Deportes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.eventCategories
                ?.reduce((acc: any[], ec) => {
                  const sport = ec.category?.sport;
                  if (sport) {
                    const existing = acc.find((s) => s.sportId === sport.sportId);
                    if (existing) {
                      existing.count++;
                    } else {
                      acc.push({ ...sport, count: 1 });
                    }
                  }
                  return acc;
                }, [])
                .slice(0, 6)
                .map((sport) => (
                  <div
                    key={sport.sportId}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {sport.iconUrl ? (
                        <img
                          src={sport.iconUrl}
                          alt={sport.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        sport.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {sport.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {sport.count} {sport.count === 1 ? "categoría" : "categorías"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// Componente auxiliar para filas de información
function InfoRow({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
        <p className="text-base font-bold text-slate-900 capitalize">{value}</p>
      </div>
    </div>
  );
}
