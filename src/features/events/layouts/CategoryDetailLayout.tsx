import { Outlet, useParams, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Calendar,
  BarChart3,
  Building2,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/PageHeader";
import {
  useEventCategories,
  useSismasterEventCategories,
} from "../api/eventCategories.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function CategoryDetailLayout() {
  const { eventId, externalEventId, sportId, categoryId } = useParams<{
    eventId?: string;
    externalEventId?: string;
    sportId: string;
    categoryId: string;
  }>();
  const navigate = useNavigate();

  const eventIdNum = eventId ? Number(eventId) : undefined;
  const externalEventIdNum = externalEventId
    ? Number(externalEventId)
    : undefined;
  const isExternalEvent = !!externalEventId;

  // ✅ Usar el hook correcto según el tipo de evento
  const { data: localEventCategories = [], isLoading: localLoading } =
    useEventCategories(
      { eventId: eventIdNum },
      { enabled: !isExternalEvent && !!eventIdNum },
    );

  const { data: externalEventCategories = [], isLoading: externalLoading } =
    useSismasterEventCategories(externalEventIdNum);

  const eventCategories = isExternalEvent
    ? externalEventCategories
    : localEventCategories;
  const isLoading = isExternalEvent ? externalLoading : localLoading;

  const eventCategory = eventCategories.find(
    (ec) => ec.eventCategoryId === Number(categoryId),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando categoría..." />
      </div>
    );
  }

  if (!eventCategory) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-red-600" />
        </div>
        <p className="text-lg font-semibold text-slate-900 mb-2">
          Categoría no encontrada
        </p>
        <p className="text-slate-500 mb-6">
          La categoría que buscas no existe o ha sido eliminada
        </p>
        <Button
          onClick={() => {
            const backPath = isExternalEvent
              ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}`
              : `/admin/events/${eventId}/sports/${sportId}`;
            navigate(backPath);
          }}
          variant="gradient"
        >
          Volver a Categorías
        </Button>
      </div>
    );
  }

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
      pendiente: {
        variant: "warning" as const,
        label: "Pendiente",
        dot: true,
      },
    };
    return configs[status as keyof typeof configs] || configs.pendiente;
  };

  const statusConfig = getStatusConfig(eventCategory.status);

  const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
  const isTimedSport =
    sportName.includes("natación") ||
    sportName.includes("atletismo") ||
    sportName.includes("ciclismo");

  const isTeam = eventCategory.category?.type === "equipo";
  const participantsCount = eventCategory.registrations?.length || 0;
  const sportIconUrl = eventCategory.category?.sport?.iconUrl;
  const sportImage = sportIconUrl ? getImageUrl(sportIconUrl) : null;

  const baseUrl = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}/categories/${categoryId}`
    : `/admin/events/${eventId}/sports/${sportId}/categories/${categoryId}`;

  const backPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}`
    : `/admin/events/${eventId}/sports/${sportId}`;

  const tabs = [
    {
      label: "Inscripciones",
      to: baseUrl,
      icon: <UserPlus className="h-4 w-4" />,
    },
    ...(!isTimedSport
      ? [
          {
            label: "Programación",
            to: `${baseUrl}/schedule`,
            icon: <Calendar className="h-4 w-4" />,
          },
        ]
      : []),
    ...(isTimedSport
      ? [
          {
            label: "Registrar Tiempos",
            to: `${baseUrl}/results`,
            icon: <Timer className="h-4 w-4" />,
          },
        ]
      : []),
    {
      label: "Posiciones",
      to: `${baseUrl}/standings`,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Instituciones",
      to: `${baseUrl}/institutions`,
      icon: <Building2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* PageHeader con botón de volver */}
      <PageHeader
        title={`${eventCategory.category?.name || "Categoría"} ${isExternalEvent ? "(Sismaster)" : ""}`}
        showBack
        onBack={() => navigate(backPath)}
      />

      {/* Header de la Categoría */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          {/* Icono del deporte */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-50 flex items-center justify-center flex-shrink-0">
            {sportImage ? (
              <img
                src={sportImage}
                alt={eventCategory.category?.sport?.name}
                className="w-full h-full object-contain p-3"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    e.currentTarget.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className =
                      "flex items-center justify-center w-full h-full";
                    placeholder.innerHTML = `<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>`;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <Trophy className="h-8 w-8 text-slate-400" />
            )}
          </div>

          {/* Información */}
          <div className="flex-1">
            {/* Badge de estado */}
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={statusConfig.variant} dot={statusConfig.dot}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {eventCategory.category?.sport?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                {isTeam ? (
                  <>
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Equipo</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Individual</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">
                  {participantsCount}{" "}
                  {participantsCount === 1 ? "inscrito" : "inscritos"}
                </span>
              </div>
            </div>

            {/* Descripción si existe */}
            {eventCategory.category?.description && (
              <p className="text-sm text-slate-600 mt-3 max-w-2xl">
                {eventCategory.category.description}
              </p>
            )}
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <Tabs tabs={tabs} />
        </div>
      </Card>

      {/* Contenido (Outlet) */}
      <Outlet context={{ eventCategory }} />
    </div>
  );
}
