import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { JudoMatch } from "../../types/judo.types";
import type { Phase } from "../../types";
import { useUpdateJudoScore } from "../../api/judo.mutations";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { toast } from "sonner";

interface Props {
  match: JudoMatch;
  phase: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export const JudoScoreModal = ({ match, phase, isOpen, onClose }: Props) => {
  const [score1, setScore1] = useState(match.participant1Score || 0);
  const [score2, setScore2] = useState(match.participant2Score || 0);

  const updateMutation = useUpdateJudoScore();
  const advanceWinnerMutation = useAdvanceWinner();

  useEffect(() => {
    setScore1(match.participant1Score || 0);
    setScore2(match.participant2Score || 0);
  }, [match]);

  const handleSubmit = () => {
    // Determinar ganador
    const winnerId =
      score1 > score2
        ? match.participations?.[0]?.registrationId
        : match.participations?.[1]?.registrationId;

    if (!winnerId) {
      toast.error("No se pudo determinar el ganador");
      return;
    }

    // Si es eliminación, usar avance automático
    if (phase.type === "eliminacion") {
      advanceWinnerMutation.mutate(
        {
          matchId: match.matchId,
          winnerRegistrationId: winnerId,
          participant1Score: score1,
          participant2Score: score2,
        },
        {
          onSuccess: () => {
            toast.success("Puntaje actualizado y ganador avanzado");
            onClose();
          },
          onError: () => {
            toast.error("Error al actualizar puntaje");
          },
        },
      );
    } else {
      // Para otras fases, usar el método tradicional
      updateMutation.mutate(
        {
          matchId: match.matchId,
          data: {
            participant1Score: score1,
            participant2Score: score2,
          },
        },
        {
          onSuccess: () => {
            toast.success("Puntaje actualizado correctamente");
            onClose();
          },
          onError: () => {
            toast.error("Error al actualizar puntaje");
          },
        },
      );
    }
  };

  if (!isOpen) return null;

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
      `${athlete.firstName || ""} ${athlete.lastName || ""}`.trim() ||
      `Atleta #${athlete.athleteId}`
    );
  };

  if (!match.participations || match.participations.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Error: Participantes no encontrados
          </h2>
          <p className="text-gray-700 mb-4">
            Este match no tiene participantes asignados o no se cargaron
            correctamente.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = updateMutation.isPending || advanceWinnerMutation.isPending;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          Editar Puntaje - Match {match.matchNumber}
        </h2>

        <div className="space-y-4">
          {/* Participant 1 - Blanco */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚪</span>
              <p className="font-medium text-sm">
                {getParticipantName(participant1)}
              </p>
            </div>
            <input
              type="number"
              min="0"
              value={score1}
              onChange={(e) => setScore1(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Puntaje"
            />
          </div>

          {/* VS Divider */}
          <div className="text-center font-bold text-gray-400">VS</div>

          {/* Participant 2 - Azul */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔵</span>
              <p className="font-medium text-sm">
                {getParticipantName(participant2)}
              </p>
            </div>
            <input
              type="number"
              min="0"
              value={score2}
              onChange={(e) => setScore2(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Puntaje"
            />
          </div>
        </div>

        {/* Actions */}
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
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isLoading || score1 === score2}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
