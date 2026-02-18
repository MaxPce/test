import { X, Trophy, Users, Award, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useMatchDetails } from "@/features/competitions/api/table-tennis.queries";
import { useAdvanceWinner } from "@/features/competitions/api/bracket.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { TableTennisMatchWrapper } from "@/features/competitions/components/table-tennis/TableTennisMatchWrapper";

interface MatchDetailsModalProps {
  matchId: number;
  onClose: () => void;
  sportConfig?: {
    sportType: string;
    scoreLabel: string;
    showScores: boolean;
  };
}

export function MatchDetailsModal({
  matchId,
  onClose,
  sportConfig,
}: MatchDetailsModalProps) {
  const { data, isLoading, refetch } = useMatchDetails(matchId);
  const advanceWinnerMutation = useAdvanceWinner();
  const [showManageModal, setShowManageModal] = useState(false);

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

  const detectSportType = (): string => {
    if (sportConfig?.sportType) return sportConfig.sportType;
    const categoryName =
      match.phase?.eventCategory?.category?.name?.toLowerCase() || "";
    const sportName =
      match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() || "";
    if (sportName.includes("judo")) return "judo";
    if (sportName.includes("taekwondo") && categoryName.includes("kyorugi"))
      return "kyorugi";
    if (sportName.includes("tenis de mesa")) return "table-tennis";
    if (
      sportName.includes("voleibol") ||
      sportName.includes("básquetbol") ||
      sportName.includes("fútbol")
    )
      return "team";
    return "generic";
  };

  const sportType = detectSportType();
  const isTeamMatch = lineups.length > 0 && lineups[0].lineups.length > 0;
  const isTableTennis = sportType === "table-tennis";
  const isJudo = sportType === "judo";
  const isKyorugi = sportType === "kyorugi";

  const participations = match.participations || [];
  const hasOnlyOneParticipant = participations.length === 1;
  const canAdvance = hasOnlyOneParticipant && match.status !== "finalizado";
  const canManage = participations.length === 2 && isTableTennis;

  const getScoreLabel = () => {
    if (sportConfig?.scoreLabel) return sportConfig.scoreLabel;
    if (isTableTennis) return "Sets ganados";
    if (isJudo) return "Puntos";
    if (isKyorugi) return "Puntos";
    return "Puntos";
  };

  const formatScore = (score: number) => {
    if (isJudo && score === 10) return "Ippon";
    return score;
  };

  const handleAdvanceParticipant = () => {
    if (!participations[0]) return;
    const participantName =
      participations[0].registration?.athlete?.name || "este participante";
    if (
      window.confirm(
        `¿Avanzar a ${participantName} automáticamente a la siguiente ronda?`,
      )
    ) {
      advanceWinnerMutation.mutate(
        {
          matchId: match.matchId,
          winnerRegistrationId: participations[0].registrationId!,
        },
        {
          onSuccess: () => {
            refetch();
          },
          onError: () => {
            alert("Error al avanzar el participante. Intenta nuevamente.");
          },
        },
      );
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Detalles del Match</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {match.phase?.eventCategory?.category?.name} • Plataforma{" "}
                  {match.platformNumber || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canAdvance && (
                  <Button
                    onClick={handleAdvanceParticipant}
                    isLoading={advanceWinnerMutation.isPending}
                    variant="ghost"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Pasar Participante
                  </Button>
                )}
                {canManage && (
                  <Button
                    onClick={() => setShowManageModal(true)}
                    variant="ghost"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {games.length > 0 ? "Editar Puntajes" : "Registrar Puntajes"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {canAdvance && (
            <div className="mx-6 mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm font-semibold text-amber-900">
                Participante sin oponente
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      result?.winner?.registrationId ===
                      result?.team1?.participation?.registrationId
                        ? "bg-green-50 border-green-500"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result?.team1?.participation?.registration?.athlete
                        ?.photoUrl && (
                        <img
                          src={getImageUrl(
                            result.team1.participation.registration.athlete
                              .photoUrl,
                          )}
                          alt={result.team1.teamName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <h4 className="font-bold text-gray-900">
                        {result?.team1?.teamName}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {getScoreLabel()}
                      </span>
                      <Badge variant="primary" className="text-2xl font-bold px-4">
                        {isTableTennis
                          ? result?.team1?.wins || 0
                          : formatScore(match.participant1Score || 0)}
                      </Badge>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border-2 ${
                      result?.winner?.registrationId ===
                      result?.team2?.participation?.registrationId
                        ? "bg-green-50 border-green-500"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result?.team2?.participation?.registration?.athlete
                        ?.photoUrl && (
                        <img
                          src={getImageUrl(
                            result.team2.participation.registration.athlete
                              .photoUrl,
                          )}
                          alt={result.team2.teamName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <h4 className="font-bold text-gray-900">
                        {result?.team2?.teamName}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {getScoreLabel()}
                      </span>
                      <Badge variant="primary" className="text-2xl font-bold px-4">
                        {isTableTennis
                          ? result?.team2?.wins || 0
                          : formatScore(match.participant2Score || 0)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {(isJudo || isKyorugi) && match.participant1Score !== null && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Detalle del Combate
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {result?.team1?.teamName}
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatScore(match.participant1Score || 0)}
                      </p>
                      {isJudo && match.participant1Score === 10 && (
                        <Badge variant="success" className="mt-2">
                          ¡Ippon!
                        </Badge>
                      )}
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {result?.team2?.teamName}
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatScore(match.participant2Score || 0)}
                      </p>
                      {isJudo && match.participant2Score === 10 && (
                        <Badge variant="success" className="mt-2">
                          ¡Ippon!
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

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

            {isTableTennis && games.length > 0 && (
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
          </div>
        </div>
      </div>

      {showManageModal && isTableTennis && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowManageModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Gestionar Match - Tenis de Mesa
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowManageModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <TableTennisMatchWrapper
                match={match}
                eventCategory={match.phase?.eventCategory}
                onClose={() => {
                  setShowManageModal(false);
                  refetch();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GameDetails({ game }: { game: any }) {
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
