// src/features/competitions/components/taekwondo/KyoruguiScoreModal.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { KyoruguiMatch } from "../../types/taekwondo.types";
import { useUpdateKyoruguiScore } from "../../api/taekwondo.mutations";
import { toast } from "sonner";

interface Props {
  match: KyoruguiMatch;
  isOpen: boolean;
  onClose: () => void;
}

export const KyoruguiScoreModal = ({ match, isOpen, onClose }: Props) => {
  const [score1, setScore1] = useState(match.participant1Score || 0);
  const [score2, setScore2] = useState(match.participant2Score || 0);

  const updateMutation = useUpdateKyoruguiScore();

  useEffect(() => {
    setScore1(match.participant1Score || 0);
    setScore2(match.participant2Score || 0);
  }, [match]);

  // ✅ DEBUG
  useEffect(() => {
    console.log("🎯 Modal recibió match:", match);
    console.log("🎯 Participations:", match.participations);
  }, [match]);

  const handleSubmit = () => {
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
  };

  if (!isOpen) return null;

  // ✅ VERIFICAR que participations exista
  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1) => {
    console.log("🔍 getParticipantName recibió:", participation);

    if (!participation) {
      console.log("❌ No hay participation");
      return "Sin asignar";
    }

    const registration = participation.registration;
    if (!registration) {
      console.log("❌ No hay registration");
      return `Participation #${participation.participationId}`;
    }

    const athlete = registration.athlete;
    if (!athlete) {
      console.log("❌ No hay athlete");
      return `Registration #${registration.registrationId}`;
    }

    console.log("✅ Athlete encontrado:", athlete);

    // Intentar varios campos posibles
    const name =
      athlete.name ||
      `${athlete.firstName || ""} ${athlete.lastName || ""}`.trim() ||
      `Atleta #${athlete.athleteId}`;

    return name;
  };

  // ✅ VERIFICAR si hay participantes
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
          <p className="text-sm text-gray-500 mb-4">
            Match ID: {match.matchId}
            <br />
            Participations: {match.participations?.length || 0}
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          Editar Puntaje - Match {match.matchNumber}
        </h2>

        <div className="space-y-4">
          {/* Participant 1 - Azul */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔵</span>
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

          {/* Participant 2 - Blanco */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚪</span>
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
            disabled={updateMutation.isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
