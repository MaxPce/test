import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Award, Star, User } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { usePoomsaeScoreTable } from "@/features/competitions/api/taekwondo.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface PoomsaeResultsTableProps {
  eventCategoryId: number;
}

export function PoomsaeResultsTable({
  eventCategoryId,
}: PoomsaeResultsTableProps) {
  const { data: phases = [], isLoading: phasesLoading } =
    usePhases(eventCategoryId);

  const poomsaePhase =
    phases.find((p) => p.type === "individual" || p.type === "poomsae") ||
    phases[0];
  const phaseId = poomsaePhase?.phaseId || 0;

  const { data: scores = [], isLoading: scoresLoading } =
    usePoomsaeScoreTable(phaseId);

  const standings = scores
    .map((s: any) => ({
      ...s,
      accuracy: parseFloat(s.accuracy) || 0,
      presentation: parseFloat(s.presentation) || 0,
      total: parseFloat(s.total) || 0,
    }))
    .filter((s: any) => s.total > 0)
    .sort((a: any, b: any) => b.total - a.total);

  if (phasesLoading || scoresLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (standings.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No hay resultados registrados aún</p>
          <p className="text-sm text-gray-400 mt-2">
            Los resultados aparecerán cuando los jueces califiquen las formas
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Pos.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Atleta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Institución
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                    Presentation
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((score: any, index: number) => {
                  const position = index + 1;

                  return (
                    <tr
                      key={score.participationId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={position <= 3 ? "primary" : "default"}>
                          {position}°
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Foto del atleta */}
                          {score.athletePhoto ? (
                            <img
                              src={getImageUrl(score.athletePhoto)}
                              alt={score.athleteName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder =
                                    document.createElement("div");
                                  placeholder.className =
                                    "w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white shadow";
                                  const icon = document.createElementNS(
                                    "http://www.w3.org/2000/svg",
                                    "svg",
                                  );
                                  icon.setAttribute(
                                    "class",
                                    "h-5 w-5 text-white",
                                  );
                                  icon.setAttribute("fill", "currentColor");
                                  icon.setAttribute("viewBox", "0 0 24 24");
                                  icon.innerHTML =
                                    '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
                                  placeholder.appendChild(icon);
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white shadow">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {score.athleteName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* Logo de la institución */}
                          {score.institutionLogo && (
                            <img
                              src={getImageUrl(score.institutionLogo)}
                              alt={score.institution}
                              className="h-6 w-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <span className="text-sm text-gray-500">
                            {score.institution}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {score.accuracy.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {score.presentation.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-bold text-purple-600">
                            {score.total.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
