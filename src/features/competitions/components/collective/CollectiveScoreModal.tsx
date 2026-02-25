import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useUpdateMatch } from "../../api/matches.mutations";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { useUpdateStandings } from "../../api/standings.mutations";
import { toast } from "sonner";
import type { Phase } from "../../types";

interface CollectiveMatch {
  matchId: number;
  matchNumber?: number;
  status: string;
  round?: string;
  winnerRegistrationId?: number | null;
  participant1Score?: number | null;
  participant2Score?: number | null;
  participations?: Array<{
    participationId: number;
    registrationId: number;
    corner?: string;
    registration?: {
      registrationId: number;
      athlete?: { name: string; institution?: { name: string } };
      team?: { name: string; institution?: { name: string } };
    };
  }>;
}

interface Props {
  match: CollectiveMatch;
  phase?: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export const CollectiveScoreModal = ({ match, phase, isOpen, onClose }: Props) => {
  const [score1, setScore1] = useState<number>(
    match.participant1Score != null ? Math.floor(Number(match.participant1Score)) : 0
  );
  const [score2, setScore2] = useState<number>(
    match.participant2Score != null ? Math.floor(Number(match.participant2Score)) : 0
  );
  const [manualWinnerId, setManualWinnerId] = useState<number | null>(null);

  const updateMutation = useUpdateMatch();
  const advanceWinnerMutation = useAdvanceWinner();
  const updateStandingsMutation = useUpdateStandings();

  useEffect(() => {
    setScore1(match.participant1Score != null ? Math.floor(Number(match.participant1Score)) : 0);
    setScore2(match.participant2Score != null ? Math.floor(Number(match.participant2Score)) : 0);
    setManualWinnerId(null);
  }, [match]);

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (
    participation: typeof participant1
  ): string => {
    if (!participation) return "Sin asignar";
    const reg = participation.registration;
    if (!reg) return `Participación #${participation.participationId}`;
    return reg.team?.name || reg.athlete?.name || `Registro #${reg.registrationId}`;
  };

  const getInstitutionName = (participation: typeof participant1): string => {
    const reg = participation?.registration;
    return reg?.team?.institution?.name || reg?.athlete?.institution?.name || "";
  };

  const isDraw = score1 === score2;

  const autoWinnerId = !isDraw
    ? score1 > score2
      ? participant1?.registrationId
      : participant2?.registrationId
    : null;

  const effectiveWinnerId = autoWinnerId ?? manualWinnerId ?? null;

  const handleSubmit = () => {
    if (isDraw && !manualWinnerId && phase?.type === "eliminacion") {
      toast.error("Hay empate en fase eliminatoria. Selecciona el ganador manualmente.");
      return;
    }

    const payload = {
      participant1Score: score1,
      participant2Score: score2,
      winnerRegistrationId: effectiveWinnerId ?? undefined,
      status: "finalizado" as const,
    };

    if (phase?.type === "eliminacion" && effectiveWinnerId) {
      updateMutation.mutate(
        { id: match.matchId, data: payload },
        {
          onSuccess: () => {
            advanceWinnerMutation.mutate(
              { matchId: match.matchId, winnerRegistrationId: effectiveWinnerId },
              {
                onSuccess: () => {
                  toast.success("Resultado registrado y ganador avanzado");
                  onClose();
                },
                onError: () => toast.error("Error al avanzar al ganador"),
              }
            );
          },
          onError: () => toast.error("Error al guardar el resultado"),
        }
      );
    } else {
      updateMutation.mutate(
        { id: match.matchId, data: payload },
        {
          onSuccess: () => {
            if (phase?.type === "grupo") {
              updateStandingsMutation.mutate(phase.phaseId, {
                onSuccess: () => {
                  toast.success("Resultado registrado y tabla actualizada");
                  onClose();
                },
                onError: () => toast.error("Error al actualizar la tabla"),
              });
            } else {
              toast.success("Resultado registrado correctamente");
              onClose();
            }
          },
          onError: () => toast.error("Error al guardar el resultado"),
        }
      );
    }
  };

  if (!isOpen) return null;

  if (!match.participations || match.participations.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Error: Participantes no encontrados
          </h2>
          <p className="text-gray-700 mb-4">
            Este partido no tiene participantes asignados o no se cargaron correctamente.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = updateMutation.isPending || advanceWinnerMutation.isPending || updateStandingsMutation.isPending;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-1">
          Registrar Resultado — Partido #{match.matchNumber}
        </h2>
        {match.round && (
          <p className="text-sm text-gray-500 mb-4">{match.round}</p>
        )}

        <div className="space-y-4">
          {/* Equipo 1 — Local */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              
              <div>
                <p className="font-semibold text-sm">
                  {getParticipantName(participant1)}
                </p>
                {getInstitutionName(participant1) && (
                  <p className="text-xs text-gray-500">
                    {getInstitutionName(participant1)}
                  </p>
                )}
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={score1}
              onChange={(e) => { setScore1(Number(e.target.value)); setManualWinnerId(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold"
              placeholder="0"
            />
          </div>

          {/* VS */}
          <div className="text-center font-bold text-gray-400 text-lg">VS</div>

          {/* Equipo 2 — Visitante */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <div>
                <p className="font-semibold text-sm">
                  {getParticipantName(participant2)}
                </p>
                {getInstitutionName(participant2) && (
                  <p className="text-xs text-gray-500">
                    {getInstitutionName(participant2)}
                  </p>
                )}
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={score2}
              onChange={(e) => { setScore2(Number(e.target.value)); setManualWinnerId(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold"
              placeholder="0"
            />
          </div>

          {/* Empate — selección manual de ganador */}
          {isDraw && (
            <div className="border border-amber-300 bg-amber-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-amber-700 mb-2 text-center">
                Marcador empatado {phase?.type === "eliminacion" ? "— selecciona el ganador" : "— puedes dejarlo así"}
              </p>
              <div className="flex gap-2">
                {[participant1, participant2].map((p) => (
                  <button
                    key={p?.registrationId}
                    onClick={() =>
                      setManualWinnerId(
                        manualWinnerId === p?.registrationId ? null : p?.registrationId ?? null
                      )
                    }
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      manualWinnerId === p?.registrationId
                        ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    {getParticipantName(p)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (isDraw && phase?.type === "eliminacion" && !manualWinnerId)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
