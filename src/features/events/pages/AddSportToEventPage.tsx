import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { useSports } from "@/features/sports/api/sports.queries";
import { useCategories } from "@/features/sports/api/categories.queries";
import { useEventCategories } from "../api/eventCategories.queries";
import { useCreateEventCategory } from "../api/eventCategories.mutations";

export function AddSportToEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const eventIdNum = Number(eventId);

  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set(),
  );

  const { data: sports = [], isLoading: sportsLoading } = useSports();
  const { data: allCategories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: eventCategories = [] } = useEventCategories({
    eventId: eventIdNum,
  });

  const createEventCategoryMutation = useCreateEventCategory();

  // Filtrar categorías del deporte seleccionado
  const availableCategories = selectedSport
    ? allCategories.filter((cat) => cat.sport?.sportId === selectedSport)
    : [];

  // Obtener IDs de categorías ya agregadas al evento
  const existingCategoryIds = new Set(
    eventCategories.map((ec) => ec.categoryId),
  );

  // Filtrar categorías que no están en el evento
  const filteredCategories = availableCategories.filter(
    (cat) => !existingCategoryIds.has(cat.categoryId),
  );

  const toggleCategory = (categoryId: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleSubmit = async () => {
    try {
      // Crear EventCategory para cada categoría seleccionada
      const promises = Array.from(selectedCategories).map((categoryId) =>
        createEventCategoryMutation.mutateAsync({
          eventId: eventIdNum,
          categoryId,
          status: "pendiente",
        }),
      );

      await Promise.all(promises);

      // Redirigir de vuelta a la lista de deportes
      navigate(`/admin/events/${eventId}/sports`);
    } catch (error) {
      console.error("Error al agregar categorías:", error);
    }
  };

  if (sportsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

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

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Agregar Deporte al Evento
          </h2>
          <p className="text-gray-600 mt-1">
            Selecciona un deporte y las categorías que quieres incluir
          </p>
        </div>
      </div>

      {/* Paso 1: Seleccionar Deporte */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Paso 1: Selecciona un Deporte
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.map((sport) => {
              const isSelected = selectedSport === sport.sportId;
              const categoriesInSport = allCategories.filter(
                (cat) => cat.sport?.sportId === sport.sportId,
              );
              const availableCount = categoriesInSport.filter(
                (cat) => !existingCategoryIds.has(cat.categoryId),
              ).length;

              return (
                <button
                  key={sport.sportId}
                  onClick={() => {
                    setSelectedSport(sport.sportId);
                    setSelectedCategories(new Set());
                  }}
                  disabled={availableCount === 0}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : availableCount === 0
                          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {sport.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {sport.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {availableCount} categoría
                        {availableCount !== 1 ? "s" : ""} disponible
                        {availableCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Paso 2: Seleccionar Categorías */}
      {selectedSport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Paso 2: Selecciona las Categorías
              </h3>
              {selectedCategories.size > 0 && (
                <Badge variant="primary">
                  {selectedCategories.size} seleccionada
                  {selectedCategories.size !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>
                  Todas las categorías de este deporte ya están en el evento
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategories.has(
                    category.categoryId,
                  );

                  return (
                    <button
                      key={category.categoryId}
                      onClick={() => toggleCategory(category.categoryId)}
                      className={`
                        w-full p-4 rounded-lg border-2 transition-all text-left
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            h-5 w-5 rounded border-2 flex items-center justify-center transition-colors
                            ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }
                          `}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {category.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {category.type === "equipo"
                                ? "Equipo"
                                : "Individual"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Botones de Acción */}
      {selectedSport && selectedCategories.size > 0 && (
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/events/${eventId}/sports`)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createEventCategoryMutation.isPending}
          >
            {createEventCategoryMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Agregando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Agregar {selectedCategories.size} Categoría
                {selectedCategories.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
