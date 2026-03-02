import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Mountain, Check, X, Pencil } from "lucide-react";
import { usePhases } from "@/features/competitions/api/phases.queries";
import {
  useClimbingScoreTable,
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
  }>({
    result: "",
    rank: "",
  });

  const { data: phases = [], isLoading: phasesLoading } =
    usePhases(eventCategoryId);

  const groupPhases = phases.filter((p) => p.type === "grupo");
  const effectivePhaseId =
    selectedPhaseId || groupPhases[0]?.phaseId || phases[0]?.phaseId || 0;

  const { data: scores = [], isLoading: scoresLoading } =
    useClimbingScoreTable(effectivePhaseId);

  const updateScore = useUpdateClimbingScore(effectivePhaseId);

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
        return { bg: "bg-slate-50", border: "border-slate-400", icon: "🥈" };
      case 3:
        return { bg: "bg-orange-50", border: "border-orange-400", icon: "🥉" };
      default:
        return null;
    }
  };

  const startEdit = (score: (typeof scores)[0]) => {
    setEditingId(score.participationId);
    setEditValues({
      result: score.total !== null ? String(score.total) : "",
      rank: score.rank !== null ? String(score.rank) : "",
    });
  };

  const saveEdit = async (participationId: number) => {
    await updateScore.mutateAsync({
      participationId,
      data: {
        total: editValues.result !== "" ? Number(editValues.result) : null,
        rank: editValues.rank !== "" ? Number(editValues.rank) : null,
      },
    });
    setEditingId(null);
  };

  if (phasesLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-16">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full bg-white" />
        </div>
        <div className="relative px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Resultados — Escalada
              </h3>
              <p className="text-emerald-100 text-sm mt-0.5">
                {scores.length > 0
                  ? `${scores.length} participación${
                      scores.length !== 1 ? "es" : ""
                    }`
                  : "Ranking"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de fase */}
      {groupPhases.length > 1 && (
        <Card>
          <CardBody className="py-4">
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
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-lg">
                Ranking{" "}
                {/** se usa la misma tabla para individuales o equipos */}
              </h4>
              <Badge variant="primary">{scores.length} filas</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {scoresLoading ? (
              <div className="flex justify-center items-center py-16">
                <Spinner size="lg" />
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Mountain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay resultados en esta fase</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-24">
                        Posición
                      </th>
                      {/* Para equipos, solo queremos universidad → esta columna será “Equipo / Universidad” */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {/** Cambia el label según si es equipo o atleta; tomamos el primero como referencia */}
                        {scores[0]?.isTeam ? "Equipo / Universidad" : "Atleta"}
                      </th>
                      {/* Universidad solo para individuales, para equipos ya va en la columna anterior */}
                      {!scores[0]?.isTeam && (
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Universidad
                        </th>
                      )}
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-36">
                        Puntaje
                      </th>
                      {canEdit && (
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-28">
                          Acción
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sorted.map((score, idx) => {
                      const medal = getMedalStyle(score.rank);
                      const isEditing = editingId === score.participationId;

                      return (
                        <tr
                          key={score.participationId}
                          className={`transition-colors ${
                            isEditing
                              ? "bg-emerald-50"
                              : medal
                                ? `${medal.bg} border-l-4 ${medal.border}`
                                : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Posición */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              {medal && (
                                <span className="text-2xl leading-none">
                                  {medal.icon}
                                </span>
                              )}
                              {isEditing && canEdit ? (
                                <input
                                  type="number"
                                  min={1}
                                  className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                <span
                                  className={`font-bold text-sm ${
                                    medal ? "text-gray-800" : "text-gray-500"
                                  }`}
                                >
                                  {score.rank !== null
                                    ? `${score.rank}°`
                                    : `${idx + 1}`}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Columna principal: 
                              - Si es equipo: mostrar institución + (opcional) nombre del equipo en la misma línea
                              - Si es individual: nombre del atleta y avatar */}
                          <td className="px-6 py-5">
                            {score.isTeam ? (
                              <div className="flex items-center gap-3">
                                {/** Logo de la universidad si existe */}
                                {score.institutionAbrev || score.institution ? (
                                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                    {(
                                      score.institutionAbrev ??
                                      score.institution ??
                                      "?"
                                    ).charAt(0)}
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                    <Mountain className="h-5 w-5 text-slate-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {score.institutionAbrev ??
                                      score.institution ??
                                      "Equipo"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {score.participantName}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                {score.participantPhoto ? (
                                  <img
                                    src={getImageUrl(score.participantPhoto)}
                                    alt={score.participantName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {score.participantName.charAt(0)}
                                  </div>
                                )}
                                <p className="font-semibold text-gray-900">
                                  {score.participantName}
                                </p>
                              </div>
                            )}
                          </td>

                          {/* Universidad separada solo para individuales */}
                          {!score.isTeam && (
                            <td className="px-6 py-5 text-sm text-gray-600">
                              {score.institutionAbrev ??
                                score.institution ??
                                "—"}
                            </td>
                          )}

                          {/* Puntaje */}
                          <td className="px-6 py-5 text-center">
                            {isEditing && canEdit ? (
                              <input
                                type="number"
                                step="0.01"
                                className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={editValues.result}
                                onChange={(e) =>
                                  setEditValues((v) => ({
                                    ...v,
                                    result: e.target.value,
                                  }))
                                }
                                placeholder="0.00"
                              />
                            ) : (
                              <span className="font-bold text-emerald-700 text-base">
                                {score.total !== null ? (
                                  Number(score.total).toFixed(2)
                                ) : (
                                  <span className="text-gray-400 font-normal text-sm">
                                    —
                                  </span>
                                )}
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          {canEdit && (
                            <td className="px-6 py-5 text-center">
                              {isEditing ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() =>
                                      saveEdit(score.participationId)
                                    }
                                    disabled={updateScore.isPending}
                                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEdit(score)}
                                  className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
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
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-16 text-gray-500">
              <Mountain className="h-14 w-14 mx-auto mb-4 text-gray-300" />
              <p className="font-semibold text-gray-700">
                Selecciona una fase para ver los resultados
              </p>
              <p className="text-sm mt-1">
                Los resultados aparecerán aquí una vez asignados
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
