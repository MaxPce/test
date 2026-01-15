// src/features/competitions/components/table-tennis/TableTennisMatchManager.tsx
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Users,
  Zap,
  Trophy,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { LineupSelector } from "./LineupSelector";
import { TableTennisMatchCard } from "./TableTennisMatchCard";
import { TableTennisScorecard } from "./TableTennisScorecard";
import {
  useMatchLineups,
  useMatchGames,
  useMatchResult,
  useGenerateGames,
} from "../../api/table-tennis.queries";
import type { Match } from "../../types";

interface TableTennisMatchManagerProps {
  match: Match;
}

export function TableTennisMatchManager({
  match,
}: TableTennisMatchManagerProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Queries
  const { data: lineups = [], isLoading: lineupsLoading } = useMatchLineups(
    match.matchId
  );

  const { data: games = [], isLoading: gamesLoading } = useMatchGames(
    match.matchId
  );

  const { data: result, isLoading: resultLoading } = useMatchResult(
    match.matchId
  );

  // Mutations
  const generateGamesMutation = useGenerateGames();

  // Estados derivados
  const hasLineups = lineups.length === 2 && lineups.every((l) => l.hasLineup);
  const hasGames = games.length > 0;
  const team1 = lineups[0];
  const team2 = lineups[1];

  // Handlers
  const handleGenerateGames = () => {
    if (!hasLineups) {
      alert("Ambos equipos deben configurar su lineup primero");
      return;
    }

    if (
      window.confirm(
        "¿Generar los 5 juegos automáticamente? Esto eliminará juegos existentes."
      )
    ) {
      generateGamesMutation.mutate(match.matchId, {
        onSuccess: () => {
          setActiveTab("scorecard");
        },
      });
    }
  };

  const handleLineupSuccess = () => {
    // Cambiar a la pestaña del otro equipo si falta configurar
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
          <span className="ml-3 text-gray-600">
            Cargando datos del match...
          </span>
        </CardBody>
      </Card>
    );
  }

  if (lineups.length !== 2) {
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
      {/* Estado del Match */}
      <TableTennisMatchCard lineups={lineups} result={result} />

      {/* Indicadores de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lineups */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                hasLineups ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Users
                className={`h-6 w-6 ${
                  hasLineups ? "text-green-600" : "text-gray-400"
                }`}
              />
            </div>
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

        {/* Juegos */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                hasGames ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Zap
                className={`h-6 w-6 ${
                  hasGames ? "text-blue-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Juegos</p>
              <p className="font-semibold text-gray-900">
                {hasGames ? (
                  <span>
                    {games.filter((g) => g.status === "completed").length} /{" "}
                    {games.length} completados
                  </span>
                ) : (
                  <span className="text-gray-500">No generados</span>
                )}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Resultado */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                result?.isComplete ? "bg-yellow-100" : "bg-gray-100"
              }`}
            >
              <Trophy
                className={`h-6 w-6 ${
                  result?.isComplete ? "text-yellow-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Match</p>
              <p className="font-semibold text-gray-900">
                {result?.isComplete ? (
                  <span className="text-yellow-600">Finalizado ✓</span>
                ) : hasGames ? (
                  <span className="text-blue-600">En juego</span>
                ) : (
                  <span className="text-gray-500">No iniciado</span>
                )}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="lineup-team1">
            <Settings className="h-4 w-4 mr-2" />
            Lineup {team1?.teamName}
          </TabsTrigger>
          <TabsTrigger value="lineup-team2">
            <Settings className="h-4 w-4 mr-2" />
            Lineup {team2?.teamName}
          </TabsTrigger>
          {hasGames && (
            <TabsTrigger value="scorecard">
              <Zap className="h-4 w-4 mr-2" />
              Scorecard
            </TabsTrigger>
          )}
          {result && (
            <TabsTrigger value="results">
              <Trophy className="h-4 w-4 mr-2" />
              Resultados
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-4">
          {!hasLineups && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="font-medium">Configuración pendiente</p>
                <p className="text-sm">
                  Ambos equipos deben configurar su lineup (3 titulares + 1
                  suplente)
                </p>
              </div>
            </Alert>
          )}

          {hasLineups && !hasGames && (
            <Alert variant="info">
              <CheckCircle className="h-4 w-4" />
              <div className="ml-2 flex-1">
                <p className="font-medium">Lineups configurados</p>
                <p className="text-sm">
                  Ahora puedes generar los 5 juegos automáticamente
                </p>
              </div>
              <Button
                onClick={handleGenerateGames}
                isLoading={generateGamesMutation.isPending}
                className="ml-4"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generar Juegos
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

          {/* Resumen de lineups */}
          {hasLineups && (
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

        {/* Tab: Lineup Equipo 1 */}
        <TabsContent value="lineup-team1">
          {team1 && (
            <LineupSelector
              participationId={team1.participation.participationId}
              teamName={team1.teamName}
              members={team1.participation.registration.team.members || []}
              existingLineup={team1.lineups.map((l) => ({
                athleteId: l.athleteId,
                lineupOrder: l.lineupOrder,
                isSubstitute: l.isSubstitute,
              }))}
              onSuccess={handleLineupSuccess}
            />
          )}
        </TabsContent>

        {/* Tab: Lineup Equipo 2 */}
        <TabsContent value="lineup-team2">
          {team2 && (
            <LineupSelector
              participationId={team2.participation.participationId}
              teamName={team2.teamName}
              members={team2.participation.registration.team.members || []}
              existingLineup={team2.lineups.map((l) => ({
                athleteId: l.athleteId,
                lineupOrder: l.lineupOrder,
                isSubstitute: l.isSubstitute,
              }))}
              onSuccess={handleLineupSuccess}
            />
          )}
        </TabsContent>

        {/* Tab: Scorecard */}
        {hasGames && (
          <TabsContent value="scorecard">
            <TableTennisScorecard games={games} matchId={match.matchId} />
          </TabsContent>
        )}

        {/* Tab: Resultados */}
        {result && (
          <TabsContent value="results">
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {result.isComplete
                      ? "¡Match Finalizado!"
                      : "Match en Progreso"}
                  </h2>
                  <p className="text-5xl font-bold text-gray-900 my-6">
                    {result.score}
                  </p>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {result.team1.teamName}
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {result.team1.wins}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        juegos ganados
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {result.team2.teamName}
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {result.team2.wins}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        juegos ganados
                      </p>
                    </div>
                  </div>
                  {result.winner && (
                    <Alert variant="success" className="mt-6">
                      <Trophy className="h-5 w-5" />
                      <span className="ml-2 font-semibold">
                        Ganador:{" "}
                        {result.winner.registrationId ===
                        team1.participation.registration.registrationId
                          ? result.team1.teamName
                          : result.team2.teamName}
                      </span>
                    </Alert>
                  )}
                </div>
              </CardBody>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
