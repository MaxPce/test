// src/features/events/components/CategoryStandingsPage.tsx

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart3, Trophy, Users } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { StandingsTable } from "@/features/results/components/StandingsTable";
import { SimpleBracket } from "@/features/results/components/SimpleBracket";
import { PoomsaeResultsTable } from "@/features/results/components/PoomsaeResultsTable";
import { WushuTaoluResultsTable } from "@/features/results/components/WushuTaoluResultsTable";
import { PodiumTable } from "@/features/results/components/PodiumTable";
import { BestOf3ResultsTable } from "@/features/results/components/BestOf3ResultsTable";
import { WrestlingResultsTable } from "@/features/competitions/components/wrestling/WrestlingResultsTable";
import { ManualPlacements } from "@/features/results/components/ManualPlacements";
import { WrestlingBracket } from "@/features/competitions/components/wrestling/WrestlingBracket";
import { WrestlingRanking } from "@/features/competitions/components/wrestling/WrestlingRanking";
import { WrestlingEliminationResults } from "@/features/competitions/components/wrestling/WrestlingEliminationResults";
import { WrestlingEliminationRanking } from "@/features/competitions/components/wrestling/WrestlingEliminationRanking";
import { WeightliftingResultsTable } from "@/features/competitions/components/weightlifting/WeightliftingResultsTable";
import { TiroDeportivoStandingsTable } from "@/features/competitions/components/shooting/TiroDeportivoStandingsTable";
import { PhaseStandingsBlock } from "@/features/competitions/components/PhaseStandingsBlock";
import type { EventCategory } from "../../types";

// ── Tipos ────────────────────────────────────────────────────────────────────

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

// ── Componente principal ─────────────────────────────────────────────────────

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

  // ── Flags de deporte ───────────────────────────────────────────────────────

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
    sportName.includes("tenis de mesa") ||
    sportName.includes("tenis de campo");
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
  const isWeightlifting =
    sportName.includes("halterofilia") ||
    sportName.includes("weightlifting") ||
    sportName.includes("levantamiento de pesas");

  // ── Config de tabla por deporte ────────────────────────────────────────────

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

  // ── Config de bracket por deporte ──────────────────────────────────────────

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
      return { sportType: "wushu-taolu", scoreLabel: "Puntos", showScores: true };
    if (isWushuSanda)
      return { sportType: "wushu", scoreLabel: "Puntos", showScores: true };
    if (isTableTennis)
      return { sportType: "table-tennis", scoreLabel: "Sets", showScores: true };
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

  // ── Pills de vista eliminación ─────────────────────────────────────────────

  const renderViewPills = () => {
    const tabs: { key: EliminationView; label: string }[] = [
      { key: "bracket", label: "Llaves" },
      { key: "podium",  label: "Podio" },
      { key: "manual",  label: "Manual" },
      ...(isWrestling
        ? [{ key: "resumen" as EliminationView, label: "Resumen" }]
        : []),
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

  // ── Render: fase de eliminación con toggle de vistas ──────────────────────

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

  // ── Render: tabla de posiciones de grupos ──────────────────────────────────

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
        {/* Header verde */}
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
            {/* Selector de fase si hay más de una */}
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

            {/* PhaseStandingsBlock ahora viene del archivo externo */}
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

  // ── Guards de render temprano ──────────────────────────────────────────────

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
              <p className="text-lg font-medium">No hay fases creadas</p>
              <p className="text-xs mt-2 text-gray-400">
                Deporte: {sportName}
              </p>
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

  // ── Render principal ───────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Mejor de 3 ────────────────────────────────────────────────────── */}
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

      {/* ── Eliminación ───────────────────────────────────────────────────── */}
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

      {/* ── Grupos ────────────────────────────────────────────────────────── */}
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
            <div className="space-y-4">
              {groupPhases.map((phase) => (
                <TiroDeportivoStandingsTable
                  key={phase.phaseId}
                  phaseId={phase.phaseId}
                  phaseName={phase.name}
                />
              ))}
            </div>

          ) : isWeightlifting ? (
            <div className="space-y-4">
              {groupPhases.map((phase) => (
                <WeightliftingResultsTable
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
            <div className="space-y-6">
              {/* Header Wrestling con tabs */}
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

                  {/* Pills Wrestling */}
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
