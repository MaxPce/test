import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trophy, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { 
  useEventCategories, 
  useSismasterEventCategories 
} from "../api/eventCategories.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function EventSportsPage() {
  const { eventId, externalEventId } = useParams<{ eventId?: string; externalEventId?: string }>();
  const navigate = useNavigate();
  
  const eventIdNum = eventId ? Number(eventId) : undefined;
  const externalEventIdNum = externalEventId ? Number(externalEventId) : undefined;
  const isExternalEvent = !!externalEventId;

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
        <Spinner size="lg" label="Cargando deportes..." />
      </div>
    );
  }

  // FIX: Agrupar categorías por deporte (incluye Sismaster)
  const sportGroups = eventCategories.reduce(
    (acc, eventCategory) => {
      const sport = eventCategory.category?.sport;
      if (sport && sport.sportId) {  // ← VERIFICACIÓN CLAVE
        if (!acc[sport.sportId]) {
          acc[sport.sportId] = {
            sport,
            categories: [],
          };
        }
        acc[sport.sportId].categories.push(eventCategory);
      }
      return acc;
    },
    {} as Record<number, { sport: any; categories: any[] }>,
  );

  const sports = Object.values(sportGroups);

  // Rutas dinámicas SISMASTER/LOCAL
  const addSportPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/add-sport`
    : `/admin/events/${eventId}/sports/add`;

  const getSportDetailPath = (sportId: number) => {
    return isExternalEvent
      ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}`  // ← SISMASTER ROUTE
      : `/admin/events/${eventId}/sports/${sportId}`;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header con badge Sismaster */}
      <PageHeader
        title={`Deportes del Evento ${isExternalEvent ? '(Sismaster)' : ''}`}
        showBack
        actions={
          <Button
            onClick={() => navigate(addSportPath)}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Agregar Deporte
          </Button>
        }
      />

      {/* Grid de Deportes - TU DISEÑO EXACTO */}
      {sports.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No hay deportes asociados"
          description={
            isExternalEvent
              ? "Este evento Sismaster no tiene deportes con categorías disponibles"
              : "Agrega el primer deporte a este evento para comenzar con las inscripciones"
          }
          action={{
            label: "Agregar Primer Deporte",
            onClick: () => navigate(addSportPath),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map(({ sport, categories }) => (
            <SportEventCard
              key={sport.sportId}
              sport={sport}
              categoriesCount={categories.length}
              athletesCount={categories.reduce(
                (sum, cat) => sum + (cat.registrations?.length || 0),
                0,
              )}
              isSismaster={isExternalEvent}  // ← PASAR PROP
              onClick={() => navigate(getSportDetailPath(sport.sportId))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// TU DISEÑO EXACTO + Badge Sismaster
function SportEventCard({
  sport,
  categoriesCount,
  athletesCount,
  isSismaster = false,
  onClick,
}: {
  sport: any;
  categoriesCount: number;
  athletesCount: number;
  isSismaster?: boolean;
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
      {/* Header con imagen - TU DISEÑO EXACTO */}
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        {sportImageUrl ? (
          <>
            <img
              src={sportImageUrl}
              alt={sport.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Overlay oscuro sutil solo en la parte inferior */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <Trophy className="h-16 w-16 text-slate-400 group-hover:text-slate-500 transition-colors" />
          </div>
        )}

        {/* Badge Sismaster - NUEVO */}
        {isSismaster && (
          <div className="absolute top-3 right-3">
            <Badge  size="sm" className="backdrop-blur-sm">
              Sisdeu
            </Badge>
          </div>
        )}

        {/* Nombre del deporte sobre la imagen - TU DISEÑO */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
            {sport.name}
          </h3>
        </div>

        {/* Indicador de hover - TU DISEÑO */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <ChevronRight className="h-5 w-5 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Bottom accent con animación - TU DISEÑO EXACTO */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
