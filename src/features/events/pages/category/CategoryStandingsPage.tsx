import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BarChart3,
  RefreshCw,
  Trophy,
  Timer,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { useStandings } from "@/features/competitions/api/standings.queries";
import { useUpdateStandings } from "@/features/competitions/api/standings.mutations";
import { StandingsTable } from "@/features/results/components/StandingsTable";
import { SimpleBracket } from "@/features/results/components/SimpleBracket";
import { PoomsaeResultsTable } from "@/features/results/components/PoomsaeResultsTable";
import type { EventCategory } from "../../types";

export function CategoryStandingsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);

  const { data: phases = [] } = usePhases(eventCategory.eventCategoryId);
  const { data: standings = [], isLoading: standingsLoading } = useStandings(
    selectedPhaseId || undefined,
  );
  const updateStandingsMutation = useUpdateStandings();

  const sportName = eventCategory?.category?.sport?.name?.toLowerCase() || "";
  const categoryType = eventCategory?.category?.type || "individual";
  const categoryName = eventCategory?.category?.name?.toLowerCase() || "";

  const isTaekwondoKyorugi =
    sportName.includes("taekwondo") && categoryName.includes("kyorugi");

  const isTaekwondoPoomsae =
    sportName.includes("taekwondo") && categoryName.includes("poomsae");

  const isTimedSport =
    sportName.includes("natación") ||
    sportName.includes("natacion") ||
    sportName.includes("atletismo") ||
    sportName.includes("ciclismo");

  const isTableSport =
    sportName.includes("tenis de mesa") ||
    sportName.includes("ping pong") ||
    sportName.includes("voleibol") ||
    sportName.includes("vóleibol") ||
    sportName.includes("básquetbol") ||
    sportName.includes("basquetbol") ||
    sportName.includes("fútbol") ||
    sportName.includes("futbol");

  if (isTaekwondoKyorugi && categoryType === "individual") {
    const eliminationPhase = phases.find((p) => p.type === "eliminacion");

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Llaves de Eliminación</h3>
              <p className="text-red-100 mt-1">
                Bracket de eliminación directa - {eventCategory.category?.name}
              </p>
            </div>
          </div>
        </div>

        {eliminationPhase ? (
          <SimpleBracket phaseId={eliminationPhase.phaseId} />
        ) : (
          <Card>
            <CardBody>
              <div className="text-center py-12 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No hay fase de eliminación creada</p>
                <p className="text-sm mt-1">
                  Crea una fase de eliminación en la sección de Programación
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  if (isTaekwondoPoomsae) {
    return (
      <div className="space-y-6">
        <PoomsaeResultsTable eventCategoryId={eventCategory.eventCategoryId} />
      </div>
    );
  }

  if (isTimedSport) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Timer className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Tabla de Posiciones</h3>
              <p className="text-blue-100 mt-1">
                Resultados finales ordenados por tiempo
              </p>
            </div>
          </div>
        </div>

        <StandingsTable eventCategoryId={eventCategory.eventCategoryId} />
      </div>
    );
  }

  if (isTableSport) {
    const phaseOptions = [
      { value: "0", label: "Seleccione una fase" },
      ...phases
        .filter((p) => p.type === "grupo")
        .map((phase) => ({
          value: String(phase.phaseId),
          label: phase.name,
        })),
    ];

    const handleUpdateStandings = async () => {
      if (selectedPhaseId > 0) {
        await updateStandingsMutation.mutateAsync(selectedPhaseId);
      }
    };

    const selectedPhase = phases.find((p) => p.phaseId === selectedPhaseId);
    const isTennis = sportName.includes("tenis");

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Tabla de Posiciones</h3>
              <p className="text-green-100 mt-1">
                Clasificación por puntos y diferencia de sets
              </p>
            </div>
          </div>
        </div>

        {phases.filter((p) => p.type === "grupo").length > 0 ? (
          <>
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-md">
                    <Select
                      label="Seleccionar Fase"
                      value={String(selectedPhaseId)}
                      onChange={(e) =>
                        setSelectedPhaseId(Number(e.target.value))
                      }
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
              </CardBody>
            </Card>

            {selectedPhaseId > 0 ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {selectedPhase?.name}
                    </h4>
                    <Badge variant="primary">
                      {standings.length} participantes
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  {standingsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando posiciones...</p>
                    </div>
                  ) : standings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">No hay datos de posiciones</p>
                      <p className="text-sm mt-1">
                        Los partidos deben finalizarse para generar la tabla
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
                                PJ
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {isTennis ? "PG" : "G"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                E
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {isTennis ? "PP" : "P"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {isTennis ? "SF" : "GF"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {isTennis ? "SC" : "GC"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {isTennis ? "DS" : "DG"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                                reg?.athlete?.institution?.abrev ||
                                reg?.team?.institution?.abrev ||
                                "";

                              const isQualified = index < 2;

                              return (
                                <tr
                                  key={standing.standingId}
                                  className={`${
                                    isQualified
                                      ? "bg-gradient-to-r from-green-50 to-emerald-50"
                                      : "hover:bg-gray-50"
                                  } transition-colors`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {isQualified && (
                                        <Trophy className="h-4 w-4 text-green-600" />
                                      )}
                                      <Badge
                                        variant={
                                          isQualified ? "success" : "default"
                                        }
                                        size="sm"
                                        className="font-bold"
                                      >
                                        {standing.rankPosition || index + 1}°
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        {name}
                                      </p>
                                      {institution && (
                                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                                          {institution}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm font-medium">
                                    {standing.matchesPlayed}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-green-600 font-bold">
                                    {standing.wins}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-600 font-medium">
                                    {standing.draws}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-red-600 font-bold">
                                    {standing.losses}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm font-medium">
                                    {standing.scoreFor}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm font-medium">
                                    {standing.scoreAgainst}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm font-bold">
                                    <span
                                      className={
                                        standing.scoreDiff > 0
                                          ? "text-green-600"
                                          : standing.scoreDiff < 0
                                            ? "text-red-600"
                                            : "text-gray-600"
                                      }
                                    >
                                      {standing.scoreDiff > 0 && "+"}
                                      {standing.scoreDiff}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge
                                      variant="primary"
                                      className="font-bold text-base px-3"
                                    >
                                      {standing.points}
                                    </Badge>
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
                            <strong>PJ:</strong> Partidos Jugados
                          </span>
                          <span>
                            <strong>{isTennis ? "PG" : "G"}:</strong>{" "}
                            {isTennis ? "Partidos Ganados" : "Ganados"}
                          </span>
                          <span>
                            <strong>E:</strong> Empatados
                          </span>
                          <span>
                            <strong>{isTennis ? "PP" : "P"}:</strong>{" "}
                            {isTennis ? "Partidos Perdidos" : "Perdidos"}
                          </span>
                          <span>
                            <strong>{isTennis ? "SF/SC" : "GF/GC"}:</strong>{" "}
                            {isTennis
                              ? "Sets A Favor/Contra"
                              : "Goles A Favor/Contra"}
                          </span>
                          <span>
                            <strong>{isTennis ? "DS" : "DG"}:</strong>{" "}
                            Diferencia
                          </span>
                          <span>
                            <strong>Pts:</strong> Puntos
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
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-medium">
                      Selecciona una fase para ver las posiciones
                    </p>
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
                <p className="font-medium">No hay fases de grupos creadas</p>
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Posiciones</h3>
            <p className="text-purple-100 mt-1">
              {eventCategory?.category?.sport?.name}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="text-center py-16 text-gray-500">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              Sistema de posiciones en desarrollo
            </p>
            <p className="text-sm mt-2">Deporte: {sportName}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
