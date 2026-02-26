import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type {
  WrestlingMatch,
  WrestlingVictoryType,
} from "../../types/wrestling.types";
import type { Phase } from "../../types";
import { useUpdateMatch } from "../../api/matches.mutations";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { useUpdateStandings } from "../../api/standings.mutations";
import { toast } from "sonner";

interface Props {
  match: WrestlingMatch;
  phase?: Phase;
  isOpen: boolean;
  onClose: () => void;
}

const VICTORY_TYPES: { value: WrestlingVictoryType; label: string }[] = [
  { value: null, label: "Sin especificar" },
  { value: "VFA", label: "VFA — Victoria por Caída" },
  { value: "VSU", label: "VSU — Por Superioridad" },
  { value: "VSU1", label: "VSU1 — Superioridad variante" },
  { value: "VPO", label: "VPO — Por Puntos" },
  { value: "VCA", label: "VCA — Por Descalificación" },
];

export const WrestlingScoreModal = ({
  match,
  phase,
  isOpen,
  onClose,
}: Props) => {
  const [tp1, setTp1] = useState<number>(Number(match.participant1Score) || 0);
  const [tp2, setTp2] = useState<number>(Number(match.participant2Score) || 0);
  const [victoryType, setVictoryType] = useState<WrestlingVictoryType>(null);
  const [vfaWinner, setVfaWinner] = useState<1 | 2 | null>(null);
  const [manualWinner, setManualWinner] = useState<1 | 2 | null>(null);

  const updateMutation = useUpdateMatch();
  const advanceWinnerMutation = useAdvanceWinner();
  const updateStandingsMutation = useUpdateStandings();

  const isElimination = phase?.type === "eliminacion";

  useEffect(() => {
    setTp1(Number(match.participant1Score) || 0);
    setTp2(Number(match.participant2Score) || 0);
    setVictoryType(match.victoryType ?? null);
    setVfaWinner(null);
    setManualWinner(null);
  }, [match]);

  if (!isOpen) return null;

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getName = (p: typeof participant1) =>
    p?.registration?.athlete?.name || `Participante #${p?.participationId}`;

  if (!match.participations || match.participations.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Error: Participantes no encontrados
          </h2>
          <p className="text-gray-700 mb-4">
            Este combate no tiene participantes asignados o no se cargaron
            correctamente.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  const isTie = tp1 === tp2;
  const isVFA = victoryType === "VFA";

  const winnerIndex: 1 | 2 | null = (() => {
    if (isVFA) return vfaWinner;
    if (!isTie) return tp1 > tp2 ? 1 : 2;
    return manualWinner;
  })();

  const winnerRegistrationId: number | null =
    winnerIndex === 1
      ? (participant1?.registrationId ?? null)
      : winnerIndex === 2
        ? (participant2?.registrationId ?? null)
        : null;

  const canSave = (): boolean => {
    if (isVFA && vfaWinner === null) return false;
    if (isElimination && isTie && !isVFA && manualWinner === null) return false;
    return true;
  };

  const handleSubmit = () => {
    if (isElimination && winnerRegistrationId === null) {
      toast.error("Debes seleccionar un ganador para avanzar en el bracket.");
      return;
    }

    const matchData = {
      participant1Score: tp1,
      participant2Score: tp2,
      winnerRegistrationId,
      status: "finalizado",
      victoryType: victoryType ?? null,
    };

    if (isElimination) {
      updateMutation.mutate(
        { id: match.matchId, data: matchData },
        {
          onSuccess: () => {
            advanceWinnerMutation.mutate(
              {
                matchId: match.matchId,
                winnerRegistrationId: winnerRegistrationId!,
              },
              {
                onSuccess: () => {
                  toast.success(
                    "Resultado guardado y ganador avanzado al bracket.",
                  );
                  onClose();
                },
                onError: () => {
                  toast.error(
                    "Resultado guardado pero error al avanzar al ganador.",
                  );
                },
              },
            );
          },
          onError: () => toast.error("Error al guardar el resultado."),
        },
      );
    } else {
      updateMutation.mutate(
        { id: match.matchId, data: matchData },
        {
          onSuccess: () => {
            if (phase?.phaseId) {
              updateStandingsMutation.mutate(phase.phaseId, {
                onSuccess: () => {
                  toast.success("Resultado y standings actualizados.");
                  onClose();
                },
                onError: () => {
                  toast.warning(
                    "Resultado guardado, pero no se pudieron actualizar los standings.",
                  );
                  onClose();
                },
              });
            } else {
              toast.success("Resultado guardado correctamente.");
              onClose();
            }
          },
          onError: () => toast.error("Error al guardar el resultado."),
        },
      );
    }
  };

  const isLoading =
    updateMutation.isPending ||
    advanceWinnerMutation.isPending ||
    updateStandingsMutation.isPending;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-orange-700 to-red-600 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold">
            {match.participant1Score !== null &&
            match.participant1Score !== undefined
              ? "Editar Resultado"
              : "Registrar Resultado"}
          </h2>
          <p className="text-sm text-orange-100">
            Combate #{match.matchNumber} — Lucha Olímpica
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
              <p className="text-xs font-semibold text-orange-700 uppercase mb-1">
                Luchador 1
              </p>
              <p className="font-medium text-sm text-gray-800 mb-3 truncate">
                {getName(participant1)}
              </p>
              <label className="text-xs text-gray-500 mb-1 block">
                TP (Puntos Técnicos)
              </label>
              <input
                type="number"
                min="0"
                value={tp1}
                onChange={(e) => {
                  setTp1(Math.max(0, Number(e.target.value)));
                  setManualWinner(null);
                }}
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl font-bold"
              />
            </div>

            <div className="border-2 border-red-400 rounded-lg p-4 bg-red-50">
              <p className="text-xs font-semibold text-red-700 uppercase mb-1">
                Luchador 2
              </p>
              <p className="font-medium text-sm text-gray-800 mb-3 truncate">
                {getName(participant2)}
              </p>
              <label className="text-xs text-gray-500 mb-1 block">
                TP (Puntos Técnicos)
              </label>
              <input
                type="number"
                min="0"
                value={tp2}
                onChange={(e) => {
                  setTp2(Math.max(0, Number(e.target.value)));
                  setManualWinner(null);
                }}
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Victoria
            </label>
            <select
              value={victoryType ?? ""}
              onChange={(e) => {
                const val = e.target.value as WrestlingVictoryType;
                setVictoryType(val || null);
                setVfaWinner(null);
                setManualWinner(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              {VICTORY_TYPES.map((vt) => (
                <option key={String(vt.value)} value={String(vt.value ?? "")}>
                  {vt.label}
                </option>
              ))}
            </select>
          </div>

          {isVFA && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVfaWinner(1)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                    vfaWinner === 1
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-orange-300 hover:border-orange-500"
                  }`}
                >
                  {getName(participant1)}
                </button>
                <button
                  type="button"
                  onClick={() => setVfaWinner(2)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                    vfaWinner === 2
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-700 border-red-300 hover:border-red-500"
                  }`}
                >
                  {getName(participant2)}
                </button>
              </div>
            </div>
          )}

          {!isVFA && isTie && (
            <div
              className={`border rounded-lg p-4 ${
                isElimination
                  ? "bg-red-50 border-red-300"
                  : "bg-amber-50 border-amber-300"
              }`}
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setManualWinner(manualWinner === 1 ? null : 1)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                    manualWinner === 1
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-orange-300 hover:border-orange-500"
                  }`}
                >
                  {getName(participant1)}
                </button>
                <button
                  type="button"
                  onClick={() => setManualWinner(manualWinner === 2 ? null : 2)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                    manualWinner === 2
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-700 border-red-300 hover:border-red-500"
                  }`}
                >
                  {getName(participant2)}
                </button>
              </div>
            </div>
          )}

          {winnerIndex !== null && (
            <div className="flex justify-around text-center bg-gray-50 rounded-lg py-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  CP — {getName(participant1)}
                </p>
                <p
                  className={`text-2xl font-bold ${winnerIndex === 1 ? "text-orange-600" : "text-gray-300"}`}
                >
                  {winnerIndex === 1 ? 5 : 0}
                </p>
              </div>
              <div className="border-l border-gray-200" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  CP — {getName(participant2)}
                </p>
                <p
                  className={`text-2xl font-bold ${winnerIndex === 2 ? "text-red-600" : "text-gray-300"}`}
                >
                  {winnerIndex === 2 ? 5 : 0}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !canSave()}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {isLoading ? "Guardando..." : "Guardar Resultado"}
          </button>
        </div>
      </div>
    </div>
  );
};
