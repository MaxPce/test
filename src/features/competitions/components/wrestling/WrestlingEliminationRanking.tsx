import { useMatches } from "@/features/competitions/api/matches.queries";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  phaseId: number;
  title?: string;
};

type MatchLike = {
  matchId: number;
  matchNumber?: number | null;
  round?: string | number | null;
  status?: string | null;
  winnerRegistrationId?: number | null;
  victoryType?: string | null;
  participant1Score?: unknown;
  participant2Score?: unknown;
  participations?: any[];
};

type Row = {
  registrationId: number;
  team: string;
  wrestler: string;
  place: number | null;
  cp: number;
  vt: number;
  st: number;
  tp: number;
  tpGvn: number;
};

// ─── Constantes UWW ───────────────────────────────────────────────────────────

const UWW_ROUND_ORDER = [
  "1/16 Final",
  "1/8 Final",
  "1/4 Final",
  "1/2 Final",
  "Repechage",
  "Final 3-5",
  "Final 3-4",
  "Final 1-2",
  "Final",
];

// Puntos de clasificación por equipo según imagen UWW adjunta
const TEAM_POINTS: Record<number, number> = {
  1: 25,
  2: 20,
  3: 15,
  5: 10,
  7: 8,
  8: 2,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapRoundLabel(raw: string | number | null | undefined): string {
  if (raw == null || String(raw).trim() === "") return "Sin ronda";
  const s = String(raw).trim();
  if (UWW_ROUND_ORDER.includes(s)) return s;
  const numericMap: Record<string, string> = {
    "1": "1/8 Final",
    "2": "1/4 Final",
    "3": "1/2 Final",
    "4": "Final 1-2",
    "5": "Repechage",
    "6": "Final 3-5",
  };
  return numericMap[s] ?? s;
}

function toInt(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : 0;
}

function getWinnerIndex(m: MatchLike): 1 | 2 | null {
  if (!m.winnerRegistrationId) return null;
  const p1 = m.participations?.[0]?.registrationId;
  const p2 = m.participations?.[1]?.registrationId;
  if (p1 && m.winnerRegistrationId === p1) return 1;
  if (p2 && m.winnerRegistrationId === p2) return 2;
  return null;
}

function computeCP(
  vtype: string | null | undefined,
  winnerIndex: 1 | 2 | null,
): { cp1: number; cp2: number } {
  if (!winnerIndex) return { cp1: 0, cp2: 0 };
  const give = (w: number, l: number) =>
    winnerIndex === 1 ? { cp1: w, cp2: l } : { cp1: l, cp2: w };
  switch (vtype) {
    case "VFA": case "VCA": return give(5, 0);
    case "VSU":             return give(4, 0);
    case "VSU1":            return give(4, 1);
    case "VPO1": case "VPO": return give(3, 1);
    default:                return give(3, 0);
  }
}

function getRegMeta(p: any): { id: number | null; wrestler: string; team: string } {
  const id: number | null =
    typeof p?.registrationId === "number" ? p.registrationId : null;
  const wrestler: string =
    p?.registration?.athlete?.name ??
    p?.registration?.team?.name ??
    `Participante ${id ?? "-"}`;
  const team: string =
    p?.registration?.athlete?.institution?.abrev ??
    p?.registration?.team?.institution?.abrev ??
    p?.registration?.athlete?.institution?.name ??
    p?.registration?.team?.institution?.name ??
    "-";
  return { id, wrestler, team };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function WrestlingEliminationRanking({ phaseId, title }: Props) {
  const { data: rawMatches = [], isLoading } = useMatches(phaseId);
  const matches = rawMatches as unknown as MatchLike[];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando clasificación...</p>
      </div>
    );
  }

  const finished = matches.filter(
    (m) =>
      m.status?.toUpperCase() === "FINALIZADO" ||
      m.winnerRegistrationId != null,
  );

  if (finished.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No hay combates finalizados para mostrar la clasificación.
      </div>
    );
  }

  // ── 1. Acumular stats ─────────────────────────────────────────────────────
  const acc = new Map<number, Row>();

  const upsert = (id: number, wrestler: string, team: string): Row => {
    if (!acc.has(id)) {
      acc.set(id, { registrationId: id, team, wrestler, place: null, cp: 0, vt: 0, st: 0, tp: 0, tpGvn: 0 });
    }
    return acc.get(id)!;
  };

  for (const m of finished) {
    const pA = m.participations?.[0];
    const pB = m.participations?.[1];
    if (!pA || !pB) continue;

    const a = getRegMeta(pA);
    const b = getRegMeta(pB);
    if (!a.id || !b.id) continue;

    const winnerIndex = getWinnerIndex(m);
    const { cp1, cp2 } = computeCP(m.victoryType, winnerIndex);
    const vtype = (m.victoryType ?? "").toUpperCase();

    const rowA = upsert(a.id, a.wrestler, a.team);
    const rowB = upsert(b.id, b.wrestler, b.team);

    rowA.cp += cp1;
    rowA.tp += toInt(m.participant1Score);
    rowA.tpGvn += toInt(m.participant2Score);

    rowB.cp += cp2;
    rowB.tp += toInt(m.participant2Score);
    rowB.tpGvn += toInt(m.participant1Score);

    // VT: victoria por toque/ausencia/lesión/descalificación (5-0)
    if (winnerIndex) {
      const winnerRow = winnerIndex === 1 ? rowA : rowB;
      if (vtype === "VFA" || vtype === "VCA") winnerRow.vt += 1;
      // ST: victoria por superioridad (4-0 / 4-1)
      if (vtype === "VSU" || vtype === "VSU1") winnerRow.st += 1;
    }
  }

  // ── 2. Asignar puestos desde rounds conocidos ─────────────────────────────

  // 1° y 2° desde Final 1-2 (mismo patrón que PodiumTable)
  const final12 =
    finished.find((m) => mapRoundLabel(m.round) === "Final 1-2") ??
    finished.find((m) => mapRoundLabel(m.round) === "Final");

  if (final12) {
    const wi = getWinnerIndex(final12);
    const idA = final12.participations?.[0]?.registrationId;
    const idB = final12.participations?.[1]?.registrationId;
    if (wi && typeof idA === "number" && typeof idB === "number") {
      const winnerId = wi === 1 ? idA : idB;
      const loserId  = wi === 1 ? idB : idA;
      const rW = acc.get(winnerId); if (rW) rW.place = 1;
      const rL = acc.get(loserId);  if (rL) rL.place = 2;
    }
  }

  // 3° y 5° desde Final 3-5 (puede haber varios: uno por cada árbol de repechage)
  const finals35 = finished.filter(
    (m) => mapRoundLabel(m.round) === "Final 3-5" ||
           mapRoundLabel(m.round) === "Final 3-4",
  );
  let nextBronzePlace = 3;
  for (const bm of finals35) {
    const wi = getWinnerIndex(bm);
    const idA = bm.participations?.[0]?.registrationId;
    const idB = bm.participations?.[1]?.registrationId;
    if (wi && typeof idA === "number" && typeof idB === "number") {
      const winnerId = wi === 1 ? idA : idB;
      const loserId  = wi === 1 ? idB : idA;
      const rW = acc.get(winnerId); if (rW && rW.place == null) rW.place = nextBronzePlace;
      const rL = acc.get(loserId);  if (rL && rL.place == null) rL.place = nextBronzePlace + 2;
      nextBronzePlace += 4; // si hay 2 finales 3-5: 3°/5° y 7°/9°
    }
  }

  // ── 3. Ordenar ────────────────────────────────────────────────────────────
  const rows = Array.from(acc.values()).sort((a, b) => {
    const pa = a.place ?? 9999;
    const pb = b.place ?? 9999;
    if (pa !== pb) return pa - pb;
    // Criterios de desempate UWW (para mismo place null)
    if (b.cp !== a.cp) return b.cp - a.cp;
    if (b.vt !== a.vt) return b.vt - a.vt;
    if (b.st !== a.st) return b.st - a.st;
    if (b.tp !== a.tp) return b.tp - a.tp;
    if (a.tpGvn !== b.tpGvn) return a.tpGvn - b.tpGvn;
    return a.wrestler.localeCompare(b.wrestler);
  });

  // Asignar place numérico a los que quedaron sin puesto (eliminados en rondas tempranas)
  let nextPlace = (rows.filter((r) => r.place != null).at(-1)?.place ?? 0) + 1;
  for (const r of rows) {
    if (r.place == null) {
      r.place = nextPlace++;
    }
  }

  // ── 4. Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {title && (
        <h2 className="text-base font-semibold text-gray-700 px-1">{title}</h2>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-semibold">
              <th className="text-center w-16">Lugar</th>
              <th className="text-left  w-20">Equipo</th>
              <th className="text-left">Luchador</th>
              <th className="text-center w-14">CP</th>
              <th className="text-center w-14">VT</th>
              <th className="text-center w-14">ST</th>
              <th className="text-center w-14">TP</th>
              <th className="text-center w-20">TP Gvn</th>
              <th className="text-center w-28">
                Puntos de
                <br />
                <span className="font-semibold">Clasificación</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const teamPts = r.place != null ? (TEAM_POINTS[r.place] ?? null) : null;

              return (
                <tr
                  key={r.registrationId}
                  className="[&>td]:px-3 [&>td]:py-2.5 hover:bg-gray-50"
                >
                  <td className="text-center font-semibold text-gray-800">
                    {r.place ?? "-"}
                  </td>
                  <td className="text-left text-gray-700 font-medium">
                    {r.team}
                  </td>
                  <td className="text-left text-gray-800">{r.wrestler}</td>
                  <td className="text-center font-bold text-gray-900">{r.cp}</td>
                  <td className="text-center text-gray-700">{r.vt}</td>
                  <td className="text-center text-gray-700">{r.st}</td>
                  <td className="text-center text-gray-700">{r.tp}</td>
                  <td className="text-center text-gray-700">{r.tpGvn}</td>
                  <td className="text-center font-bold text-gray-900">
                    {teamPts != null ? teamPts : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda — igual que en la imagen UWW adjunta */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 space-y-1">
        <p><strong>CP</strong>: Puntos de Clasificación</p>
        <p><strong>VT</strong>: Victorias por toque, ausencia/lesión/descalificación (5-0)</p>
        <p><strong>ST</strong>: Victorias por Superioridad (4-0 / 4-1)</p>
        <p><strong>TP</strong>: Puntos Técnicos Obtenidos</p>
        <p><strong>TP Gvn</strong>: Puntos Técnicos Otorgados</p>
      </div>

      
    </div>
  );
}
