// src/pages/CategoryStandingsPage.tsx

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart3, Timer, Trophy, Users } from "lucide-react";
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
import { TableTennisPhaseBlock } from "@/features/competitions/components/table-tennis/TableTennisPhaseBlock";
import { ClimbingResultsTable } from "@/features/competitions/components/climbing/ClimbingResultsTable";
import { AthleticsStandingsBlock } from "@/features/competitions/components/athletics/AthleticsStandingsBlock";
import { PhaseFeaturedAthlete } from "@/features/events/components/PhaseFeaturedAthlete";
import type { EventCategory } from "../../types";
import type { Phase } from "@/features/competitions/types";
import { RoundRobinManualRanks } from "@/features/competitions/components/RoundRobinManualRanks";
import { BestOf3ManualRanks } from "@/features/competitions/components/BestOf3ManualRanks";

// ── Tipos ─────────────────────────────────────────────────────────────────────


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


// ── Selector de fases de atletismo ────────────────────────────────────────────


function AthleticsPhaseSelector({
  phases,
  categoryName,
}: {
  phases: Phase[];
  categoryName: string;
}) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(
    phases[0]?.phaseId ?? 0,
  );

  const selectedPhase = phases.find((p) => p.phaseId === selectedPhaseId) ?? null;

  const grouped = {
    pista: phases.filter((p) => p.type === "combined_pista"),
    distancia: phases.filter((p) => p.type === "combined_distancia"),
    altura: phases.filter((p) => p.type === "combined_altura"),
  };

  const groups: { key: keyof typeof grouped; emoji: string; label: string }[] = [
    { key: "pista", emoji: "🏃", label: "Pista" },
    { key: "distancia", emoji: "📏", label: "Distancia" },
    { key: "altura", emoji: "📐", label: "Altura" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Timer className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Atletismo</h3>
            <p className="text-orange-100 mt-1">{categoryName} · Resultados por prueba</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selecciona una prueba</p>
        </div>
        <div className="p-3 space-y-3">
          {groups.map(({ key, emoji, label }) => {
            const group = grouped[key];
            if (group.length === 0) return null;
            return (
              <div key={key}>
                <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {emoji} {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.map((phase) => (
                    <button
                      key={phase.phaseId}
                      type="button"
                      onClick={() => setSelectedPhaseId(phase.phaseId)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                        selectedPhaseId === phase.phaseId
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                      }`}
                    >
                      {phase.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPhase && (
        <AthleticsStandingsBlock key={selectedPhase.phaseId} phase={selectedPhase} />
      )}
    </div>
  );
}


// ── Sub-bloque: grupo genérico con switcher Tabla / Manual ────────────────────


function GroupPhaseBlock({
  phaseId,
  phase,
  config,
}: {
  phaseId: number;
  phase: Phase;
  config: SportConfig;
}) {
  type GroupView = "tabla" | "manual";
  const [view, setView] = useState<GroupView>("tabla");

  const tabs: { key: GroupView; label: string }[] = [
    { key: "tabla", label: "Tabla" },
    { key: "manual", label: "Manual" },
  ];

  const viewSubtitles: Record<GroupView, string> = {
    tabla: "Clasificación automática por puntos",
    manual: "Asignación manual de puestos",
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{phase.name}</h3>
              <p className="text-green-100 mt-1">
                {config.title} · {viewSubtitles[view]}
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <div className="flex gap-1">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    view === key
                      ? "bg-white text-green-700 shadow"
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

      {view === "tabla" && <PhaseStandingsBlock phase={phase} config={config} />}
      {view === "manual" && <RoundRobinManualRanks phaseId={phaseId} />}
    </div>
  );
}


// ── Sub-bloque: mejor de 3 con switcher Partidos / Manual ─────────────────────


function BestOf3PhaseBlock({
  phaseId,
  phase,
  eventCategory,
}: {
  phaseId: number;
  phase: Phase;
  eventCategory: EventCategory;
}) {
  type BestOf3View = "partidos" | "manual";
  const [view, setView] = useState<BestOf3View>("partidos");

  const tabs: { key: BestOf3View; label: string }[] = [
    { key: "partidos", label: "Partidos" },
    { key: "manual", label: "Manual" },
  ];

  const viewSubtitles: Record<BestOf3View, string> = {
    partidos: "Serie de partidos al mejor de tres",
    manual: "Asignación manual de puestos",
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{phase.name || "Mejor de 3"}</h3>
              <p className="text-orange-100 mt-1">{viewSubtitles[view]}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <div className="flex gap-1">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    view === key
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

      {view === "partidos" && (
        <BestOf3ResultsTable phaseId={phaseId} eventCategory={eventCategory} />
      )}
      {view === "manual" && <BestOf3ManualRanks phaseId={phaseId} />}

      <PhaseFeaturedAthlete phaseId={phaseId} eventCategoryId={eventCategory.eventCategoryId} />
    </div>
  );
}


// ── Componente principal ──────────────────────────────────────────────────────


export function CategoryStandingsPage() {
  const { eventCategory } = useOutletContext<{ eventCategory: EventCategory }>();

  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);

  type EliminationView = "bracket" | "podium" | "manual" | "resumen";
  const [elimView, setElimView] = useState<EliminationView>("bracket");

  type WrestlingView = "results" | "bracket" | "ranking";
  const [wrestlingView, setWrestlingView] = useState<WrestlingView>("results");
  const [selectedAnyPhaseId, setSelectedAnyPhaseId] = useState<number>(0);

  const { data: phases = [] } = usePhases(eventCategory.eventCategoryId);

  const sportName = eventCategory?.category?.sport?.name?.toLowerCase() || "";
  const categoryName = eventCategory?.category?.name?.toLowerCase() || "";
  const resultType = eventCategory?.category?.resultType;

  const getTaekwondoType = (): "poomsae" | "kyorugui" | null => {
    if (!sportName.includes("taekwondo")) return null;
    if (resultType === "score") return "poomsae";
    if (resultType === "combat") return "kyorugui";
    if (categoryName.includes("poomsae") || categoryName.includes("forma")) return "poomsae";
    if (categoryName.includes("kyorugi") || categoryName.includes("combate")) return "kyorugui";
    return null;
  };

  const taekwondoType = getTaekwondoType();
  const isTaekwondoKyorugi = taekwondoType === "kyorugui";
  const isTaekwondoPoomsae = taekwondoType === "poomsae";
  const isJudo = sportName.includes("judo");
  const isAtletismo = sportName.includes("atletismo");
  const isTimedSport =
    sportName.includes("natación") ||
    sportName.includes("natacion") ||
    sportName.includes("ciclismo");
  const isTableTennis =
    sportName.includes("tenis de mesa") || sportName.includes("tenis de campo");
  const isKarate = sportName.includes("karate");
  const isWushu = sportName.includes("wushu");
  const isWrestling = sportName.includes("lucha") || sportName.includes("wrestling");
  const isWushuTaolu =
    sportName.includes("wushu") &&
    (categoryName.includes("taolu") || categoryName.includes("formas") || categoryName.includes("forma"));
  const isWushuSanda = isWushu && !isWushuTaolu;
  const isTiroDeportivo =
    sportName.includes("tiro deportivo") ||
    sportName.includes("tiro al blanco") ||
    sportName.includes("shooting");
  const isWeightlifting =
    sportName.includes("halterofilia") ||
    sportName.includes("weightlifting") ||
    sportName.includes("levantamiento de pesas");
  const isClimbing =
    sportName.includes("escalada") ||
    sportName.includes("climbing") ||
    sportName.includes("boulder");

  const isSpecialGroupSport =
    isTiroDeportivo || isWeightlifting || isTaekwondoPoomsae ||
    isWushuTaolu || isWrestling || isTableTennis || isClimbing;

  const getSportConfig = (): SportConfig => {
    if (isJudo) return {
      title: "Tabla de Clasificación", subtitle: "Round Robin - Judo",
      headers: { wins: "V", draws: "E", losses: "D", scoreFor: "Victorias", scoreAgainst: "-", scoreDiff: "-" },
      legend: { wins: "Victorias", draws: "Empates", losses: "Derrotas" },
      showScores: false,
    };
    if (isTaekwondoKyorugi) return {
      title: "Tabla de Clasificación", subtitle: "Round Robin - Kyorugi",
      headers: { wins: "V", draws: "E", losses: "D", scoreFor: "Pts A Favor", scoreAgainst: "Pts En Contra", scoreDiff: "Dif" },
      legend: { wins: "Victorias", draws: "Empates", losses: "Derrotas" },
      showScores: false,
    };
    if (isTableTennis) return {
      title: "Tabla de Posiciones", subtitle: "Round Robin - Tenis de Mesa",
      headers: { wins: "PG", draws: "E", losses: "PP", scoreFor: "Sets A Favor", scoreAgainst: "Sets En Contra", scoreDiff: "DS" },
      legend: { wins: "Partidos Ganados", draws: "Empates", losses: "Partidos Perdidos", scores: "Sets" },
      showScores: false,
    };
    return {
      title: "Tabla de Posiciones", subtitle: `${eventCategory?.category?.sport?.name}`,
      headers: { wins: "G", draws: "E", losses: "P", scoreFor: "GF", scoreAgainst: "GC", scoreDiff: "DG" },
      legend: { wins: "Ganados", draws: "Empatados", losses: "Perdidos", scores: "Goles/Puntos" },
      showScores: false,
    };
  };

  const getBracketConfig = () => {
    if (isTaekwondoPoomsae) return { sportType: "poomsae", scoreLabel: "Puntos", showScores: true };
    if (isTaekwondoKyorugi) return { sportType: "kyorugi", scoreLabel: "Puntos", showScores: true };
    if (isJudo) return { sportType: "judo", scoreLabel: "Puntos", showScores: true };
    if (isKarate) return { sportType: "karate", scoreLabel: "Puntos", showScores: true };
    if (isWushuTaolu) return { sportType: "wushu-taolu", scoreLabel: "Puntos", showScores: true };
    if (isWushuSanda) return { sportType: "wushu", scoreLabel: "Puntos", showScores: true };
    if (isTableTennis) return { sportType: "table-tennis", scoreLabel: "Sets", showScores: true };
    if (isWrestling) return { sportType: "wrestling", scoreLabel: "TP", showScores: true };
    return {
      sportType: "team",
      scoreLabel: sportName.includes("fútbol") || sportName.includes("futbol") ? "Goles" : "Puntos",
      showScores: true,
    };
  };

  // ── Pills eliminación ──────────────────────────────────────────────────────

  const renderViewPills = () => {
    const tabs: { key: EliminationView; label: string }[] = [
      { key: "bracket", label: "Llaves" },
      { key: "podium", label: "Podio" },
      { key: "manual", label: "Manual" },
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

  // ── Render eliminación ─────────────────────────────────────────────────────

  const renderBracketWithToggle = (eliminationPhase: any) => {
    const bracketConfig = getBracketConfig();
    const viewTitles: Record<EliminationView, string> = {
      bracket: "Llave de Eliminación",
      podium: "Podio Final",
      manual: "Clasificación Manual",
      resumen: "Resumen — Fase de Eliminación",
    };
    const viewSubtitles: Record<EliminationView, string> = {
      bracket: "Diagrama de enfrentamientos",
      podium: isTaekwondoPoomsae ? "Top de Poomsae" : "Top de la competencia",
      manual: "Asignación manual de puestos",
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
                <h3 className="text-2xl font-bold">{eliminationPhase.name}</h3>
                <p className="text-purple-100 mt-1">
                  {viewTitles[elimView]} · {viewSubtitles[elimView]}
                </p>
              </div>
            </div>
            {renderViewPills()}
          </div>
        </div>
        {elimView === "bracket" && (
          <SimpleBracket phaseId={eliminationPhase.phaseId} sportConfig={bracketConfig} phase={eliminationPhase} />
        )}
        {elimView === "podium" && <PodiumTable phaseId={eliminationPhase.phaseId} />}
        {elimView === "manual" && <ManualPlacements phaseId={eliminationPhase.phaseId} />}
        {elimView === "resumen" && isWrestling && (
          <div className="space-y-8">
            <WrestlingEliminationResults phaseId={eliminationPhase.phaseId} title="Resultados por Ronda" />
            <WrestlingEliminationRanking phaseId={eliminationPhase.phaseId} title="Clasificación Final" />
          </div>
        )}
      </div>
    );
  };

  // ── Guards de render temprano ──────────────────────────────────────────────

  if (isAtletismo) {
    const athleticsPhases = phases.filter(
      (p) =>
        p.type === "combined_pista" ||
        p.type === "combined_distancia" ||
        p.type === "combined_altura",
    );
    if (athleticsPhases.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Timer className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Atletismo</h3>
                <p className="text-orange-100 mt-1">
                  {eventCategory?.category?.name} · Resultados por prueba
                </p>
              </div>
            </div>
          </div>
          <Card>
            <CardBody>
              <div className="text-center py-12 text-slate-400">
                <p className="font-medium">Sin pruebas registradas</p>
                <p className="text-sm mt-1">
                  Los resultados aparecerán aquí una vez que se creen las series
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }
    return (
      <AthleticsPhaseSelector
        phases={athleticsPhases}
        categoryName={eventCategory?.category?.name ?? ""}
      />
    );
  }

  if (isTimedSport) {
    return (
      <div className="space-y-6">
        <StandingsTable eventCategoryId={eventCategory.eventCategoryId} />
      </div>
    );
  }

  const eliminationPhases = phases.filter((p) => p.type === "eliminacion");
  const groupPhases = phases.filter((p) => p.type === "grupo");
  const bestOf3Phases = phases.filter((p) => p.type === "mejor_de_3");
  const hasAnyPhase = bestOf3Phases.length > 0 || eliminationPhases.length > 0 || groupPhases.length > 0;

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
              <p className="text-purple-100 mt-1">{eventCategory?.category?.sport?.name}</p>
            </div>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No hay fases creadas</p>
              <p className="text-xs mt-2 text-gray-400">Deporte: {sportName}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ── Render principal ───────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Selector global de fase */}
      {phases.filter(
        (p) => !["combined_pista", "combined_distancia", "combined_altura"].includes(p.type),
      ).length > 1 && (
        <Card>
          <CardBody className="py-3">
            <Select
              label="Seleccionar Fase"
              value={String(selectedAnyPhaseId || phases[0]?.phaseId)}
              onChange={(e) => setSelectedAnyPhaseId(Number(e.target.value))}
              options={phases
                .filter(
                  (p) =>
                    !["combined_pista", "combined_distancia", "combined_altura"].includes(p.type),
                )
                .map((p) => ({ value: String(p.phaseId), label: p.name }))}
            />
          </CardBody>
        </Card>
      )}

      {/* Render de la fase activa */}
      {(() => {
        const allPhases = phases.filter(
          (p) => !["combined_pista", "combined_distancia", "combined_altura"].includes(p.type),
        );
        const activePhase = allPhases.find(
          (p) => p.phaseId === (selectedAnyPhaseId || allPhases[0]?.phaseId),
        );
        if (!activePhase) return null;

        // ── MEJOR DE 3 ────────────────────────────────────────────────────
        if (activePhase.type === "mejor_de_3") {
          return (
            <BestOf3PhaseBlock
              phaseId={activePhase.phaseId}
              phase={activePhase}
              eventCategory={eventCategory}
            />
          );
        }

        // ── ELIMINACIÓN ───────────────────────────────────────────────────
        if (activePhase.type === "eliminacion") {
          return (
            <div className="space-y-6">
              {renderBracketWithToggle(activePhase)}
              <PhaseFeaturedAthlete
                phaseId={activePhase.phaseId}
                eventCategoryId={eventCategory.eventCategoryId}
              />
            </div>
          );
        }

        // ── GRUPO ─────────────────────────────────────────────────────────
        if (activePhase.type === "grupo") {
          return (
            <div className="space-y-6">
              {isTiroDeportivo && (
                <TiroDeportivoStandingsTable
                  phaseId={activePhase.phaseId}
                  phaseName={activePhase.name}
                />
              )}
              {isWeightlifting && (
                <WeightliftingResultsTable
                  phaseId={activePhase.phaseId}
                  phaseName={activePhase.name}
                />
              )}
              {isTaekwondoPoomsae && (
                <PoomsaeResultsTable eventCategoryId={eventCategory.eventCategoryId} />
              )}
              {isWushuTaolu && (
                <WushuTaoluResultsTable eventCategoryId={eventCategory.eventCategoryId} />
              )}
              {isWrestling && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-700 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <BarChart3 className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{activePhase.name}</h3>
                          <p className="text-orange-100 mt-1">Round Robin — Lucha Olímpica</p>
                        </div>
                      </div>
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
                  {wrestlingView === "results" && (
                    <WrestlingResultsTable
                      phaseId={activePhase.phaseId}
                      title={activePhase.name}
                      categoryLabel={eventCategory?.category?.name}
                    />
                  )}
                  {wrestlingView === "bracket" && (
                    <WrestlingBracket phaseId={activePhase.phaseId} />
                  )}
                  {wrestlingView === "ranking" && (
                    <WrestlingRanking phaseId={activePhase.phaseId} />
                  )}
                </div>
              )}
              {isTableTennis && <TableTennisPhaseBlock phase={activePhase} />}
              {isClimbing && (
                <ClimbingResultsTable eventCategoryId={eventCategory.eventCategoryId} />
              )}

              {/* Fallback genérico: tabla automática + pestaña manual */}
              {!isSpecialGroupSport && (
                <GroupPhaseBlock
                  phaseId={activePhase.phaseId}
                  phase={activePhase}
                  config={getSportConfig()}
                />
              )}

              <PhaseFeaturedAthlete
                phaseId={activePhase.phaseId}
                eventCategoryId={eventCategory.eventCategoryId}
              />
            </div>
          );
        }

        return null;
      })()}
    </div>
  );
}