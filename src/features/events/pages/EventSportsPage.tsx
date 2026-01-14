import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useEventCategories } from "../api/eventCategories.queries";

export function EventSportsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: eventCategories = [], isLoading } = useEventCategories({
    eventId: Number(eventId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Agrupar categorías por deporte
  const sportGroups = eventCategories.reduce((acc, eventCategory) => {
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
  }, {} as Record<number, { sport: any; categories: any[] }>);

  const sports = Object.values(sportGroups);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Deportes del Evento
          </h2>
          <p className="text-gray-600 mt-1">
            Selecciona un deporte para ver sus categorías
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/events/${eventId}/sports/add`)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Deporte
        </Button>
      </div>

      {/* Lista de Deportes */}
      {sports.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay deportes asociados a este evento
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate(`/admin/events/${eventId}/sports/add`)}
                className="mt-4"
              >
                Agregar el primer deporte
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map(({ sport, categories }) => (
            <Card
              key={sport.sportId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                navigate(`/admin/events/${eventId}/sports/${sport.sportId}`)
              }
            >
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {sport.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {sport.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {categories.length} categoría
                        {categories.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
