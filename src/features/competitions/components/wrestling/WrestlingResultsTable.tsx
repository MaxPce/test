import { useMatches } from "@/features/competitions/api/matches.queries";

type Props = {
  phaseId: number;
  title?: string;
  categoryLabel?: string; // ej: "WW - 53kg"
};

type MatchLike = {
  matchId: number;
  matchNumber?: number | null;
  round?: string | number | null;
  participant1Score?: unknown;
  participant2Score?: unknown;
  winnerRegistrationId?: number | null;
  victoryType?: string | null;
  scheduledTime?: string | null;
  participations?: any[];
};

function toIntScore(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.floor(n);
}

function getAthleteName(m: MatchLike, idx: 0 | 1): string {
  const p = m.participations?.[idx];
  return (
    p?.registration?.athlete?.name ||
    `Participante #${p?.participationId ?? idx + 1}`
  );
}

function formatTime(scheduledTime?: string | null): string {
  if (!scheduledTime) return "Not specified";
  try {
    const d = new Date(scheduledTime);
    if (isNaN(d.getTime())) return "Not specified";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Not specified";
  }
}

function computeCP(
  victoryType: string | null | undefined,
  winnerIndex: 1 | 2 | null,
): { cp1: number | null; cp2: number | null } {
  if (!winnerIndex) return { cp1: null, cp2: null };

  const give = (winner: number, loser: number) =>
    winnerIndex === 1
      ? { cp1: winner, cp2: loser }
      : { cp1: loser, cp2: winner };

  switch (victoryType) {
    case "VFA":
    case "VCA":
      return give(5, 0);
    case "VSU":
      return give(4, 0);
    case "VSU1":
      return give(4, 1);
    case "VPO1":
    case "VPO":
      return give(3, 1);
    default:
      return give(3, 0);
  }
}

function getWinnerIndex(m: MatchLike): 1 | 2 | null {
  if (!m.winnerRegistrationId) return null;
  const p1RegId = m.participations?.[0]?.registrationId;
  const p2RegId = m.participations?.[1]?.registrationId;
  if (p1RegId && m.winnerRegistrationId === p1RegId) return 1;
  if (p2RegId && m.winnerRegistrationId === p2RegId) return 2;
  return null;
}

export function WrestlingResultsTable({
  phaseId,
  title,
  categoryLabel,
}: Props) {
  const { data: matches = [], isLoading } = useMatches(phaseId);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando resultados...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No hay combates registrados en esta fase.
      </div>
    );
  }

  const sorted = [...matches].sort(
    (a, b) => (a.matchNumber ?? a.matchId) - (b.matchNumber ?? b.matchId),
  );

  const groups = sorted.reduce<Record<string, MatchLike[]>>((acc, m) => {
    const raw = m.round;
    const key =
      raw != null && String(raw).trim() !== "" ? String(raw) : "Sin ronda";
    acc[key] = acc[key] || [];
    acc[key].push(m);
    return acc;
  }, {});

  const roundKeys = Object.keys(groups).sort((a, b) => {
    const na = Number(a),
      nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-base font-semibold text-gray-700 px-1">{title}</h2>
      )}

      {roundKeys.map((round) => {
        const roundLabel = categoryLabel
          ? `Round ${round} - ${categoryLabel}`
          : `Round ${round}`;

        return (
          <div key={round} className="space-y-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide px-1 border-l-4 border-orange-500 pl-3">
              {roundLabel}
            </h3>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-semibold">
                    <th className="text-left w-16">Match</th>
                    <th className="text-left">Wrestler</th>
                    <th className="text-center w-12">TP</th>
                    <th className="text-center w-12">CP</th>
                    <th className="text-center w-24">Victory</th>
                    <th className="text-center w-28">Time</th>
                    <th className="text-center w-12">CP</th>
                    <th className="text-center w-12">TP</th>
                    <th className="text-left">Wrestler</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {groups[round].map((m) => {
                    const tp1 = toIntScore(m.participant1Score);
                    const tp2 = toIntScore(m.participant2Score);
                    const winnerIndex = getWinnerIndex(m);
                    const { cp1, cp2 } = computeCP(m.victoryType, winnerIndex);

                    const isWinner1 = winnerIndex === 1;
                    const isWinner2 = winnerIndex === 2;

                    return (
                      <tr
                        key={m.matchId}
                        className="[&>td]:px-3 [&>td]:py-2.5 hover:bg-gray-50"
                      >
                        <td className="text-gray-400 font-medium">
                          {m.matchNumber ?? m.matchId}
                        </td>

                        <td
                          className={
                            isWinner1
                              ? "font-bold text-red-600"
                              : "text-gray-700"
                          }
                        >
                          {getAthleteName(m, 0)}
                        </td>

                        <td className="text-center font-bold text-gray-800">
                          {tp1 ?? "-"}
                        </td>
                        <td
                          className={`text-center font-bold ${isWinner1 ? "text-red-600" : "text-gray-400"}`}
                        >
                          {cp1 ?? "-"}
                        </td>

                        <td className="text-center">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {m.victoryType ?? "-"}
                          </span>
                        </td>

                        <td className="text-center text-gray-500 text-xs">
                          {formatTime(m.scheduledTime)}
                        </td>

                        <td
                          className={`text-center font-bold ${isWinner2 ? "text-red-600" : "text-gray-400"}`}
                        >
                          {cp2 ?? "-"}
                        </td>
                        <td className="text-center font-bold text-gray-800">
                          {tp2 ?? "-"}
                        </td>

                        <td
                          className={
                            isWinner2
                              ? "font-bold text-red-600"
                              : "text-gray-700"
                          }
                        >
                          {getAthleteName(m, 1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
