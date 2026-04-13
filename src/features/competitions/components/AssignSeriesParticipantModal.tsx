import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Registration {
  registrationId: number;
  athlete?: {
    name: string;
    dni?: string;
    institution?: { name: string };
  };
  team?: { name: string; institution?: { name: string } };
}

interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phaseId: number;
  phaseName: string;
  allRegistrations: Registration[];
  onAssign: (registrationId: number) => Promise<void>;
  isLoading?: boolean;
  sismasterEventId?: number;
  sismasterSportId?: number;
  eventCategoryId?: number;
}

// ── Componente ─────────────────────────────────────────────────────────────

export function AssignSeriesParticipantModal({
  isOpen,
  onClose,
  phaseId,
  phaseName,
  allRegistrations,
  onAssign,
  isLoading = false,
  sismasterEventId,
  sismasterSportId,
  eventCategoryId,
}: Props) {
  const [selectedIds, setSelectedIds]   = useState<number[]>([]);
  const [selectedNiv, setSelectedNiv]   = useState("");
  const [selectedCat, setSelectedCat]   = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");   // ← NUEVO

  const hasSismaster   = Boolean(sismasterEventId && sismasterSportId);
  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectedNiv("");
      setSelectedCat("");
      setSearchQuery("");   // ← NUEVO
    }
  }, [isOpen]);

  // ── Query 1: opciones niv/cat ────────────────────────────────────────────
  const { data: nivCatOptions } = useQuery<{ combos: NivCatCombo[] }>({
    queryKey: [
      "sismaster-niv-cat-options",
      sismasterEventId,
      sismasterSportId,
      eventCategoryId,
    ],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/sismaster/athletes/niv-cat-options",
        { params: { sismasterEventId, sismasterSportId, eventCategoryId } },
      );
      return data;
    },
    enabled: hasSismaster && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  // ── Query 2: registrationIds filtrados ──────────────────────────────────
  const { data: nivCatResult, isFetching: loadingFilter } = useQuery<{
    registrationIds: number[];
  }>({
    queryKey: [
      "sismaster-registrations-niv-cat",
      sismasterEventId,
      sismasterSportId,
      eventCategoryId,
      selectedNiv,
      selectedCat,
    ],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/sismaster/athletes/registrations-by-niv-cat",
        {
          params: {
            sismasterEventId,
            sismasterSportId,
            idniv: selectedNiv,
            idcat: selectedCat,
            ...(eventCategoryId ? { eventCategoryId } : {}),
          },
        },
      );
      return data;
    },
    enabled: hasSismaster && isFilterActive,
  });

  // Auto-seleccionar todos los del filtro
  useEffect(() => {
    if (!isFilterActive || loadingFilter) return;
    if (nivCatResult?.registrationIds) {
      const validIds = new Set(allRegistrations.map((r) => r.registrationId));
      const filtered = nivCatResult.registrationIds.filter((id) =>
        validIds.has(id),
      );
      setSelectedIds(filtered);
    }
  }, [nivCatResult, isFilterActive, loadingFilter, allRegistrations]);

  // ── Filtrado por búsqueda ────────────────────────────────────────────────
  // Se aplica ENCIMA del filtro niv/cat existente
  const visibleRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRegistrations.filter((r) => {
      // Filtro niv/cat — misma lógica que tenías
      const passesNivCat =
        !isFilterActive ||
        loadingFilter ||
        !nivCatResult ||
        nivCatResult.registrationIds.includes(r.registrationId);

      if (!passesNivCat) return false;

      // Filtro búsqueda
      if (!q) return true;

      const name = (r.athlete?.name ?? r.team?.name ?? "").toLowerCase();
      const dni  = (r.athlete?.dni ?? "").toLowerCase();
      const inst = (
        r.athlete?.institution?.name ??
        r.team?.institution?.name ?? ""
      ).toLowerCase();

      return name.includes(q) || dni.includes(q) || inst.includes(q);
    });
  }, [allRegistrations, searchQuery, isFilterActive, loadingFilter, nivCatResult]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const clearFilter = () => {
    setSelectedNiv("");
    setSelectedCat("");
    setSelectedIds([]);
  };

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    // Selecciona solo los visibles (respeta búsqueda + filtro niv/cat)
    setSelectedIds(visibleRegistrations.map((r) => r.registrationId));
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);

    let success = 0;
    let failed  = 0;

    for (const registrationId of selectedIds) {
      try {
        await onAssign(registrationId);
        success++;
      } catch {
        failed++;
      }
    }

    setSubmitting(false);

    if (failed === 0) {
      toast.success(
        `${success} atleta${success !== 1 ? "s" : ""} asignado${success !== 1 ? "s" : ""}`,
      );
    } else {
      toast.warning(`${success} asignados, ${failed} ya estaban en la fase`);
    }

    onClose();
  };

  const isBusy = submitting || isLoading;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar atletas — ${phaseName}`}
      size="md"
    >
      <div className="space-y-4">

        {/* ── Filtro Sismaster ──────────────────────────────────────────── */}
        {hasSismaster && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Filtrar por nivel / categoría
              </p>
              {isFilterActive && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="text-xs text-red-500 hover:underline"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nivel</label>
                <select
                  value={selectedNiv}
                  onChange={(e) => {
                    setSelectedNiv(e.target.value);
                    setSelectedCat("");
                    setSelectedIds([]);
                  }}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Todos</option>
                  {[...new Set(nivCatOptions?.combos.map((c) => c.idniv))].map(
                    (niv) => (
                      <option key={niv} value={niv}>{niv}</option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  disabled={!selectedNiv}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-orange-400
                             disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <option value="">Todas</option>
                  {nivCatOptions?.combos
                    .filter((c) => c.idniv === selectedNiv)
                    .map((c) => (
                      <option key={c.idcat} value={c.idcat}>
                        {c.idcat} ({c.total})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {loadingFilter && (
              <p className="animate-pulse text-xs text-orange-500">
                Aplicando filtro...
              </p>
            )}
            {isFilterActive && !loadingFilter && (
              <p className="text-xs text-orange-600">
                Filtro:{" "}
                <span className="font-semibold">
                  {selectedNiv} / {selectedCat}
                </span>{" "}
                — {selectedIds.length} atleta
                {selectedIds.length !== 1 ? "s" : ""} preseleccionado
                {selectedIds.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* ── Buscador ──────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o institución..."
            className="w-full rounded-lg border border-gray-200 bg-white
                       pl-9 pr-9 py-2 text-sm focus:outline-none
                       focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Lista de participantes ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {visibleRegistrations.length === allRegistrations.length
                ? `Participantes (${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""})`
                : `${visibleRegistrations.length} resultado${visibleRegistrations.length !== 1 ? "s" : ""} — ${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""}`
              }
            </label>
            {visibleRegistrations.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-orange-600 hover:underline"
              >
                Seleccionar todos
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-lg
                          border border-gray-200 p-3">
            {visibleRegistrations.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                {searchQuery
                  ? `Sin resultados para "${searchQuery}"`
                  : "No hay participantes disponibles"
                }
              </div>
            ) : (
              visibleRegistrations.map((reg) => {
                const name = reg.athlete?.name ?? reg.team?.name ?? "Sin nombre";
                const institution =
                  reg.athlete?.institution?.name ??
                  reg.team?.institution?.name ?? "";
                const dni       = reg.athlete?.dni;
                const isSelected = selectedIds.includes(reg.registrationId);

                return (
                  <label
                    key={reg.registrationId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg
                               border p-3 transition-all
                               ${isSelected
                                 ? "border-orange-400 bg-orange-50"
                                 : "border-gray-200 bg-white hover:bg-gray-50"
                               }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(reg.registrationId)}
                      disabled={isBusy}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {institution && (
                          <p className="text-xs text-gray-500">{institution}</p>
                        )}
                        {dni && (
                          <span className="text-xs text-gray-400 font-mono">
                            DNI: {dni}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* ── Acciones ──────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isBusy}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || isBusy}
          >
            {submitting
              ? "Asignando..."
              : `Asignar${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}