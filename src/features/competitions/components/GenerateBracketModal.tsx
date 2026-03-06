import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useGenerateBracket } from "../api/bracket.mutations";
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

interface GenerateBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  availableRegistrations: AvailableRegistration[];
  sismasterEventId?: number;
  sismasterSportId?: number;
  eventCategoryId?: number;
}

type BracketType = "with-participants" | "empty";

// ── Componente ─────────────────────────────────────────────────────────────

export function GenerateBracketModal({
  isOpen,
  onClose,
  phase,
  availableRegistrations,
  sismasterEventId,
  sismasterSportId,
  eventCategoryId,
}: GenerateBracketModalProps) {
  const [bracketType, setBracketType] = useState<BracketType>("with-participants");
  const [bracketSize, setBracketSize] = useState<number>(8);
  const [includeThirdPlace, setIncludeThirdPlace] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(availableRegistrations.map((r) => r.registrationId)),
  );
  const [selectedNiv, setSelectedNiv] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("");

  const generateBracket = useGenerateBracket();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  const isFilterActive = Boolean(selectedNiv && selectedCat);

  // ── Resetear al abrir ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(availableRegistrations.map((r) => r.registrationId)));
      setSelectedNiv("");
      setSelectedCat("");
      setBracketType("with-participants");
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
    enabled:
      hasSismaster &&
      Boolean(selectedNiv) &&
      Boolean(selectedCat),
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

  // ── Lógica de generación ─────────────────────────────────────────────────
  const handleGenerate = () => {
    // En ambos casos siempre se envían los registrationIds seleccionados
    // para que AssignParticipantsModal pueda filtrar el pool correctamente.
    const poolIds = Array.from(selectedIds);

    if (bracketType === "empty") {
      generateBracket.mutate(
        {
          phaseId: phase.phaseId,
          bracketSize: poolIds.length,   // ← calculado desde los seleccionados
          includeThirdPlace,
          registrationIds: poolIds.length > 0 ? poolIds : undefined,
        },
        { onSuccess: () => onClose() },
      );
      return;
    }

    generateBracket.mutate(
      {
        phaseId: phase.phaseId,
        registrationIds: poolIds,
        includeThirdPlace,
      },
      { onSuccess: () => onClose() },
    );
  };

  // ── Cálculos de preview ──────────────────────────────────────────────────
  const numParticipants = selectedIds.size;
  const canGenerate = selectedIds.size >= 2;
  const nextPowerOf2 =
    numParticipants >= 2
      ? Math.pow(2, Math.ceil(Math.log2(numParticipants)))
      : 2;
  const totalRounds = Math.log2(nextPowerOf2);
  const byeCount    = nextPowerOf2 - numParticipants;

  // ────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Bracket de Eliminación"
      size="md"
    >
      <div className="space-y-6">

        {/* ── Toggle tipo de bracket ───────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Tipo de bracket</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                value="with-participants"
                checked={bracketType === "with-participants"}
                onChange={() => setBracketType("with-participants")}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Con participantes</p>
                
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                value="empty"
                checked={bracketType === "empty"}
                onChange={() => setBracketType("empty")}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Bracket vacío</p>
                
              </div>
            </label>
          </div>
        </div>

        

        {/* ── Sección de participantes (ambos modos) ───────────────────── */}
        <div className="space-y-3">

          {/* Encabezado con etiqueta contextual */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {bracketType === "with-participants"
                  ? "Participantes en el bracket"
                  : "Pool de participantes disponibles"}
              </p>
              {bracketType === "empty" && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Estos serán los únicos disponibles al asignar manualmente
                </p>
              )}
            </div>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={selectAll} className="text-blue-600 hover:underline">
                Todos
              </button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={deselectAll} className="text-red-500 hover:underline">
                Ninguno
              </button>
            </div>
          </div>

          {/* Filtros Sismaster — solo si se pasaron las props */}
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
                <p className="text-xs text-blue-500 animate-pulse">Aplicando filtro...</p>
              )}
              {isFilterActive && !loadingFilter && (
                <p className="text-xs text-blue-600">
                  Filtro activo:{" "}
                  <span className="font-semibold">{selectedNiv} / {selectedCat}</span>
                  {" — "}
                  {selectedIds.size} de {availableRegistrations.length} seleccionados
                </p>
              )}
            </div>
          )}

          {/* Contador */}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{selectedIds.size}</span>
            {" "}/{" "}{availableRegistrations.length} seleccionados
          </p>

          {/* Lista de participantes */}
          <div className="border rounded-lg divide-y max-h-52 overflow-y-auto">
            {availableRegistrations.map((reg) => {
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
            })}
          </div>

          {bracketType === "with-participants" && selectedIds.size < 2 && (
            <p className="text-xs text-red-500">Selecciona al menos 2 participantes.</p>
          )}
        </div>

        {/* ── Tercer lugar ─────────────────────────────────────────────── */}
        <div>
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={includeThirdPlace}
              onChange={(e) => setIncludeThirdPlace(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <p className="font-medium text-gray-900">Incluir partido de tercer lugar</p>
          </label>
        </div>

        {/* ── Preview dinámico ──────────────────────────────────────────── */}
        {canGenerate && numParticipants >= 2 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Se generarán:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {byeCount > 0 && (
                <li className="text-amber-600">• BYEs automáticos: {byeCount}</li>
              )}
              {getRoundNames(totalRounds).map((round, index) => (
                <li key={index}>
                  • {round.name}: {round.matches} partido(s)
                </li>
              ))}
              {includeThirdPlace && (
                <li className="text-amber-700">• Tercer lugar: 1 partido</li>
              )}
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
            isLoading={generateBracket.isPending}
            disabled={!canGenerate || generateBracket.isPending}
          >
            Generar Bracket
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────
function getRoundNames(totalRounds: number) {
  const rounds = [];
  let matchesInRound = Math.pow(2, totalRounds - 1);

  const names: Record<number, string> = {
    1: "Final",
    2: "Semifinales",
    4: "Cuartos de Final",
    8: "Octavos de Final",
    16: "Dieciseisavos de Final",
  };

  for (let i = 0; i < totalRounds; i++) {
    rounds.push({
      name: names[matchesInRound] || `Ronda de ${matchesInRound * 2}`,
      matches: matchesInRound,
    });
    matchesInRound /= 2;
  }

  return rounds;
}