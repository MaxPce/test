import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Medal, Clock } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useSwimmingResults } from "../api/results.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface StandingsTableProps {
  eventCategoryId: number;
}

export function StandingsTable({ eventCategoryId }: StandingsTableProps) {
  const { data: results = [], isLoading } = useSwimmingResults(eventCategoryId);

  const standings = results
    .filter((r: any) => r.timeValue && r.rankPosition)
    .sort(
      (a: any, b: any) => (a.rankPosition || 999) - (b.rankPosition || 999),
    );

  if (isLoading) {
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
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No hay resultados registrados aún</p>
          <p className="text-sm text-gray-400 mt-2">
            Los resultados aparecerán cuando se registren los tiempos
          </p>
        </CardBody>
      </Card>
    );
  }

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <Card>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Pos.
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Institución
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((result: any) => {
                const position = result.rankPosition;
                const reg = result.participation?.registration;
                const isTeam = !!reg?.team;

                const participantName = isTeam
                  ? reg.team.name
                  : reg?.athlete?.name || "Sin nombre";

                // Obtener objeto completo de institución
                const institutionObj = isTeam
                  ? reg.team.institution
                  : reg?.athlete?.institution;

                const institutionName =
                  institutionObj?.code ||
                  institutionObj?.name ||
                  "Sin institución";

                const institutionLogo = institutionObj?.logoUrl;

                const members =
                  isTeam && reg.team.members
                    ? reg.team.members
                        .map((m: any) => m.athlete?.name)
                        .filter(Boolean)
                        .join(", ")
                    : null;

                return (
                  <tr
                    key={result.resultId}
                    className={`hover:bg-gray-50 transition-colors ${
                      position <= 3 ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getMedalIcon(position)}
                        <Badge variant={position <= 3 ? "primary" : "default"}>
                          {position}°
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participantName}
                        </p>
                        {members && (
                          <p className="text-xs text-gray-500 mt-1">
                            {members}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Logo de la institución */}
                        {institutionLogo && (
                          <img
                            src={getImageUrl(institutionLogo)}
                            alt={institutionName}
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <p className="text-sm text-gray-700 font-medium">
                          {institutionName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-lg font-bold text-blue-600">
                          {result.timeValue}
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
  );
}
