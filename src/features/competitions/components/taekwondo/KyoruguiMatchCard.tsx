import { useState } from "react";
import type { KyoruguiMatch } from "../../types/taekwondo.types";
import { KyoruguiScoreModal } from "./KyoruguiScoreModal";
import { PoomsaeScoreModal } from "./PoomsaeScoreModal";

interface Props {
  match: KyoruguiMatch;
}

export const KyoruguiMatchCard = ({ match }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const isPoomsae = () => {
    const categoryName =
      match.phase?.eventCategory?.category?.name?.toLowerCase() || "";
    return (
      categoryName.includes("poomsae") ||
      categoryName.includes("formas") ||
      categoryName.includes("forma")
    );
  };

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "TBD";
    const athlete = participation.registration?.athlete;
    return athlete?.name || "TBD";
  };

  const getInstitution = (participation: typeof participant1) => {
    return participation?.registration?.athlete?.institution?.code || "";
  };

  const isCompleted = match.status === "finalizado";
  const isWinner = (participationId: number) =>
    match.participations?.find((p) => p.participationId === participationId)
      ?.registrationId === match.winnerRegistrationId;

  const getTotal = (participation: typeof participant1) => {
    if (!participation) return 0;
    const accuracy = participation.accuracy || 0;
    const presentation = participation.presentation || 0;
    return accuracy + presentation;
  };

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
            {isPoomsae() ? (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {getTotal(participant1) > 0
                    ? getTotal(participant1).toFixed(1)
                    : "-"}
                </div>
                {match.status !== "programado" && (
                  <div className="text-xs text-gray-500 mt-1">
                    A: {participant1?.accuracy?.toFixed(1) || "-"} | P:{" "}
                    {participant1?.presentation?.toFixed(1) || "-"}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                {match.participant1Score ?? "-"}
              </div>
            )}
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
            {isPoomsae() ? (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {getTotal(participant2) > 0
                    ? getTotal(participant2).toFixed(1)
                    : "-"}
                </div>
                {match.status !== "programado" && (
                  <div className="text-xs text-gray-500 mt-1">
                    A: {participant2?.accuracy?.toFixed(1) || "-"} | P:{" "}
                    {participant2?.presentation?.toFixed(1) || "-"}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                {match.participant2Score ?? "-"}
              </div>
            )}
          </div>
        </div>

        {/* Action hint */}
        <div className="mt-3 text-center text-xs text-gray-400">
          Click para editar {isPoomsae() ? "puntajes" : "puntaje"}
        </div>
      </div>

      {/* Modal for editing */}
      {isPoomsae() ? (
        <PoomsaeScoreModal
          match={match}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      ) : (
        <KyoruguiScoreModal
          match={match}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
