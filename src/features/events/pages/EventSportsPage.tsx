import { useParams, useNavigate, useLocation } from "react-router-dom";

import { Plus, Trophy, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "react-hot-toast";
import {
  useEventCategories,
  useSismasterEventCategories,
  useHaymasterEventCategories,
  useRegisterEventCategories,
  useRegisterHaymasterEventCategories,
} from "../api/eventCategories.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { useAuthStore } from "@/app/store/useAuthStore";

export function EventSportsPage() {
  const { eventId, externalEventId } = useParams<{ eventId?: string; externalEventId?: string }>();
  const navigate  = useNavigate();
  const location  = useLocation();

  const eventIdNum         = eventId         ? Number(eventId)         : undefined;
  const externalEventIdNum = externalEventId ? Number(externalEventId) : undefined;

  const isExternalEvent  = !!externalEventId;
  const isHaymasterEvent = location.pathname.includes("/haymaster-events/");
  const isSismasterEvent = isExternalEvent && !isHaymasterEvent;

  const canAccessSport = useAuthStore((s) => s.canAccessSport);
  const isOperator     = useAuthStore((s) => s.isOperator);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: localEventCategories = [], isLoading: localLoading } =
    useEventCategories(
      { eventId: eventIdNum },
      { enabled: !isExternalEvent && !!eventIdNum },
    );

  const { data: sismasterEventCategories = [], isLoading: sismasterLoading } =
    useSismasterEventCategories(
      isSismasterEvent ? externalEventIdNum : undefined,
    );

  const { data: haymasterEventCategories = [], isLoading: haymasterLoading } =
    useHaymasterEventCategories(
      isHaymasterEvent ? externalEventIdNum : undefined,
    );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutate: registerSismasterCategories, isPending: isRegisteringSismaster } =
    useRegisterEventCategories();

  const { mutate: registerHaymasterCategories, isPending: isRegisteringHaymaster } =
    useRegisterHaymasterEventCategories();

  const isRegistering = isRegisteringSismaster || isRegisteringHaymaster;

  const handleRegisterCategories = () => {
    if (!externalEventIdNum) return;

    const onSuccess = (data: any) => {
      if (data.created === 0 && data.alreadyExists > 0) {
        toast.success(`Todas las categorías ya estaban registradas (${data.alreadyExists})`);
      } else {
        toast.success(
          `${data.created} categorías registradas` +
          (data.alreadyExists > 0 ? ` · ${data.alreadyExists} ya existían` : "") +
          (data.skipped      > 0 ? ` · ${data.skipped} sin mapeo local`    : ""),
        );
      }
    };
    const onError = () => toast.error("Error al registrar las categorías");

    if (isHaymasterEvent) {
      registerHaymasterCategories(externalEventIdNum, { onSuccess, onError });
    } else {
      registerSismasterCategories(externalEventIdNum, { onSuccess, onError });
    }
  };

  // ── Datos activos según tipo ────────────────────────────────────────────────
  const eventCategories =
    isHaymasterEvent ? haymasterEventCategories :
    isSismasterEvent ? sismasterEventCategories :
    localEventCategories;

  const isLoading =
    isHaymasterEvent ? haymasterLoading :
    isSismasterEvent ? sismasterLoading :
    localLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando deportes..." />
      </div>
    );
  }

  // ── Agrupar categorías por deporte ─────────────────────────────────────────
  const sportGroups = eventCategories.reduce(
    (acc, eventCategory) => {
      const sport = eventCategory.category?.sport;
      if (sport && sport.sportId) {
        if (!acc[sport.sportId]) {
          acc[sport.sportId] = { sport, categories: [] };
        }
        acc[sport.sportId].categories.push(eventCategory);
      }
      return acc;
    },
    {} as Record<number, { sport: any; categories: any[] }>,
  );

  const sports = Object.values(sportGroups);

  const filterEventId = isExternalEvent ? externalEventIdNum : eventIdNum;

  const visibleSports = isOperator()
    ? sports.filter(({ sport }) => canAccessSport(sport.sportId, filterEventId))
    : sports;

  // ── Rutas dinámicas para los 3 tipos ───────────────────────────────────────
  const addSportPath =
    isHaymasterEvent ? `/admin/haymaster-events/${externalEventId}/add-sport` :
    isSismasterEvent ? `/admin/sismaster-events/${externalEventId}/add-sport` :
                       `/admin/events/${eventId}/sports/add`;

  const getSportDetailPath = (sportId: number) => {
    if (isHaymasterEvent) return `/admin/haymaster-events/${externalEventId}/sports/${sportId}`;
    if (isSismasterEvent) return `/admin/sismaster-events/${externalEventId}/sports/${sportId}`;
    return `/admin/events/${eventId}/sports/${sportId}`;
  };

  // ── Badge label ────────────────────────────────────────────────────────────
  const eventSourceLabel =
    isHaymasterEvent ? "(Haymaster)" :
    isSismasterEvent ? "(Sisdeu)"    :
    "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={`Deportes del Evento ${eventSourceLabel}`}
        showBack
        actions={
          <div className="flex items-center gap-3">
            {isExternalEvent && !isOperator() && (
              <Button
                onClick={handleRegisterCategories}
                disabled={isRegistering}
                variant="outline"
                size="lg"
                icon={
                  <RefreshCw className={`h-4 w-4 ${isRegistering ? "animate-spin" : ""}`} />
                }
              >
                {isRegistering ? "Registrando..." : "Registrar Categorías"}
              </Button>
            )}

            {!isOperator() && (
              <Button
                onClick={() => navigate(addSportPath)}
                variant="gradient"
                size="lg"
                icon={<Plus className="h-5 w-5" />}
              >
                Agregar Deporte
              </Button>
            )}
          </div>
        }
      />

      {visibleSports.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No hay deportes asociados"
          description={
            isExternalEvent
              ? "Este evento externo no tiene deportes con categorías disponibles"
              : "Agrega el primer deporte a este evento para comenzar con las inscripciones"
          }
          action={{
            label: "Agregar Primer Deporte",
            onClick: () => navigate(addSportPath),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSports.map(({ sport, categories }) => (
            <SportEventCard
              key={sport.sportId}
              sport={sport}
              categoriesCount={categories.length}
              athletesCount={categories.reduce(
                (sum, cat) => sum + (cat.registrations?.length || 0),
                0,
              )}
              eventSourceLabel={isHaymasterEvent ? "Haymaster" : isSismasterEvent ? "Sisdeu" : undefined}
              onClick={() => navigate(getSportDetailPath(sport.sportId))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── SportEventCard ─────────────────────────────────────────────────────────────
function SportEventCard({
  sport,
  categoriesCount,
  athletesCount,
  eventSourceLabel,
  onClick,
}: {
  sport: any;
  categoriesCount: number;
  athletesCount: number;
  eventSourceLabel?: string;  // "Sisdeu" | "Haymaster" | undefined
  onClick: () => void;
}) {
  const sportImageUrl = sport.iconUrl ? getImageUrl(sport.iconUrl) : null;

  return (
    <Card
      hover
      variant="elevated"
      padding="none"
      onClick={onClick}
      className="group cursor-pointer overflow-hidden"
    >
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        {sportImageUrl ? (
          <>
            <img
              src={sportImageUrl}
              alt={sport.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <Trophy className="h-16 w-16 text-slate-400 group-hover:text-slate-500 transition-colors" />
          </div>
        )}

        {/* Badge dinámico: "Sisdeu" o "Haymaster" según origen */}
        {eventSourceLabel && (
          <div className="absolute top-3 right-3">
            <Badge size="sm" className="backdrop-blur-sm">
              {eventSourceLabel}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
            {sport.name}
          </h3>
        </div>

        {/* Indicador de hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <ChevronRight className="h-5 w-5 text-slate-900" />
          </div>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}