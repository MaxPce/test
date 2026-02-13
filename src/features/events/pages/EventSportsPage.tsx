import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trophy, ChevronRight, Grid3x3, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useEventCategories, useSismasterEventCategories } from "../api/eventCategories.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function EventSportsPage() {
  // ✅ Detectar si es evento local o de Sismaster
  const { eventId, externalEventId } = useParams<{ eventId?: string; externalEventId?: string }>();
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
        <Spinner size="lg" label="Cargando deportes..." />
      </div>
    );
  }

  // Agrupar categorías por deporte
  const sportGroups = eventCategories.reduce(
    (acc, eventCategory) => {
      const sport = eventCategory.category?.sport;
      if (sport) {
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

  // ✅ Rutas dinámicas según el tipo de evento
  const addSportPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/add-sport`
    : `/admin/events/${eventId}/sports/add`;

  const getSportDetailPath = (sportId: number) => {
    return isExternalEvent
      ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}`
      : `/admin/events/${eventId}/sports/${sportId}`;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
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

      {/* Grid de Deportes */}
      {sports.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No hay deportes asociados"
          description="Agrega el primer deporte a este evento para comenzar con las inscripciones"
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
              onClick={() => navigate(getSportDetailPath(sport.sportId))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para la tarjeta de deporte
function SportEventCard({
  sport,
  categoriesCount,
  athletesCount,
  onClick,
}: {
  sport: any;
  categoriesCount: number;
  athletesCount: number;
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
      {/* Header con imagen */}
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

        {/* Nombre del deporte sobre la imagen */}
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

      {/* Bottom accent con animación */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
