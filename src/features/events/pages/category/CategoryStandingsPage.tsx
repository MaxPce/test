import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart3, Trophy, Users, User } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { useStandings } from "@/features/competitions/api/standings.queries";
import { StandingsTable } from "@/features/results/components/StandingsTable";
import { SimpleBracket } from "@/features/results/components/SimpleBracket";
import { PoomsaeResultsTable } from "@/features/results/components/PoomsaeResultsTable";
import { WushuTaoluResultsTable } from "@/features/results/components/WushuTaoluResultsTable";
import { PodiumTable } from "@/features/results/components/PodiumTable";
import { BestOf3ResultsTable } from "@/features/results/components/BestOf3ResultsTable";
import { WrestlingResultsTable } from "@/features/competitions/components/wrestling/WrestlingResultsTable";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { EventCategory } from "../../types";
import { ManualPlacements } from "@/features/results/components/ManualPlacements";
import { WrestlingBracket } from "@/features/competitions/components/wrestling/WrestlingBracket";
import { WrestlingRanking } from "@/features/competitions/components/wrestling/WrestlingRanking";
import { WrestlingEliminationResults } from "@/features/competitions/components/wrestling/WrestlingEliminationResults";
import { WrestlingEliminationRanking } from "@/features/competitions/components/wrestling/WrestlingEliminationRanking";
import { TiroDeportivoResultsTable } from "@/features/competitions/components/shooting/TiroDeportivoResultsTable";
import { TiroDeportivoStandingsTable } from '@/features/competitions/components/shooting/TiroDeportivoStandingsTable';



interface SportConfig {
  title: string;
  subtitle: string;
  headers: {
    wins: string;
    draws: string;
    losses: string;
    scoreFor: string;
    scoreAgainst: string;
    scoreDiff: string;
  };
  legend: {
    wins: string;
    draws: string;
    losses: string;
    scores?: string;
  };
  showScores: boolean;
}

function PhaseStandingsBlock({
  phase,
  config,
}: {
  phase: any;
  config: SportConfig;
}) {
  const { data: standings = [], isLoading } = useStandings(phase.phaseId);

  const phaseMatches = phase.matches || [];
  const allMatchesFinished =
    phaseMatches.length > 0 &&
    phaseMatches
      .filter((m: any) => (m.participations?.length ?? 0) >= 2)
      .every((m: any) => m.status === "finalizado");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-lg">{phase.name}</h4>
          <Badge variant="primary">{standings.length} participantes</Badge>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando posiciones...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">No hay datos de posiciones</p>
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
                      reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                    const institution =
                      reg?.athlete?.institution || reg?.team?.institution;
                    const photoUrl = reg?.athlete?.photoUrl;
                    const logoUrl = institution?.logoUrl;
                    const isQualified = allMatchesFinished && index < 2;

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
                              variant={isQualified ? "success" : "default"}
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
                                  e.currentTarget.style.display = "none";
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
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  )}
                                  <p className="text-xs text-gray-600 font-medium">
                                    {institution.abrev || institution.name}
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
                  <strong>{config.headers.wins}:</strong> {config.legend.wins}
                </span>
                <span>
                  <strong>{config.headers.draws}:</strong> {config.legend.draws}
                </span>
                <span>
                  <strong>{config.headers.losses}:</strong>{" "}
                  {config.legend.losses}
                </span>
                {config.showScores && config.legend.scores && (
                  <span>
                    <strong>
                      {config.headers.scoreFor}/{config.headers.scoreAgainst}:
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
  );
}

