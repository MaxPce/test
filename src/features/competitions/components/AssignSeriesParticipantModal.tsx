import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Registration {
  registrationId: number;
  athlete?: { name: string; institution?: { name: string } };
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedNiv, setSelectedNiv] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);
  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectedNiv("");
      setSelectedCat("");
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
    const visible = allRegistrations
      .filter((r) => {
        if (!isFilterActive || !nivCatResult) return true;
        return nivCatResult.registrationIds.includes(r.registrationId);
      })
      .map((r) => r.registrationId);
    setSelectedIds(visible);
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);

    let success = 0;
    let failed = 0;

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
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Todos</option>
                  {[...new Set(nivCatOptions?.combos.map((c) => c.idniv))].map(
                    (niv) => (
                      <option key={niv} value={niv}>
                        {niv}
                      </option>
                    ),
                  )}
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
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
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

        {/* ── Lista de participantes ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Participantes ({selectedIds.length} seleccionado
              {selectedIds.length !== 1 ? "s" : ""})
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-orange-600 hover:underline"
            >
              Seleccionar todos
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-lg border border-gray-200 p-3">
            {allRegistrations.map((reg) => {
              const name = reg.athlete?.name ?? reg.team?.name ?? "Sin nombre";
              const institution =
                reg.athlete?.institution?.name ??
                reg.team?.institution?.name ??
                "";
              const isSelected = selectedIds.includes(reg.registrationId);
              const isFiltered =
                isFilterActive &&
                !loadingFilter &&
                nivCatResult !== undefined &&
                !nivCatResult.registrationIds.includes(reg.registrationId);

              return (
                <label
                  key={reg.registrationId}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                    isFiltered
                      ? "pointer-events-none opacity-20"
                      : isSelected
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(reg.registrationId)}
                    disabled={isFiltered || isBusy}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {name}
                    </p>
                    {institution && (
                      <p className="text-xs text-gray-500">{institution}</p>
                    )}
                  </div>
                </label>
              );
            })}
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
