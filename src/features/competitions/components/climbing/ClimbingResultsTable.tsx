import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Mountain } from "lucide-react";
import { usePhases } from "@/features/competitions/api/phases.queries";
import {
  useClimbingScoreTable,
  useClimbingInstitutionalRanking,
  useUpdateClimbingScore,
} from "@/features/competitions/api/climbing.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  eventCategoryId: number;
  canEdit?: boolean;
}

export function ClimbingResultsTable({
  eventCategoryId,
  canEdit = false,
}: Props) {
  const [selectedPhaseId, setSelectedPhaseId] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    result: string;
    rank: string;
    notes: string;
  }>({ result: "", rank: "", notes: "" });

  const { data: phases = [], isLoading: phasesLoading } =
    usePhases(eventCategoryId);

  const groupPhases = phases.filter((p) => p.type === "grupo");
  const effectivePhaseId =
    selectedPhaseId || groupPhases[0]?.phaseId || phases[0]?.phaseId || 0;

  const { data: scores = [], isLoading: scoresLoading } =
    useClimbingScoreTable(effectivePhaseId);

  const { data: institutional } =
    useClimbingInstitutionalRanking(effectivePhaseId);

  const updateScore = useUpdateClimbingScore(effectivePhaseId);

  // Ordenar: primero los que tienen rank, después los pendientes
  const sorted = [...scores].sort((a, b) => {
    if (a.rank === null && b.rank === null) return 0;
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

  const allRanked = sorted.length > 0 && sorted.every((s) => s.rank !== null);

  const getMedalStyle = (rank: number | null) => {
    if (!allRanked || rank === null) return null;
    switch (rank) {
      case 1:
        return { bg: "bg-yellow-50", border: "border-yellow-400", icon: "🥇" };
      case 2:
        return { bg: "bg-gray-50", border: "border-gray-400", icon: "🥈" };
      case 3:
        return { bg: "bg-orange-50", border: "border-orange-400", icon: "🥉" };
      default:
        return null;
    }
  };

  const startEdit = (score: (typeof scores)[0]) => {
    setEditingId(score.participationId);
    setEditValues({
      result: score.result !== null ? String(score.result) : "",
      rank: score.rank !== null ? String(score.rank) : "",
      notes: score.notes ?? "",
    });
  };

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

  if (phasesLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <Mountain className="h-10 w-10 opacity-80" />
          <div>
            <h3 className="text-2xl font-bold">Resultados Escalada</h3>
            <p className="text-emerald-100 text-sm">
              Ranking individual y por institución
            </p>
          </div>
        </div>
      </div>

      {/* Selector de fase */}
      {groupPhases.length > 1 && (
        <Card>
          <CardBody>
            <Select
              label="Seleccionar Fase"
              value={String(effectivePhaseId)}
              onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
              options={[
                { value: "0", label: "Seleccione una fase" },
                ...groupPhases.map((p) => ({
                  value: String(p.phaseId),
                  label: p.name,
                })),
              ]}
            />
          </CardBody>
        </Card>
      )}

      {effectivePhaseId > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tabla individual — ocupa 2/3 */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Ranking Individual
                  </h4>
                  <Badge variant="primary">{scores.length} atletas</Badge>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {scoresLoading ? (
                  <div className="text-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : scores.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="font-medium">
                      No hay participantes en esta fase
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Pos
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Atleta
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Resultado
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Pts. Ranking
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Notas
                          </th>
                          {canEdit && (
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Acción
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sorted.map((score) => {
                          const medal = getMedalStyle(score.rank);
                          const isEditing = editingId === score.participationId;

                          return (
                            <tr
                              key={score.participationId}
                              className={`transition-colors ${
                                medal
                                  ? `${medal.bg} border-l-4 ${medal.border}`
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {/* Posición */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {medal && (
                                    <span className="text-xl">
                                      {medal.icon}
                                    </span>
                                  )}
                                  {isEditing && canEdit ? (
                                    <input
                                      type="number"
                                      className="w-16 border rounded px-2 py-1 text-sm"
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
                                      variant={medal ? "primary" : "default"}
                                      size="sm"
                                      className="font-bold"
                                    >
                                      {score.rank !== null
                                        ? `${score.rank}°`
                                        : "—"}
                                    </Badge>
                                  )}
                                </div>
                              </td>

                              {/* Atleta */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  {score.participantPhoto ? (
                                    <img
                                      src={getImageUrl(score.participantPhoto)}
                                      alt={score.participantName}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow">
                                      {score.participantName.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {score.participantName}
                                    </p>
                                    {score.institution && (
                                      <p className="text-xs text-gray-500">
                                        {score.institutionAbrev ??
                                          score.institution}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Resultado */}
                              <td className="px-4 py-4 text-center">
                                {isEditing && canEdit ? (
                                  <input
                                    type="number"
                                    step="0.001"
                                    className="w-24 border rounded px-2 py-1 text-sm text-center"
                                    value={editValues.result}
                                    onChange={(e) =>
                                      setEditValues((v) => ({
                                        ...v,
                                        result: e.target.value,
                                      }))
                                    }
                                    placeholder="Resultado"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-emerald-700">
                                    {score.result !== null ? score.result : "—"}
                                  </span>
                                )}
                              </td>

                              {/* Puntos ranking */}
                              <td className="px-4 py-4 text-center">
                                {score.points !== null ? (
                                  <Badge
                                    variant="primary"
                                    className="font-bold"
                                  >
                                    {score.points}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    Pendiente
                                  </span>
                                )}
                              </td>

                              {/* Notas */}
                              <td className="px-4 py-4 text-center">
                                {isEditing && canEdit ? (
                                  <input
                                    className="w-32 border rounded px-2 py-1 text-sm"
                                    value={editValues.notes}
                                    onChange={(e) =>
                                      setEditValues((v) => ({
                                        ...v,
                                        notes: e.target.value,
                                      }))
                                    }
                                    placeholder="Tops/Zonas..."
                                  />
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    {score.notes ?? "—"}
                                  </span>
                                )}
                              </td>

                              {/* Acciones */}
                              {canEdit && (
                                <td className="px-4 py-4 text-center">
                                  {isEditing ? (
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() =>
                                          saveEdit(score.participationId)
                                        }
                                        className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startEdit(score)}
                                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                                    >
                                      Editar
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Ranking institucional — ocupa 1/3 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h4 className="font-bold text-gray-900 text-lg">
                  Ranking Institucional
                </h4>
              </CardHeader>
              <CardBody className="p-0">
                {!institutional?.general?.length ? (
                  <div className="text-center py-8 text-gray-500 text-sm px-4">
                    Los puntos aparecerán cuando se asignen posiciones
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {institutional.general.map((inst, idx) => (
                      <div
                        key={inst.institutionName}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <span className="w-6 text-center font-bold text-gray-500 text-sm">
                          {idx + 1}°
                        </span>
                        {inst.logoUrl && (
                          <img
                            src={getImageUrl(inst.logoUrl)}
                            alt={inst.institutionName}
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {inst.institutionAbrev}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {inst.institutionName}
                          </p>
                        </div>
                        <Badge variant="primary" className="font-bold shrink-0">
                          {inst.totalPoints}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <Mountain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">
                Selecciona una fase para ver los resultados
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
