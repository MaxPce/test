import { useState, useEffect } from "react";
import { Trophy, Users, Zap, ChevronDown, Loader2, User } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useStandings } from "@/features/competitions/api/standings.queries";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { useMatchDetails } from "@/features/competitions/api/table-tennis.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface TableTennisPhaseBlockProps {
  phase: any;
}

type MatchFilter = "all" | "individual" | "team";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getParticipantName(participation: any): string {
  const reg = participation?.registration;
  return (
    reg?.team?.name ??
    reg?.athlete?.name ??
    `Participante #${participation?.participationId ?? "?"}`
  );
}

function getInstitutionAbrev(participation: any): string {
  const reg = participation?.registration;
  return (
    reg?.team?.institution?.abrev ?? reg?.athlete?.institution?.abrev ?? ""
  );
}

function getInstitutionLogo(participation: any): string | undefined {
  const reg = participation?.registration;
  return reg?.team?.institution?.logoUrl ?? reg?.athlete?.institution?.logoUrl;
}

function getAthletePhoto(participation: any): string | undefined {
  return participation?.registration?.athlete?.photoUrl;
}

// true = individual (atleta), false = equipo
function isIndividual(match: any): boolean {
  const reg = match.participations?.[0]?.registration;
  return !!reg?.athlete && !reg?.team;
}

// ── Sub-componente: detalle inline ───────────────────────────────────────────

interface MatchInlineDetailProps {
  matchId: number;
  individual: boolean;
  onScoreResolved?: (scoreA: number, scoreB: number) => void;
}

