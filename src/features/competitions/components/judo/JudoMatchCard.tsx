import { useState } from "react";
import { Trophy, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JudoScoreModal } from "./JudoScoreModal";
import type { JudoMatch } from "../../types/judo.types";

interface Props {
  match: JudoMatch;
}

export function JudoMatchCard({ match }: Props) {
  const [showScoreModal, setShowScoreModal] = useState(false);

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getName = (participation: typeof participant1) => {
    if (!participation) return "Sin asignar";
    return participation.registration?.athlete?.name || "Sin nombre";
  };

  const isWinner = (registrationId: number | undefined) => {
    return registrationId === match.winnerRegistrationId;
  };

  return (
    <>
      <div className="border-2 border-gray-300 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-700">Match {match.matchNumber}</h4>
          <Badge
            variant={
              match.status === "finalizado"
                ? "success"
                : match.status === "en_curso"
                  ? "primary"
                  : "default"
            }
            size="sm"
          >
            {match.status === "finalizado" && "Finalizado"}
            {match.status === "en_curso" && "En Curso"}
            {match.status === "programado" && "Programado"}
          </Badge>
        </div>

        <div className="space-y-2">
          {/* Participante 1 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isWinner(participant1?.registrationId)
                ? "bg-green-100 border-2 border-green-500"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2 flex-1">
              {isWinner(participant1?.registrationId) && (
                <Trophy className="h-4 w-4 text-green-600" />
              )}
              <span className="font-medium text-sm truncate">
                {getName(participant1)}
              </span>
            </div>
            <Badge variant="primary" className="ml-2">
              {match.participant1Score ?? 0}
            </Badge>
          </div>

          {/* Participante 2 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isWinner(participant2?.registrationId)
                ? "bg-green-100 border-2 border-green-500"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2 flex-1">
              {isWinner(participant2?.registrationId) && (
                <Trophy className="h-4 w-4 text-green-600" />
              )}
              <span className="font-medium text-sm truncate">
                {getName(participant2)}
              </span>
            </div>
            <Badge variant="primary" className="ml-2">
              {match.participant2Score ?? 0}
            </Badge>
          </div>
        </div>

        {/* Botón de editar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowScoreModal(true)}
          className="w-full mt-3"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Editar Puntaje
        </Button>
      </div>

      {showScoreModal && (
        <JudoScoreModal
          match={match}
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
        />
      )}
    </>
  );
}
