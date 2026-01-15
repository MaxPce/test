// src/features/results/components/StandingsTable.tsx
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Medal, Users } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useSwimmingResults } from "../api/results.queries";

interface StandingsTableProps {
  eventCategoryId: number;
}

export function StandingsTable({ eventCategoryId }: StandingsTableProps) {
  const { data: results = [], isLoading } = useSwimmingResults(eventCategoryId);

  // Filtrar y ordenar resultados
  const standings = results
    .filter((r) => r.rankPosition !== null && r.rankPosition !== undefined)
    .sort((a, b) => (a.rankPosition || 999) - (b.rankPosition || 999));

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
          <p className="text-gray-500">No hay resultados registrados aún</p>
          <p className="text-sm text-gray-400 mt-2">
            Los resultados aparecerán aquí una vez que se registren los tiempos
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

  const getPositionBadge = (position: number) => {
    if (position === 1) return "success";
    if (position <= 3) return "primary";
    return "default";
  };

  return (
    <Card>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pos.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institución
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((result) => {
                const isTeam = !!result.participation?.registration?.team; // ✅ Detectar equipo
                const position = result.rankPosition || 0;

                // ✅ Obtener datos según sea equipo o atleta
                const participantName = isTeam
                  ? result.participation?.registration?.team?.name
                  : result.participation?.registration?.athlete?.name;

                const institutionCode = isTeam
                  ? result.participation?.registration?.team?.institution?.code
                  : result.participation?.registration?.athlete?.institution
                      ?.code;

                const teamMembers = isTeam
                  ? result.participation?.registration?.team?.members
                      ?.map((m) => m.athlete.name)
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
                        <Badge variant={getPositionBadge(position) as any}>
                          {position}°
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        {isTeam && (
                          <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {participantName}
                          </p>
                          {teamMembers && (
                            <p className="text-xs text-gray-500 mt-1">
                              {teamMembers}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {institutionCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {result.timeValue}
                      </span>
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
