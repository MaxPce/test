import { X, Trophy, Users, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useMatchDetails } from "@/features/competitions/api/table-tennis.queries"; // ✅ TU IMPORT

interface MatchDetailsModalProps {
  matchId: number;
  onClose: () => void;
}

export function MatchDetailsModal({
  matchId,
  onClose,
}: MatchDetailsModalProps) {
  const { data, isLoading } = useMatchDetails(matchId); // ✅ TU HOOK

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardBody className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { match, lineups, games, result } = data;

  // Determinar modalidad
  const isTeamMatch = lineups.length > 0 && lineups[0].lineups.length > 0;
  const isIndividualOrDoubles = games.length === 1;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold">Detalles del Match</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {match.phase?.eventCategory?.category?.name} • Plataforma{" "}
                  {match.platformNumber || "N/A"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resultado General */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Resultado</h3>
                <Badge
                  variant={
                    match.status === "finalizado"
                      ? "success"
                      : match.status === "en_curso"
                        ? "primary"
                        : "default"
                  }
                >
                  {match.status === "finalizado" && "Finalizado"}
                  {match.status === "en_curso" && "En Curso"}
                  {match.status === "programado" && "Programado"}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                {/* Participante 1 */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    result?.winner?.registrationId ===
                    result?.team1?.participation?.registrationId
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">
                      {result?.team1?.teamName}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Juegos ganados
                    </span>
                    <Badge
                      variant="primary"
                      className="text-2xl font-bold px-4"
                    >
                      {result?.team1?.wins || 0}
                    </Badge>
                  </div>
                </div>

                {/* Participante 2 */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    result?.winner?.registrationId ===
                    result?.team2?.participation?.registrationId
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">
                      {result?.team2?.teamName}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Juegos ganados
                    </span>
                    <Badge
                      variant="primary"
                      className="text-2xl font-bold px-4"
                    >
                      {result?.team2?.wins || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Lineups (Solo para Equipos) */}
          {isTeamMatch && lineups.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Formaciones
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-6">
                  {lineups.map((lineup, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-900 mb-3">
                        {lineup.teamName}
                      </h4>
                      <div className="space-y-2">
                        {lineup.lineups
                          .filter((l: any) => !l.isSubstitute)
                          .map((player: any) => (
                            <div
                              key={player.lineupId}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <Badge size="sm" variant="primary">
                                {player.lineupOrder}
                              </Badge>
                              <span className="font-medium">
                                {player.athlete?.name}
                              </span>
                            </div>
                          ))}
                      </div>
                      {lineup.lineups.some((l: any) => l.isSubstitute) && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-2">
                            Suplente:
                          </p>
                          {lineup.lineups
                            .filter((l: any) => l.isSubstitute)
                            .map((player: any) => (
                              <div
                                key={player.lineupId}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                              >
                                <Badge size="sm">S</Badge>
                                <span className="text-sm">
                                  {player.athlete?.name}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Juegos */}
          {games.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {isTeamMatch ? "Juegos Individuales" : "Sets"}
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {games.map((game: any) => (
                    <GameDetails key={game.gameId} game={game} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {games.length === 0 && (
            <Card>
              <CardBody className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">No hay juegos registrados aún</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar detalles de cada juego
function GameDetails({ game }: { game: any }) {
  const hasWinner = !!game.winnerId;
  const player1Won = game.winnerId === game.player1Id;
  const player2Won = game.winnerId === game.player2Id;

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-700">Juego {game.gameNumber}</h4>
        <Badge
          variant={
            game.status === "completed"
              ? "success"
              : game.status === "in_progress"
                ? "primary"
                : "default"
          }
          size="sm"
        >
          {game.status === "completed" && "Completado"}
          {game.status === "in_progress" && "En Progreso"}
          {game.status === "pending" && "Pendiente"}
        </Badge>
      </div>

      <div className="space-y-2">
        {/* Jugador 1 */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            player1Won ? "bg-green-100" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-semibold truncate">{game.player1?.name}</span>
          </div>
          <Badge variant={player1Won ? "success" : "default"} className="ml-2">
            {game.score1 ?? 0}
          </Badge>
        </div>

        {/* Jugador 2 */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            player2Won ? "bg-green-100" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-semibold truncate">{game.player2?.name}</span>
          </div>
          <Badge variant={player2Won ? "success" : "default"} className="ml-2">
            {game.score2 ?? 0}
          </Badge>
        </div>
      </div>

      {/* Sets (si existen) */}
      {game.sets && game.sets.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-semibold text-gray-500 mb-2">Sets:</p>
          <div className="flex gap-2 flex-wrap">
            {game.sets.map((set: any, idx: number) => (
              <div
                key={idx}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium"
              >
                Set {set.setNumber}: {set.player1Score} - {set.player2Score}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