export function CategoryStandingsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);
  type EliminationView = "bracket" | "podium" | "manual" | "resumen";
  const [elimView, setElimView] = useState<EliminationView>("bracket");
  type WrestlingView = "results" | "bracket" | "ranking";
  const [wrestlingView, setWrestlingView] = useState<WrestlingView>("results");

  const { data: phases = [] } = usePhases(eventCategory.eventCategoryId);

  const sportName = eventCategory?.category?.sport?.name?.toLowerCase() || "";
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
  const isKarate = sportName.includes("karate");
  const isWushu = sportName.includes("wushu");
  const isWrestling =
    sportName.includes("lucha") || sportName.includes("wrestling");
  const isWushuTaolu =
    sportName.includes("wushu") &&
    (categoryName.includes("taolu") ||
      categoryName.includes("formas") ||
      categoryName.includes("forma"));
  const isWushuSanda = isWushu && !isWushuTaolu;
  const isTiroDeportivo =
    sportName.includes("tiro deportivo") ||
    sportName.includes("tiro al blanco") ||
    sportName.includes("shooting");

  const getSportConfig = (): SportConfig => {
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
        legend: { wins: "Victorias", draws: "Empates", losses: "Derrotas" },
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
        legend: { wins: "Victorias", draws: "Empates", losses: "Derrotas" },
        showScores: false,
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
        showScores: false,
      };
    }
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
      showScores: false,
    };
  };

  const getBracketConfig = () => {
    if (isTaekwondoPoomsae)
      return { sportType: "poomsae", scoreLabel: "Puntos", showScores: true };
    if (isTaekwondoKyorugi)
      return { sportType: "kyorugi", scoreLabel: "Puntos", showScores: true };
    if (isJudo)
      return { sportType: "judo", scoreLabel: "Puntos", showScores: true };
    if (isKarate)
      return { sportType: "karate", scoreLabel: "Puntos", showScores: true };
    if (isWushuTaolu)
      return {
        sportType: "wushu-taolu",
        scoreLabel: "Puntos",
        showScores: true,
      };
    if (isWushuSanda)
      return { sportType: "wushu", scoreLabel: "Puntos", showScores: true };
    if (isTableTennis)
      return {
        sportType: "table-tennis",
        scoreLabel: "Sets",
        showScores: true,
      };

    if (isWrestling)                                          
      return { sportType: "wrestling", scoreLabel: "TP", showScores: true };
    return {
      sportType: "team",
      scoreLabel:
        sportName.includes("fútbol") || sportName.includes("futbol")
          ? "Goles"
          : "Puntos",
      showScores: true,
    };
  };

  const renderViewPills = () => {
    const tabs: { key: EliminationView; label: string }[] = [
      { key: "bracket", label: "Llaves" },
      { key: "podium",  label: "Podio" },
      { key: "manual",  label: "Manual" },
      ...(isWrestling ? [{ key: "resumen" as EliminationView, label: "Resumen" }] : []),
    ];

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setElimView(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                elimView === key
                  ? "bg-white text-purple-700 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };


  const renderBracketWithToggle = (eliminationPhase: any) => {
    const bracketConfig = getBracketConfig();

    const viewTitles: Record<EliminationView, string> = {
      bracket: "Llave de Eliminación",
      podium:  "Podio Final",
      manual:  "Clasificación Manual",
      resumen: "Resumen — Fase de Eliminación", 
    };
    const viewSubtitles: Record<EliminationView, string> = {
      bracket: "Diagrama de enfrentamientos",
      podium:  isTaekwondoPoomsae ? "Top 3 de Poomsae" : "Top 3 de la competencia",
      manual:  "Asignación manual de puestos",
      resumen: "Resultados y clasificación UWW", 
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{viewTitles[elimView]}</h3>
                <p className="text-purple-100 mt-1">{viewSubtitles[elimView]}</p>
              </div>
            </div>
            {renderViewPills()}
          </div>
        </div>

        {elimView === "bracket" && (
          <SimpleBracket
            phaseId={eliminationPhase.phaseId}
            sportConfig={bracketConfig}
            phase={eliminationPhase}
          />
        )}
        {elimView === "podium" && (
          <PodiumTable phaseId={eliminationPhase.phaseId} />
        )}
        {elimView === "manual" && (
          <ManualPlacements phaseId={eliminationPhase.phaseId} />
        )}

        {/* ── Tab Resumen: solo Wrestling ─────────────────────────────────── */}
        {elimView === "resumen" && isWrestling && (
          <div className="space-y-8">
            <WrestlingEliminationResults
              phaseId={eliminationPhase.phaseId}
              title="Resultados por Ronda"
            />
            <WrestlingEliminationRanking
              phaseId={eliminationPhase.phaseId}
              title="Clasificación Final"
            />
          </div>
        )}
      </div>
    );
  };


  function renderGroupStandings() {
    const groupPhases = phases.filter((p) => p.type === "grupo");
    const config = getSportConfig();

    const phaseOptions = [
      { value: "0", label: "Todas las fases" },
      ...groupPhases.map((phase) => ({
        value: String(phase.phaseId),
        label: phase.name,
      })),
    ];

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

        {groupPhases.length === 0 ? (
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
        ) : (
          <>
            {groupPhases.length > 1 && (
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md">
                      <Select
                        label="Filtrar por fase"
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
            )}

            {selectedPhaseId > 0 ? (
              <PhaseStandingsBlock
                phase={phases.find((p) => p.phaseId === selectedPhaseId)!}
                config={config}
              />
            ) : (
              <div className="space-y-6">
                {groupPhases.map((phase) => (
                  <PhaseStandingsBlock
                    key={phase.phaseId}
                    phase={phase}
                    config={config}
                  />
                ))}
              </div>
            )}
          </>
        )}
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

  const eliminationPhase = phases.find((p) => p.type === "eliminacion");
  const groupPhases = phases.filter((p) => p.type === "grupo");
  const bestOf3Phases = phases.filter((p) => p.type === "mejor_de_3");

  const hasAnyPhase =
    bestOf3Phases.length > 0 || !!eliminationPhase || groupPhases.length > 0;

  if (!hasAnyPhase) {
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
  }

  const multipleTypes =
    [
      bestOf3Phases.length > 0,
      !!eliminationPhase,
      groupPhases.length > 0,
    ].filter(Boolean).length > 1;

  return (
    <div className="space-y-8">
      {bestOf3Phases.map((bestOf3Phase) => (
        <div key={bestOf3Phase.phaseId} className="space-y-6">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {bestOf3Phase.name || "Mejor de 3"}
                </h3>
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
      ))}

      {eliminationPhase && (
        <div className="space-y-6">
          {multipleTypes && bestOf3Phases.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fase de Eliminación
              </h3>
            </div>
          )}
          {renderBracketWithToggle(eliminationPhase)}

          
        </div>
      )}

      {groupPhases.length > 0 && (
        <div className="space-y-6">
          {multipleTypes && (
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fase de Grupos
              </h3>
            </div>
          )}
          {isTiroDeportivo ? (
            // ── Tiro Deportivo: tabla de series y totales ──────────────────
            <div className="space-y-4">
              {groupPhases.map((phase) => (
                <TiroDeportivoStandingsTable
                  key={phase.phaseId}
                  phaseId={phase.phaseId}
                  phaseName={phase.name}
                />
              ))}
            </div>
          ) : isTaekwondoPoomsae ? (
            <PoomsaeResultsTable
              eventCategoryId={eventCategory.eventCategoryId}
            />
          ) : isWushuTaolu ? (
            <WushuTaoluResultsTable
              eventCategoryId={eventCategory.eventCategoryId}
            />
          ) : isWrestling ? (
            // ── Lucha Olímpica: 3 vistas UWW ─────────────────────────────────
            <div className="space-y-6">
              {/* Header con tabs */}
              <div className="bg-gradient-to-r from-orange-700 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <BarChart3 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {wrestlingView === "results"
                          ? "Results"
                          : wrestlingView === "bracket"
                            ? "Bracket"
                            : "Ranking"}
                      </h3>
                      <p className="text-orange-100 mt-1">
                        Round Robin — Lucha Olímpica
                      </p>
                    </div>
                  </div>

                  {/* Pills de navegación */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
                    <div className="flex gap-1">
                      {(
                        [
                          { key: "results", label: "Results" },
                          { key: "bracket", label: "Bracket" },
                          { key: "ranking", label: "Ranking" },
                        ] as { key: WrestlingView; label: string }[]
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setWrestlingView(key)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            wrestlingView === key
                              ? "bg-white text-orange-700 shadow"
                              : "text-white/80 hover:text-white hover:bg-white/20"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido de la vista activa */}
              {wrestlingView === "results" &&
                groupPhases.map((phase) => (
                  <WrestlingResultsTable
                    key={phase.phaseId}
                    phaseId={phase.phaseId}
                    title={phase.name}
                    categoryLabel={eventCategory?.category?.name}
                  />
                ))}

              {wrestlingView === "bracket" &&
                groupPhases.map((phase) => (
                  <WrestlingBracket
                    key={phase.phaseId}
                    phaseId={phase.phaseId}
                  />
                ))}

              {wrestlingView === "ranking" &&
                groupPhases.map((phase) => (
                  <WrestlingRanking
                    key={phase.phaseId}
                    phaseId={phase.phaseId}
                  />
                ))}
            </div>
          ) : (
            renderGroupStandings()
          )}
        </div>
      )}
    </div>
  );
}
