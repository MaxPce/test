import { useState, useEffect } from "react";
import { X, Trophy, Circle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { KyoruguiMatch, KyoruguiRound } from "../../types/taekwondo.types";
import { useUpdateKyoruguiRounds } from "../../api/taekwondo.mutations";
import { useKyoruguiRounds } from "../../api/taekwondo.queries";
import { toast } from "sonner";

interface Props {
  match: KyoruguiMatch;
  isOpen: boolean;
  onClose: () => void;
}

interface RoundData {
  roundNumber: number;
  participant1Points: number;
  participant2Points: number;
}

export const KyoruguiRoundsModal = ({ match, isOpen, onClose }: Props) => {
  const [rounds, setRounds] = useState<RoundData[]>([
    { roundNumber: 1, participant1Points: 0, participant2Points: 0 },
    { roundNumber: 2, participant1Points: 0, participant2Points: 0 },
    { roundNumber: 3, participant1Points: 0, participant2Points: 0 },
  ]);

  const updateMutation = useUpdateKyoruguiRounds();
  const { data: existingRounds } = useKyoruguiRounds(match.matchId);

  // Cargar rounds existentes
  useEffect(() => {
    if (existingRounds && existingRounds.length > 0) {
      const loadedRounds = [1, 2, 3].map((roundNum) => {
        const existing = existingRounds.find(
          (r: KyoruguiRound) => r.gameNumber === roundNum
        );
        return {
          roundNumber: roundNum,
          participant1Points: existing?.score1 || 0,
          participant2Points: existing?.score2 || 0,
        };
      });
      setRounds(loadedRounds);
    }
  }, [existingRounds]);

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "Sin asignar";
    const registration = participation.registration;
    if (!registration) return `Participation #${participation.participationId}`;
    const athlete = registration.athlete;
    if (!athlete) return `Registration #${registration.registrationId}`;

    return (
      athlete.name ||
      `Atleta #${athlete.athleteId}`
    );
  };

  const handlePointChange = (
    roundIndex: number,
    participant: "p1" | "p2",
    value: number
  ) => {
    const newRounds = [...rounds];
    if (participant === "p1") {
      newRounds[roundIndex].participant1Points = Math.max(0, value);
    } else {
      newRounds[roundIndex].participant2Points = Math.max(0, value);
    }
    setRounds(newRounds);
  };

  // Calcular rounds ganados
  const participant1Rounds = rounds.filter(
    (r) => r.participant1Points > r.participant2Points && (r.participant1Points > 0 || r.participant2Points > 0)
  ).length;
  const participant2Rounds = rounds.filter(
    (r) => r.participant2Points > r.participant1Points && (r.participant1Points > 0 || r.participant2Points > 0)
  ).length;

  const matchFinished = participant1Rounds >= 2 || participant2Rounds >= 2;

  // Validar que no haya empates en rounds jugados
  const hasInvalidRounds = rounds.some(
    (r) =>
      (r.participant1Points > 0 || r.participant2Points > 0) &&
      r.participant1Points === r.participant2Points
  );

  // Validar que al menos un round tenga puntos
  const hasAnyRound = rounds.some(
    (r) => r.participant1Points > 0 || r.participant2Points > 0
  );

  const handleSaveAll = async () => {
    if (!hasAnyRound) {
      toast.error("Debes registrar al menos un round");
      return;
    }

    if (hasInvalidRounds) {
      toast.error("No puede haber empate en ningún round");
      return;
    }

    // Filtrar solo los rounds que tienen puntos
    const roundsToSave = rounds.filter(
      (r) => r.participant1Points > 0 || r.participant2Points > 0
    );

    updateMutation.mutate(
      {
        matchId: match.matchId,
        rounds: roundsToSave,
      },
      {
        onSuccess: () => {
          toast.success(
            matchFinished
              ? "¡Match finalizado exitosamente!"
              : "Rounds guardados correctamente"
          );
          onClose();
        },
      }
    );
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
            Este match no tiene participantes asignados.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">
              Match {match.matchNumber} - Rounds
            </h2>
            <p className="text-sm text-gray-500">
              Kyorugui • Mejor de 3 Rounds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Circle className="w-6 h-6 fill-blue-500 text-blue-500" />
                <span className="font-bold text-lg">{participant1Rounds}</span>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {getParticipantName(participant1)}
              </p>
            </div>

            <div className="px-4">
              <div className="text-2xl font-bold text-gray-400">-</div>
            </div>

            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-bold text-lg">{participant2Rounds}</span>
                <Circle className="w-6 h-6 fill-red-500 text-red-500" />
              </div>
              <p className="text-xs text-gray-600 truncate">
                {getParticipantName(participant2)}
              </p>
            </div>
          </div>

          
        </div>

        {/* Rounds */}
        <div className="p-6 space-y-4">
          {rounds.map((round, index) => {
            const isRoundComplete =
              round.participant1Points > 0 || round.participant2Points > 0;
            const roundWinner =
              round.participant1Points > round.participant2Points && isRoundComplete
                ? "p1"
                : round.participant2Points > round.participant1Points && isRoundComplete
                ? "p2"
                : null;

            return (
              <div
                key={round.roundNumber}
                className={`border-2 rounded-lg overflow-hidden ${
                  roundWinner === "p1"
                    ? "border-blue-500 bg-blue-50"
                    : roundWinner === "p2"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Round Header */}
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                  <span className="font-bold text-gray-700">
                    Round {round.roundNumber}
                  </span>
                  
                </div>

                {/* Scores */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Participant 1 - Azul */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-blue-500 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {getParticipantName(participant1)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={round.participant1Points}
                        onChange={(e) =>
                          handlePointChange(index, "p1", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    {/* Participant 2 - Rojo */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 fill-red-500 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {getParticipantName(participant2)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={round.participant2Points}
                        onChange={(e) =>
                          handlePointChange(index, "p2", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer con botón de guardar */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 space-y-3">
          {/* Botón principal de confirmar */}
          <button
            onClick={handleSaveAll}
            disabled={updateMutation.isPending || !hasAnyRound || hasInvalidRounds}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 font-bold text-lg flex items-center justify-center gap-2"
          >
            
            {updateMutation.isPending
              ? "Guardando..."
              : matchFinished
              ? "Confirmar y Finalizar Match"
              : "Guardar Rounds"}
          </button>

          {/* Botón secundario de cancelar */}
          <button
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
