import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Check, Trophy, Users, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSports } from "@/features/sports/api/sports.queries";
import { useCategories } from "@/features/sports/api/categories.queries";
import { useEventCategories, useSismasterEventCategories } from "../api/eventCategories.queries";
import { useCreateEventCategory } from "../api/eventCategories.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function AddSportToEventPage() {
  // ✅ Detectar si es evento local o de Sismaster
  const { eventId, externalEventId } = useParams<{ eventId?: string; externalEventId?: string }>();
  const navigate = useNavigate();
  
  const eventIdNum = eventId ? Number(eventId) : undefined;
  const externalEventIdNum = externalEventId ? Number(externalEventId) : undefined;
  const isExternalEvent = !!externalEventId;

  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());

  const { data: sports = [], isLoading: sportsLoading } = useSports();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();
  
  // ✅ Usar el hook correcto según el tipo de evento
  const { data: localEventCategories = [] } = useEventCategories(
    { eventId: eventIdNum },
    { enabled: !isExternalEvent }
  );
  const { data: externalEventCategories = [] } = useSismasterEventCategories(
    externalEventIdNum,
    { enabled: isExternalEvent }
  );

  const eventCategories = isExternalEvent ? externalEventCategories : localEventCategories;
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

  // Obtener el deporte seleccionado
  const selectedSportData = sports.find((s) => s.sportId === selectedSport);

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
      // ✅ Crear EventCategory con el campo correcto según el tipo de evento
      const promises = Array.from(selectedCategories).map((categoryId) =>
        createEventCategoryMutation.mutateAsync({
          ...(isExternalEvent 
            ? { externalEventId: externalEventIdNum } 
            : { eventId: eventIdNum }
          ),
          categoryId,
          externalSportId: selectedSport || undefined,
          status: "pendiente",
        }),
      );

      await Promise.all(promises);

      // ✅ Redirigir a la URL correcta
      const redirectPath = isExternalEvent
        ? `/admin/sismaster-events/${externalEventId}/sports`
        : `/admin/events/${eventId}/sports`;
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Error al agregar categorías:", error);
    }
  };

  if (sportsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando deportes..." />
      </div>
    );
  }

  // ✅ Rutas dinámicas para navegación
  const backPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports`
    : `/admin/events/${eventId}/sports`;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <PageHeader
        title={`Agregar Deporte al Evento ${isExternalEvent ? '(Sismaster)' : ''}`}
        showBack
        onBack={() => navigate(backPath, { replace: true })}
      />

      {/* Indicador de progreso */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              selectedSport
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            1
          </div>
          <span className="font-medium text-slate-700">Selecciona Deporte</span>
        </div>
        <div className="h-px flex-1 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              selectedCategories.size > 0
                ? "bg-blue-600 text-white"
                : selectedSport
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-400"
            }`}
          >
            2
          </div>
          <span
            className={`font-medium ${
              selectedSport ? "text-slate-700" : "text-slate-400"
            }`}
          >
            Selecciona Categorías
          </span>
        </div>
      </div>

      {/* Paso 1: Seleccionar Deporte */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Deportes Disponibles
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Selecciona el deporte que deseas agregar
              </p>
            </div>
            {selectedSport && (
              <Badge variant="success" size="lg">
                <Check className="h-3.5 w-3.5 mr-1" />
                Deporte seleccionado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {sports.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No hay deportes disponibles"
              description="Crea deportes primero para poder agregarlos al evento"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sports.map((sport) => {
                const isSelected = selectedSport === sport.sportId;
                const categoriesInSport = allCategories.filter(
                  (cat) => cat.sport?.sportId === sport.sportId,
                );
                const availableCount = categoriesInSport.filter(
                  (cat) => !existingCategoryIds.has(cat.categoryId),
                ).length;
                const sportIconUrl = sport.iconUrl
                  ? getImageUrl(sport.iconUrl)
                  : null;

                return (
                  <button
                    key={sport.sportId}
                    onClick={() => {
                      setSelectedSport(sport.sportId);
                      setSelectedCategories(new Set());
                    }}
                    disabled={availableCount === 0}
                    className={`
                      relative p-5 rounded-xl border-2 transition-all text-left group
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : availableCount === 0
                            ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                            : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-slate-50"
                      }
                    `}
                  >
                    {/* Check icon */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Contenido */}
                    <div className="space-y-3">
                      {/* Icono del deporte */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        {sportIconUrl ? (
                          <img
                            src={sportIconUrl}
                            alt={sport.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const placeholder = document.createElement("div");
                                placeholder.className = "text-white font-bold text-xl";
                                placeholder.textContent = sport.name.charAt(0);
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {sport.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Nombre */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">
                          {sport.name}
                        </h4>
                        <p
                          className={`text-sm ${
                            availableCount === 0
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {availableCount === 0 ? (
                            "No hay categorías disponibles"
                          ) : (
                            <>
                              {availableCount} categoría
                              {availableCount !== 1 ? "s" : ""} disponible
                              {availableCount !== 1 ? "s" : ""}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Paso 2: Seleccionar Categorías */}
      {selectedSport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Categorías de {selectedSportData?.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Selecciona las categorías que deseas agregar al evento
                </p>
              </div>
              {selectedCategories.size > 0 && (
                <Badge variant="primary" size="lg">
                  {selectedCategories.size} seleccionada
                  {selectedCategories.size !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {filteredCategories.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="No hay categorías disponibles"
                description="Todas las categorías de este deporte ya están agregadas al evento"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategories.has(category.categoryId);
                  const isTeam = category.type === "equipo";

                  return (
                    <button
                      key={category.categoryId}
                      onClick={() => toggleCategory(category.categoryId)}
                      className={`
                        p-4 rounded-xl border-2 transition-all text-left group
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className={`
                            mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${
                              isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-slate-300 group-hover:border-blue-400"
                            }
                          `}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        {/* Icono de tipo */}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isTeam ? "bg-purple-100" : "bg-blue-100"
                          }`}
                        >
                          {isTeam ? (
                            <Users className="h-5 w-5 text-purple-600" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 line-clamp-1 mb-1">
                            {category.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isTeam ? "default" : "primary"}
                              size="sm"
                            >
                              {isTeam ? "Equipo" : "Individual"}
                            </Badge>
                            {category.gender && (
                              <Badge variant="default" size="sm">
                                {category.gender}
                              </Badge>
                            )}
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
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardBody className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 mb-1">
                  ¿Listo para agregar?
                </p>
                <p className="text-sm text-slate-600">
                  Se agregarán {selectedCategories.size} categoría
                  {selectedCategories.size !== 1 ? "s" : ""} de{" "}
                  {selectedSportData?.name}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(backPath, { replace: true })}
                  disabled={createEventCategoryMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleSubmit}
                  disabled={createEventCategoryMutation.isPending}
                  size="lg"
                >
                  {createEventCategoryMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar al Evento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
