import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Award, Star } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { usePoomsaeScoreTable } from "@/features/competitions/api/taekwondo.queries";

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
                        <p className="text-sm font-medium text-gray-900">
                          {score.athleteName}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.institution}
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
                          <Star className="h-4 w-4 text-yellow-500" />
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
