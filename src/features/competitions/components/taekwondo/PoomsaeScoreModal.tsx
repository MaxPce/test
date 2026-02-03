import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { Match } from "../../types";
import type { Phase } from "../../types";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { toast } from "sonner";

interface Props {
  match: Match;
  phase: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export const PoomsaeScoreModal = ({ match, phase, isOpen, onClose }: Props) => {
  // States para participante 1 (Azul)
  const [accuracy1, setAccuracy1] = useState(0);
  const [presentation1, setPresentation1] = useState(0);

  // States para participante 2 (Blanco)
  const [accuracy2, setAccuracy2] = useState(0);
  const [presentation2, setPresentation2] = useState(0);

  const advanceWinnerMutation = useAdvanceWinner();

  useEffect(() => {
    // Inicializar con valores existentes si los hay
    setAccuracy1(0);
    setPresentation1(0);
    setAccuracy2(0);
    setPresentation2(0);
  }, [match]);

  // Calcular totales
  const total1 = accuracy1 + presentation1;
  const total2 = accuracy2 + presentation2;

  const handleSubmit = () => {
    // Validar que ambos tengan puntaje
    if (total1 === 0 && total2 === 0) {
      toast.error("Debe asignar puntajes a ambos participantes");
      return;
    }

    // Determinar ganador por total
    const winnerId =
      total1 > total2
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
          participant1Score: total1,
          participant2Score: total2,
          participant1Accuracy: accuracy1,
          participant1Presentation: presentation1,
          participant2Accuracy: accuracy2,
          participant2Presentation: presentation2,
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

    const name =
      athlete.name ||
      `${athlete.firstName || ""} ${athlete.lastName || ""}`.trim() ||
      `Atleta #${athlete.athleteId}`;

    return name;
  };

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

  const isLoading = advanceWinnerMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">
          Registrar Puntaje Poomsae - Match {match.matchNumber}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Participante 1 - Azul */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔵</span>
              <p className="font-semibold text-sm">
                {getParticipantName(participant1)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accuracy (Precisión)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={accuracy1}
                  onChange={(e) => setAccuracy1(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presentation (Presentación)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={presentation1}
                  onChange={(e) => setPresentation1(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                />
              </div>

              <div className="pt-2 border-t border-blue-300">
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Total
                </label>
                <div className="text-3xl font-bold text-blue-600">
                  {total1.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Participante 2 - Blanco */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚪</span>
              <p className="font-semibold text-sm">
                {getParticipantName(participant2)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accuracy (Precisión)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={accuracy2}
                  onChange={(e) => setAccuracy2(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presentation (Presentación)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={presentation2}
                  onChange={(e) => setPresentation2(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="0.0"
                />
              </div>

              <div className="pt-2 border-t border-gray-300">
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Total
                </label>
                <div className="text-3xl font-bold text-gray-700">
                  {total2.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
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
            disabled={
              isLoading || total1 === total2 || (total1 === 0 && total2 === 0)
            }
          >
            {isLoading ? "Guardando..." : "Registrar Ganador"}
          </button>
        </div>
      </div>
    </div>
  );
};
