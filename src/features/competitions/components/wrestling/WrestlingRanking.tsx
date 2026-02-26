import { useMatches } from "@/features/competitions/api/matches.queries";

type Props = { phaseId: number };
type MatchLike = {
  matchId: number;
  participant1Score?: unknown;
  participant2Score?: unknown;
  winnerRegistrationId?: number | null;
  victoryType?: string | null;
  participations?: any[];
};

function toInt(v: unknown): number {
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
    "-"
  );
}

interface Row {
  regId: number;
  name: string;
  noc: string;
  W: number;
  CP: number;
  VT: number;
  ST: number;
  TP: number;
  TPGvn: number;
  rank?: number;
  rankPts?: number;
}

export function WrestlingRanking({ phaseId }: Props) {
  const { data: rawMatches = [], isLoading } = useMatches(phaseId);
  const matches = rawMatches as unknown as MatchLike[];

  if (isLoading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando ranking...</p>
      </div>
    );

  if (matches.length === 0)
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No hay combates.
      </div>
    );

  const rowMap = new Map<number, Row>();

  function ensureRow(regId: number, m: MatchLike, idx: 0 | 1): Row {
    if (!rowMap.has(regId))
      rowMap.set(regId, {
        regId,
        name: getName(m, idx),
        noc: getNOC(m, idx),
        W: 0,
        CP: 0,
        VT: 0,
        ST: 0,
        TP: 0,
        TPGvn: 0,
      });
    return rowMap.get(regId)!;
  }

  for (const m of matches) {
    const reg0 = getRegId(m, 0);
    const reg1 = getRegId(m, 1);
    if (!reg0 || !reg1) continue;

    const r0 = ensureRow(reg0, m, 0);
    const r1 = ensureRow(reg1, m, 1);
    const tp0 = toInt(m.participant1Score);
    const tp1 = toInt(m.participant2Score);

    r0.TP += tp0;
    r0.TPGvn += tp1;
    r1.TP += tp1;
    r1.TPGvn += tp0;

    if (m.winnerRegistrationId === reg0) {
      r0.W++;
      r0.CP += winnerCP(m.victoryType);
      r1.CP += loserCP(m.victoryType);
      if (m.victoryType === "VFA" || m.victoryType === "VCA") r0.VT++;
      if (m.victoryType === "VSU" || m.victoryType === "VSU1") r0.ST++;
    } else if (m.winnerRegistrationId === reg1) {
      r1.W++;
      r1.CP += winnerCP(m.victoryType);
      r0.CP += loserCP(m.victoryType);
      if (m.victoryType === "VFA" || m.victoryType === "VCA") r1.VT++;
      if (m.victoryType === "VSU" || m.victoryType === "VSU1") r1.ST++;
    }
  }

  const sorted = Array.from(rowMap.values()).sort((a, b) =>
    b.CP !== a.CP
      ? b.CP - a.CP
      : b.W !== a.W
        ? b.W - a.W
        : b.TP !== a.TP
          ? b.TP - a.TP
          : a.TPGvn - b.TPGvn,
  );

  const medal: Record<number, string> = {
    1: "text-yellow-600",
    2: "text-gray-500",
    3: "text-orange-600",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-center [&>th]:font-semibold">
            <th className="w-12">Rank</th>
            <th className="text-left min-w-[80px]">NOC</th>
            <th className="text-left min-w-[160px]">Wrestler</th>
            <th title="Victories">W</th>
            <th title="Classification Points">CP</th>
            <th title="Victory by Fall (VFA/VCA)">VT</th>
            <th title="Victory by Superiority (VSU/VSU1)">ST</th>
            <th title="Technical Points scored">TP</th>
            <th title="Technical Points given">TP Gvn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((row, i) => (
            <tr
              key={row.regId}
              className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50`}
            >
              <td className="px-3 py-2.5 text-center">
                <span
                  className={`font-bold text-base ${medal[row.rank!] ?? "text-gray-600"}`}
                >
                  {row.rank}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center font-medium text-gray-600">
                {row.noc}
              </td>
              <td className="px-3 py-2.5 font-semibold text-gray-800">
                {row.name}
              </td>
              <td className="px-3 py-2.5 text-center text-gray-700">{row.W}</td>
              <td className="px-3 py-2.5 text-center font-bold text-red-600">
                {row.CP}
              </td>
              <td className="px-3 py-2.5 text-center text-gray-700">
                {row.VT}
              </td>
              <td className="px-3 py-2.5 text-center text-gray-700">
                {row.ST}
              </td>
              <td className="px-3 py-2.5 text-center text-gray-700">
                {row.TP}
              </td>
              <td className="px-3 py-2.5 text-center text-gray-500">
                {row.TPGvn}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 px-1">
        <span>
          <strong>W</strong> = Victorias
        </span>
        <span>
          <strong>CP</strong> = Classification Points
        </span>
        <span>
          <strong>VT</strong> = Victoria por caída (VFA/VCA)
        </span>
        <span>
          <strong>ST</strong> = Superioridad técnica (VSU/VSU1)
        </span>
        <span>
          <strong>TP Gvn</strong> = Puntos cedidos
        </span>
      </div>
    </div>
  );
}
