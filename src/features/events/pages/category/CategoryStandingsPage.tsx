import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart3, RefreshCw, Trophy, Users, User } from "lucide-react";
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
import { Switch } from "@/components/ui/Switch";
import { PodiumTable } from "@/features/results/components/PodiumTable";
import { BestOf3ResultsTable } from "@/features/results/components/BestOf3ResultsTable";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { EventCategory } from "../../types";

export function CategoryStandingsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);
  const [showPodium, setShowPodium] = useState(false);

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

  const isJudo = sportName.includes("judo");

  const isTimedSport =
    sportName.includes("natación") ||
    sportName.includes("natacion") ||
    sportName.includes("atletismo") ||
    sportName.includes("ciclismo");

  const isTableTennis =
    sportName.includes("tenis de mesa") || sportName.includes("tenis de campo");

  const isTableSport =
    sportName.includes("tenis de mesa") ||
    sportName.includes("ping pong") ||
    sportName.includes("voleibol") ||
    sportName.includes("vóleibol") ||
    sportName.includes("básquetbol") ||
    sportName.includes("basquetbol") ||
    sportName.includes("fútbol") ||
    sportName.includes("futbol");

  // Función para obtener la configuración de headers según el deporte
  const getSportConfig = () => {
    if (isJudo) {
      return {
        title: "Tabla de Clasificación",
        subtitle: "Round Robin - Judo",
        headers: {
          wins: "V",
          draws: "E",
          losses: "D",
          scoreFor: "Victorias",
          scoreAgainst: "-",
          scoreDiff: "-",
        },
        legend: {
          wins: "Victorias",
          draws: "Empates",
          losses: "Derrotas",
        },
        showScores: false,
      };
    }

    if (isTaekwondoKyorugi) {
      return {
        title: "Tabla de Clasificación",
        subtitle: "Round Robin - Kyorugi",
        headers: {
          wins: "V",
          draws: "E",
          losses: "D",
          scoreFor: "Pts A Favor",
          scoreAgainst: "Pts En Contra",
          scoreDiff: "Dif",
        },
        legend: {
          wins: "Victorias",
          draws: "Empates",
          losses: "Derrotas",
          scores: "Puntos de Combate",
        },
        showScores: true,
      };
    }

    if (isTableTennis) {
      return {
        title: "Tabla de Posiciones",
        subtitle: "Round Robin - Tenis de Mesa",
        headers: {
          wins: "PG",
          draws: "E",
          losses: "PP",
          scoreFor: "Sets A Favor",
          scoreAgainst: "Sets En Contra",
          scoreDiff: "DS",
        },
        legend: {
          wins: "Partidos Ganados",
          draws: "Empates",
          losses: "Partidos Perdidos",
          scores: "Sets",
        },
        showScores: true,
      };
    }

    // Deportes de equipo (voleibol, básquetbol, fútbol)
    return {
      title: "Tabla de Posiciones",
      subtitle: `${eventCategory?.category?.sport?.name}`,
      headers: {
        wins: "G",
        draws: "E",
        losses: "P",
        scoreFor: "GF",
        scoreAgainst: "GC",
        scoreDiff: "DG",
      },
      legend: {
        wins: "Ganados",
        draws: "Empatados",
        losses: "Perdidos",
        scores: "Goles/Puntos",
      },
      showScores: true,
    };
  };

  // Configuración para brackets
  const getBracketConfig = () => {
    if (isJudo) {
      return {
        sportType: "judo",
        scoreLabel: "Puntos",
        showScores: true,
      };
    }

    if (isTaekwondoKyorugi) {
      return {
        sportType: "kyorugi",
        scoreLabel: "Puntos",
        showScores: true,
      };
    }

    if (isTableTennis) {
      return {
        sportType: "table-tennis",
        scoreLabel: "Sets",
        showScores: true,
      };
    }

    // Deportes de equipo
    return {
      sportType: "team",
      scoreLabel:
        sportName.includes("fútbol") || sportName.includes("futbol")
          ? "Goles"
          : "Puntos",
      showScores: true,
    };
  };

  const renderBracketWithToggle = (eliminationPhase: any) => {
    const bracketConfig = getBracketConfig(); 

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {showPodium ? "Podio Final" : "Llave de Eliminación"}
                </h3>
                <p className="text-purple-100 mt-1">
                  {showPodium
                    ? "Top 3 de la competencia"
                    : "Diagrama de enfrentamientos"}
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${!showPodium ? "text-white" : "text-white/60"}`}
                >
                  Llaves
                </span>
                <Switch checked={showPodium} onChange={setShowPodium} />
                <span
                  className={`text-sm font-medium ${showPodium ? "text-white" : "text-white/60"}`}
                >
                  Podio
                </span>
              </div>
            </div>
          </div>
        </div>

        {showPodium ? (
          <PodiumTable phaseId={eliminationPhase.phaseId} />
        ) : (
          <SimpleBracket
            phaseId={eliminationPhase.phaseId}
            sportConfig={bracketConfig} 
          />
        )}
      </div>
    );
  };

  if (isTaekwondoPoomsae) {
    const eliminationPhase = phases.find((p) => p.type === "eliminacion");
    const groupPhases = phases.filter((p) => p.type === "grupo");

    // Si hay fase de eliminación, mostrar bracket
    if (eliminationPhase) {
      const poomsaeBracketConfig = {
        sportType: "poomsae",
        scoreLabel: "Puntos",
        showScores: true,
      };

      return (
        <div className="space-y-6">
          {/* Bracket de Eliminación */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {showPodium ? "Podio Final" : "Llave de Eliminación"}
                  </h3>
                  <p className="text-purple-100 mt-1">
                    {showPodium
                      ? "Top 3 de Poomsae"
                      : "Diagrama de enfrentamientos"}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${!showPodium ? "text-white" : "text-white/60"}`}
                  >
                    Llaves
                  </span>
                  <Switch checked={showPodium} onChange={setShowPodium} />
                  <span
                    className={`text-sm font-medium ${showPodium ? "text-white" : "text-white/60"}`}
                  >
                    Podio
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showPodium ? (
            <PodiumTable phaseId={eliminationPhase.phaseId} />
          ) : (
            <SimpleBracket
              phaseId={eliminationPhase.phaseId}
              sportConfig={poomsaeBracketConfig}
            />
          )}

          {/* Si también hay fase de grupos, mostrar tabla de Poomsae */}
          {groupPhases.length > 0 && (
            <>
              
              <PoomsaeResultsTable
                eventCategoryId={eventCategory.eventCategoryId}
              />
            </>
          )}
        </div>
      );
    }

    // Si solo hay fase de grupos, mostrar solo tabla de resultados
    return (
      <div className="space-y-6">
        <PoomsaeResultsTable eventCategoryId={eventCategory.eventCategoryId} />
      </div>
    );
  }

  if (isTimedSport) {
    return (
      <div className="space-y-6">
        <StandingsTable eventCategoryId={eventCategory.eventCategoryId} />
      </div>
    );
  }

  const onlyGroupSports =
    sportName.includes("voleibol") ||
    sportName.includes("vóleibol") ||
    sportName.includes("básquetbol") ||
    sportName.includes("basquetbol") ||
    sportName.includes("fútbol") ||
    sportName.includes("futbol");

  if (onlyGroupSports) {
    const hasElimination = phases.some((p) => p.type === "eliminacion");

    if (!hasElimination) {
      return renderGroupStandings();
    }
  }

  const eliminationPhase = phases.find((p) => p.type === "eliminacion");
  const groupPhases = phases.filter((p) => p.type === "grupo");
  const bestOf3Phase = phases.find((p) => p.type === "mejor_de_3");

  if (bestOf3Phase) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Mejor de 3</h3>
              <p className="text-orange-100 mt-1">
                Serie de partidos al mejor de tres
              </p>
            </div>
          </div>
        </div>

        <BestOf3ResultsTable
          phaseId={bestOf3Phase.phaseId}
          eventCategory={eventCategory}
        />
      </div>
    );
  }

  if (eliminationPhase) {
    return (
      <div className="space-y-6">
        {renderBracketWithToggle(eliminationPhase)}

        {groupPhases.length > 0 && (
          <>
            <div className="border-t-2 border-gray-200 pt-6 mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Fase de Grupos
              </h3>
            </div>
            {renderGroupStandings()}
          </>
        )}
      </div>
    );
  }

  if (groupPhases.length > 0) {
    return renderGroupStandings();
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
            <p className="text-lg font-medium">No hay fases creadas</p>
            <p className="text-sm mt-2">
              Crea fases de grupos o eliminación en la sección de Programación
            </p>
            <p className="text-xs mt-2 text-gray-400">Deporte: {sportName}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  function renderGroupStandings() {
    const groupPhases = phases.filter((p) => p.type === "grupo");
    const phaseOptions = [
      { value: "0", label: "Seleccione una fase" },
      ...groupPhases.map((phase) => ({
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
    const config = getSportConfig();

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{config.title}</h3>
              <p className="text-green-100 mt-1">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {groupPhases.length > 0 ? (
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
                                {config.headers.wins}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {config.headers.draws}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {config.headers.losses}
                              </th>
                              {config.showScores && (
                                <>
                                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {config.headers.scoreFor}
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {config.headers.scoreAgainst}
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {config.headers.scoreDiff}
                                  </th>
                                </>
                              )}
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Pts
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {standings.map((standing, index) => {
                              const reg = standing.registration;
                              const isAthlete = !!reg?.athlete;
                              const name =
                                reg?.athlete?.name ||
                                reg?.team?.name ||
                                "Sin nombre";
                              const institution =
                                reg?.athlete?.institution ||
                                reg?.team?.institution;
                              const photoUrl = reg?.athlete?.photoUrl;
                              const logoUrl = institution?.logoUrl;
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
                                    <div className="flex items-center gap-3">
                                      {isAthlete && photoUrl ? (
                                        <img
                                          src={getImageUrl(photoUrl)}
                                          alt={name}
                                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                          onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = "none";
                                            const parent = target.parentElement;
                                            if (parent) {
                                              const placeholder =
                                                document.createElement("div");
                                              placeholder.className =
                                                "w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow";
                                              const icon =
                                                document.createElementNS(
                                                  "http://www.w3.org/2000/svg",
                                                  "svg",
                                                );
                                              icon.setAttribute(
                                                "class",
                                                "h-5 w-5 text-white",
                                              );
                                              icon.setAttribute(
                                                "fill",
                                                "currentColor",
                                              );
                                              icon.setAttribute(
                                                "viewBox",
                                                "0 0 24 24",
                                              );
                                              icon.innerHTML =
                                                '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
                                              placeholder.appendChild(icon);
                                              parent.appendChild(placeholder);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow">
                                          <User className="h-5 w-5 text-white" />
                                        </div>
                                      )}

                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900">
                                          {name}
                                        </p>
                                        {institution && (
                                          <div className="flex items-center gap-2 mt-0.5">
                                            {logoUrl && (
                                              <img
                                                src={getImageUrl(logoUrl)}
                                                alt={institution.name}
                                                className="h-4 w-4 object-contain"
                                                onError={(e) => {
                                                  e.currentTarget.style.display =
                                                    "none";
                                                }}
                                              />
                                            )}
                                            <p className="text-xs text-gray-600 font-medium">
                                              {institution.abrev ||
                                                institution.name}
                                            </p>
                                          </div>
                                        )}
                                      </div>
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
                                  {config.showScores && (
                                    <>
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
                                    </>
                                  )}
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
                            <strong>{config.headers.wins}:</strong>{" "}
                            {config.legend.wins}
                          </span>
                          <span>
                            <strong>{config.headers.draws}:</strong>{" "}
                            {config.legend.draws}
                          </span>
                          <span>
                            <strong>{config.headers.losses}:</strong>{" "}
                            {config.legend.losses}
                          </span>
                          {config.showScores && (
                            <span>
                              <strong>
                                {config.headers.scoreFor}/
                                {config.headers.scoreAgainst}:
                              </strong>{" "}
                              {config.legend.scores} A Favor/En Contra
                            </span>
                          )}
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
}
