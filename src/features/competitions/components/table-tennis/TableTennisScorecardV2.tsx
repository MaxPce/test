import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, Play, Trophy, Plus, Trash2, X } from "lucide-react";
import { useUpdateGameResult } from "../../api/table-tennis.queries";
import type { MatchGame, GameSet } from "../../api/table-tennis.api";

interface TableTennisScorecardProps {
  games: MatchGame[];
  matchId: number;
  onGameUpdate?: () => void;
}

export function TableTennisScorecardV2({
  games,
  matchId,
  onGameUpdate,
}: TableTennisScorecardProps) {
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  const [currentSets, setCurrentSets] = useState<GameSet[]>([]);

  const updateGameMutation = useUpdateGameResult();

  const handleEdit = (game: MatchGame) => {
    setEditingGameId(game.gameId);

    // Si ya tiene sets, cargarlos
    if (game.sets && game.sets.length > 0) {
      setCurrentSets(game.sets);
    } else {
      // Iniciar con 1 set vacío
      setCurrentSets([{ setNumber: 1, player1Score: 0, player2Score: 0 }]);
    }
  };

  const handleAddSet = () => {
    if (currentSets.length >= 5) {
      alert("Un juego no puede tener más de 5 sets");
      return;
    }

    const newSet: GameSet = {
      setNumber: currentSets.length + 1,
      player1Score: 0,
      player2Score: 0,
    };

    setCurrentSets([...currentSets, newSet]);
  };

  const handleRemoveSet = (index: number) => {
    const updatedSets = currentSets.filter((_, i) => i !== index);
    // Renumerar sets
    const renumbered = updatedSets.map((set, i) => ({
      ...set,
      setNumber: i + 1,
    }));
    setCurrentSets(renumbered);
  };

  const handleSetScoreChange = (
    index: number,
    player: "player1" | "player2",
    value: string,
  ) => {
    const score = parseInt(value) || 0;
    const updatedSets = [...currentSets];

    if (player === "player1") {
      updatedSets[index].player1Score = score;
    } else {
      updatedSets[index].player2Score = score;
    }

    setCurrentSets(updatedSets);
  };

  const validateSets = (): string | null => {
    for (const set of currentSets) {
      const maxScore = Math.max(set.player1Score, set.player2Score);
      const minScore = Math.min(set.player1Score, set.player2Score);
      const diff = maxScore - minScore;

      // Validar que ambos tengan puntos
      if (set.player1Score === 0 && set.player2Score === 0) {
        return `Set ${set.setNumber}: Debe ingresar los puntos`;
      }

      // Validar puntuación mínima
      if (maxScore < 11) {
        return `Set ${set.setNumber}: El ganador debe tener al menos 11 puntos`;
      }

      // Validar diferencia mínima
      if (diff < 2) {
        return `Set ${set.setNumber}: Debe haber diferencia de al menos 2 puntos`;
      }
    }

    return null;
  };

  const handleSave = () => {
    if (!editingGameId) return;

    const validationError = validateSets();
    if (validationError) {
      alert(validationError);
      return;
    }

    updateGameMutation.mutate(
      {
        gameId: editingGameId,
        data: {
          sets: currentSets,
        },
      },
      {
        onSuccess: () => {
          setEditingGameId(null);
          setCurrentSets([]);
          onGameUpdate?.();
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || "Error al guardar");
        },
      },
    );
  };

  const handleCancel = () => {
    setEditingGameId(null);
    setCurrentSets([]);
  };

  const getGameLabel = (gameNumber: number) => {
    const labels = ["A vs X", "B vs Y", "C vs Z", "A vs Y", "B vs Z"];
    return labels[gameNumber - 1] || `Juego ${gameNumber}`;
  };

  const getSetWinner = (
    set: GameSet,
    game: MatchGame,
  ): "player1" | "player2" | null => {
    if (set.player1Score > set.player2Score) return "player1";
    if (set.player2Score > set.player1Score) return "player2";
    return null;
  };

  return (
    <Card>
      <CardBody className="p-0">
        <div className="divide-y divide-gray-200">
          {games.map((game) => {
            const isEditing = editingGameId === game.gameId;
            const isCompleted = game.status === "completed";
            const displaySets = isEditing ? currentSets : game.sets || [];

            return (
              <div
                key={game.gameId}
                className={`p-6 ${
                  isCompleted ? "bg-green-50/30" : "hover:bg-gray-50"
                }`}
              >
                {/* Header del juego */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="default"
                      className="font-bold text-base px-3 py-1"
                    >
                      {getGameLabel(game.gameNumber)}
                    </Badge>

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

                    {!isEditing &&
                      game.score1 !== null &&
                      game.score2 !== null && (
                        <span className="text-2xl font-bold text-gray-900">
                          {game.score1} - {game.score2}
                        </span>
                      )}
                  </div>

                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(game)}
                    >
                      {isCompleted ? "Editar" : "Registrar"}
                    </Button>
                  )}
                </div>

                {/* Jugadores */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {game.player1.name}
                    </span>
                    {game.winnerId === game.player1Id && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                    {game.player1.institution && (
                      <span className="text-xs text-gray-500">
                        ({game.player1.institution.code})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {game.player2.institution && (
                      <span className="text-xs text-gray-500">
                        ({game.player2.institution.code})
                      </span>
                    )}
                    {game.winnerId === game.player2Id && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {game.player2.name}
                    </span>
                  </div>
                </div>
                {/* Sets */}
                {displaySets.length > 0 && (
                  <div className="space-y-2">
                    {displaySets.map((set, index) => {
                      const winner = getSetWinner(set, game);

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-600 w-16">
                            Set {set.setNumber}
                          </span>

                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                value={set.player1Score}
                                onChange={(e) =>
                                  handleSetScoreChange(
                                    index,
                                    "player1",
                                    e.target.value,
                                  )
                                }
                                className="w-20 px-3 py-2 text-center border rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="font-bold text-gray-400">-</span>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                value={set.player2Score}
                                onChange={(e) =>
                                  handleSetScoreChange(
                                    index,
                                    "player2",
                                    e.target.value,
                                  )
                                }
                                className="w-20 px-3 py-2 text-center border rounded focus:ring-2 focus:ring-blue-500"
                              />

                              {currentSets.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveSet(index)}
                                  className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <span
                                className={`text-lg font-bold ${
                                  winner === "player1"
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {set.player1Score}
                              </span>
                              <span className="font-bold text-gray-400">-</span>
                              <span
                                className={`text-lg font-bold ${
                                  winner === "player2"
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {set.player2Score}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Acciones de edición */}
                {isEditing && (
                  <div className="mt-4 flex items-center gap-2">
                    {currentSets.length < 5 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddSet}
                      >
                        Agregar Set
                      </Button>
                    )}

                    <div className="ml-auto flex gap-2">
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
