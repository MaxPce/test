import { useState } from "react";
import type { KyoruguiMatch } from "../../types/taekwondo.types";
import { KyoruguiRoundsModal } from "./KyoruguiRoundsModal"; 
import { KyoruguiMatchDetailsModal } from "./KyoruguiMatchDetailsModal"; // ✅ NUEVO
import { PoomsaeScoreModal } from "./PoomsaeScoreModal";
import { useKyoruguiRounds } from "../../api/taekwondo.queries";
import { Circle, Eye } from "lucide-react"; // ✅ Agregar Eye

interface Props {
  match: KyoruguiMatch;
}

export const KyoruguiMatchCard = ({ match }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Obtener rounds para calcular ganados
  const { data: rounds } = useKyoruguiRounds(match.matchId);

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

  // Calcular rounds ganados por cada participante
  const calculateRoundsWon = () => {
    if (!rounds || rounds.length === 0) {
      return { p1Rounds: 0, p2Rounds: 0 };
    }

    const participant1RegId = participant1?.registrationId;
    const participant2RegId = participant2?.registrationId;

    let p1Rounds = 0;
    let p2Rounds = 0;

    rounds.forEach((round: any) => {
      if (round.score1 > round.score2) {
        p1Rounds++;
      } else if (round.score2 > round.score1) {
        p2Rounds++;
      }
    });

    return { p1Rounds, p2Rounds };
  };

  const { p1Rounds, p2Rounds } = calculateRoundsWon();

  return (
    <>
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
              <div className="flex items-center gap-2">
                {!isPoomsae() && (
                  <Circle className="w-3 h-3 fill-blue-500 text-blue-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {getParticipantName(participant1)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getInstitution(participant1)}
                  </p>
                </div>
              </div>
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
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {p1Rounds}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p1Rounds === 1 ? "round" : "rounds"}
                  </div>
                </div>
                {p1Rounds >= 2 && (
                  <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">
                    GANA
                  </div>
                )}
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
              <div className="flex items-center gap-2">
                {!isPoomsae() && (
                  <Circle className="w-3 h-3 fill-red-500 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {getParticipantName(participant2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getInstitution(participant2)}
                  </p>
                </div>
              </div>
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
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {p2Rounds}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p2Rounds === 1 ? "round" : "rounds"}
                  </div>
                </div>
                {p2Rounds >= 2 && (
                  <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                    GANA
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {/* Botón Ver Detalles */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsModalOpen(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver Detalles
          </button>

          {/* Botón Gestionar Rounds */}
          {!isPoomsae() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Gestionar Rounds
            </button>
          )}
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
        <KyoruguiRoundsModal
          match={match}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Modal de detalles */}
      <KyoruguiMatchDetailsModal
        match={match}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </>
  );
};
