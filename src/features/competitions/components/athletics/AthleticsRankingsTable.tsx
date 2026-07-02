// src/features/competitions/components/athletics/AthleticsRankingsTable.tsx

import { useMemo } from "react";
import {
  useAthleticsResultsByEvent,
  useAthleticsParticipatingInstitutions,
} from "../../api/athletics-results.queries";
import type {
  AthleticsCategoryData,
  AthleticsResultEntry,
  ParticipatingInstitution,
} from "../../api/athletics-results.queries";
import { Spinner } from "@/components/ui/Spinner";
import { Trophy } from "lucide-react";

interface Props {
  externalEventId: number;
  localSportId: number;
}

interface RankRow {
  rank: number | null;
  university: string;
  universityAbrev: string;
  points: number;
}

function getCategoryLevel(categoryName: string): "noveles" | "avanzados" | null {
  const lower = categoryName.toLowerCase();
  if (lower.includes("novel")) return "noveles";
  if (lower.includes("avanzad")) return "avanzados";
  return null;
}

function accumulatePoints(
  entries: AthleticsResultEntry[]
): Record<string, { university: string; universityAbrev: string; points: number }> {
  const acc: Record<string, { university: string; universityAbrev: string; points: number }> = {};
  for (const e of entries) {
    if (!acc[e.university]) {
      acc[e.university] = { university: e.university, universityAbrev: e.universityAbrev, points: 0 };
    }
    acc[e.university].points += e.points ?? 0;
  }
  return acc;
}

function mergeAndRank(
  accs: Record<string, { university: string; universityAbrev: string; points: number }>[]
): RankRow[] {
  const merged: Record<string, { university: string; universityAbrev: string; points: number }> = {};
  for (const acc of accs) {
    for (const key of Object.keys(acc)) {
      if (!merged[key]) {
        merged[key] = { ...acc[key], points: 0 };
      }
      merged[key].points += acc[key].points;
    }
  }
  return Object.values(merged)
    .sort((a, b) => b.points - a.points)
    .map((row, i) => ({ rank: i + 1, ...row }));
}

