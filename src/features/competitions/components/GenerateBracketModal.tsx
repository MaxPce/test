import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useGenerateBracket } from "../api/bracket.mutations";
import type { Phase } from "../types";

export interface AvailableRegistration {
  registrationId: number;
  displayName: string;
}

interface GenerateBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  availableRegistrations: AvailableRegistration[]; 
}

export function GenerateBracketModal({
  isOpen,
  onClose,
  phase,
  availableRegistrations,
}: GenerateBracketModalProps) {
  const [bracketType, setBracketType] = useState<"with-participants" | "empty">(
    "with-participants",
  );
  const [bracketSize, setBracketSize] = useState<number>(8);
  const [includeThirdPlace, setIncludeThirdPlace] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(availableRegistrations.map((r) => r.registrationId)),
  );

  const generateBracket = useGenerateBracket();

  // Resetear selección cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(
        new Set(availableRegistrations.map((r) => r.registrationId)),
      );
    }
  }, [isOpen, availableRegistrations]);

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

  const handleGenerate = () => {
    const payload =
      bracketType === "empty"
        ? { phaseId: phase.phaseId, bracketSize, includeThirdPlace }
        : {
            phaseId: phase.phaseId,
            registrationIds: Array.from(selectedIds), 
            includeThirdPlace,
          };

    generateBracket.mutate(payload, {
      onSuccess: () => onClose(),
    });
  };

  const numParticipants =
    bracketType === "empty" ? bracketSize : selectedIds.size;

  const canGenerate = bracketType === "empty" || selectedIds.size >= 2;

  const nextPowerOf2 =
    numParticipants >= 2
      ? Math.pow(2, Math.ceil(Math.log2(numParticipants)))
      : 2;
  const totalRounds = Math.log2(nextPowerOf2);
  const byeCount = nextPowerOf2 - numParticipants;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Bracket de Eliminación"
      size="md"
    >
      <div className="space-y-6">

        {/* Toggle tipo de bracket */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Tipo de bracket</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                value="with-participants"
                checked={bracketType === "with-participants"}
                onChange={(e) =>
                  setBracketType(e.target.value as "with-participants" | "empty")
                }
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Con participantes</p>
                <p className="text-sm text-gray-500">
                  {availableRegistrations.length} participantes registrados
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                value="empty"
                checked={bracketType === "empty"}
                onChange={(e) =>
                  setBracketType(e.target.value as "with-participants" | "empty")
                }
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Bracket vacío</p>
                <p className="text-sm text-gray-500">
                  Solo estructura, sin participantes
                </p>
              </div>
            </label>
          </div>
        </div>

        {bracketType === "with-participants" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Participantes{" "}
                <span className="font-semibold text-blue-600">
                  ({selectedIds.size} seleccionados)
                </span>
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

            <div className="border rounded-lg divide-y max-h-52 overflow-y-auto">
              {availableRegistrations.map((reg) => (
                <label
                  key={reg.registrationId}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(reg.registrationId)}
                    onChange={() => toggleParticipant(reg.registrationId)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">{reg.displayName}</span>
                </label>
              ))}
            </div>

            {selectedIds.size < 2 && (
              <p className="text-xs text-red-500">
                Selecciona al menos 2 participantes.
              </p>
            )}
          </div>
        )}

        {/* Selector de tamaño (solo bracket vacío) */}
        {bracketType === "empty" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tamaño del bracket
            </label>
            <select
              value={bracketSize}
              onChange={(e) => setBracketSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={4}>4 participantes</option>
              <option value={8}>8 participantes</option>
              <option value={16}>16 participantes</option>
              <option value={32}>32 participantes</option>
            </select>
          </div>
        )}

        {/* Tercer lugar */}
        <div>
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={includeThirdPlace}
              onChange={(e) => setIncludeThirdPlace(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <p className="font-medium text-gray-900">
              Incluir partido de tercer lugar
            </p>
          </label>
        </div>

        {/* Preview dinámico */}
        {canGenerate && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Se generarán:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              {byeCount > 0 && (
                <li className="text-amber-600">
                  • BYEs automáticos: {byeCount}
                </li>
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

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            isLoading={generateBracket.isPending}
            disabled={!canGenerate}
          >
            Generar Bracket
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Helper — sin cambios
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
