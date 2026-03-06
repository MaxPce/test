import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Phase } from "../types";
import type { Registration } from "@/features/events/types";
import { apiClient } from "@/lib/api/client";

// ── Tipos ──────────────────────────────────────────────────────────────────

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
}

interface GenerateBestOf3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  registrations: Registration[];
  onGenerate: (data: { phaseId: number; registrationIds: number[] }) => Promise<void>;
  isLoading: boolean;
  // Sismaster (opcionales)
  sismasterEventId?: number;
  sismasterSportId?: number;
  eventCategoryId?: number;
}

// ── Componente ─────────────────────────────────────────────────────────────

export function GenerateBestOf3Modal({
  isOpen,
  onClose,
  phase,
  registrations,
  onGenerate,
  isLoading,
  sismasterEventId,
  sismasterSportId,
  eventCategoryId,
}: GenerateBestOf3ModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedNiv, setSelectedNiv] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  // ✅ Antes de cualquier useEffect
  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectedNiv("");
      setSelectedCat("");
    }
  }, [isOpen]);

  // ── Query 1: opciones idniv/idcat ────────────────────────────────────────
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
      const { data } = await apiClient.get("/sismaster/athletes/registrations-by-niv-cat", {
        params: {
          sismasterEventId,
          sismasterSportId,
          idniv: selectedNiv,
          idcat: selectedCat,
          ...(eventCategoryId ? { eventCategoryId } : {}),
        },
      });
      return data;
    },
    enabled: hasSismaster && Boolean(selectedNiv) && Boolean(selectedCat),
  });

  // Auto-seleccionar los primeros 2 del filtro
  useEffect(() => {
    if (!isFilterActive || loadingFilter) return;
    if (nivCatResult?.registrationIds) {
      const validIds = new Set(registrations.map((r) => r.registrationId));
      const filtered = nivCatResult.registrationIds.filter((id) => validIds.has(id));
      // BestOf3 solo admite 2 → preseleccionar los primeros 2
      setSelectedIds(filtered.slice(0, 2));
    }
  }, [nivCatResult, isFilterActive, loadingFilter, registrations]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const clearFilter = () => {
    setSelectedNiv("");
    setSelectedCat("");
    setSelectedIds([]);
  };

  const handleToggle = (registrationId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(registrationId)) return prev.filter((id) => id !== registrationId);
      if (prev.length < 2) return [...prev, registrationId];
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length !== 2) return;
    await onGenerate({ phaseId: phase.phaseId, registrationIds: selectedIds });
    setSelectedIds([]);
    onClose();
  };

  // ────────────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Serie Mejor de 3">
      <div className="space-y-4">

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
                    setSelectedIds([]);
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
              <p className="text-xs text-blue-500 animate-pulse">Aplicando filtro...</p>
            )}
            {isFilterActive && !loadingFilter && (
              <p className="text-xs text-blue-600">
                Filtro: <span className="font-semibold">{selectedNiv} / {selectedCat}</span>
                {" — "}solo se muestran los coincidentes
              </p>
            )}
          </div>
        )}

        {/* Lista participantes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Participantes ({selectedIds.length}/2)
          </label>
          <div className="max-h-80 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {registrations.map((reg) => {
              const name = reg.athlete ? reg.athlete.name : reg.team?.name || "Sin nombre";
              const institution =
                reg.athlete?.institution?.name || reg.team?.institution?.name || "";
              const isSelected = selectedIds.includes(reg.registrationId);

              const isFiltered =
                isFilterActive &&
                !loadingFilter &&
                nivCatResult !== undefined &&
                !nivCatResult.registrationIds.includes(reg.registrationId);

              return (
                <label
                  key={reg.registrationId}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    isFiltered
                      ? "opacity-25 pointer-events-none"
                      : isSelected
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                  } ${selectedIds.length >= 2 && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(reg.registrationId)}
                    disabled={(selectedIds.length >= 2 && !isSelected) || isFiltered}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{name}</p>
                    {institution && (
                      <p className="text-sm text-gray-600">{institution}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedIds.length !== 2 || isLoading}
          >
            {isLoading ? "Generando..." : "Generar Serie"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