function RankingTable({ title, rows, colorClass }: {
  title: string;
  rows: RankRow[];
  colorClass?: string;
}) {
  const headerColor = colorClass ?? "from-slate-600 to-slate-700";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-r ${headerColor} px-4 py-3`}>
        <h3 className="font-bold text-white text-sm tracking-wide uppercase">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400 italic">Sin datos aún.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-12 px-3 py-2 text-center">Pos</th>
              <th className="px-4 py-2 text-left">Institución</th>
              <th className="w-20 px-3 py-2 text-center font-bold text-orange-600">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const medal =
                row.rank === 1
                  ? "bg-yellow-400 text-yellow-900"
                  : row.rank === 2
                  ? "bg-slate-300 text-slate-700"
                  : row.rank === 3
                  ? "bg-orange-400 text-orange-900"
                  : "bg-slate-100 text-slate-500";

              return (
                <tr key={row.university} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-center">
                    {row.rank !== null ? (
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${medal}`}
                      >
                        {row.rank}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-900">{row.university}</div>
                    {row.universityAbrev && row.universityAbrev !== row.university && (
                      <div className="text-xs text-slate-400">{row.universityAbrev}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-orange-600 text-base">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function AthleticsRankingsTable({ externalEventId, localSportId }: Props) {
  const { data = [], isLoading } = useAthleticsResultsByEvent(externalEventId, localSportId);
  const { data: participatingInstitutions = [] } = useAthleticsParticipatingInstitutions(
    externalEventId,
    localSportId,
  );

  const rankings = useMemo(() => {
    if (data.length === 0 && participatingInstitutions.length === 0) return null;

    const novelF: AthleticsResultEntry[] = [];
    const novelM: AthleticsResultEntry[] = [];
    const avanzF: AthleticsResultEntry[] = [];
    const avanzM: AthleticsResultEntry[] = [];

    for (const cat of data as AthleticsCategoryData[]) {
      const level = getCategoryLevel(cat.category);
      for (const ev of cat.events) {
        if (level === "noveles") {
          novelF.push(...ev.femaleResults);
          novelM.push(...ev.maleResults);
        } else if (level === "avanzados") {
          avanzF.push(...ev.femaleResults);
          avanzM.push(...ev.maleResults);
        } else {
          novelF.push(...ev.femaleResults);
          novelM.push(...ev.maleResults);
        }
      }
    }

    const accNovelF = accumulatePoints(novelF);
    const accNovelM = accumulatePoints(novelM);
    const accAvanzF = accumulatePoints(avanzF);
    const accAvanzM = accumulatePoints(avanzM);

    const puntaje_general_base = mergeAndRank([accNovelF, accNovelM, accAvanzF, accAvanzM]);

    const scoredNames = new Set(puntaje_general_base.map((r) => r.university));
    const zeroRows: RankRow[] = participatingInstitutions
      .filter((p: ParticipatingInstitution) => !scoredNames.has(p.institutionName))
      .map((p: ParticipatingInstitution) => ({
        rank: null,
        university: p.institutionName,
        universityAbrev: p.institutionAbrev ?? p.institutionName,
        points: 0,
      }));

    return {
      damas_noveles:     mergeAndRank([accNovelF]),
      varones_noveles:   mergeAndRank([accNovelM]),
      damas_avanzadas:   mergeAndRank([accAvanzF]),
      varones_avanzados: mergeAndRank([accAvanzM]),
      total_damas:       mergeAndRank([accNovelF, accAvanzF]),
      total_varones:     mergeAndRank([accNovelM, accAvanzM]),
      total_noveles:     mergeAndRank([accNovelF, accNovelM]),
      total_avanzados:   mergeAndRank([accAvanzF, accAvanzM]),
      puntaje_general:   [...puntaje_general_base, ...zeroRows],
    };
  }, [data, participatingInstitutions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Calculando rankings..." />
      </div>
    );
  }

  if (!rankings) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Trophy className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p className="font-medium">No hay resultados registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-700 border-b border-slate-200 pb-2">
          <span className="inline-block w-3 h-3 rounded-full bg-sky-400" />
          Categoría Noveles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RankingTable
            title="Puntaje Damas Noveles"
            rows={rankings.damas_noveles}
            colorClass="from-pink-500 to-rose-600"
          />
          <RankingTable
            title="Puntaje Varones Noveles"
            rows={rankings.varones_noveles}
            colorClass="from-blue-500 to-blue-700"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-700 border-b border-slate-200 pb-2">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
          Categoría Avanzados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RankingTable
            title="Puntaje Damas Avanzadas"
            rows={rankings.damas_avanzadas}
            colorClass="from-pink-600 to-rose-700"
          />
          <RankingTable
            title="Puntaje Varones Avanzados"
            rows={rankings.varones_avanzados}
            colorClass="from-blue-600 to-blue-800"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-700 border-b border-slate-200 pb-2">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-400" />
          Total por Género (todas las categorías)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RankingTable
            title="Puntaje Total Damas"
            rows={rankings.total_damas}
            colorClass="from-fuchsia-500 to-pink-600"
          />
          <RankingTable
            title="Puntaje Total Varones"
            rows={rankings.total_varones}
            colorClass="from-indigo-500 to-blue-600"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-700 border-b border-slate-200 pb-2">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" />
          Total por Nivel (ambos géneros)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RankingTable
            title="Puntaje Total Noveles"
            rows={rankings.total_noveles}
            colorClass="from-sky-500 to-cyan-600"
          />
          <RankingTable
            title="Puntaje Total Avanzados"
            rows={rankings.total_avanzados}
            colorClass="from-amber-500 to-orange-600"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-700 border-b border-slate-200 pb-2">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
          Puntaje General
        </h2>
        <div className="max-w-lg">
          <RankingTable
            title="🏆 Puntaje General — Atletismo"
            rows={rankings.puntaje_general}
            colorClass="from-yellow-500 to-amber-600"
          />
        </div>
      </section>

    </div>
  );
}