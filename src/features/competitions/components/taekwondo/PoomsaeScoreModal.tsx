import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Match } from "../../types";
import type { Phase } from "../../types";
import { useAdvanceWinner, useSetWalkoverGeneric } from "../../api/bracket.mutations";
import { useUpdateMatch } from "../../api/matches.mutations"; // ← AÑADIR
import { WalkoverDialog } from "@/features/competitions/components/table-tennis/WalkoverDialog";
import { toast } from "sonner";

interface Props {
  match: Match;
  phase?: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export const PoomsaeScoreModal = ({ match, phase, isOpen, onClose }: Props) => {
  const [accuracy1, setAccuracy1] = useState(0);
  const [presentation1, setPresentation1] = useState(0);
  const [accuracy2, setAccuracy2] = useState(0);
  const [presentation2, setPresentation2] = useState(0);
  const [showWalkoverDialog, setShowWalkoverDialog] = useState(false);

  const advanceWinnerMutation = useAdvanceWinner();
  const setWalkoverMutation = useSetWalkoverGeneric();
  const updateMatchMutation = useUpdateMatch(); // ← AÑADIR

  const isEditMode = !!(
    match.participant1Score ||
    match.participant2Score ||
    match.participant1Accuracy ||
    match.participant2Accuracy
  );

  useEffect(() => {
    if (isEditMode && match) {
      setAccuracy1(Number(match.participant1Accuracy ?? 0));
      setPresentation1(Number(match.participant1Presentation ?? 0));
      setAccuracy2(Number(match.participant2Accuracy ?? 0));
      setPresentation2(Number(match.participant2Presentation ?? 0));
    } else {
      setAccuracy1(0);
      setPresentation1(0);
      setAccuracy2(0);
      setPresentation2(0);
    }
    setShowWalkoverDialog(false);
  }, [match, isEditMode, isOpen]);

  const total1 = accuracy1 + presentation1;
  const total2 = accuracy2 + presentation2;

  const currentWinnerId =
    total1 > total2
      ? match.participations?.[0]?.registrationId
      : match.participations?.[1]?.registrationId;

  const handleSubmit = () => {
    if (total1 === 0 && total2 === 0) {
      toast.error("Debe asignar puntajes a ambos participantes");
      return;
    }
    if (total1 === total2) {
      toast.error("No puede haber empate en Poomsae. Ajuste los puntajes.");
      return;
    }
    if (!currentWinnerId) {
      toast.error("No se pudo determinar el ganador");
      return;
    }

    const scorePayload = {
      participant1Score: total1,
      participant2Score: total2,
      participant1Accuracy: accuracy1,
      participant1Presentation: presentation1,
      participant2Accuracy: accuracy2,
      participant2Presentation: presentation2,
    };

    if (!phase || phase.type === "eliminacion") {
      advanceWinnerMutation.mutate(
        {
          matchId: match.matchId,
          winnerRegistrationId: currentWinnerId,
          ...scorePayload,
        },
        {
          onSuccess: () => {
            toast.success(
              isEditMode
                ? "Puntaje actualizado correctamente"
                : "Puntaje registrado y ganador avanzado",
            );
            onClose();
          },
          onError: (error: any) => {
            console.error("Error al guardar:", error);
            toast.error("Error al actualizar puntaje");
          },
        },
      );
    } else {
      updateMatchMutation.mutate(
        {
          id: match.matchId,
          data: {
            status: "finalizado",
            winnerRegistrationId: currentWinnerId,
            ...scorePayload,
          },
        },
        {
          onSuccess: () => {
            toast.success(
              isEditMode
                ? "Puntaje actualizado correctamente"
                : "Puntaje registrado correctamente",
            );
            onClose();
          },
          onError: (error: any) => {
            console.error("Error al guardar:", error);
            toast.error("Error al actualizar puntaje");
          },
        },
      );
    }
  };

  const handleWalkoverConfirm = (
    winnerRegistrationId: number,
    reason: string,
  ) => {
    setWalkoverMutation.mutate(
      { matchId: match.matchId, winnerRegistrationId, reason },
      {
        onSuccess: () => {
          toast.success("Walkover registrado correctamente");
          setShowWalkoverDialog(false);
          onClose();
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Error al registrar walkover",
          );
        },
      },
    );
  };

  if (!isOpen) return null;

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "Sin asignar";
    const registration = participation.registration;
    if (!registration) return `Participation #${participation.participationId}`;
    if (registration.team)
      return `${registration.team.name || "Equipo"} (Equipo)`;
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
            Este match no tiene participantes asignados.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  const p1Name = getParticipantName(participant1);
  const p2Name = getParticipantName(participant2);
  const p1RegId = participant1?.registrationId ?? 0;
  const p2RegId = participant2?.registrationId ?? 0;
  // ← isBusy ahora incluye updateMatchMutation
  const isBusy =
    advanceWinnerMutation.isPending ||
    setWalkoverMutation.isPending ||
    updateMatchMutation.isPending;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {isEditMode ? "Editar" : "Registrar"} Puntaje Poomsae - Match{" "}
              {match.matchNumber}
            </h2>
            {isEditMode && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                Editando
              </span>
            )}
          </div>

          {/* Puntajes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Participant 1 */}
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔵</span>
                <p className="font-semibold text-sm">{p1Name}</p>
                {match.winnerRegistrationId === participant1?.registrationId && (
                  <span className="ml-auto text-sm bg-blue-600 text-white px-2 py-0.5 rounded">
                    Ganador
                  </span>
                )}
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

            {/* Participant 2 */}
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚪</span>
                <p className="font-semibold text-sm">{p2Name}</p>
                {match.winnerRegistrationId === participant2?.registrationId && (
                  <span className="ml-auto text-sm bg-gray-600 text-white px-2 py-0.5 rounded">
                    Ganador
                  </span>
                )}
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

          {/* Walkover */}
          <div className="mt-6">
            <button
              onClick={() => setShowWalkoverDialog(true)}
              disabled={isBusy}
              className="w-full px-4 py-2 border-2 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Registrar Walkover
            </button>
          </div>

          {/* Botones principales */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={isBusy}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isBusy ||
                total1 === total2 ||
                (total1 === 0 && total2 === 0)
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isBusy
                ? "Guardando..."
                : isEditMode
                  ? "Actualizar Puntaje"
                  : "Registrar Ganador"}
            </button>
          </div>
        </div>
      </div>

      {showWalkoverDialog && (
        <WalkoverDialog
          participant1Name={p1Name}
          participant2Name={p2Name}
          participant1RegistrationId={p1RegId}
          participant2RegistrationId={p2RegId}
          onConfirm={handleWalkoverConfirm}
          onCancel={() => setShowWalkoverDialog(false)}
          isLoading={setWalkoverMutation.isPending}
        />
      )}
    </>
  );
};
