import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Check, Pencil, X } from "lucide-react";
import {
  useClimbingScoreTable,
  useUpdateClimbingScore,
} from "@/features/competitions/api/climbing.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  phaseId: number;
}

export function ClimbingScoreTable({ phaseId }: Props) {
  const { data: scores = [], isLoading } = useClimbingScoreTable(phaseId);
  const updateScore = useUpdateClimbingScore(phaseId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    result: "",
    rank: "",
    notes: "",
  });

  const startEdit = (score: (typeof scores)[0]) => {
    setEditingId(score.participationId);
    setEditValues({
      result: score.result !== null ? String(score.result) : "",
      rank: score.rank !== null ? String(score.rank) : "",
      notes: score.notes ?? "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (participationId: number) => {
    await updateScore.mutateAsync({
      participationId,
      data: {
        result: editValues.result !== "" ? Number(editValues.result) : null,
        rank: editValues.rank !== "" ? Number(editValues.rank) : null,
        notes: editValues.notes || null,
      },
    });
    setEditingId(null);
  };

  const sorted = [...scores].sort((a, b) => {
    if (a.rank === null && b.rank === null) return 0;
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-lg">
            Tabla de Resultados — Escalada
          </h4>
          <Badge variant="primary">{scores.length} atletas</Badge>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium">No hay participantes en esta fase</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Pos
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Atleta
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Resultado
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Pts. Ranking
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Notas
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((score) => {
                  const isEditing = editingId === score.participationId;
                  return (
                    <tr
                      key={score.participationId}
                      className={
                        isEditing ? "bg-emerald-50" : "hover:bg-gray-50"
                      }
                    >
                      {/* Posición */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                            value={editValues.rank}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                rank: e.target.value,
                              }))
                            }
                            placeholder="Pos"
                          />
                        ) : (
                          <Badge
                            variant={score.rank ? "primary" : "default"}
                            size="sm"
                          >
                            {score.rank !== null ? `${score.rank}°` : "—"}
                          </Badge>
                        )}
                      </td>

                      {/* Atleta */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {score.participantPhoto ? (
                            <img
                              src={getImageUrl(score.participantPhoto)}
                              alt={score.participantName}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                              {score.participantName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {score.participantName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {score.institutionAbrev ??
                                score.institution ??
                                "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Resultado */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.001"
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                            value={editValues.result}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                result: e.target.value,
                              }))
                            }
                            placeholder="0.000"
                          />
                        ) : (
                          <span className="font-semibold text-emerald-700">
                            {score.result !== null ? score.result : "—"}
                          </span>
                        )}
                      </td>

                      {/* Puntos ranking */}
                      <td className="px-4 py-3 text-center">
                        {score.points !== null ? (
                          <Badge variant="primary" className="font-bold">
                            {score.points}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Notas */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                            value={editValues.notes}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                notes: e.target.value,
                              }))
                            }
                            placeholder="Tops / Zonas..."
                          />
                        ) : (
                          <span className="text-xs text-gray-500">
                            {score.notes ?? "—"}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => saveEdit(score.participationId)}
                              disabled={updateScore.isPending}
                              className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(score)}
                            className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
