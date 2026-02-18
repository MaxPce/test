import { X, Trophy, Users, Award, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useMatchDetails } from "@/features/competitions/api/table-tennis.queries";
import { useAdvanceWinner } from "@/features/competitions/api/bracket.mutations";
import { useUpdateMatch } from "@/features/competitions/api/matches.mutations";
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
  // useMatchDetails siempre se llama — su api.ts ya tiene el fallback interno
  const { data, isLoading, refetch } = useMatchDetails(matchId);
  const advanceWinnerMutation = useAdvanceWinner();
  const updateMatchMutation = useUpdateMatch();

  const [showManageModal, setShowManageModal] = useState(false);
  const [editScores, setEditScores] = useState(false);
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");
  const [winnerRegId, setWinnerRegId] = useState<number | null>(null);

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


  const match = (data as any).match ?? data;
  const lineups: any[] = (data as any).lineups ?? [];
  const games: any[] = (data as any).games ?? [];
  const result: any = (data as any).result ?? null;

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
    return "generic";
  };

  const sportType = detectSportType();
  const isTeamMatch = lineups.length > 0 && lineups[0]?.lineups?.length > 0;
  const isTableTennis = sportType === "table-tennis";
  const isJudo = sportType === "judo";
  const isKyorugi = sportType === "kyorugi";

  const participations = match.participations || [];
  const p1 = participations[0];
  const p2 = participations[1];

  const p1Name =
    p1?.registration?.athlete?.name ||
    p1?.registration?.team?.name ||
    "Participante 1";
  const p2Name =
    p2?.registration?.athlete?.name ||
    p2?.registration?.team?.name ||
    "Participante 2";

  // ── Condiciones de botones ──────────────────────────────────────────────
  // BYE: único participante sin finalizar
  const canAdvanceBye =
    participations.length === 1 && match.status !== "finalizado";

  // TT: botón especializado
  const canManageTT = participations.length === 2 && isTableTennis;

  // Deportes genéricos: registrar/editar resultado (incluye judo/kyorugi genérico)
  const canPickWinner =
    participations.length === 2 && !isTableTennis;
  // ───────────────────────────────────────────────────────────────────────

  const getScoreLabel = () => {
    if (sportConfig?.scoreLabel) return sportConfig.scoreLabel;
    if (isTableTennis) return "Sets ganados";
    if (isJudo) return "Puntos";
    if (isKyorugi) return "Puntos";
    return "Puntos";
  };

  const formatScore = (score: any) => {
    if (isJudo && (score === 10 || score === "10")) return "Ippon";
    return score ?? 0;
  };

  const handleAdvanceParticipant = () => {
    if (!p1) return;
    const participantName =
      p1.registration?.athlete?.name ||
      p1.registration?.team?.name ||
      "este participante";
    if (confirm(`¿Avanzar a ${participantName} automáticamente a la siguiente ronda?`)) {
      advanceWinnerMutation.mutate(
        {
          matchId: match.matchId,
          winnerRegistrationId: p1.registrationId!,
        },
        {
          onSuccess: () => refetch(),
          onError: () => alert("Error al avanzar el participante."),
        },
      );
    }
  };

  // ✅ Firma real de useUpdateMatch: { id, data }
  const handleSaveScores = () => {
    if (winnerRegId === null) {
      alert("Selecciona un ganador antes de guardar.");
      return;
    }
    updateMatchMutation.mutate(
      {
        id: match.matchId,
        data: {
          participant1Score: score1 !== "" ? parseFloat(score1) : undefined,
          participant2Score: score2 !== "" ? parseFloat(score2) : undefined,
          winnerRegistrationId: winnerRegId,
          status: "finalizado",
        },
      },
      {
        onSuccess: () => {
          setEditScores(false);
          refetch();
        },
        onError: () => alert("Error al guardar los puntajes."),
      },
    );
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
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Detalles del Match</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {match.phase?.eventCategory?.category?.name} • Plataforma{" "}
                  {match.platformNumber || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">

                {/* BYE */}
                {canAdvanceBye && (
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

                {/* Tenis de mesa */}
                {canManageTT && (
                  <Button
                    onClick={() => setShowManageModal(true)}
                    variant="ghost"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {games.length > 0 ? "Editar Puntajes" : "Registrar Puntajes"}
                  </Button>
                )}

                {/* Deportes genéricos (judo, etc.) */}
                {canPickWinner && (
                  <Button
                    onClick={() => {
                      setScore1(String(match.participant1Score ?? ""));
                      setScore2(String(match.participant2Score ?? ""));
                      setWinnerRegId(match.winnerRegistrationId ?? null);
                      setEditScores(true);
                    }}
                    variant="ghost"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {match.status === "finalizado"
                      ? "Editar Resultado"
                      : "Registrar Resultado"}
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

          {/* Aviso BYE */}
          {canAdvanceBye && (
            <div className="mx-6 mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm font-semibold text-amber-900">
                Participante sin oponente
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* ── Panel inline: Registrar/Editar resultado (no-TT) ── */}
            {editScores && canPickWinner && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900">
                    Registrar Resultado
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {p1Name}
                      </label>
                      <input
                        type="number"
                        value={score1}
                        onChange={(e) => setScore1(e.target.value)}
                        placeholder={getScoreLabel()}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {p2Name}
                      </label>
                      <input
                        type="number"
                        value={score2}
                        onChange={(e) => setScore2(e.target.value)}
                        placeholder={getScoreLabel()}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Selección de ganador */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Ganador
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[p1, p2].map((p, idx) => {
                        if (!p) return null;
                        const regId = p.registrationId ?? p.registration?.registrationId;
                        const name = idx === 0 ? p1Name : p2Name;
                        return (
                          <button
                            key={regId}
                            type="button"
                            onClick={() => setWinnerRegId(regId)}
                            className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                              winnerRegId === regId
                                ? "border-green-500 bg-green-50 text-green-800"
                                : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                            }`}
                          >
                            {winnerRegId === regId && (
                              <Trophy className="inline h-4 w-4 mr-1 text-green-600" />
                            )}
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setEditScores(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveScores}
                      isLoading={updateMatchMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Guardar y Finalizar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* ── Resultado ── */}
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
                  {/* P1 */}
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      isTableTennis
                        ? result?.winner?.registrationId ===
                          result?.team1?.participation?.registrationId
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-gray-300"
                        : match.winnerRegistrationId != null &&
                          match.winnerRegistrationId ===
                            (p1?.registrationId ?? p1?.registration?.registrationId)
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result?.team1?.participation?.registration?.athlete?.photoUrl && (
                        <img
                          src={getImageUrl(result.team1.participation.registration.athlete.photoUrl)}
                          alt={result.team1.teamName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                      <h4 className="font-bold text-gray-900">
                        {isTableTennis ? result?.team1?.teamName : p1Name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getScoreLabel()}</span>
                      <Badge variant="primary" className="text-2xl font-bold px-4">
                        {isTableTennis
                          ? result?.team1?.wins ?? 0
                          : formatScore(match.participant1Score)}
                      </Badge>
                    </div>
                  </div>

                  {/* P2 */}
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      isTableTennis
                        ? result?.winner?.registrationId ===
                          result?.team2?.participation?.registrationId
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-gray-300"
                        : match.winnerRegistrationId != null &&
                          match.winnerRegistrationId ===
                            (p2?.registrationId ?? p2?.registration?.registrationId)
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result?.team2?.participation?.registration?.athlete?.photoUrl && (
                        <img
                          src={getImageUrl(result.team2.participation.registration.athlete.photoUrl)}
                          alt={result.team2.teamName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                      <h4 className="font-bold text-gray-900">
                        {isTableTennis ? result?.team2?.teamName : p2Name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getScoreLabel()}</span>
                      <Badge variant="primary" className="text-2xl font-bold px-4">
                        {isTableTennis
                          ? result?.team2?.wins ?? 0
                          : formatScore(match.participant2Score)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Detalle judo/kyorugi */}
            {(isJudo || isKyorugi) && match.participant1Score != null && (
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
                      <p className="text-sm text-gray-600 mb-1">{p1Name}</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatScore(match.participant1Score)}
                      </p>
                      {isJudo && match.participant1Score === 10 && (
                        <Badge variant="success" className="mt-2">¡Ippon!</Badge>
                      )}
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{p2Name}</p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatScore(match.participant2Score)}
                      </p>
                      {isJudo && match.participant2Score === 10 && (
                        <Badge variant="success" className="mt-2">¡Ippon!</Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Formaciones TT */}
            {isTeamMatch && lineups.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Formaciones</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-6">
                    {lineups.map((lineup: any, idx: number) => (
                      <div key={idx}>
                        <h4 className="font-bold text-gray-900 mb-3">{lineup.teamName}</h4>
                        <div className="space-y-2">
                          {lineup.lineups
                            .filter((l: any) => !l.isSubstitute)
                            .map((player: any) => (
                              <div key={player.lineupId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Badge size="sm" variant="primary">{player.lineupOrder}</Badge>
                                <span className="font-medium">{player.athlete?.name}</span>
                              </div>
                            ))}
                        </div>
                        {lineup.lineups.some((l: any) => l.isSubstitute) && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-2">Suplente:</p>
                            {lineup.lineups
                              .filter((l: any) => l.isSubstitute)
                              .map((player: any) => (
                                <div key={player.lineupId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <Badge size="sm">S</Badge>
                                  <span className="text-sm">{player.athlete?.name}</span>
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

            {/* Juegos TT */}
            {isTableTennis && games.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isTeamMatch ? "Juegos Individuales" : "Sets"}
                  </h3>
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

      {/* Modal TT especializado */}
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
              <Button variant="ghost" onClick={() => setShowManageModal(false)}>
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
            game.status === "completed" ? "success" : game.status === "in_progress" ? "primary" : "default"
          }
          size="sm"
        >
          {game.status === "completed" && "Completado"}
          {game.status === "in_progress" && "En Progreso"}
          {game.status === "pending" && "Pendiente"}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-3 rounded-lg ${player1Won ? "bg-green-100" : "bg-gray-50"}`}>
          <span className="font-semibold truncate">{game.player1?.name}</span>
          <Badge variant={player1Won ? "success" : "default"} className="ml-2">{game.score1 ?? 0}</Badge>
        </div>
        <div className={`flex items-center justify-between p-3 rounded-lg ${player2Won ? "bg-green-100" : "bg-gray-50"}`}>
          <span className="font-semibold truncate">{game.player2?.name}</span>
          <Badge variant={player2Won ? "success" : "default"} className="ml-2">{game.score2 ?? 0}</Badge>
        </div>
      </div>
      {game.sets && game.sets.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-semibold text-gray-500 mb-2">Sets:</p>
          <div className="flex gap-2 flex-wrap">
            {game.sets.map((set: any, idx: number) => (
              <div key={idx} className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                Set {set.setNumber}: {set.player1Score} - {set.player2Score}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
