import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trophy, ChevronRight, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useEventCategories } from "../api/eventCategories.queries";

export function EventSportsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: eventCategories = [], isLoading } = useEventCategories({
    eventId: Number(eventId),
  });

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

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title="Deportes del Evento"
        description="Gestione los deportes y categorías asociadas al evento"
        showBack
        actions={
          <Button
            onClick={() => navigate(`/admin/events/${eventId}/sports/add`)}
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
            onClick: () => navigate(`/admin/events/${eventId}/sports/add`),
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
              onClick={() =>
                navigate(`/admin/events/${eventId}/sports/${sport.sportId}`)
              }
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
  return (
    <Card
      hover
      variant="elevated"
      padding="none"
      onClick={onClick}
      className="group cursor-pointer overflow-hidden"
    >
      {/* Header con gradiente */}
      <div className="relative h-24 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 overflow-hidden">
        {sport.iconUrl ? (
          <>
            <img
              src={sport.iconUrl}
              alt={sport.name}
              className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="h-12 w-12 text-white/40" />
          </div>
        )}

        {/* Icono flotante */}
        <div className="absolute top-4 left-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
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
        </div>

        {/* Indicador de hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <CardBody>
        <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
          {sport.name}
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Grid3x3 className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-semibold">
                Categorías
              </span>
            </div>
            <p className="text-xl font-bold text-blue-900">{categoriesCount}</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-semibold">
                Atletas
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-900">{athletesCount}</p>
          </div>
        </div>

        {/* Tipo de deporte */}
        {sport.sportType && (
          <div className="mt-4">
            <Badge variant="primary" size="sm">
              {sport.sportType.name}
            </Badge>
          </div>
        )}
      </CardBody>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
