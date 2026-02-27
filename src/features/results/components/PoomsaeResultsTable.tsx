import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Award, Star } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { usePoomsaeScoreTable } from "@/features/competitions/api/taekwondo.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface PoomsaeResultsTableProps {
  eventCategoryId: number;
}

export function PoomsaeResultsTable({ eventCategoryId }: PoomsaeResultsTableProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);

  const { data: phases = [], isLoading: phasesLoading } = usePhases(eventCategoryId);

  const groupPhases = phases.filter((p) => p.type === "grupo");
  const effectivePhaseId =
    selectedPhaseId || groupPhases[0]?.phaseId || phases[0]?.phaseId || 0;

  const { data: scores = [], isLoading: scoresLoading } =
    usePoomsaeScoreTable(effectivePhaseId);

  const standings = scores
    .map((s: any) => ({
      ...s,
      accuracy: parseFloat(s.accuracy) || 0,
      presentation: parseFloat(s.presentation) || 0,
      total: parseFloat(s.total) || 0,
    }))
    .sort((a: any, b: any) => {
      if (b.total === 0 && a.total === 0) return 0;
      if (a.total === 0) return 1;
      if (b.total === 0) return -1;
      return b.total - a.total;
    });

  const allScoresRegistered =
    standings.length > 0 && standings.every((s: any) => s.total > 0);

  if (phasesLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  const phaseOptions = [
    { value: "0", label: "Seleccione una fase" },
    ...groupPhases.map((phase) => ({
      value: String(phase.phaseId),
      label: phase.name,
    })),
  ];

  const selectedPhase = phases.find((p) => p.phaseId === effectivePhaseId);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", icon: "🥇" };
      case 2:
        return { bg: "bg-gray-50", border: "border-gray-400", text: "text-gray-700", icon: "🥈" };
      case 3:
        return { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", icon: "🥉" };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Star className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Resultados de Poomsae</h3>
            <p className="text-purple-100 mt-1">
              Calificaciones de Precisión y Presentación
            </p>
          </div>
        </div>
      </div>

      {groupPhases.length > 1 && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <Select
                  label="Seleccionar Fase"
                  value={String(effectivePhaseId)}
                  onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
                  options={phaseOptions}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {effectivePhaseId > 0 ? (
        <Card>
          {selectedPhase && (
            <CardHeader>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-lg">
                  {selectedPhase.name}
                </h4>
                <Badge variant="primary">{standings.length} participantes</Badge>
              </div>
            </CardHeader>
          )}
          <CardBody className="p-0">
            {scoresLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Cargando resultados...</p>
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">No hay participantes en esta fase</p>
                <p className="text-sm mt-1">
                  Los participantes aparecerán cuando se inscriban en la categoría
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Pos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Participante
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center justify-center gap-1">
                            Accuracy
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center justify-center gap-1">
                            Presentation
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {standings.map((score: any, index: number) => {
                        const position = index + 1;
                        const isMedalist = allScoresRegistered && position <= 3;
                        const medalColor = isMedalist ? getMedalColor(position) : null;

                        return (
                          <tr
                            key={score.participationId}
                            className={`transition-colors ${
                              isMedalist
                                ? `${medalColor?.bg} border-l-4 ${medalColor?.border}`
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {isMedalist && (
                                  <span className="text-xl">{medalColor?.icon}</span>
                                )}
                                <Badge
                                  variant={isMedalist ? "primary" : "default"}
                                  size="sm"
                                  className="font-bold"
                                >
                                  {position}°
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                {score.participantPhoto ? (
                                  <img
                                    src={getImageUrl(score.participantPhoto)}
                                    alt={score.participantName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const parent = e.currentTarget.parentElement;
                                      if (parent) {
                                        const placeholder = document.createElement("div");
                                        placeholder.className =
                                          "w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow";
                                        placeholder.textContent =
                                          score.participantName.charAt(0);
                                        parent.appendChild(placeholder);
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow">
                                    {score.participantName.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {score.participantName}
                                    {score.isTeam && (
                                      <span className="ml-2 text-xs text-blue-600 font-normal">
                                        (Equipo)
                                      </span>
                                    )}
                                  </p>
                                  {score.institution && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {score.institutionLogo && (
                                        <img
                                          src={getImageUrl(score.institutionLogo)}
                                          alt={score.institution}
                                          className="h-4 w-4 object-contain"
                                          onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                          }}
                                        />
                                      )}
                                      <p className="text-xs text-gray-600 font-medium">
                                        {score.institution}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-purple-700">
                                {score.accuracy > 0 ? score.accuracy.toFixed(2) : "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-pink-700">
                                {score.presentation > 0
                                  ? score.presentation.toFixed(2)
                                  : "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {score.total > 0 ? (
                                <Badge
                                  variant="primary"
                                  className={`font-bold text-base px-3 ${
                                    isMedalist ? medalColor?.text : ""
                                  }`}
                                >
                                  {score.total.toFixed(2)}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm font-medium">
                                  Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600">
                    <span>
                      <strong>Accuracy:</strong> Precisión técnica de la forma
                    </span>
                    <span>
                      <strong>Presentation:</strong> Presentación y ejecución
                    </span>
                    <span>
                      <strong>Total:</strong> Puntuación final (Accuracy + Presentation)
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
