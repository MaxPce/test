import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";
import { useMatches } from "@/features/competitions/api/matches.queries";

interface SimpleBracketProps {
  phaseId: number;
}

export function SimpleBracket({ phaseId }: SimpleBracketProps) {
  const { data: matches = [], isLoading } = useMatches({ phaseId });

  console.log("🔍 Total matches:", matches.length);
  console.log("🔍 First match:", matches[0]);
  console.log("🔍 Phase ID:", phaseId);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando bracket...</p>
        </CardBody>
      </Card>
    );
  }

  // ✅ FILTRAR: Solo partidos que tengan al menos un participante O que tengan ronda definida
  const realMatches = matches.filter((match) => {
    // Verificar si tiene participantes asignados
    const hasParticipant1 = match.participant1 || match.participant1Id;
    const hasParticipant2 = match.participant2 || match.participant2Id;

    // Verificar si tiene ronda (cuartos, semifinal, final)
    const hasRound = match.round && match.round !== "Sin ronda";

    // Incluir si tiene ronda O si tiene al menos un participante
    return hasRound || (hasParticipant1 && hasParticipant2);
  });

  if (realMatches.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium">No hay combates definidos aún</p>
          <p className="text-sm mt-1">
            Los combates aparecerán cuando se asignen los participantes
          </p>
        </CardBody>
      </Card>
    );
  }

  // Agrupar partidos por ronda
  const rounds = realMatches.reduce(
    (acc, match) => {
      const round = match.round || "Otros";
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    },
    {} as Record<string, typeof realMatches>,
  );

  // Ordenar rondas
  const roundOrder = [
    "Cuartos de Final",
    "Semifinal",
    "Final",
    "Tercer Lugar",
    "Otros",
  ];
  const sortedRounds = Object.entries(rounds).sort(([a], [b]) => {
    const indexA = roundOrder.indexOf(a);
    const indexB = roundOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-6">
      {/* Contador total */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>{realMatches.length}</strong> combates programados
        </p>
      </div>

      {sortedRounds.map(([roundName, roundMatches]) => (
        <Card key={roundName}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{roundName}</h3>
              <Badge variant="primary">{roundMatches.length} combates</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roundMatches.map((match) => {
                const participant1 = match.participant1?.registration;
                const participant2 = match.participant2?.registration;

                const name1 =
                  participant1?.athlete?.name ||
                  participant1?.team?.name ||
                  "Por definir";
                const name2 =
                  participant2?.athlete?.name ||
                  participant2?.team?.name ||
                  "Por definir";

                const institution1 =
                  participant1?.athlete?.institution?.abrev ||
                  participant1?.team?.institution?.abrev ||
                  "";
                const institution2 =
                  participant2?.athlete?.institution?.abrev ||
                  participant2?.team?.institution?.abrev ||
                  "";

                const score1 = match.score1 ?? "-";
                const score2 = match.score2 ?? "-";

                const winner = match.winnerId;
                const isP1Winner = winner && winner === match.participant1Id;
                const isP2Winner = winner && winner === match.participant2Id;

                return (
                  <div
                    key={match.matchId}
                    className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-shadow"
                  >
                    {/* Participante 1 */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                        isP1Winner
                          ? "bg-green-50 border-2 border-green-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isP1Winner && (
                          <Trophy className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate">
                            {name1}
                          </p>
                          {institution1 && (
                            <p className="text-xs text-gray-600 truncate">
                              {institution1}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-2xl font-bold ml-3 flex-shrink-0 ${
                          isP1Winner ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {score1}
                      </span>
                    </div>

                    <div className="text-center text-xs text-gray-400 my-1">
                      VS
                    </div>

                    {/* Participante 2 */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isP2Winner
                          ? "bg-green-50 border-2 border-green-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isP2Winner && (
                          <Trophy className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate">
                            {name2}
                          </p>
                          {institution2 && (
                            <p className="text-xs text-gray-600 truncate">
                              {institution2}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-2xl font-bold ml-3 flex-shrink-0 ${
                          isP2Winner ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {score2}
                      </span>
                    </div>

                    {/* Estado del partido */}
                    <div className="mt-3 text-center">
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
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