function MatchInlineDetail({
  matchId,
  individual,
  onScoreResolved,
}: MatchInlineDetailProps) {
  const { data, isLoading } = useMatchDetails(matchId);

  useEffect(() => {
    if (!data) return;
    const result: any = (data as any).result ?? null;
    if (!result || !onScoreResolved) return;

    if (individual) {
      // Individual: score = sets ganados por jugador
      const wins1 = result.team1?.wins ?? result.player1Wins ?? 0;
      const wins2 = result.team2?.wins ?? result.player2Wins ?? 0;
      onScoreResolved(wins1, wins2);
    } else {
      // Equipos: score = juegos individuales ganados por el equipo
      onScoreResolved(result.team1?.wins ?? 0, result.team2?.wins ?? 0);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 bg-slate-50">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <span className="text-sm text-slate-500">Cargando detalle...</span>
      </div>
    );
  }

  if (!data) return null;

  const games: any[] = (data as any).games ?? [];
  const result: any = (data as any).result ?? null;
  const gameLabels = ["A", "B", "C", "D", "E"];

  if (games.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 bg-slate-50 text-sm">
        No hay juegos registrados aún
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-t border-slate-200">
      {/* Cabecera */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-200 bg-white/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {individual ? "Sets" : "Detalle por juego"}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] text-slate-400">
          {games.length}{" "}
          {individual
            ? `set${games.length !== 1 ? "s" : ""}`
            : `juego${games.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {games.map((game: any, i: number) => {
          const isCompleted = game.status === "completed";
          const isInProgress = game.status === "in_progress";
          const p1Won =
            isCompleted &&
            game.winnerId != null &&
            game.winnerId === game.player1Id;
          const p2Won =
            isCompleted &&
            game.winnerId != null &&
            game.winnerId === game.player2Id;
          const sets: any[] = game.sets ?? [];

          return (
            <div key={game.gameId ?? i} className="px-4 py-3">
              {/* Header del juego */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white bg-slate-500 w-5 h-5 rounded-md flex items-center justify-center">
                    {individual ? i + 1 : (gameLabels[i] ?? i + 1)}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {individual
                      ? `Set ${game.gameNumber ?? i + 1}`
                      : `Juego ${game.gameNumber ?? i + 1}`}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : isInProgress
                        ? "bg-blue-100 text-blue-700 animate-pulse"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted
                    ? "Completado"
                    : isInProgress
                      ? "En Curso"
                      : "Pendiente"}
                </span>
              </div>

              {/* Enfrentamiento */}
              <div className="grid grid-cols-[1fr_56px_1fr] items-center gap-2 mb-2">
                <div
                  className={`flex flex-col items-end gap-0.5 ${isCompleted && !p1Won ? "opacity-40" : ""}`}
                >
                  <span
                    className={`text-xs font-bold text-right leading-tight ${p1Won ? "text-blue-700" : "text-slate-700"}`}
                  >
                    {game.player1?.name ?? "—"}
                  </span>
                  {p1Won && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Trophy className="h-2.5 w-2.5" /> ganador
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  {isCompleted ? (
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
                      <span
                        className={`text-sm font-black leading-none ${p1Won ? "text-blue-400" : "text-slate-500"}`}
                      >
                        {game.score1 ?? 0}
                      </span>
                      <span className="text-slate-600 text-[10px]">–</span>
                      <span
                        className={`text-sm font-black leading-none ${p2Won ? "text-blue-400" : "text-slate-500"}`}
                      >
                        {game.score2 ?? 0}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest">
                      vs
                    </span>
                  )}
                </div>

                <div
                  className={`flex flex-col items-start gap-0.5 ${isCompleted && !p2Won ? "opacity-40" : ""}`}
                >
                  <span
                    className={`text-xs font-bold leading-tight ${p2Won ? "text-blue-700" : "text-slate-700"}`}
                  >
                    {game.player2?.name ?? "—"}
                  </span>
                  {p2Won && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Trophy className="h-2.5 w-2.5" /> ganador
                    </span>
                  )}
                </div>
              </div>

              {/* Sets del juego (chips) */}
              {sets.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium self-center">
                    Sets:
                  </span>
                  {sets.map((s: any, si: number) => {
                    const s1 = s.player1Score ?? 0;
                    const s2 = s.player2Score ?? 0;
                    return (
                      <div
                        key={si}
                        className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2.5 py-0.5 shadow-sm"
                      >
                        <span className="text-[10px] text-slate-400 font-medium">
                          {s.setNumber ?? si + 1}
                        </span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span
                          className={`text-[11px] font-black ${s1 > s2 ? "text-blue-600" : "text-slate-400"}`}
                        >
                          {s1}
                        </span>
                        <span className="text-[10px] text-slate-300">–</span>
                        <span
                          className={`text-[11px] font-black ${s2 > s1 ? "text-blue-600" : "text-slate-400"}`}
                        >
                          {s2}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resultado final */}
      {result && (
        <div className="border-t-2 border-slate-200 px-4 py-3 bg-white/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Resultado del partido
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <p
              className={`text-xs font-bold text-right ${
                result.winner?.registrationId ===
                result.team1?.participation?.registrationId
                  ? "text-blue-700"
                  : "text-slate-400"
              }`}
            >
              {result.team1?.teamName ?? "—"}
            </p>
            <div className="flex items-center gap-1.5 bg-slate-900 rounded-xl px-3 py-1.5">
              <span
                className={`text-xl font-black ${
                  result.winner?.registrationId ===
                  result.team1?.participation?.registrationId
                    ? "text-blue-400"
                    : "text-slate-500"
                }`}
              >
                {result.team1?.wins ?? 0}
              </span>
              <span className="text-slate-600 text-xs">–</span>
              <span
                className={`text-xl font-black ${
                  result.winner?.registrationId ===
                  result.team2?.participation?.registrationId
                    ? "text-blue-400"
                    : "text-slate-500"
                }`}
              >
                {result.team2?.wins ?? 0}
              </span>
            </div>
            <p
              className={`text-xs font-bold ${
                result.winner?.registrationId ===
                result.team2?.participation?.registrationId
                  ? "text-blue-700"
                  : "text-slate-400"
              }`}
            >
              {result.team2?.teamName ?? "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componente: card de partido ──────────────────────────────────────────

interface MatchCardProps {
  match: any;
  roundLabel: string;
  expandedId: number | null;
  onToggle: (id: number) => void;
}

function MatchCard({
  match,
  roundLabel,
  expandedId,
  onToggle,
}: MatchCardProps) {
  const [resolvedScore, setResolvedScore] = useState<{
    a: number;
    b: number;
  } | null>(null);

  const [partA, partB] = match.participations ?? [];
  const nameA = getParticipantName(partA);
  const nameB = getParticipantName(partB);
  const instA = getInstitutionAbrev(partA);
  const instB = getInstitutionAbrev(partB);
  const logoA = getInstitutionLogo(partA);
  const logoB = getInstitutionLogo(partB);
  const photoA = getAthletePhoto(partA);
  const photoB = getAthletePhoto(partB);

  const individual = isIndividual(match);
  const isFinished = match.status === "finalizado";
  const isInProgress = match.status === "en_curso";
  const isExpanded = expandedId === match.matchId;

  // Usar score resuelto (del detail) si existe, si no el raw del listado
  const rawA = match.scoreA ?? match.participant1Score ?? 0;
  const rawB = match.scoreB ?? match.participant2Score ?? 0;
  const scoreA = resolvedScore?.a ?? rawA;
  const scoreB = resolvedScore?.b ?? rawB;

  const winnerRegId = match.winnerRegistrationId ?? match.winnerParticipantId;
  const aWon =
    isFinished && winnerRegId != null && winnerRegId === partA?.registrationId;
  const bWon =
    isFinished && winnerRegId != null && winnerRegId === partB?.registrationId;

  const scoreLabel = individual ? "sets ganados" : "partidos ganados";

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200
      ${
        isInProgress
          ? "border-emerald-300 shadow-md shadow-emerald-100"
          : isExpanded
            ? "border-blue-300 shadow-md shadow-blue-50"
            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }
    `}
    >
      {/* ── Header clickeable ── */}
      <button
        className="w-full text-left px-4 pt-3 pb-3 focus:outline-none"
        onClick={() => onToggle(match.matchId)}
      >
        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Pill individual / equipo */}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                individual
                  ? "bg-violet-100 text-violet-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {individual ? "Individual" : "Equipos"}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {roundLabel}
              {match.tableNumber && ` · Mesa ${match.tableNumber}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isInProgress && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                <Zap className="h-3 w-3" /> En Curso
              </span>
            )}
            {isFinished && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                Finalizado
              </span>
            )}
            {!isFinished && !isInProgress && (
              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                Programado
              </span>
            )}
            <span
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </span>
          </div>
        </div>

        {/* Enfrentamiento */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Participante A */}
          <div
            className={`flex flex-col items-end gap-1 transition-opacity ${isFinished && !aWon ? "opacity-40" : ""}`}
          >
            {individual ? (
              photoA ? (
                <img
                  src={getImageUrl(photoA)}
                  alt={nameA}
                  className="h-9 w-9 rounded-full object-cover border-2 border-white shadow"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center border-2 border-white shadow">
                  <User className="h-4 w-4 text-violet-500" />
                </div>
              )
            ) : logoA ? (
              <img
                src={getImageUrl(logoA)}
                alt={instA}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <p
              className={`text-sm font-bold text-right leading-tight ${aWon ? "text-blue-700" : "text-slate-800"}`}
            >
              {nameA}
            </p>
            {instA && <p className="text-[10px] text-slate-400">{instA}</p>}
          </div>

          {/* Marcador central */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {isFinished ? (
              <div className="flex items-center gap-1.5 bg-slate-900 rounded-xl px-3 py-2">
                <span
                  className={`text-2xl font-black leading-none ${aWon ? "text-blue-400" : "text-slate-500"}`}
                >
                  {scoreA}
                </span>
                <span className="text-slate-600 text-sm">–</span>
                <span
                  className={`text-2xl font-black leading-none ${bWon ? "text-blue-400" : "text-slate-500"}`}
                >
                  {scoreB}
                </span>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-xl px-4 py-2">
                <span className="text-sm font-bold text-slate-400 tracking-widest">
                  VS
                </span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 font-medium">
              {scoreLabel}
            </span>
          </div>

          {/* Participante B */}
          <div
            className={`flex flex-col items-start gap-1 transition-opacity ${isFinished && !bWon ? "opacity-40" : ""}`}
          >
            {individual ? (
              photoB ? (
                <img
                  src={getImageUrl(photoB)}
                  alt={nameB}
                  className="h-9 w-9 rounded-full object-cover border-2 border-white shadow"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center border-2 border-white shadow">
                  <User className="h-4 w-4 text-violet-500" />
                </div>
              )
            ) : logoB ? (
              <img
                src={getImageUrl(logoB)}
                alt={instB}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <p
              className={`text-sm font-bold leading-tight ${bWon ? "text-blue-700" : "text-slate-800"}`}
            >
              {nameB}
            </p>
            {instB && <p className="text-[10px] text-slate-400">{instB}</p>}
          </div>
        </div>
      </button>

      {/* ── Panel expandible inline ── */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <MatchInlineDetail
            matchId={match.matchId}
            individual={individual}
            onScoreResolved={(a, b) => setResolvedScore({ a, b })}
          />
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function TableTennisPhaseBlock({ phase }: TableTennisPhaseBlockProps) {
  const { data: standings = [], isLoading } = useStandings(phase.phaseId);
  const { data: matches = [], isLoading: matchesLoading } = useMatches(
    phase.phaseId,
  );

  const [showMatches, setShowMatches] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");

  const handleToggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const phaseMatches = phase.matches || [];
  const allFinished =
    phaseMatches.length > 0 &&
    phaseMatches
      .filter((m: any) => (m.participations?.length ?? 0) >= 2)
      .every((m: any) => m.status === "finalizado");

  // Detectar si hay ambos tipos para mostrar el filtro
  const allMatches = matches as any[];
  const hasIndividual = allMatches.some((m) => isIndividual(m));
  const hasTeam = allMatches.some((m) => !isIndividual(m));
  const showFilter = hasIndividual && hasTeam;

  // Aplicar filtro
  const filteredMatches = allMatches.filter((m) => {
    if (matchFilter === "individual") return isIndividual(m);
    if (matchFilter === "team") return !isIndividual(m);
    return true;
  });

  // Agrupar por ronda
  const matchesByRound = filteredMatches.reduce(
    (acc: Record<string, any[]>, match: any) => {
      const round = match.round ? `Ronda ${match.round}` : "Sin ronda";
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    },
    {},
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-lg">{phase.name}</h4>
          </div>
          <Badge variant="primary">{standings.length} equipos</Badge>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-2" />
            <p className="font-medium text-sm">Sin datos de posiciones</p>
          </div>
        ) : (
          <>
            {/* ── Tabla de posiciones ── */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                  <tr>
                    {["Pos", "Equipo", "PJ", "PG", "PP", "SG", "SP", "Pts"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider
                          ${h === "Pos" || h === "Equipo" ? "text-left" : "text-center"}
                          ${h === "Pos" ? "w-10" : ""}`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((standing: any, index: number) => {
                    const reg = standing.registration;
                    const name = reg?.team?.name ?? reg?.athlete?.name ?? "—";
                    const institution =
                      reg?.team?.institution ?? reg?.athlete?.institution;
                    const photoUrl = reg?.athlete?.photoUrl;
                    const logoUrl = institution?.logoUrl;
                    const isAthlete = !!reg?.athlete;
                    const isQualified = allFinished && index < 2;

                    return (
                      <tr
                        key={standing.standingId}
                        className={`transition-colors ${
                          isQualified
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {isQualified && (
                              <Trophy className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                            <span
                              className={`text-sm font-black ${isQualified ? "text-emerald-700" : "text-slate-500"}`}
                            >
                              {standing.rankPosition ?? index + 1}°
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {isAthlete ? (
                              photoUrl ? (
                                <img
                                  src={getImageUrl(photoUrl)}
                                  alt={name}
                                  className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-violet-500" />
                                </div>
                              )
                            ) : logoUrl ? (
                              <img
                                src={getImageUrl(logoUrl)}
                                alt={institution?.abrev}
                                className="h-8 w-8 object-contain shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <Users className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {name}
                              </p>
                              {institution && (
                                <p className="text-xs text-slate-400">
                                  {institution.abrev ?? institution.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-slate-600">
                          {standing.matchesPlayed}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-emerald-600">
                          {standing.wins}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-red-500">
                          {standing.losses}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-slate-600">
                          {standing.scoreFor}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-slate-600">
                          {standing.scoreAgainst}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-black">
                            {standing.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                {[
                  ["PJ", "Partidos Jugados"],
                  ["PG", "Partidos Ganados"],
                  ["PP", "Partidos Perdidos"],
                  ["SG", "Sets Ganados"],
                  ["SP", "Sets Perdidos"],
                  ["Pts", "Puntos (2=victoria, 1=derrota)"],
                ].map(([k, v]) => (
                  <span key={k}>
                    <strong>{k}:</strong> {v}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Toggle partidos ── */}
            <div className="border-t-2 border-slate-200">
              <button
                onClick={() => setShowMatches((p) => !p)}
                className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 text-sm">
                    Partidos
                  </span>
                  <Badge variant="default" size="sm">
                    {matchesLoading
                      ? "..."
                      : `${filteredMatches.length} de ${allMatches.length}`}
                  </Badge>
                </div>
                <span className="text-slate-400 text-xs font-medium">
                  {showMatches ? "▲ Ocultar" : "▼ Ver partidos"}
                </span>
              </button>

              {showMatches && (
                <>
                  {matchesLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    </div>
                  ) : allMatches.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No hay partidos registrados
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {/* ── Filtro Individual / Equipos ── solo si hay ambos tipos ── */}
                      {showFilter && (
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 w-fit">
                          {(
                            [
                              {
                                key: "all",
                                label: "Todos",
                                count: allMatches.length,
                              },
                              {
                                key: "individual",
                                label: "Individual",
                                count: allMatches.filter(isIndividual).length,
                              },
                              {
                                key: "team",
                                label: "Equipos",
                                count: allMatches.filter(
                                  (m) => !isIndividual(m),
                                ).length,
                              },
                            ] as {
                              key: MatchFilter;
                              label: string;
                              count: number;
                            }[]
                          ).map(({ key, label, count }) => (
                            <button
                              key={key}
                              onClick={() => {
                                setMatchFilter(key);
                                setExpandedId(null); // cerrar el expandido al cambiar filtro
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                matchFilter === key
                                  ? "bg-white text-slate-800 shadow-sm"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {label}
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  matchFilter === key
                                    ? key === "individual"
                                      ? "bg-violet-100 text-violet-600"
                                      : key === "team"
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-blue-100 text-blue-600"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 text-center">
                        Toca un partido para ver el detalle de sets
                      </p>

                      {Object.entries(matchesByRound).map(
                        ([round, roundMatches]) => (
                          <div key={round}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-px flex-1 bg-slate-200" />
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                                {round}
                              </span>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>
                            <div className="space-y-3">
                              {(roundMatches as any[]).map((match: any) => (
                                <MatchCard
                                  key={match.matchId}
                                  match={match}
                                  roundLabel={round}
                                  expandedId={expandedId}
                                  onToggle={handleToggle}
                                />
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
