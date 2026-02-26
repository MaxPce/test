import { useMatches } from "@/features/competitions/api/matches.queries";

type Props = { phaseId: number };

type MatchLike = {
  matchId: number;
  matchNumber?: number | null;
  round?: string | number | null;
  participant1Score?: unknown;
  participant2Score?: unknown;
  winnerRegistrationId?: number | null;
  victoryType?: string | null;
  participations?: any[];
};

function toInt(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : Math.floor(n);
}

function winnerCP(vt: string | null | undefined): number {
  switch (vt) {
    case "VFA":
    case "VCA":
      return 5;
    case "VSU":
    case "VSU1":
      return 4;
    case "VPO1":
    case "VPO":
      return 3;
    default:
      return 3;
  }
}

function loserCP(vt: string | null | undefined): number {
  switch (vt) {
    case "VFA":
    case "VCA":
    case "VSU":
      return 0;
    case "VSU1":
    case "VPO1":
    case "VPO":
      return 1;
    default:
      return 0;
  }
}

function getRegId(m: MatchLike, idx: 0 | 1): number | null {
  return m.participations?.[idx]?.registrationId ?? null;
}

function getName(m: MatchLike, idx: 0 | 1): string {
  const p = m.participations?.[idx];
  return p?.registration?.athlete?.name || `Participante #${idx + 1}`;
}

function getNOC(m: MatchLike, idx: 0 | 1): string {
  const p = m.participations?.[idx];
  return (
    p?.registration?.athlete?.institution?.abrev ||
    p?.registration?.athlete?.institution?.name ||
    ""
  );
}

export function WrestlingBracket({ phaseId }: Props) {
  const { data: rawMatches = [], isLoading } = useMatches(phaseId);
  const matches = rawMatches as unknown as MatchLike[];

  if (isLoading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando tabla...</p>
      </div>
    );

  if (matches.length === 0)
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No hay combates.
      </div>
    );

  // Build athlete map
  const athleteMap = new Map<
    number,
    { regId: number; name: string; noc: string }
  >();
  for (const m of matches) {
    for (const idx of [0, 1] as const) {
      const regId = getRegId(m, idx);
      if (regId && !athleteMap.has(regId))
        athleteMap.set(regId, {
          regId,
          name: getName(m, idx),
          noc: getNOC(m, idx),
        });
    }
  }
  const athletes = Array.from(athleteMap.values());
  const seedMap = new Map(athletes.map((a, i) => [a.regId, i + 1]));

  // Build rounds
  const roundSet = new Set<string>();
  for (const m of matches)
    roundSet.add(m.round != null ? String(m.round) : "?");
  const rounds = Array.from(roundSet).sort((a, b) => {
    const na = Number(a),
      nb = Number(b);
    return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b);
  });

  // Index matches by athlete + round
  const byAthleteRound = new Map<
    number,
    Map<string, { m: MatchLike; myIdx: 0 | 1 }>
  >();
  for (const m of matches) {
    const r = m.round != null ? String(m.round) : "?";
    for (const idx of [0, 1] as const) {
      const regId = getRegId(m, idx);
      if (!regId) continue;
      if (!byAthleteRound.has(regId)) byAthleteRound.set(regId, new Map());
      byAthleteRound.get(regId)!.set(r, { m, myIdx: idx });
    }
  }

  // Compute totals
  const statsMap = new Map<number, { totalCP: number; totalVP: number }>();
  for (const a of athletes) {
    let totalCP = 0,
      totalVP = 0;
    for (const { m, myIdx } of byAthleteRound.get(a.regId)?.values() ?? []) {
      const isWin =
        m.winnerRegistrationId != null &&
        m.winnerRegistrationId === getRegId(m, myIdx);
      totalVP += isWin ? 1 : 0;
      totalCP += isWin ? winnerCP(m.victoryType) : loserCP(m.victoryType);
    }
    statsMap.set(a.regId, { totalCP, totalVP });
  }

  const sorted = [...athletes].sort((a, b) => {
    const sa = statsMap.get(a.regId)!;
    const sb = statsMap.get(b.regId)!;
    if (sb.totalVP !== sa.totalVP) return sb.totalVP - sa.totalVP;
    return sb.totalCP - sa.totalCP;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border border-gray-300">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-2 py-2 text-center w-10">Rank</th>
            <th className="px-2 py-2 text-center w-10">#</th>
            <th className="px-3 py-2 text-left min-w-[160px]">Wrestler</th>
            <th className="px-2 py-2 text-center w-20">NOC</th>
            {rounds.map((r) => (
              <th key={r} className="px-2 py-2 text-center min-w-[100px]">
                Round {r}
              </th>
            ))}
            <th className="px-2 py-2 text-center w-16 bg-gray-700">C.Pts</th>
            <th className="px-2 py-2 text-center w-12 bg-gray-700">VP</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a, rankIdx) => {
            const seed = seedMap.get(a.regId)!;
            const stats = statsMap.get(a.regId)!;
            return (
              <tr
                key={a.regId}
                className={rankIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-2 py-2 text-center font-bold text-gray-700 border-r border-gray-200">
                  {rankIdx + 1}
                </td>
                <td className="px-2 py-2 text-center text-gray-500 border-r border-gray-200">
                  {seed}
                </td>
                <td className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200">
                  {a.name}
                </td>
                <td className="px-2 py-2 text-center text-gray-600 border-r border-gray-200">
                  {a.noc || "-"}
                </td>

                {rounds.map((r) => {
                  const entry = byAthleteRound.get(a.regId)?.get(r);
                  if (!entry)
                    return (
                      <td
                        key={r}
                        className="px-2 py-2 text-center text-gray-300 border-r border-gray-200"
                      >
                        —
                      </td>
                    );
                  const { m, myIdx } = entry;
                  const oppIdx = myIdx === 0 ? 1 : 0;
                  const oppRegId = getRegId(m, oppIdx);
                  const oppSeed = oppRegId
                    ? (seedMap.get(oppRegId) ?? "?")
                    : "?";
                  const isWin =
                    m.winnerRegistrationId != null &&
                    m.winnerRegistrationId === getRegId(m, myIdx);
                  const myTP =
                    myIdx === 0
                      ? toInt(m.participant1Score)
                      : toInt(m.participant2Score);
                  const cp = isWin
                    ? winnerCP(m.victoryType)
                    : loserCP(m.victoryType);
                  return (
                    <td
                      key={r}
                      className="px-1 py-1 border-r border-gray-200 align-middle"
                    >
                      <div className="flex flex-col items-center gap-0 leading-tight">
                        <span className="text-gray-500">
                          Opp.{oppSeed} / M.{m.matchNumber ?? m.matchId}
                        </span>
                        <span
                          className={`font-bold text-sm ${isWin ? "text-red-600" : "text-gray-400"}`}
                        >
                          {cp} C.Pts
                        </span>
                        <span className="text-gray-600">{myTP} T.Pts</span>
                        <span
                          className={`font-semibold ${isWin ? "text-green-600" : "text-gray-400"}`}
                        >
                          VP: {isWin ? 1 : 0}
                        </span>
                      </div>
                    </td>
                  );
                })}

                <td className="px-2 py-2 text-center font-bold text-red-600 bg-gray-50 border-r border-gray-200">
                  {stats.totalCP}
                </td>
                <td className="px-2 py-2 text-center font-bold text-gray-700 bg-gray-50">
                  {stats.totalVP}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
