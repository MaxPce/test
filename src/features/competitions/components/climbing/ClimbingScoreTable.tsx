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
  const [editValues, setEditValues] = useState({ total: "", rank: "" });

  const startEdit = (score: (typeof scores)[0]) => {
    setEditingId(score.participationId);
    setEditValues({
      total: score.total !== null ? String(score.total) : "",
      rank: score.rank !== null ? String(score.rank) : "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (participationId: number) => {
    try {
      await updateScore.mutateAsync({
        participationId,
        data: {
          total: editValues.total !== "" ? Number(editValues.total) : null,
          rank: editValues.rank !== "" ? Number(editValues.rank) : null,
        },
      });
      setEditingId(null);
    } catch (err: any) {
      console.log("CLIMBING ERROR:", err.response?.data || err);
    }
  };

  // Ordenar: primero los que tienen rank (por rank asc), luego los sin rank
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
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider w-12">
                    N°
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    Universidad
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider w-24">
                    Posición
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider w-28">
                    Puntaje
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider w-20">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((score, idx) => {
                  const isEditing = editingId === score.participationId;
                  return (
                    <tr
                      key={score.participationId}
                      className={
                        isEditing ? "bg-emerald-50" : "hover:bg-gray-50"
                      }
                    >
                      {/* N° de fila */}
                      <td className="px-4 py-3 text-gray-500 font-medium text-sm">
                        {idx + 1}
                      </td>

                      {/* Nombre */}
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
                          <p className="font-semibold text-gray-900">
                            {score.participantName}
                          </p>
                        </div>
                      </td>

                      {/* Universidad */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {score.institutionAbrev ?? score.institution ?? "—"}
                      </td>

                      {/* Posición */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                            value={editValues.rank}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                rank: e.target.value,
                              }))
                            }
                            placeholder="—"
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

                      {/* Puntaje */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                            value={editValues.total}
                            onChange={(e) =>
                              setEditValues((v) => ({
                                ...v,
                                total: e.target.value,
                              }))
                            }
                            placeholder="0.00"
                          />
                        ) : (
                          <span className="font-semibold text-emerald-700">
                            {score.total !== null
                              ? Number(score.total).toFixed(2)
                              : "—"}
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
