import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, Play, Trophy } from "lucide-react";
import { useUpdateGameResult } from "../../api/table-tennis.queries";
import type { MatchGame } from "../../api/table-tennis.api";

interface TableTennisScorecardProps {
  games: MatchGame[];
  matchId: number;
}

export function TableTennisScorecard({
  games,
  matchId,
}: TableTennisScorecardProps) {
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");

  const updateGameMutation = useUpdateGameResult();

  const handleEdit = (game: MatchGame) => {
    setEditingGameId(game.gameId);
    setScore1(game.score1?.toString() || "");
    setScore2(game.score2?.toString() || "");
  };

  const handleSave = () => {
    if (!editingGameId) return;

    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;

    updateGameMutation.mutate(
      {
        gameId: editingGameId,
        data: {
          score1: s1,
          score2: s2,
          status: "completed",
        },
      },
      {
        onSuccess: () => {
          setEditingGameId(null);
          setScore1("");
          setScore2("");
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingGameId(null);
    setScore1("");
    setScore2("");
  };

  const getGameLabel = (gameNumber: number) => {
    const labels = ["A vs X", "B vs Y", "C vs Z", "A vs Y", "B vs Z"];
    return labels[gameNumber - 1] || `Juego ${gameNumber}`;
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Resultados por Juego</h3>
        <p className="text-sm text-gray-600 mt-1">
          Registra el resultado de cada juego individual (mejor de 3 o 5 sets)
        </p>
      </CardHeader>

      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Juego
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jugador 1
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Sets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jugador 2
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {games.map((game) => {
                const isEditing = editingGameId === game.gameId;
                const isCompleted = game.status === "completed";

                return (
                  <tr
                    key={game.gameId}
                    className={`hover:bg-gray-50 ${
                      isCompleted ? "bg-green-50/30" : ""
                    }`}
                  >
                    {/* Juego */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" className="font-bold">
                        {getGameLabel(game.gameNumber)}
                      </Badge>
                    </td>

                    {/* Jugador 1 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {game.player1.name}
                        </span>
                        {game.winnerId === game.player1Id && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {game.player1.institution.code}
                      </span>
                    </td>

                    {/* Sets */}
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={score1}
                            onChange={(e) => setScore1(e.target.value)}
                            className="w-16 px-2 py-1 text-center border rounded"
                            placeholder="0"
                          />
                          <span className="font-bold">-</span>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={score2}
                            onChange={(e) => setScore2(e.target.value)}
                            className="w-16 px-2 py-1 text-center border rounded"
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {game.score1 !== null && game.score2 !== null
                            ? `${game.score1} - ${game.score2}`
                            : "-"}
                        </span>
                      )}
                    </td>

                    {/* Jugador 2 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {game.player2.name}
                        </span>
                        {game.winnerId === game.player2Id && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {game.player2.institution.code}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      {isCompleted ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completo
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          <Play className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            isLoading={updateGameMutation.isPending}
                          >
                            Guardar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(game)}
                        >
                          {isCompleted ? "Editar" : "Registrar"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
