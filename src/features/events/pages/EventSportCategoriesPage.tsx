import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ChevronRight, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
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
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Filtrar categorías del deporte específico
  const sportCategories = eventCategories.filter(
    (ec) => ec.category?.sport?.sportId === Number(sportId),
  );

  const sportName = sportCategories[0]?.category?.sport?.name || "Deporte";

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "success" | "primary" | "default" | "warning"
    > = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
      pendiente: "warning",
    };
    return variants[status] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/events/${eventId}/sports`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Deportes
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Categorías de {sportName}
            </h2>
          </div>
        </div>
      </div>

      {/* Lista de Categorías */}
      {sportCategories.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay categorías para este deporte en el evento
              </p>
              <Button
                variant="ghost"
                onClick={() =>
                  navigate(
                    `/admin/events/${eventId}/sports/${sportId}/categories/add`,
                  )
                }
                className="mt-4"
              >
                Agregar la primera categoría
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sportCategories.map((eventCategory) => (
            <Card
              key={eventCategory.eventCategoryId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                navigate(
                  `/admin/events/${eventId}/sports/${sportId}/categories/${eventCategory.eventCategoryId}`,
                )
              }
            >
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {eventCategory.category?.name}
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(eventCategory.status)}
                      >
                        {eventCategory.status === "pendiente" && "Pendiente"}
                        {eventCategory.status === "en_curso" && "En Curso"}
                        {eventCategory.status === "finalizado" && "Finalizado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {eventCategory.category?.type === "equipo"
                        ? "Equipo"
                        : "Individual"}{" "}
                      • {eventCategory.registrations?.length || 0} inscrito
                      {eventCategory.registrations?.length !== 1 ? "s" : ""}
                    </p>
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
