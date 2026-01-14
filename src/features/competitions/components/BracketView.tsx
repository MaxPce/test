import { Badge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";
import type { Match, Phase } from "../types";

interface BracketViewProps {
  matches: Match[];
  phase: Phase;
}

export function BracketView({ matches, phase }: BracketViewProps) {
  // Organizar partidos por ronda
  const rounds: Record<string, Match[]> = {};

  matches.forEach((match) => {
    const round = match.round || "sin_ronda";
    if (!rounds[round]) {
      rounds[round] = [];
    }
    rounds[round].push(match);
  });

  // Orden de rondas para bracket
  const roundOrder = [
    "dieciseisavos",
    "octavos",
    "cuartos",
    "semifinal",
    "final",
  ];

  const orderedRounds = roundOrder.filter((r) => rounds[r]);

  const getRoundLabel = (round: string) => {
    const labels: Record<string, string> = {
      final: "Final",
      semifinal: "Semifinales",
      cuartos: "Cuartos",
      octavos: "Octavos",
      dieciseisavos: "Dieciseisavos",
    };
    return labels[round] || round;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-8 p-4 min-w-full">
        {orderedRounds.map((roundKey, roundIndex) => (
          <div key={roundKey} className="flex flex-col gap-4 min-w-[280px]">
            {/* Título de la ronda */}
            <div className="text-center mb-2">
              <h5 className="font-semibold text-gray-900">
                {getRoundLabel(roundKey)}
              </h5>
            </div>

            {/* Partidos de la ronda */}
            <div className="space-y-6">
              {rounds[roundKey].map((match) => {
                const participants = match.participations || [];

                return (
                  <div
                    key={match.matchId}
                    className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    {/* Header del partido */}
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          {match.matchNumber && `#${match.matchNumber}`}
                        </span>
                        <Badge
                          variant={
                            match.status === "finalizado"
                              ? "default"
                              : match.status === "en_curso"
                              ? "success"
                              : "primary"
                          }
                          size="sm"
                        >
                          {match.status === "programado" && "Programado"}
                          {match.status === "en_curso" && "En Curso"}
                          {match.status === "finalizado" && "Finalizado"}
                        </Badge>
                      </div>
                    </div>

                    {/* Participantes */}
                    <div className="divide-y divide-gray-200">
                      {participants.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          Sin participantes
                        </div>
                      ) : (
                        participants.map((participation) => {
                          const reg = participation.registration;
                          const name = reg?.athlete
                            ? reg.athlete.name
                            : reg?.team?.name || "TBD";
                          const institution =
                            reg?.athlete?.institution?.name ||
                            reg?.team?.institution?.name;
                          const isWinner =
                            match.winnerRegistrationId ===
                            participation.registrationId;

                          return (
                            <div
                              key={participation.participationId}
                              className={`p-3 ${
                                isWinner
                                  ? "bg-green-50 font-semibold"
                                  : "bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  {isWinner && (
                                    <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm truncate ${
                                        isWinner
                                          ? "text-green-900"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {name}
                                    </p>
                                    {institution && (
                                      <p className="text-xs text-gray-500 truncate">
                                        {institution}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    participation.corner === "ROJO"
                                      ? "destructive"
                                      : "primary"
                                  }
                                  size="sm"
                                >
                                  {participation.corner}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Info adicional */}
                    {match.scheduledTime && (
                      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          📅{" "}
                          {new Date(match.scheduledTime).toLocaleString(
                            "es-ES",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
