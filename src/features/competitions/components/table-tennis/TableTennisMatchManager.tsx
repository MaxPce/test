import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/TabsControlled";
import { Zap, AlertCircle, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { LineupSelector } from "./LineupSelector";
import { TableTennisMatchCard } from "./TableTennisMatchCard";
import { TableTennisScorecardV2 } from "./TableTennisScorecardV2";
import {
  useMatchLineups,
  useMatchGames,
  useMatchResult,
  useGenerateGames,
} from "../../api/table-tennis.queries";
import {
  useFinalizeMatch,
  useReopenMatch,
  useSetWalkover,
} from "../../api/table-tennis.mutations";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import type { Match, Phase } from "../../types";
import {
  detectTableTennisModality,
  getModalityLabel,
  needsLineup,
} from "../../utils/table-tennis.utils";
import { WalkoverDialog } from "./WalkoverDialog";

interface TableTennisMatchManagerProps {
  match: Match;
  phase?: Phase | any;
  onClose?: () => void;
  onMatchUpdate?: () => void;
}

export function TableTennisMatchManager({
  match,
  phase,
  onClose,
  onMatchUpdate,
}: TableTennisMatchManagerProps) {
  const modality = detectTableTennisModality(match);
  const requiresLineup = needsLineup(modality);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showWalkoverDialog, setShowWalkoverDialog] = useState(false);

  const { data: lineups = [], isLoading: lineupsLoading } = useMatchLineups(
    match.matchId,
  );
  const { data: games = [] } = useMatchGames(match.matchId);
  const { data: result } = useMatchResult(match.matchId);

  const generateGamesMutation = useGenerateGames();
  const finalizeMatchMutation = useFinalizeMatch();
  const reopenMatchMutation = useReopenMatch();
  const advanceWinnerMutation = useAdvanceWinner();
  const setWalkoverMutation = useSetWalkover();

  const hasLineups = lineups.length === 2 && lineups.every((l) => l.hasLineup);
  const hasGames = games.length > 0;
  const team1 = lineups[0];
  const team2 = lineups[1];

  


  const participation1 = match.participations?.[0];
  const participation2 = match.participations?.[1];

  const team1Members =
    lineups[0]?.participation?.registration?.team?.members ||
    participation1?.registration?.team?.members ||
    [];
  const team2Members =
    lineups[1]?.participation?.registration?.team?.members ||
    participation2?.registration?.team?.members ||
    [];


  const getParticipantName = (participationIndex: number): string => {
    const participation = match.participations?.[participationIndex];
    if (!participation) return `Participante ${participationIndex + 1}`;

    if (modality === "individual") {
      return (
        participation.registration?.athlete?.name ||
        `Jugador ${participationIndex + 1}`
      );
    }

    if (modality === "doubles") {
      const members = participation.registration?.team?.members || [];
      if (members.length === 2) {
        return `${members[0].athlete.name} / ${members[1].athlete.name}`;
      }
      return (
        participation.registration?.team?.name ||
        `Pareja ${participationIndex + 1}`
      );
    }

    return (
      participation.registration?.team?.name ||
      `Equipo ${participationIndex + 1}`
    );
  };

  const participant1Name = getParticipantName(0);
  const participant2Name = getParticipantName(1);

  const getWinnerName = (): string => {
    if (!result?.winner) return "";

    if (modality === "team") {
      return result.winner.registrationId ===
        team1?.participation?.registration?.registrationId
        ? result.team1.teamName
        : result.team2.teamName;
    }

    return result.winner.registrationId ===
      (participation1?.registrationId ??
        participation1?.registration?.registrationId)
      ? participant1Name
      : participant2Name;
  };

  const handleGenerateGames = () => {
    if (requiresLineup && !hasLineups) {
      alert("Ambos equipos deben configurar su lineup primero");
      return;
    }

    const confirmMessage =
      modality === "team"
        ? "¿Generar los 5 juegos automáticamente? Esto eliminará juegos existentes."
        : "¿Generar el juego? Esto eliminará juegos existentes.";

    if (window.confirm(confirmMessage)) {
      generateGamesMutation.mutate(match.matchId, {
        onSuccess: () => {
          setActiveTab(requiresLineup ? "scorecard" : "scorecard");
        },
      });
    }
  };

  const handleFinalizeMatch = () => {
    if (!result?.winner) {
      alert("No hay un ganador determinado aún. Completa todos los juegos.");
      return;
    }

    const winnerName = getWinnerName();
    const resolvedPhase = phase ?? match.phase;

    if (
      window.confirm(
        `¿Finalizar el match?\n\nGanador: ${winnerName}\nMarcador: ${result.score}`,
      )
    ) {
      if (resolvedPhase?.type === "eliminacion") {
        advanceWinnerMutation.mutate(
          {
            matchId: match.matchId,
            winnerRegistrationId: result.winner.registrationId,
          },
          {
            onSuccess: () => {
              onMatchUpdate?.();
              onClose?.();
            },
            onError: () => alert("Error al finalizar el match"),
          },
        );
      } else {
        finalizeMatchMutation.mutate(match.matchId, {
          onSuccess: () => {
            alert("Match finalizado exitosamente");
            onMatchUpdate?.();
            onClose?.();
          },
          onError: () => alert("Error al finalizar el match"),
        });
      }
    }
  };

  const handleSetWalkover = () => {
    setShowWalkoverDialog(true);
  };

  const handleWalkoverConfirm = (
    winnerRegistrationId: number,
    reason: string,
  ) => {
    setWalkoverMutation.mutate(
      { matchId: match.matchId, winnerRegistrationId, reason },
      {
        onSuccess: () => {
          setShowWalkoverDialog(false);
          onClose?.();
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || "Error al marcar walkover");
        },
      },
    );
  };

  const handleLineupSuccess = () => {
    const team1HasLineup = lineups[0]?.hasLineup;
    const team2HasLineup = lineups[1]?.hasLineup;

    if (team1HasLineup && !team2HasLineup) {
      setActiveTab("lineup-team2");
    } else if (team1HasLineup && team2HasLineup) {
      setActiveTab("overview");
    }
  };

  if (lineupsLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando datos del match...</span>
        </CardBody>
      </Card>
    );
  }

  if (requiresLineup && lineups.length !== 2) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900 mb-2">Match incompleto</h3>
          <p className="text-gray-600">
            Este match necesita exactamente 2 equipos inscritos
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {match.phase?.eventCategory?.category?.name || "Tenis de Mesa"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary">
                  {getModalityLabel(
                    modality,
                    match.phase?.eventCategory?.category?.gender,
                  )}
                </Badge>
                <Badge variant="default">
                  {match.phase?.name || "Sin fase"}
                </Badge>
              </div>
            </div>
            <Badge
              variant={
                match.status === "finalizado"
                  ? "success"
                  : match.status === "en_curso"
                    ? "warning"
                    : "default"
              }
            >
              {match.status === "finalizado"
                ? "Finalizado"
                : match.status === "en_curso"
                  ? "En curso"
                  : "Programado"}
            </Badge>
          </div>
        </CardBody>
      </Card>

      {modality === "team" && lineups.length === 2 ? (
        <TableTennisMatchCard lineups={lineups} match={match} result={result} />
      ) : (
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <h3 className="font-bold text-lg text-gray-900">
                  {participant1Name}
                </h3>
                {modality === "individual" && (
                  <Badge variant="default" className="mt-2">
                    {participation1?.registration?.athlete?.institution?.name ||
                      ""}
                  </Badge>
                )}
              </div>

              <div className="text-center px-6">
                {result ? (
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {result.team1.wins} - {result.team2.wins}
                    </div>
                    <Badge
                      variant={
                        match.status === "finalizado" ? "success" : "default"
                      }
                    >
                      {match.status === "finalizado"
                        ? "Finalizado"
                        : `Sets: ${result.team1.wins} - ${result.team2.wins}`}
                    </Badge>
                    {modality !== "team" && (
                      <p className="text-xs text-gray-500 mt-1">(Sets ganados)</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-gray-400 mb-2">
                      VS
                    </div>
                    <Badge variant="default">Programado</Badge>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center">
                <h3 className="font-bold text-lg text-gray-900">
                  {participant2Name}
                </h3>
                {modality === "individual" && (
                  <Badge variant="default" className="mt-2">
                    {participation2?.registration?.athlete?.institution?.name ||
                      ""}
                  </Badge>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {requiresLineup && (
          <Card>
            <CardBody className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${hasLineups ? "bg-green-100" : "bg-gray-100"}`}
              ></div>
              <div>
                <p className="text-sm text-gray-600">Lineups</p>
                <p className="font-semibold text-gray-900">
                  {hasLineups ? (
                    <span className="text-green-600">Configurados ✓</span>
                  ) : (
                    <span className="text-gray-500">Pendientes</span>
                  )}
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${hasGames ? "bg-blue-100" : "bg-gray-100"}`}
            ></div>
            <div>
              <p className="text-sm text-gray-600">
                {modality === "team" ? "Juegos" : "Juego"}
              </p>
              <p className="font-semibold text-gray-900">
                {hasGames ? (
                  <span>
                    {modality === "team"
                      ? `${games.filter((g) => g.status === "completed").length} / ${games.length} completados`
                      : games[0]?.status === "completed"
                        ? "Completado ✓"
                        : "En progreso"}
                  </span>
                ) : (
                  <span className="text-gray-500">No generado</span>
                )}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${match.status === "finalizado" ? "bg-yellow-100" : "bg-gray-100"}`}
            ></div>
            <div>
              <p className="text-sm text-gray-600">Match</p>
              <p className="font-semibold text-gray-900">
                {match.status === "finalizado" ? (
                  <span className="text-yellow-600">Finalizado ✓</span>
                ) : hasGames ? (
                  <span className="text-blue-600">En juego</span>
                ) : (
                  <span className="text-gray-500">Programado</span>
                )}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {hasGames && result && result.winner && (
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Ganador determinado
                </p>
                <p className="text-sm text-gray-600">
                  Ganador: {getWinnerName()} ({result.score})
                  {modality !== "team" && (
                    <span className="text-xs"> sets</span>
                  )}
                </p>
              </div>
              <Button
                onClick={handleFinalizeMatch}
                isLoading={
                  finalizeMatchMutation.isPending ||
                  advanceWinnerMutation.isPending
                }
                variant={match.status === "finalizado" ? "outline" : "default"}
              >
                Finalizar Match
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          {requiresLineup && team1 && (
            <TabsTrigger value="lineup-team1">
              Lineup {team1.teamName}
            </TabsTrigger>
          )}
          {requiresLineup && team2 && (
            <TabsTrigger value="lineup-team2">
              Lineup {team2.teamName}
            </TabsTrigger>
          )}
          {hasGames && (
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
          )}
          {result && <TabsTrigger value="results">Resultados</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {!requiresLineup && (
            <Alert variant="info">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="font-medium">
                  Modalidad{" "}
                  {modality === "individual" ? "Individual" : "Dobles"}
                </p>
                <p className="text-sm">
                  Este match se juega a 1 juego (mejor de 5 sets)
                </p>
              </div>
            </Alert>
          )}

          {!hasGames && match.status !== "finalizado" && (
            <Alert variant="warning">
              <Button
                onClick={handleSetWalkover}
                isLoading={setWalkoverMutation.isPending}
                variant="outline"
                className="ml-4"
              >
                Marcar Walkover (WO)
              </Button>
            </Alert>
          )}

          {requiresLineup && hasLineups && !hasGames && (
            <Alert variant="info">
              <div className="ml-2 flex-1">
                <p className="font-medium">Lineups configurados</p>
              </div>
              <Button
                onClick={handleGenerateGames}
                isLoading={generateGamesMutation.isPending}
                className="ml-4"
              >
                Generar Juegos
              </Button>
            </Alert>
          )}

          {!requiresLineup && !hasGames && (
            <Alert variant="info">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2 flex-1">
                <p className="font-medium">Listo para generar juego</p>
                <p className="text-sm">
                  Genera el juego para comenzar a registrar resultados
                </p>
              </div>
              <Button
                onClick={handleGenerateGames}
                isLoading={generateGamesMutation.isPending}
                className="ml-4"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generar Juego
              </Button>
            </Alert>
          )}

          {hasGames && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Progreso del Match
                </h3>
                <div className="space-y-3">
                  {games.map((game) => (
                    <div
                      key={game.gameId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-700">
                          Juego {game.gameNumber}
                        </span>
                        <span className="text-sm text-gray-600">
                          {game.player1.name.split(" ")[0]} vs{" "}
                          {game.player2.name.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {game.status === "completed" ? (
                          <>
                            <span className="font-bold text-gray-900">
                              {game.score1} - {game.score2}
                            </span>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {requiresLineup && hasLineups && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lineups.map((lineup) => (
                <Card key={lineup.participation.participationId}>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {lineup.teamName}
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Titulares:
                      </p>
                      {lineup.lineups
                        .filter((l) => !l.isSubstitute)
                        .sort((a, b) => a.lineupOrder - b.lineupOrder)
                        .map((l) => (
                          <div
                            key={l.lineupId}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="font-bold text-blue-600">
                              {String.fromCharCode(64 + l.lineupOrder)}:
                            </span>
                            <span>{l.athlete.name}</span>
                          </div>
                        ))}
                      <p className="text-sm font-medium text-gray-700 mt-3">
                        Suplente:
                      </p>
                      {lineup.lineups
                        .filter((l) => l.isSubstitute)
                        .map((l) => (
                          <div key={l.lineupId} className="text-sm text-gray-600">
                            {l.athlete.name}
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {requiresLineup && team1 && (
          <TabsContent value="lineup-team1">
            <LineupSelector
              participationId={team1.participation.participationId}
              teamName={team1.teamName}
              members={team1Members}
              existingLineup={team1.lineups.map((l) => ({
                athleteId: l.athleteId,
                lineupOrder: l.lineupOrder,
                isSubstitute: l.isSubstitute,
              }))}
              onSuccess={handleLineupSuccess}
            />
          </TabsContent>
        )}

        {requiresLineup && team2 && (
          <TabsContent value="lineup-team2">
            <LineupSelector
              participationId={team2.participation.participationId}
              teamName={team2.teamName}
              members={team2Members}
              existingLineup={team2.lineups.map((l) => ({
                athleteId: l.athleteId,
                lineupOrder: l.lineupOrder,
                isSubstitute: l.isSubstitute,
              }))}
              onSuccess={handleLineupSuccess}
            />
          </TabsContent>
        )}

        {hasGames && (
          <TabsContent value="scorecard">
            <TableTennisScorecardV2
              games={games}
              matchId={match.matchId}
              onGameUpdate={onMatchUpdate}
            />
          </TabsContent>
        )}

        {result && (
          <TabsContent value="results">
            <div className="space-y-6">
              <TableTennisScorecardV2
                games={games}
                matchId={match.matchId}
                onGameUpdate={onMatchUpdate}
              />
              <Card>
                <CardBody>
                  <div className="text-center py-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {match.status === "finalizado"
                        ? "¡Match Finalizado!"
                        : "Match en Progreso"}
                    </h2>
                    <p className="text-5xl font-bold text-gray-900 my-6">
                      {result.score}
                    </p>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          {modality === "team"
                            ? result.team1.teamName
                            : participant1Name}
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {result.team1.wins}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {modality === "team" ? "juegos ganados" : "sets ganados"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          {modality === "team"
                            ? result.team2.teamName
                            : participant2Name}
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {result.team2.wins}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {modality === "team" ? "juegos ganados" : "sets ganados"}
                        </p>
                      </div>
                    </div>
                    {result.winner && (
                      <Alert variant="success" className="mt-6">
                        <span className="ml-2 font-semibold">
                          Ganador: {getWinnerName()}
                        </span>
                      </Alert>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showWalkoverDialog && (
        <WalkoverDialog
          participant1Name={participant1Name}
          participant2Name={participant2Name}
          participant1RegistrationId={
            participation1?.registrationId ??
            participation1?.registration?.registrationId ??
            0
          }
          participant2RegistrationId={
            participation2?.registrationId ??
            participation2?.registration?.registrationId ??
            0
          }
          onConfirm={handleWalkoverConfirm}
          onCancel={() => setShowWalkoverDialog(false)}
          isLoading={setWalkoverMutation.isPending}
        />
      )}
    </div>
  );
}
