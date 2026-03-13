import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useInitializePoomsaeGroupPhase } from "../api/taekwondo.mutations";
import type { Phase } from "../types";
import { apiClient } from "@/lib/api/client";

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface AvailableRegistration {
  registrationId: number;
  displayName: string;
}

interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}

interface NivCatOptions {
  combos: NivCatCombo[];
}

interface NivCatResult {
  registrationIds: number[];
  athletes: {
    idacreditation: number;
    fullName: string;
    institutionAbrev: string;
    registration_id: number | null;
  }[];
}

// ── Props ──────────────────────────────────────────────────────────────────

interface InitializePoomsaeGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  availableRegistrations: AvailableRegistration[];
  sismasterEventId?: number;
  sismasterSportId?: number;
  eventCategoryId?: number;
}

// ── Componente ─────────────────────────────────────────────────────────────

export function InitializePoomsaeGroupModal({
  isOpen,
  onClose,
  phase,
  availableRegistrations,
  sismasterEventId,
  sismasterSportId,
  eventCategoryId,
}: InitializePoomsaeGroupModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(availableRegistrations.map((r) => r.registrationId)),
  );
  const [selectedNiv, setSelectedNiv] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("");

  const initializeMutation = useInitializePoomsaeGroupPhase();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);
  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // ── Resetear al abrir ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(availableRegistrations.map((r) => r.registrationId)));
      setSelectedNiv("");
      setSelectedCat("");
    }
  }, [isOpen, availableRegistrations]);

  // ── Query 1: combos idniv/idcat disponibles ──────────────────────────────
  const { data: nivCatOptions } = useQuery<NivCatOptions>({
    queryKey: ["sismaster-niv-cat-options", sismasterEventId, sismasterSportId, eventCategoryId],
    queryFn: async () => {
      const { data } = await apiClient.get("/sismaster/athletes/niv-cat-options", {
        params: { sismasterEventId, sismasterSportId, eventCategoryId },
      });
      return data;
    },
    enabled: hasSismaster && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  // ── Query 2: cruce sismaster → registration_ids locales ──────────────────
  const { data: nivCatResult, isFetching: loadingFilter } = useQuery<NivCatResult>({
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
    enabled: hasSismaster && Boolean(selectedNiv) && Boolean(selectedCat),
  });

  // ── Auto-seleccionar IDs cuando llega resultado del filtro ───────────────
  useEffect(() => {
    if (!isFilterActive || loadingFilter) return;
    if (nivCatResult?.registrationIds) {
      const validIds = new Set(availableRegistrations.map((r) => r.registrationId));
      const filtered = nivCatResult.registrationIds.filter((id) => validIds.has(id));
      setSelectedIds(new Set(filtered));
    }
  }, [nivCatResult, isFilterActive, loadingFilter, availableRegistrations]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const clearFilter = () => {
    setSelectedNiv("");
    setSelectedCat("");
    setSelectedIds(new Set(availableRegistrations.map((r) => r.registrationId)));
  };

  const toggleParticipant = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(availableRegistrations.map((r) => r.registrationId)));
  const deselectAll = () => setSelectedIds(new Set());

  // ── Generación ───────────────────────────────────────────────────────────
  const handleGenerate = () => {
    const registrationIds = Array.from(selectedIds);
    initializeMutation.mutate(
      { phaseId: phase.phaseId, registrationIds },
      { onSuccess: () => onClose() },
    );
  };

  const canGenerate = selectedIds.size >= 1;

  // ────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inicializar Fase Poomsae - Grupos"
      size="md"
    >
      <div className="space-y-6">

        

        {/* ── Participantes ────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Participantes en la fase
            </p>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={selectAll}
                className="text-blue-600 hover:underline"
              >
                Todos
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-red-500 hover:underline"
              >
                Ninguno
              </button>
            </div>
          </div>

          {/* Filtros Sismaster */}
          {hasSismaster && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
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
                      setSelectedIds(
                        new Set(availableRegistrations.map((r) => r.registrationId)),
                      );
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {[...new Set(nivCatOptions?.combos.map((c) => c.idniv))].map((niv) => (
                      <option key={niv} value={niv}>{niv}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    disabled={!selectedNiv}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
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
                <p className="text-xs text-blue-500 animate-pulse">
                  Aplicando filtro...
                </p>
              )}
              {isFilterActive && !loadingFilter && (
                <p className="text-xs text-blue-600">
                  Filtro activo:{" "}
                  <span className="font-semibold">
                    {selectedNiv} / {selectedCat}
                  </span>{" "}
                  — {selectedIds.size} de {availableRegistrations.length} seleccionados
                </p>
              )}
            </div>
          )}

          {/* Contador */}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{selectedIds.size}</span>
            {" "}/{" "}{availableRegistrations.length} seleccionados
          </p>

          {/* Lista */}
          <div className="border rounded-lg divide-y max-h-56 overflow-y-auto">
            {availableRegistrations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No hay inscritos en esta categoría
              </p>
            ) : (
              availableRegistrations.map((reg) => {
                const isFiltered =
                  isFilterActive &&
                  !loadingFilter &&
                  nivCatResult !== undefined &&
                  !nivCatResult.registrationIds.includes(reg.registrationId);

                return (
                  <label
                    key={reg.registrationId}
                    className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-opacity ${
                      isFiltered ? "opacity-30" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(reg.registrationId)}
                      onChange={() => toggleParticipant(reg.registrationId)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-800">{reg.displayName}</span>
                  </label>
                );
              })
            )}
          </div>

          {selectedIds.size === 0 && (
            <p className="text-xs text-red-500">
              Selecciona al menos 1 participante.
            </p>
          )}
        </div>

        {/* ── Preview ──────────────────────────────────────────────────── */}
        {canGenerate && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Se creará:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 1 grupo con {selectedIds.size} participante{selectedIds.size !== 1 ? "s" : ""}</li>
              
            </ul>
          </div>
        )}

        {/* ── Acciones ─────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            isLoading={initializeMutation.isPending}
            disabled={!canGenerate || initializeMutation.isPending}
          >
            Inicializar Fase
          </Button>
        </div>
      </div>
    </Modal>
  );
}
