import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trophy, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useEventCategories, useSismasterEventCategories } from "../api/eventCategories.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function EventSportCategoriesPage() {
  const { eventId, externalEventId, sportId } = useParams<{
    eventId?: string;
    externalEventId?: string;
    sportId: string;
  }>();
  const navigate = useNavigate();
  
  const eventIdNum = eventId ? Number(eventId) : undefined;
  const externalEventIdNum = externalEventId ? Number(externalEventId) : undefined;
  const isExternalEvent = !!externalEventId;

  // ✅ Usar el hook correcto según el tipo de evento
  const { data: localEventCategories = [], isLoading: localLoading } = useEventCategories(
    { eventId: eventIdNum },
    { enabled: !isExternalEvent && !!eventIdNum }
  );
  
  const { data: externalEventCategories = [], isLoading: externalLoading } = useSismasterEventCategories(
    externalEventIdNum
  );

  const eventCategories = isExternalEvent ? externalEventCategories : localEventCategories;
  const isLoading = isExternalEvent ? externalLoading : localLoading;

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
  const sportIconUrl = sportCategories[0]?.category?.sport?.iconUrl;
  const sportImage = sportIconUrl ? getImageUrl(sportIconUrl) : null;

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

  const totalParticipants = sportCategories.reduce(
    (sum, ec) => sum + (ec.registrations?.length || 0),
    0
  );

  // ✅ Rutas dinámicas según el tipo de evento
  const backPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports`
    : `/admin/events/${eventId}/sports`;

  const getCategoryDetailPath = (eventCategoryId: number) => {
    return isExternalEvent
      ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}/categories/${eventCategoryId}`
      : `/admin/events/${eventId}/sports/${sportId}/categories/${eventCategoryId}`;
  };

  const addCategoryPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}/categories/add`
    : `/admin/events/${eventId}/sports/${sportId}/categories/add`;

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title={`Categorías de ${sportName} ${isExternalEvent ? '(Sismaster)' : ''}`}
        showBack
        onBack={() => navigate(backPath)}
      />

      {/* Header del deporte */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* Imagen del deporte */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-50 flex items-center justify-center flex-shrink-0">
            {sportImage ? (
              <img
                src={sportImage}
                alt={sportName}
                className="w-full h-full object-contain p-3"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    e.currentTarget.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className =
                      "w-10 h-10 flex items-center justify-center";
                    placeholder.innerHTML = `<svg class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>`;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <Trophy className="h-10 w-10 text-slate-400" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {sportName}
            </h2>
            <p className="text-slate-600">
              {sportCategories.length}{" "}
              {sportCategories.length === 1 ? "categoría" : "categorías"} •{" "}
              {totalParticipants}{" "}
              {totalParticipants === 1 ? "participante" : "participantes"}
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
            onClick: () => navigate(addCategoryPath),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  navigate(getCategoryDetailPath(eventCategory.eventCategoryId))
                }
                className="group cursor-pointer overflow-hidden"
              >
                {/* Header limpio */}
                <div className="p-5 pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                      {eventCategory.category?.name || "Sin nombre"}
                    </h3>
                    <Badge
                      variant={statusConfig.variant}
                      dot={statusConfig.dot}
                      size="sm"
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Descripción si existe */}
                  {eventCategory.category?.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                      {eventCategory.category.description}
                    </p>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5">
                  {/* Info en grid compacto */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {isTeam ? (
                          <Users className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Trophy className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">
                          Formato
                        </p>
                        <p className="text-sm text-slate-900 font-semibold">
                          {isTeam ? "Equipo" : "Individual"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">
                          Participantes
                        </p>
                        <p className="text-sm text-slate-900 font-semibold">
                          {participantsCount}{" "}
                          {participantsCount === 1 ? "inscrito" : "inscritos"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hora si existe */}
                  {eventCategory.startTime && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        Hora: {eventCategory.startTime}
                      </span>
                    </div>
                  )}
                </div>

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
