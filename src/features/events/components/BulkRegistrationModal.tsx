import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, X } from "lucide-react";
import { useAthletes } from "@/features/institutions/api/athletes.queries";
import { useBulkRegistration } from "../api/registrations.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { EventCategory } from "../types";

interface BulkRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCategory: EventCategory;
}

export function BulkRegistrationModal({
  isOpen,
  onClose,
  eventCategory,
}: BulkRegistrationModalProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: athletes = [], isLoading } = useAthletes();
  const bulkMutation = useBulkRegistration();

  // Atletas ya inscritos
  const registeredAthleteIds =
    eventCategory.registrations?.map((r) => r.athleteId).filter(Boolean) || [];

  // Obtener lista única de instituciones
  const institutions = useMemo(() => {
    const uniqueInstitutions = Array.from(
      new Set(athletes.map((a) => a.institution?.name).filter(Boolean))
    ).sort();
    return uniqueInstitutions;
  }, [athletes]);

  // Filtrado de atletas
  const filteredAthletes = useMemo(() => {
    let filtered = athletes;

    // Filtrar por género de la categoría
    filtered = filtered.filter(
      (athlete) =>
        athlete.gender === eventCategory.category?.gender ||
        eventCategory.category?.gender === "MIXTO"
    );

    // Excluir ya inscritos
    filtered = filtered.filter(
      (athlete) => !registeredAthleteIds.includes(athlete.athleteId)
    );

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (athlete) =>
          athlete.name.toLowerCase().includes(search) ||
          athlete.institution?.name.toLowerCase().includes(search) ||
          athlete.docNumber?.toLowerCase().includes(search)
      );
    }

    // Filtrar por institución
    if (selectedInstitution !== "all") {
      filtered = filtered.filter(
        (athlete) => athlete.institution?.name === selectedInstitution
      );
    }

    // Filtrar por género adicional (si se muestra filtros)
    if (selectedGender !== "all") {
      filtered = filtered.filter((athlete) => athlete.gender === selectedGender);
    }

    return filtered;
  }, [
    athletes,
    eventCategory.category?.gender,
    registeredAthleteIds,
    searchTerm,
    selectedInstitution,
    selectedGender,
  ]);

  const handleToggleAthlete = (athleteId: number) => {
    setSelectedAthletes((prev) =>
      prev.includes(athleteId)
        ? prev.filter((id) => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAthletes.length === filteredAthletes.length) {
      setSelectedAthletes([]);
    } else {
      setSelectedAthletes(filteredAthletes.map((a) => a.athleteId));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedInstitution("all");
    setSelectedGender("all");
  };

  const handleSubmit = async () => {
    if (selectedAthletes.length === 0) return;

    await bulkMutation.mutateAsync({
      eventCategoryId: eventCategory.eventCategoryId,
      athleteIds: selectedAthletes,
    });

    setSelectedAthletes([]);
    handleClearFilters();
    onClose();
  };

  const handleClose = () => {
    setSelectedAthletes([]);
    handleClearFilters();
    onClose();
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedInstitution !== "all" ||
    selectedGender !== "all";

  const institutionOptions = [
    { value: "all", label: "Todas las instituciones" },
    ...institutions.map((inst) => ({ value: inst, label: inst })),
  ];

  const genderOptions = [
    { value: "all", label: "Todos los géneros" },
    { value: "M", label: "Masculino" },
    { value: "F", label: "Femenino" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Inscripción Masiva"
      size="lg"
    >
      <div className="space-y-4">
        {/* Header con info de categoría */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-blue-900 text-lg">
                {eventCategory.category?.name}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {eventCategory.category?.sport?.name} •{" "}
                {eventCategory.category?.type === "individual"
                  ? "Individual"
                  : "Equipo"}
              </p>
            </div>
            <Badge variant="primary" size="lg">
              {eventCategory.category?.gender}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" label="Cargando atletas..." />
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="space-y-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, institución o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Toggle filtros avanzados */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>

              {/* Filtros adicionales */}
              {showFilters && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                  <Select
                    label="Institución"
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    options={institutionOptions}
                  />
                  <Select
                    label="Género"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    options={genderOptions}
                  />
                </div>
              )}

              {/* Indicador de filtros activos */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    Filtros activos
                  </span>
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            {/* Lista de atletas */}
            {filteredAthletes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">
                  No hay atletas disponibles
                </p>
                <p className="text-sm">
                  {hasActiveFilters
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "No hay atletas que cumplan los requisitos de esta categoría"}
                </p>
              </div>
            ) : (
              <>
                {/* Header de selección */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedAthletes.length} de {filteredAthletes.length}{" "}
                    seleccionados
                  </p>
                  <Button size="sm" variant="ghost" onClick={handleSelectAll}>
                    {selectedAthletes.length === filteredAthletes.length
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </Button>
                </div>

                {/* Lista con scroll */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredAthletes.map((athlete) => {
                    const photoUrl = athlete.photoUrl
                      ? getImageUrl(athlete.photoUrl)
                      : null;

                    return (
                      <label
                        key={athlete.athleteId}
                        className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAthletes.includes(
                            athlete.athleteId
                          )}
                          onChange={() =>
                            handleToggleAthlete(athlete.athleteId)
                          }
                          className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={athlete.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder =
                                    document.createElement("div");
                                  placeholder.className =
                                    "h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200 flex-shrink-0";
                                  placeholder.textContent =
                                    athlete.name.charAt(0);
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200 flex-shrink-0">
                              {athlete.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {athlete.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-gray-600 truncate">
                                {athlete.institution?.name || "Sin institución"}
                              </p>
                              
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Footer con acciones */}
        <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedAthletes.length > 0 && (
              <span className="font-semibold text-blue-600">
                {selectedAthletes.length} atleta(s) listo(s) para inscribir
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={bulkMutation.isPending}
              disabled={selectedAthletes.length === 0}
              variant="gradient"
            >
              Inscribir {selectedAthletes.length || ""} atleta(s)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
