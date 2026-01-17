import { useState } from "react";
import type { KyoruguiMatch } from "../../types/taekwondo.types"; // ✅ Agregar 'type'
import { KyoruguiScoreModal } from "./KyoruguiScoreModal";

interface Props {
  match: KyoruguiMatch;
}

export const KyoruguiMatchCard = ({ match }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "TBD";
    const athlete = participation.registration?.athlete;
    return athlete?.name || "TBD"; // ✅ FIX: usar 'name' directamente
  };

  const getInstitution = (participation: typeof participant1) => {
    return participation?.registration?.athlete?.institution?.code || ""; // ✅ FIX: usar 'code' en lugar de 'acronym'
  };

  const isCompleted = match.status === "finalizado"; // ✅ FIX: 'finalizado' en lugar de 'COMPLETADO'
  const isWinner = (participationId: number) =>
    match.participations?.find((p) => p.participationId === participationId)
      ?.registrationId === match.winnerRegistrationId;

  return (
    <>
      <div
        className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-600">
            {match.round} - Match {match.matchNumber}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {match.status}
          </span>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          {/* Participant 1 */}
          <div
            className={`flex justify-between items-center p-2 rounded ${
              isWinner(participant1?.participationId)
                ? "bg-green-50 border-2 border-green-400"
                : "bg-gray-50"
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-sm">
                {getParticipantName(participant1)}
              </p>
              <p className="text-xs text-gray-500">
                {getInstitution(participant1)}
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {match.participant1Score ?? "-"}
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center text-xs text-gray-400 font-semibold">
            VS
          </div>

          {/* Participant 2 */}
          <div
            className={`flex justify-between items-center p-2 rounded ${
              isWinner(participant2?.participationId)
                ? "bg-green-50 border-2 border-green-400"
                : "bg-gray-50"
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-sm">
                {getParticipantName(participant2)}
              </p>
              <p className="text-xs text-gray-500">
                {getInstitution(participant2)}
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {match.participant2Score ?? "-"}
            </div>
          </div>
        </div>

        {/* Action hint */}
        <div className="mt-3 text-center text-xs text-gray-400">
          Click para editar puntaje
        </div>
      </div>

      {/* Modal for editing */}
      <KyoruguiScoreModal
        match={match}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
