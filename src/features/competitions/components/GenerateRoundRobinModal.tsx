import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { UserCircle2, CheckCircle2 } from "lucide-react";
import type { Phase } from "../types";
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

type RoundRobinType = "with-participants" | "empty";

interface GenerateRoundRobinModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  registrations: any[];
  onGenerate: (data: {
    phaseId: number;
    registrationIds: number[];
    emptyParticipantCount?: number;
  }) => void;
  isLoading?: boolean;
  // Sismaster (opcionales)
  sismasterEventId?: number;
  sismasterSportId?: number;
  eventCategoryId?: number;
}

// ── Componente ─────────────────────────────────────────────────────────────

export function GenerateRoundRobinModal({
  isOpen,
  onClose,
  phase,
  registrations,
  onGenerate,
  isLoading,
  sismasterEventId,
  sismasterSportId,
  eventCategoryId,
}: GenerateRoundRobinModalProps) {
  const [roundRobinType, setRoundRobinType] = useState<RoundRobinType>("with-participants");
  const [emptyParticipantCount, setEmptyParticipantCount] = useState(4);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedNiv, setSelectedNiv] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  // ✅ Antes de cualquier useEffect
  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setSelectedNiv("");
      setSelectedCat("");
      setRoundRobinType("with-participants");
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
    enabled: hasSismaster && isOpen && roundRobinType === "with-participants",
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
    enabled:
      hasSismaster &&
      roundRobinType === "with-participants" &&
      Boolean(selectedNiv) &&
      Boolean(selectedCat),
  });

  // Auto-seleccionar IDs filtrados
  useEffect(() => {
    if (!isFilterActive || loadingFilter) return;
    if (nivCatResult?.registrationIds) {
      const validIds = new Set(registrations.map((r) => r.registrationId));
      const filtered = nivCatResult.registrationIds.filter((id) => validIds.has(id));
      setSelectedIds(new Set(filtered));
    }
  }, [nivCatResult, isFilterActive, loadingFilter, registrations]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const clearFilter = () => {
    setSelectedNiv("");
    setSelectedCat("");
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(registrations.map((r) => r.registrationId)));
  const deselectAll = () => setSelectedIds(new Set());

  // ── Generación ───────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (roundRobinType === "empty") {
      onGenerate({
        phaseId: phase.phaseId,
        registrationIds: [],
        emptyParticipantCount,
      });
    } else {
      onGenerate({
        phaseId: phase.phaseId,
        registrationIds: Array.from(selectedIds),
      });
    }
    setSelectedIds(new Set());
    onClose();
  };

  // ── Cálculos ─────────────────────────────────────────────────────────────
  const participantCount =
    roundRobinType === "empty" ? emptyParticipantCount : selectedIds.size;
  const totalMatches = (participantCount * (participantCount - 1)) / 2;
  const canGenerate =
    roundRobinType === "empty" ? emptyParticipantCount >= 2 : selectedIds.size >= 2;

  // ────────────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Partidos" size="lg">
      <div className="space-y-6">

        {/* ── Tipo ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Tipo de grupos</p>
          <div className="space-y-2">

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                checked={roundRobinType === "with-participants"}
                onChange={() => setRoundRobinType("with-participants")}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Con participantes</p>
                <p className="text-sm text-gray-500">
                  {registrations.length} participantes registrados
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                checked={roundRobinType === "empty"}
                onChange={() => setRoundRobinType("empty")}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Partidos vacíos</p>
                <p className="text-sm text-gray-500">Solo estructura, sin participantes</p>
              </div>
            </label>
          </div>
        </div>

        {/* ── Modo vacío ───────────────────────────────────────────────── */}
        {roundRobinType === "empty" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Número de participantes
            </label>
            <select
              value={emptyParticipantCount}
              onChange={(e) => setEmptyParticipantCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} participantes → {(n * (n - 1)) / 2} partidos
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Modo con participantes ───────────────────────────────────── */}
        {roundRobinType === "with-participants" && (
          <div className="space-y-4">

            {/* Estadísticas */}
            {participantCount > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Participantes</p>
                  <p className="text-2xl font-bold text-green-900">{participantCount}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 mb-1">Partidos a crear</p>
                  <p className="text-2xl font-bold text-purple-900">{totalMatches}</p>
                </div>
              </div>
            )}

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
                        setSelectedIds(new Set());
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
                    Filtro activo:{" "}
                    <span className="font-semibold">{selectedNiv} / {selectedCat}</span>
                    {" — "}
                    {selectedIds.size} de {registrations.length} seleccionados
                  </p>
                )}
              </div>
            )}

            {/* Header lista */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                Participantes ({selectedIds.size}/{registrations.length})
              </h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Seleccionar Todos
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Lista */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {registrations.map((registration) => {
                const isSelected = selectedIds.has(registration.registrationId);
                const name = registration.athlete
                  ? registration.athlete.name
                  : registration.team?.name || "Sin nombre";
                const institution =
                  registration.athlete?.institution?.name ||
                  registration.team?.institution?.name || "";

                const isFiltered =
                  isFilterActive &&
                  !loadingFilter &&
                  nivCatResult !== undefined &&
                  !nivCatResult.registrationIds.includes(registration.registrationId);

                return (
                  <button
                    key={registration.registrationId}
                    onClick={() => toggleSelection(registration.registrationId)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isFiltered
                        ? "opacity-30"
                        : isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <UserCircle2 className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          {institution && (
                            <p className="text-sm text-gray-600">{institution}</p>
                          )}
                        </div>
                      </div>
                      {registration.seedNumber && (
                        <Badge variant="default" size="sm">
                          Seed #{registration.seedNumber}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Preview ──────────────────────────────────────────────────── */}
        {canGenerate && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Se generarán:</p>
            <p className="text-sm text-gray-600">
              • <span className="font-semibold">{totalMatches}</span> partidos (todos contra todos)
            </p>
            {roundRobinType === "empty" && (
              <p className="text-xs text-amber-600 mt-1">
                Los participantes se asignarán manualmente después.
              </p>
            )}
          </div>
        )}

        {/* ── Acciones ─────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={!canGenerate || isLoading}
          >
            Generar {totalMatches} Partido{totalMatches !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
