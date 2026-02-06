import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trophy, Users, Clock, Award, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useEventCategories } from "../api/eventCategories.queries";

export function EventSportCategoriesPage() {
  const { eventId, sportId } = useParams<{
    eventId: string;
    sportId: string;
  }>();
  const navigate = useNavigate();
  const { data: eventCategories = [], isLoading } = useEventCategories({
    eventId: Number(eventId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando categorías..." />
      </div>
    );
  }

  // Filtrar categorías del deporte específico
  const sportCategories = eventCategories.filter(
    (ec) => ec.category?.sport?.sportId === Number(sportId),
  );

  const sportName = sportCategories[0]?.category?.sport?.name || "Deporte";
  const sportIcon = sportCategories[0]?.category?.sport?.iconUrl;

  // Calcular estadísticas
  const stats = {
    total: sportCategories.length,
    individual: sportCategories.filter((ec) => ec.category?.type === "individual")
      .length,
    team: sportCategories.filter((ec) => ec.category?.type === "equipo").length,
    participants: sportCategories.reduce(
      (sum, ec) => sum + (ec.registrations?.length || 0),
      0
    ),
    pending: sportCategories.filter((ec) => ec.status === "pendiente").length,
    inProgress: sportCategories.filter((ec) => ec.status === "en_curso").length,
    finished: sportCategories.filter((ec) => ec.status === "finalizado").length,
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pendiente: {
        variant: "warning" as const,
        label: "Pendiente",
        dot: true,
      },
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
    return configs[status as keyof typeof configs] || configs.pendiente;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title={`Categorías de ${sportName}`}
        description={`Gestione las categorías y competencias de ${sportName}`}
        showBack
        onBack={() => navigate(`/admin/events/${eventId}/sports`)}
        actions={
          sportCategories.length > 0 ? (
            <Button
              onClick={() =>
                navigate(
                  `/admin/events/${eventId}/sports/${sportId}/categories/add`
                )
              }
              variant="gradient"
              size="lg"
              icon={<Plus className="h-5 w-5" />}
            >
              Agregar Categoría
            </Button>
          ) : undefined
        }
      />

      {/* Icono y nombre del deporte */}
      <Card variant="gradient" padding="lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-strong">
            {sportIcon ? (
              <img
                src={sportIcon}
                alt={sportName}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <Trophy className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {sportName}
            </h2>
            <p className="text-slate-600">
              {stats.total} {stats.total === 1 ? "categoría" : "categorías"} •{" "}
              {stats.participants}{" "}
              {stats.participants === 1 ? "participante" : "participantes"}
            </p>
          </div>
        </div>
      </Card>

      

      {/* Lista de Categorías */}
      {sportCategories.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No hay categorías configuradas"
          description={`Agrega la primera categoría para ${sportName} en este evento`}
          action={{
            label: "Agregar Primera Categoría",
            onClick: () =>
              navigate(
                `/admin/events/${eventId}/sports/${sportId}/categories/add`
              ),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportCategories.map((eventCategory) => {
            const statusConfig = getStatusConfig(eventCategory.status);
            const isTeam = eventCategory.category?.type === "equipo";
            const participantsCount = eventCategory.registrations?.length || 0;

            return (
              <Card
                key={eventCategory.eventCategoryId}
                hover
                variant="elevated"
                padding="none"
                onClick={() =>
                  navigate(
                    `/admin/events/${eventId}/sports/${sportId}/categories/${eventCategory.eventCategoryId}`
                  )
                }
                className="group cursor-pointer overflow-hidden"
              >
                {/* Header con gradiente */}
                <div className="relative h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Badge de estado */}
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={statusConfig.variant}
                      dot={statusConfig.dot}
                      size="sm"
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Icono de tipo */}
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {isTeam ? (
                        <Users className="h-5 w-5 text-white" />
                      ) : (
                        <Trophy className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <CardBody>
                  {/* Nombre de la categoría */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {eventCategory.category?.name || "Sin nombre"}
                  </h3>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        {isTeam ? (
                          <Users className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Trophy className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <span className="text-slate-700 font-semibold">
                        {isTeam ? "Equipo" : "Individual"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 font-semibold">
                        {participantsCount}{" "}
                        {participantsCount === 1 ? "inscrito" : "inscritos"}
                      </span>
                    </div>
                  </div>

                  {/* Descripción si existe */}
                  {eventCategory.category?.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {eventCategory.category.description}
                    </p>
                  )}

                  {/* Footer con hora/fecha si existe */}
                  {eventCategory.startTime && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-auto pt-3 border-t border-slate-100">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{eventCategory.startTime}</span>
                    </div>
                  )}
                </CardBody>

                {/* Bottom accent */}
                <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
