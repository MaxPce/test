import { useState, useEffect } from "react";
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
import { ArrowLeftRight, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableTennisApi } from "../../api/table-tennis.api";

import { Spinner } from "@/components/ui/Spinner";
import { LineupSelector } from "./LineupSelector";
import { TableTennisMatchCard } from "./TableTennisMatchCard";
import { TableTennisScorecardV2 } from "./TableTennisScorecardV2";
import {
  useMatchLineups,
  useMatchGames,
  useMatchResult,
  useGenerateGames,
  tableTennisKeys,
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
  const sortByCorner = (parts: any[]) => {
    console.log('[sortByCorner] INPUT:', parts.map(p => ({
      name: p.registration?.athlete?.name ?? p.registration?.team?.name,
      corner: p.corner,
      participationId: p.participationId,
      registrationId: p.registrationId,
    })));

    const sorted = [...parts].sort((a, b) => {
      const order = (corner?: string) => {
        const FIRST = ['left', 'A', 'top', 'blue'];
        return FIRST.includes(corner ?? '') ? 0 : 1;
      };
      return order(a.corner) - order(b.corner);
    });

    

    return sorted;
  };


  const [localParticipations, setLocalParticipations] = useState(
    () => sortByCorner(match.participations ?? [])
  );

  useEffect(() => {
    setLocalParticipations(sortByCorner(match.participations ?? []));
  }, [match.matchId, match.participations]);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showWalkoverDialog, setShowWalkoverDialog] = useState(false);

  const { data: lineups = [], isLoading: lineupsLoading } = useMatchLineups(
    match.matchId,
  );
  const [localLineups, setLocalLineups] = useState(() => {
    const FIRST = ['left', 'A', 'top', 'blue'];
    return [...lineups].sort((a, b) => {
      const orderA = FIRST.includes(a.participation?.corner ?? '') ? 0 : 1;
      const orderB = FIRST.includes(b.participation?.corner ?? '') ? 0 : 1;
      return orderA - orderB;
    });
  });

  useEffect(() => {
    if (lineups.length > 0) {
      const FIRST = ['left', 'A', 'top', 'blue'];
      const sorted = [...lineups].sort((a, b) => {
        const orderA = FIRST.includes(a.participation?.corner ?? '') ? 0 : 1;
        const orderB = FIRST.includes(b.participation?.corner ?? '') ? 0 : 1;
        return orderA - orderB;
      });
      setLocalLineups(sorted);
    }
  }, [lineups]);

  const { data: games = [] } = useMatchGames(match.matchId);
  const { data: result } = useMatchResult(match.matchId);

  const generateGamesMutation = useGenerateGames();
  const finalizeMatchMutation = useFinalizeMatch();
  const reopenMatchMutation = useReopenMatch();
  const advanceWinnerMutation = useAdvanceWinner();
  const queryClient = useQueryClient();
  const setWalkoverMutation = useSetWalkover();
  const swapMutation = useMutation({
    mutationFn: () => tableTennisApi.swapParticipants(match.matchId),
    onSuccess: (data) => {
      setLocalLineups((prev) => {
        if (prev.length === 2) return [prev[1], prev[0]];
        return prev;
      });

      if (data?.participants?.length === 2) {
        setLocalParticipations((prev) => {
          const updated = prev.map((p) => {
            const serverVersion = data.participants.find(
              (r: any) => r.participationId === p.participationId
            );
            if (!serverVersion) return p;
            return {
              ...p,
              registrationId: serverVersion.registrationId,
              corner: serverVersion.corner,
              registration: prev.find(
                (op) => op.registrationId === serverVersion.registrationId
              )?.registration ?? p.registration,
            };
          });
          return sortByCorner(updated); // ← AGREGAR ESTE SORT
        });
      } else {
        setLocalParticipations((prev) => [prev[1], prev[0]]);
      }

      // ── 2. Resuelve el phaseId de forma segura ──
      const phaseId = match.phase?.phaseId ?? phase?.phaseId ?? (match as any).phaseId;

      // ── 3. Invalida queries de tenis de mesa ──
      queryClient.invalidateQueries({
        queryKey: ["table-tennis", "lineups", match.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: tableTennisKeys.details(match.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: tableTennisKeys.result(match.matchId),
      });

      // ── 4. Invalida el match individual ──
      queryClient.invalidateQueries({
        queryKey: ["match", match.matchId],
      });

      // ── 5. Invalida la lista de matches de la fase ──
      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: ["matches", phaseId],
          exact: false,
        });
        // ── 6. Invalida la fase completa (FIX PRINCIPAL para GenericScheduleView) ──
        queryClient.invalidateQueries({
          queryKey: ["phase", phaseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["phases"],
          exact: false,
        });
        // ── 7. Invalida bracket si aplica ──
        queryClient.invalidateQueries({
          queryKey: ["bracket", phaseId, "structure"],
        });
        queryClient.invalidateQueries({
          queryKey: ["bracket", phaseId, "complete"],
        });
      }

      // ── 8. Notifica al padre para que refresque selectedMatch ──
      onMatchUpdate?.();
    },
    onError: (error: any) => {
      console.error(
        "Error al intercambiar:",
        error?.response?.data?.message ?? error.message
      );
    },
  });


  const hasGames = games.length > 0;
  const team1 = localLineups[0];
  const team2 = localLineups[1];

  
  const hasLineups = localLineups.length === 2 && localLineups.every((l) => l.hasLineup);

  const participation1 = localParticipations[0];
  const participation2 = localParticipations[1];

  

  const team1Members =
    localLineups[0]?.participation?.registration?.team?.members ||
    participation1?.registration?.team?.members || [];

  const team2Members =
    localLineups[1]?.participation?.registration?.team?.members ||
    participation2?.registration?.team?.members || [];



  const getParticipantName = (participationIndex: number): string => {
    const participation = localParticipations[participationIndex];
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
    if (requiresLineup && !hasLineups) return;

    generateGamesMutation.mutate(match.matchId, {
      onSuccess: () => {
        setActiveTab("scorecard");
      },
    });
  };

  const handleFinalizeMatch = () => {
    if (!result?.winner) return;

    const resolvedPhase = phase ?? match.phase;

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
        },
      );
    } else {
      finalizeMatchMutation.mutate(match.matchId, {
        onSuccess: () => {
          onMatchUpdate?.();
          onClose?.();
        },
      });
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
      },
    );
  };

  const handleLineupSuccess = () => {
    const team1HasLineup = localLineups[0]?.hasLineup;
    const team2HasLineup = localLineups[1]?.hasLineup;

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
          <span className="ml-3 text-gray-600">
            Cargando datos del match...
          </span>
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

      {modality === "team" && localLineups.length === 2 ? (
          <>
            <TableTennisMatchCard lineups={localLineups} match={match} result={result} />
            
          </>
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
                      <p className="text-xs text-gray-500 mt-1">
                        (Sets ganados)
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-gray-400 mb-2">
                      VS
                    </div>
                    <Badge variant="default">Programado</Badge>
                    {match.status !== "finalizado" && match.status !== "en_curso" && (
                      <button
                        onClick={() => swapMutation.mutate()}
                        disabled={swapMutation.isPending}
                        className="mt-2 flex items-center gap-1 mx-auto text-[11px] text-slate-400
                                  hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed
                                  transition-colors px-2 py-1 rounded-lg border border-slate-200
                                  hover:border-slate-400 bg-white"
                        title="Intercambiar posición de los participantes"
                      >
                        {swapMutation.isPending
                          ? <span className="text-[10px]">...</span>
                          : <ArrowLeftRight className="h-3.5 w-3.5" />
                        }
                        Swap
                      </button>
                    )}
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
          {hasGames && <TabsTrigger value="scorecard">Scorecard</TabsTrigger>}
          {result && <TabsTrigger value="results">Resultados</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
              <Button
                onClick={handleGenerateGames}
                isLoading={generateGamesMutation.isPending}
                className="ml-4"
              >
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
              {localLineups.map((lineup) => (
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
                          <div
                            key={l.lineupId}
                            className="text-sm text-gray-600"
                          >
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
