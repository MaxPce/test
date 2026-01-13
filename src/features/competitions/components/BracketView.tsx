import { Card, CardBody } from "@/components/ui/Card";
import type { Match, Participation } from "../types";

interface BracketViewProps {
  matches: Match[];
  participations: Participation[];
}

export function BracketView({ matches, participations }: BracketViewProps) {
  const getParticipantName = (participantId?: number) => {
    if (!participantId) return "TBD";
    const participation = participations.find(
      (p) => p.participationId === participantId
    );
    return participation?.athlete?.name || participation?.team?.name || "TBD";
  };

  // Agrupar matches por ronda
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  if (matches.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            No hay partidos generados. Inicializa el bracket para comenzar.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((round) => (
          <div key={round} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">
              Ronda {round}
            </h3>
            {matchesByRound[round].map((match) => (
              <Card key={match.matchId} className="w-64">
                <CardBody className="p-3">
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        match.winnerParticipantId === match.participantA
                          ? "bg-green-50 font-semibold"
                          : "bg-gray-50"
                      }`}
                    >
                      <span className="truncate">
                        {getParticipantName(match.participantA)}
                      </span>
                      <span className="font-bold ml-2">
                        {match.scoreA ?? "-"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        match.winnerParticipantId === match.participantB
                          ? "bg-green-50 font-semibold"
                          : "bg-gray-50"
                      }`}
                    >
                      <span className="truncate">
                        {getParticipantName(match.participantB)}
                      </span>
                      <span className="font-bold ml-2">
                        {match.scoreB ?? "-"}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
