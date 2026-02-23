import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { WushuSandaMatch, WushuSandaScore } from '../../types/wushu.types';
import type { Phase } from '../../types';
import { useUpdateWushuScore } from '../../api/wushu.mutations';
import { useAdvanceWinner } from '../../api/bracket.mutations';
import { toast } from 'sonner';

interface Props {
  match: WushuSandaMatch;
  phase?: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export const WushuScoreModal = ({ match, phase, isOpen, onClose }: Props) => {
  const [score1, setScore1] = useState<number>(Number(match.participant1Score) || 0);
  const [score2, setScore2] = useState<number>(Number(match.participant2Score) || 0);

  const updateMutation        = useUpdateWushuScore();
  const advanceWinnerMutation = useAdvanceWinner();

  useEffect(() => {
    setScore1(Number(match.participant1Score) || 0);
    setScore2(Number(match.participant2Score) || 0);
  }, [match]);

  const handleSubmit = () => {
    const winnerId =
      score1 > score2
        ? match.participations?.[0]?.registrationId
        : match.participations?.[1]?.registrationId;

    if (!winnerId) {
      toast.error('No se pudo determinar el ganador');
      return;
    }

    const scoreData: WushuSandaScore = {
      participant1Score:    score1,
      participant2Score:    score2,
      winnerRegistrationId: winnerId,
    };

    if (phase?.type === 'eliminacion') {
      updateMutation.mutate(
        { matchId: match.matchId, data: scoreData },
        {
          onSuccess: () => {
            advanceWinnerMutation.mutate(
              { matchId: match.matchId, winnerRegistrationId: winnerId },
              {
                onSuccess: () => {
                  toast.success('Puntaje actualizado y ganador avanzado');
                  onClose();
                },
                onError: () => toast.error('Error al avanzar al ganador'),
              },
            );
          },
          onError: () => toast.error('Error al guardar los puntajes'),
        },
      );
    } else {
      updateMutation.mutate(
        { matchId: match.matchId, data: scoreData },
        {
          onSuccess: () => {
            toast.success('Puntaje actualizado correctamente');
            onClose();
          },
          onError: () => toast.error('Error al actualizar puntaje'),
        },
      );
    }
  };

  if (!isOpen) return null;

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return 'Sin asignar';
    const registration = participation.registration;
    if (!registration) return `Participation #${participation.participationId}`;
    const athlete = registration.athlete;
    if (!athlete) return `Registration #${registration.registrationId}`;
    return (
      athlete.name ||
      `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() ||
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
            Este match no tiene participantes asignados o no se cargaron correctamente.
          </p>
          <Button onClick={onClose} className="w-full">Cerrar</Button>
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
          {/* Participante 1 */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚪</span>
              <p className="font-medium text-sm">{getParticipantName(participant1)}</p>
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

          <div className="text-center font-bold text-gray-400">VS</div>

          {/* Participante 2 */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔵</span>
              <p className="font-medium text-sm">{getParticipantName(participant2)}</p>
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
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
