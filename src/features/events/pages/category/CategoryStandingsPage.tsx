import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { useStandings } from "@/features/competitions/api/standings.queries";
import { useUpdateStandings } from "@/features/competitions/api/standings.mutations";
import type { EventCategory } from "../../types";

export function CategoryStandingsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);

  const { data: phases = [] } = usePhases(eventCategory.eventCategoryId);
  const { data: standings = [], isLoading: standingsLoading } = useStandings(
    selectedPhaseId || undefined
  );
  const updateStandingsMutation = useUpdateStandings();

  const phaseOptions = [
    { value: 0, label: "Seleccione una fase" },
    ...phases
      .filter((p) => p.type === "grupo")
      .map((phase) => ({
        value: phase.phaseId,
        label: phase.name,
      })),
  ];

  const handleUpdateStandings = async () => {
    if (selectedPhaseId > 0) {
      await updateStandingsMutation.mutateAsync(selectedPhaseId);
    }
  };

  const selectedPhase = phases.find((p) => p.phaseId === selectedPhaseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Tabla de Posiciones
        </h3>
        <p className="text-gray-600 mt-1">
          Clasificación y estadísticas de los participantes
        </p>
      </div>

      {/* Selector de Fase */}
      {phases.filter((p) => p.type === "grupo").length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md">
              <Select
                label="Seleccionar Fase"
                value={selectedPhaseId}
                onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
                options={phaseOptions}
              />
            </div>
            {selectedPhaseId > 0 && (
              <Button
                variant="ghost"
                onClick={handleUpdateStandings}
                isLoading={updateStandingsMutation.isPending}
                className="mt-6"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            )}
          </div>

          {/* Tabla de Posiciones */}
          {selectedPhaseId > 0 ? (
            <Card>
              <CardHeader>
                <h4 className="font-semibold text-gray-900">
                  {selectedPhase?.name}
                </h4>
              </CardHeader>
              <CardBody className="p-0">
                {standingsLoading ? (
                  <div className="text-center py-8">Cargando posiciones...</div>
                ) : standings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay datos de posiciones</p>
                    <p className="text-sm mt-1">
                      Los partidos deben finalizarse para generar la tabla
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Pos
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Participante
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            PJ
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            PG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            PE
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            PP
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            GF
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            GC
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            DG
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {standings.map((standing, index) => {
                          const reg = standing.registration;
                          const name = reg?.athlete
                            ? reg.athlete.name
                            : reg?.team?.name || "Sin nombre";
                          const institution =
                            reg?.athlete?.institution?.name ||
                            reg?.team?.institution?.name;

                          return (
                            <tr
                              key={standing.standingId}
                              className={
                                index < 2 ? "bg-green-50" : "hover:bg-gray-50"
                              }
                            >
                              <td className="px-4 py-3">
                                <Badge
                                  variant={index < 2 ? "success" : "default"}
                                  size="sm"
                                >
                                  {standing.rankPosition || index + 1}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {name}
                                  </p>
                                  {institution && (
                                    <p className="text-sm text-gray-600">
                                      {institution}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {standing.matchesPlayed}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">
                                {standing.wins}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">
                                {standing.draws}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-red-600">
                                {standing.losses}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {standing.scoreFor}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {standing.scoreAgainst}
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-medium">
                                {standing.scoreDiff > 0 && "+"}
                                {standing.scoreDiff}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant="primary">
                                  {standing.points}
                                </Badge>
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
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Selecciona una fase para ver las posiciones</p>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No hay fases de grupos creadas</p>
              <p className="text-sm mt-1">
                Las tablas de posiciones se generan para fases de grupos
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
