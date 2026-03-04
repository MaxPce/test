// src/features/events/components/BulkRegistrationModal.tsx
import { useState, useMemo, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, X, AlertCircle, Tag } from "lucide-react";
import {
  useSportCategoriesByEvent,
  useAthletesByCategory,
  type SportCategoryParam,
} from "@/features/institutions/api/sismaster.queries";
import { useBulkRegistrationFromSismaster } from "../api/registrations.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { EventCategory } from "../types";

interface BulkRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCategory: EventCategory;
  eventId: number; // sismaster event ID (ej: 200)
}

/**
 * Intenta encontrar la categoría de sismaster que coincida con el nombre local.
 * Normaliza espacios y mayúsculas para mayor tolerancia.
 */
function findMatchingParam(
  params: SportCategoryParam[],
  localName: string,
): SportCategoryParam | undefined {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const target = normalize(localName);
  return (
    params.find((p) => normalize(p.name) === target) ??
    params.find((p) => normalize(p.name).includes(target)) ??
    params.find((p) => target.includes(normalize(p.name)))
  );
}

export function BulkRegistrationModal({
  isOpen,
  onClose,
  eventCategory,
  eventId,
}: BulkRegistrationModalProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // idparam seleccionado manualmente (override del auto-match)
  const [manualIdparam, setManualIdparam] = useState<number | null>(null);

  const localSportId = eventCategory.category?.sport?.sportId;
  const categoryName  = eventCategory.category?.name ?? "";
  const sportName     = eventCategory.category?.sport?.name;

  // ── 1. Obtener categorías del deporte para este evento ──────────────────
  const {
    data: sismasterCategories = [],
    isLoading: isLoadingCategories,
  } = useSportCategoriesByEvent(
    localSportId!,
    eventId,
    isOpen && !!localSportId,
  );

  // ── 2. Auto-match por nombre cuando llegan las categorías ───────────────
  const autoMatchedParam = useMemo(
    () => findMatchingParam(sismasterCategories, categoryName),
    [sismasterCategories, categoryName],
  );

  // Resetear override manual si cambia la categoría o el modal se abre
  useEffect(() => {
    if (isOpen) setManualIdparam(null);
  }, [isOpen, eventCategory.eventCategoryId]);

  // El idparam efectivo: manual > auto-match
  const activeParam: SportCategoryParam | undefined = useMemo(() => {
    if (manualIdparam !== null) {
      return sismasterCategories.find((p) => p.idparam === manualIdparam);
    }
    return autoMatchedParam;
  }, [manualIdparam, autoMatchedParam, sismasterCategories]);

  const matchIsAuto = manualIdparam === null && !!autoMatchedParam;

  // ── 3. Cargar atletas de la categoría resuelta ──────────────────────────
  const {
    data: athletesFromSismaster = [],
    isLoading: isLoadingAthletes,
    error,
  } = useAthletesByCategory(
    eventId,
    localSportId!,
    activeParam?.idparam ?? 0,
    isOpen && !!localSportId && !!activeParam,
  );

  const isLoading = isLoadingCategories || isLoadingAthletes;

  const bulkMutation = useBulkRegistrationFromSismaster();

  const registeredAthleteIds =
    eventCategory.registrations
      ?.map((r) => r.external_athlete_id)
      .filter(Boolean) ?? [];

  // ── 4. Instituciones para el filtro ────────────────────────────────────
  const institutions = useMemo(() => {
    return Array.from(
      new Set(athletesFromSismaster.map((a) => a.institutionName).filter(Boolean)),
    ).sort();
  }, [athletesFromSismaster]);

  // ── 5. Filtrado local ───────────────────────────────────────────────────
  const filteredAthletes = useMemo(() => {
    let filtered = athletesFromSismaster.filter(
      (a) => !registeredAthleteIds.includes(a.idperson),
    );

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          `${a.firstname} ${a.lastname}`.toLowerCase().includes(search) ||
          a.institutionName?.toLowerCase().includes(search) ||
          a.docnumber?.toLowerCase().includes(search),
      );
    }

    if (selectedInstitution !== "all") {
      filtered = filtered.filter(
        (a) => a.institutionName === selectedInstitution,
      );
    }

    return filtered;
  }, [athletesFromSismaster, registeredAthleteIds, searchTerm, selectedInstitution]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleToggleAthlete = (athleteId: number) =>
    setSelectedAthletes((prev) =>
      prev.includes(athleteId) ? prev.filter((id) => id !== athleteId) : [...prev, athleteId],
    );

  const handleSelectAll = () =>
    setSelectedAthletes(
      selectedAthletes.length === filteredAthletes.length
        ? []
        : filteredAthletes.map((a) => a.idperson),
    );

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedInstitution("all");
  };

  const handleSubmit = async () => {
    if (selectedAthletes.length === 0) return;
    try {
      await bulkMutation.mutateAsync({
        eventCategoryId: eventCategory.eventCategoryId,
        external_athlete_ids: selectedAthletes,
      });
      setSelectedAthletes([]);
      handleClearFilters();
      onClose();
    } catch (err) {
      console.error("Error al inscribir atletas:", err);
    }
  };

  const handleClose = () => {
    setSelectedAthletes([]);
    setManualIdparam(null);
    handleClearFilters();
    onClose();
  };

  const hasActiveFilters = searchTerm.trim() !== "" || selectedInstitution !== "all";

  const categoryOptions = [
    { value: "", label: "— Seleccionar categoría —" },
    ...sismasterCategories.map((p) => ({
      value: String(p.idparam),
      label: `${p.name} (${p.athleteCount} atletas)`,
    })),
  ];

  const institutionOptions = [
    { value: "all", label: "Todas las instituciones" },
    ...institutions.map((inst) => ({ value: inst, label: inst })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Inscripción Masiva de Atletas"
      size="lg"
    >
      <div className="space-y-4">

        {/* Header con info de categoría */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-blue-900 text-lg">
                {categoryName}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {sportName}
                {eventCategory.category?.type === "individual"
                  ? " • Individual"
                  : " • Equipo"}
              </p>
            </div>
            <Badge variant="primary" size="lg">
              {eventCategory.category?.gender}
            </Badge>
          </div>
        </div>

        {/* Selector de categoría Sismaster */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Categoría Sismaster
          </label>

          {isLoadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Spinner size="sm" />
              <span>Cargando categorías...</span>
            </div>
          ) : sismasterCategories.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>No se encontraron categorías para este deporte y evento.</span>
            </div>
          ) : (
            <>
              <Select
                value={String(activeParam?.idparam ?? "")}
                onChange={(e) =>
                  setManualIdparam(e.target.value ? Number(e.target.value) : null)
                }
                options={categoryOptions}
              />

              

              {/* Advertencia si no hubo auto-match */}
              {!activeParam && !isLoadingCategories && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    No se encontró coincidencia automática para <strong>"{categoryName}"</strong>.
                    Selecciona la categoría manualmente.
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Estado de carga o error de atletas */}
        {!activeParam ? null : isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" label="Cargando atletas de la categoría..." />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error al cargar atletas</p>
              <p className="text-sm text-red-700 mt-1">
                No se pudieron obtener los atletas para esta categoría.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, institución o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>

              {showFilters && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Select
                    label="Institución"
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    options={institutionOptions}
                  />
                </div>
              )}

              {hasActiveFilters && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">Filtros activos</span>
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar
                  </button>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-sm text-green-800">
                  <strong>{athletesFromSismaster.length}</strong> atletas 
                  {registeredAthleteIds.length > 0 && (
                    <span className="text-green-700">
                      {" "}· <strong>{registeredAthleteIds.length}</strong> ya inscritos
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Lista de atletas */}
            {filteredAthletes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No hay atletas disponibles</p>
                <p className="text-sm">
                  {hasActiveFilters
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Todos los atletas de esta categoría ya están inscritos"}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedAthletes.length} de {filteredAthletes.length} seleccionados
                  </p>
                  <Button size="sm" variant="ghost" onClick={handleSelectAll}>
                    {selectedAthletes.length === filteredAthletes.length
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredAthletes.map((athlete) => {
                    const photoUrl = athlete.photo ? getImageUrl(athlete.photo) : null;
                    return (
                      <label
                        key={athlete.idperson}
                        className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAthletes.includes(athlete.idperson)}
                          onChange={() => handleToggleAthlete(athlete.idperson)}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={`${athlete.firstname} ${athlete.lastname}`}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200 flex-shrink-0">
                              {athlete.firstname.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {athlete.firstname} {athlete.lastname}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-0.5">
                              {athlete.institutionName || "Sin institución"}
                            </p>
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

        {/* Footer */}
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
              disabled={selectedAthletes.length === 0 || !activeParam}
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