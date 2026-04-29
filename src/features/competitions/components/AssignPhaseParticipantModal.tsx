// src/features/competitions/components/AssignPhaseParticipantModal.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Search, X, Trash2 } from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Registration {
  registrationId: number;
  athlete?: {
    name: string;
    dni?: string;
    institution?: { name: string };
  };
  team?: {
    name: string;
    institution?: { name: string };
    members?: Array<{
      athlete?: { gender?: "M" | "F" | string };
    }>;
  };
}

interface PhaseRegistration {
  registrationId: number;
  registration?: Registration;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phaseId: number;
  phaseName: string;
  allRegistrations: Registration[];
  sismasterEventId?: number;
  sismasterSportId?: number;
  eventCategoryId?: number;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function AssignPhaseParticipantModal({
  isOpen,
  onClose,
  phaseId,
  phaseName,
  allRegistrations,
  sismasterEventId,
  sismasterSportId,
  eventCategoryId,
}: Props) {
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"assign" | "assigned">("assign");

  // ── Sismaster filter (mismo patrón que AssignSeriesParticipantModal) ───────
  const [selectedNiv, setSelectedNiv] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);
  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectedNiv("");
      setSelectedCat("");
      setSearchQuery("");
      setTab("assign");
    }
  }, [isOpen]);

  // ── Query: registrations ya asignadas a la fase ───────────────────────────
  const { data: phaseRegistrations = [], refetch: refetchPhase } = useQuery<
    PhaseRegistration[]
  >({
    queryKey: ["phase-registrations", phaseId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/competitions/phases/${phaseId}/registrations`,
      );
      return data;
    },
    enabled: isOpen && Boolean(phaseId),
    staleTime: 1000 * 30,
  });

  // ── Query sismaster: opciones niv/cat ─────────────────────────────────────
  const { data: nivCatOptions } = useQuery<{
    combos: { idniv: string; idcat: string; total: number }[];
  }>({
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

  // ── Query sismaster: registrationIds filtrados ────────────────────────────
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

  // Auto-seleccionar todos los del filtro niv/cat
  useEffect(() => {
    if (!isFilterActive || loadingFilter) return;
    if (nivCatResult?.registrationIds) {
      const validIds = new Set(allRegistrations.map((r) => r.registrationId));
      // Excluye los ya asignados
      const alreadyAssignedIds = new Set(
        phaseRegistrations.map((pr) => pr.registrationId),
      );
      const filtered = nivCatResult.registrationIds.filter(
        (id) => validIds.has(id) && !alreadyAssignedIds.has(id),
      );
      setSelectedIds(filtered);
    }
  }, [
    nivCatResult,
    isFilterActive,
    loadingFilter,
    allRegistrations,
    phaseRegistrations,
  ]);

  // ── IDs ya asignados a esta fase ──────────────────────────────────────────
  const assignedIds = useMemo(
    () => new Set(phaseRegistrations.map((pr) => pr.registrationId)),
    [phaseRegistrations],
  );

  // ── Registrations disponibles (no asignadas aún) ─────────────────────────
  const availableRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRegistrations.filter((r) => {
      if (assignedIds.has(r.registrationId)) return false;

      // Filtro niv/cat
      const passesNivCat =
        !isFilterActive ||
        loadingFilter ||
        !nivCatResult ||
        nivCatResult.registrationIds.includes(r.registrationId);
      if (!passesNivCat) return false;

      // Filtro búsqueda
      if (!q) return true;
      const name = (r.athlete?.name ?? r.team?.name ?? "").toLowerCase();
      const dni = (r.athlete?.dni ?? "").toLowerCase();
      const inst = (
        r.athlete?.institution?.name ??
        r.team?.institution?.name ??
        ""
      ).toLowerCase();
      return name.includes(q) || dni.includes(q) || inst.includes(q);
    });
  }, [
    allRegistrations,
    assignedIds,
    searchQuery,
    isFilterActive,
    loadingFilter,
    nivCatResult,
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────────

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
    setSelectedIds(availableRegistrations.map((r) => r.registrationId));
  };

  // ── Asignar seleccionados a la fase ──────────────────────────────────────
  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);

    let success = 0;
    let failed = 0;

    for (const registrationId of selectedIds) {
      try {
        await apiClient.post(
          `/competitions/phases/${phaseId}/registrations`,
          { registrationId },
        );
        success++;
      } catch {
        failed++;
      }
    }

    setSubmitting(false);

    // Invalida el cache para refrescar la lista
    queryClient.invalidateQueries({ queryKey: ["phase-registrations", phaseId] });
    setSelectedIds([]);
    refetchPhase();

    if (failed === 0) {
      toast.success(
        `${success} participante${success !== 1 ? "s" : ""} asignado${success !== 1 ? "s" : ""} a la fase`,
      );
    } else {
      toast.warning(`${success} asignados, ${failed} ya estaban en la fase`);
    }
  };

  // ── Quitar un participante de la fase ─────────────────────────────────────
  const handleRemove = async (registrationId: number) => {
    setRemoving(registrationId);
    try {
      await apiClient.delete(
        `/competitions/phases/${phaseId}/registrations/${registrationId}`,
      );
      queryClient.invalidateQueries({
        queryKey: ["phase-registrations", phaseId],
      });
      toast.success("Participante eliminado de la fase");
    } catch {
      toast.error("No se pudo eliminar el participante");
    } finally {
      setRemoving(null);
    }
  };

  const isBusy = submitting || removing !== null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Participantes de fase — ${phaseName}`}
      size="md"
    >
      <div className="space-y-4">

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => setTab("assign")}
            className={`flex-1 py-2 transition-colors ${
              tab === "assign"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Asignar ({availableRegistrations.length} disponibles)
          </button>
          <button
            type="button"
            onClick={() => setTab("assigned")}
            className={`flex-1 py-2 transition-colors border-l border-gray-200 ${
              tab === "assigned"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Asignados ({phaseRegistrations.length})
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB: ASIGNAR
        ══════════════════════════════════════════════════════════════ */}
        {tab === "assign" && (
          <>
            {/* ── Filtro Sismaster ───────────────────────────────────── */}
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
                    <label className="block text-xs text-gray-500 mb-1">
                      Nivel
                    </label>
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
                      {[
                        ...new Set(
                          nivCatOptions?.combos.map((c) => c.idniv),
                        ),
                      ].map((niv) => (
                        <option key={niv} value={niv}>
                          {niv}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Categoría
                    </label>
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
                    — {selectedIds.length} preseleccionado
                    {selectedIds.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            {/* ── Buscador ──────────────────────────────────────────── */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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

            {/* ── Lista de disponibles ───────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {availableRegistrations.length === allRegistrations.length - assignedIds.size
                    ? `Disponibles (${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""})`
                    : `${availableRegistrations.length} resultado${availableRegistrations.length !== 1 ? "s" : ""} — ${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""}`}
                </label>
                {availableRegistrations.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    Seleccionar todos
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-lg border border-gray-200 p-3">
                {availableRegistrations.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    {searchQuery
                      ? `Sin resultados para "${searchQuery}"`
                      : assignedIds.size === allRegistrations.length
                        ? "Todos los participantes ya están asignados a esta fase"
                        : "No hay participantes disponibles"}
                  </div>
                ) : (
                  availableRegistrations.map((reg) => {
                    const name =
                      reg.athlete?.name ?? reg.team?.name ?? "Sin nombre";
                    const institution =
                      reg.athlete?.institution?.name ??
                      reg.team?.institution?.name ??
                      "";
                    const dni = reg.athlete?.dni;
                    const isSelected = selectedIds.includes(reg.registrationId);

                    return (
                      <label
                        key={reg.registrationId}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg
                                   border p-3 transition-all
                                   ${
                                     isSelected
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
                              <p className="text-xs text-gray-500">
                                {institution}
                              </p>
                            )}
                            {dni && (
                              <span className="text-xs text-gray-400 font-mono">
                                DNI: {dni}
                              </span>
                            )}
                            {/* Conteo de género para equipos */}
                            {reg.team?.members &&
                              reg.team.members.length > 0 &&
                              (() => {
                                const males = reg.team!.members!.filter(
                                  (m) => m.athlete?.gender === "M",
                                ).length;
                                const females = reg.team!.members!.filter(
                                  (m) => m.athlete?.gender === "F",
                                ).length;
                                return (
                                  <div className="flex items-center gap-1">
                                    {males > 0 && (
                                      <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                        ♂ {males}
                                      </span>
                                    )}
                                    {females > 0 && (
                                      <span className="inline-flex items-center gap-0.5 rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600 border border-pink-200">
                                        ♀ {females}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Acciones ──────────────────────────────────────────── */}
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
                  : `Asignar a fase${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
              </Button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: ASIGNADOS — ver y quitar participantes de la fase
        ══════════════════════════════════════════════════════════════ */}
        {tab === "assigned" && (
          <>
            {phaseRegistrations.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No hay participantes asignados a esta fase todavía.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-1.5 rounded-lg border border-gray-200 p-3">
                {phaseRegistrations.map((pr) => {
                  // Enriquecer con datos de allRegistrations si el backend
                  // devuelve poco (algunos backends solo devuelven registrationId)
                  const full = allRegistrations.find(
                    (r) => r.registrationId === pr.registrationId,
                  );
                  const reg = pr.registration ?? full;
                  const name =
                    reg?.athlete?.name ?? reg?.team?.name ?? "Sin nombre";
                  const institution =
                    reg?.athlete?.institution?.name ??
                    reg?.team?.institution?.name ??
                    "";
                  const dni = reg?.athlete?.dni;
                  const isBeingRemoved = removing === pr.registrationId;

                  return (
                    <div
                      key={pr.registrationId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {institution && (
                            <p className="text-xs text-gray-500">
                              {institution}
                            </p>
                          )}
                          {dni && (
                            <span className="text-xs text-gray-400 font-mono">
                              DNI: {dni}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(pr.registrationId)}
                        disabled={isBusy}
                        className="flex-shrink-0 p-1.5 rounded-md text-gray-400
                                   hover:text-red-500 hover:bg-red-50 transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Quitar de la fase"
                      >
                        {isBeingRemoved ? (
                          <span className="h-4 w-4 block rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}