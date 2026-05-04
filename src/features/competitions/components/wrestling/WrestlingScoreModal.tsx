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

// ─── Tipos de victoria disponibles ─────────────────────────────────────────
const VICTORY_TYPES: { value: WrestlingVictoryType; label: string }[] = [
  { value: null,   label: "Sin especificar" },
  { value: "VFA",  label: "VFA  — Victoria por Caída" },
  { value: "VSU",  label: "VSU  — Por Superioridad" },
  { value: "VSU1", label: "VSU1 — Superioridad variante" },
  { value: "VPO",  label: "VPO  — Por Puntos" },
  { value: "VCA",  label: "VCA  — Por Descalificación" },
  { value: "VIN",  label: "VIN  — Por Invalidación" },
  { value: "FFT",  label: "FFT  — Forfait (no presentación)" },
  { value: "INJ",  label: "INJ  — Por Lesión" },
  { value: "DSQ",  label: "DSQ  — Descalificación" },
];

// ─── Tipos que NO requieren puntaje TP ─────────────────────────────────────
// En estos casos el ganador se define manualmente sin marcador técnico.
const NO_SCORE_VICTORY_TYPES: WrestlingVictoryType[] = ["FFT", "INJ", "DSQ"];

// Mensajes informativos por tipo especial
const NO_SCORE_MESSAGES: Partial<Record<string, string>> = {
  FFT: "Forfait: el atleta no se presentó al combate. No se registran puntos TP.",
  INJ: "Lesión: el combate se detiene por lesión del atleta. No se registran puntos TP.",
  DSQ: "Descalificación: el atleta pierde por infracción grave. No se registran puntos TP.",
};

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

  const updateMutation        = useUpdateMatch();
  const advanceWinnerMutation = useAdvanceWinner();
  const updateStandingsMutation = useUpdateStandings();

  const isElimination = phase?.type === "eliminacion";

  // ─── Derivados del tipo de victoria seleccionado ──────────────────────────
  const isVFA        = victoryType === "VFA";
  // ← LÓGICA ESPECIAL: se activa cuando el tipo es FFT, INJ o DSQ
  const isNoScoreType = NO_SCORE_VICTORY_TYPES.includes(victoryType as WrestlingVictoryType);

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

  // ─── Determinación del ganador ────────────────────────────────────────────
  const winnerIndex: 1 | 2 | null = (() => {
    // VFA: ganador siempre manual (por caída)
    if (isVFA) return vfaWinner;
    // ← LÓGICA ESPECIAL: FFT/INJ/DSQ → ganador siempre manual, sin importar TP
    if (isNoScoreType) return manualWinner;
    // Normal: quien tenga más TP gana; si empatan, manual en eliminación
    if (!isTie) return tp1 > tp2 ? 1 : 2;
    return manualWinner;
  })();

  const winnerRegistrationId: number | null =
    winnerIndex === 1
      ? (participant1?.registrationId ?? null)
      : winnerIndex === 2
        ? (participant2?.registrationId ?? null)
        : null;

  // ─── Validación para habilitar el botón Guardar ───────────────────────────
  const canSave = (): boolean => {
    // VFA siempre necesita seleccionar quién cayó
    if (isVFA && vfaWinner === null) return false;
    // ← LÓGICA ESPECIAL: FFT/INJ/DSQ requieren seleccionar ganador manualmente
    if (isNoScoreType && manualWinner === null) return false;
    // Empate en eliminación sin VFA/NoScore → debe elegir ganador
    if (isElimination && isTie && !isVFA && !isNoScoreType && manualWinner === null) return false;
    return true;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (isElimination && winnerRegistrationId === null) {
      toast.error("Debes seleccionar un ganador para avanzar en el bracket.");
      return;
    }

    const matchData = {
      // ← LÓGICA ESPECIAL: si es FFT/INJ/DSQ los TP se envían en 0
      participant1Score: isNoScoreType ? 0 : tp1,
      participant2Score: isNoScoreType ? 0 : tp2,
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
                  toast.success("Resultado guardado y ganador avanzado al bracket.");
                  onClose();
                },
                onError: () => {
                  toast.error("Resultado guardado pero error al avanzar al ganador.");
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
        {/* ── Header ── */}
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
          {/* ── Inputs de TP ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Luchador 1 */}
            <div
              className={`border-2 rounded-lg p-4 transition-colors ${
                isNoScoreType
                  ? "border-gray-200 bg-gray-50"
                  : "border-orange-400 bg-orange-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase mb-1 ${
                  isNoScoreType ? "text-gray-400" : "text-orange-700"
                }`}
              >
                Luchador 1
              </p>
              <p className="font-medium text-sm text-gray-800 mb-3 truncate">
                {getName(participant1)}
              </p>
              <label
                className={`text-xs mb-1 block ${
                  isNoScoreType ? "text-gray-400" : "text-gray-500"
                }`}
              >
                TP (Puntos Técnicos)
              </label>
              {/* ← LÓGICA ESPECIAL: input deshabilitado para FFT/INJ/DSQ */}
              <input
                type="number"
                min="0"
                value={isNoScoreType ? 0 : tp1}
                onChange={(e) => {
                  setTp1(Math.max(0, Number(e.target.value)));
                  setManualWinner(null);
                }}
                disabled={isNoScoreType}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none text-center text-2xl font-bold transition-colors ${
                  isNoScoreType
                    ? "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "border-orange-300 focus:ring-2 focus:ring-orange-500"
                }`}
              />
            </div>

            {/* Luchador 2 */}
            <div
              className={`border-2 rounded-lg p-4 transition-colors ${
                isNoScoreType
                  ? "border-gray-200 bg-gray-50"
                  : "border-red-400 bg-red-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase mb-1 ${
                  isNoScoreType ? "text-gray-400" : "text-red-700"
                }`}
              >
                Luchador 2
              </p>
              <p className="font-medium text-sm text-gray-800 mb-3 truncate">
                {getName(participant2)}
              </p>
              <label
                className={`text-xs mb-1 block ${
                  isNoScoreType ? "text-gray-400" : "text-gray-500"
                }`}
              >
                TP (Puntos Técnicos)
              </label>
              {/* ← LÓGICA ESPECIAL: input deshabilitado para FFT/INJ/DSQ */}
              <input
                type="number"
                min="0"
                value={isNoScoreType ? 0 : tp2}
                onChange={(e) => {
                  setTp2(Math.max(0, Number(e.target.value)));
                  setManualWinner(null);
                }}
                disabled={isNoScoreType}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none text-center text-2xl font-bold transition-colors ${
                  isNoScoreType
                    ? "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "border-red-300 focus:ring-2 focus:ring-red-500"
                }`}
              />
            </div>
          </div>

          {/* ── Selector de tipo de victoria ── */}
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

          {/* ── Selector de ganador para VFA (por caída) ── */}
          {isVFA && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
              <p className="text-xs font-semibold text-orange-800 mb-2 uppercase">
                ¿Quién ganó por caída?
              </p>
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

          {/* ── LÓGICA ESPECIAL: selector de ganador + warning para FFT/INJ/DSQ ── */}
          {isNoScoreType && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-3">
              {/* Mensaje informativo */}
              <div className="flex items-start gap-2 text-sm text-amber-800">
                <span>{NO_SCORE_MESSAGES[victoryType as string]}</span>
              </div>

              {/* Selector de ganador manual obligatorio */}
              <div>
                <p className="text-xs font-semibold text-amber-900 mb-2 uppercase">
                  Seleccionar ganador
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setManualWinner(manualWinner === 1 ? null : 1)
                    }
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
                    onClick={() =>
                      setManualWinner(manualWinner === 2 ? null : 2)
                    }
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
            </div>
          )}

          {/* ── Selector de ganador en empate normal ── */}
          {!isVFA && !isNoScoreType && isTie && (
            <div
              className={`border rounded-lg p-4 ${
                isElimination
                  ? "bg-red-50 border-red-300"
                  : "bg-amber-50 border-amber-300"
              }`}
            >
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                {isElimination
                  ? "Empate — seleccionar ganador (obligatorio)"
                  : "Empate — seleccionar ganador (opcional)"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setManualWinner(manualWinner === 1 ? null : 1)
                  }
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
                  onClick={() =>
                    setManualWinner(manualWinner === 2 ? null : 2)
                  }
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

          {/* ── Preview de CP (Clasificación de Puntos) ── */}
          {winnerIndex !== null && (
            <div className="flex justify-around text-center bg-gray-50 rounded-lg py-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  CP — {getName(participant1)}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    winnerIndex === 1 ? "text-orange-600" : "text-gray-300"
                  }`}
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
                  className={`text-2xl font-bold ${
                    winnerIndex === 2 ? "text-red-600" : "text-gray-300"
                  }`}
                >
                  {winnerIndex === 2 ? 5 : 0}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
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