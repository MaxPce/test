import { Trophy, Medal } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useWeightliftingPhaseResults } from "../../api/weightlifting.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { WeightliftingAthleteResult } from "../../api/weightlifting.api";

interface Props {
  phaseId: number;
  phaseName: string;
}

// ── Calcular lugar dentro de un grupo por tipo de lift ───────────────────────
function calcLugares(
  athletes: WeightliftingAthleteResult[],
): Map<number, { snatchLugar: number | null; cnjLugar: number | null; totalLugar: number | null }> {
  const map = new Map<number, { snatchLugar: number | null; cnjLugar: number | null; totalLugar: number | null }>();

  // Ordenar por bestSnatch desc → asignar lugar
  const bySnatch = [...athletes]
    .filter((r) => r.bestSnatch !== null)
    .sort((a, b) => (b.bestSnatch ?? 0) - (a.bestSnatch ?? 0));

  const byCnj = [...athletes]
    .filter((r) => r.bestCleanAndJerk !== null)
    .sort((a, b) => (b.bestCleanAndJerk ?? 0) - (a.bestCleanAndJerk ?? 0));

  const byTotal = [...athletes]
    .filter((r) => r.total !== null)
    .sort((a, b) => {
      if (b.total !== a.total) return (b.total ?? 0) - (a.total ?? 0);
      return (a.totalAchievedAtAttempt ?? 99) - (b.totalAchievedAtAttempt ?? 99);
    });

  for (const r of athletes) {
    const id = r.participation.participationId;
    const snatchLugar = bySnatch.findIndex((x) => x.participation.participationId === id);
    const cnjLugar = byCnj.findIndex((x) => x.participation.participationId === id);
    const totalLugar = byTotal.findIndex((x) => x.participation.participationId === id);

    map.set(id, {
      snatchLugar: snatchLugar >= 0 ? snatchLugar + 1 : null,
      cnjLugar: cnjLugar >= 0 ? cnjLugar + 1 : null,
      totalLugar: totalLugar >= 0 ? totalLugar + 1 : null,
    });
  }

  return map;
}

const lugarStyle = (lugar: number | null) => {
  if (lugar === 1) return "bg-yellow-400 text-white font-bold";
  if (lugar === 2) return "bg-slate-300 text-slate-700 font-bold";
  if (lugar === 3) return "bg-orange-300 text-white font-bold";
  if (lugar !== null) return "bg-slate-100 text-slate-600";
  return "text-slate-300";
};

// ── Agrupar por división ──────────────────────────────────────────────────────
function groupByDivision(
  results: WeightliftingAthleteResult[],
): Map<string, WeightliftingAthleteResult[]> {
  const groups = new Map<string, WeightliftingAthleteResult[]>();
  for (const r of results) {
    const div = r.participation?.registration?.weightClass ?? "";
    if (!groups.has(div)) groups.set(div, []);
    groups.get(div)!.push(r);
  }
  return groups;
}

// ── Thead ─────────────────────────────────────────────────────────────────────
function TableHead() {
  return (
    <thead>
      <tr className="bg-slate-50 border-b-2 border-slate-200">
        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 w-10">
          Seed
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 min-w-[180px]">
          Atleta
        </th>
        {/* Arranque */}
        <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-x border-blue-200">
          ARRANQUE
        </th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-r border-blue-100">
          Mejor
        </th>
        <th className="px-2 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-r border-blue-200">
          Lugar
        </th>
        {/* Envión */}
        <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-x border-purple-200">
          ENVIÓN
        </th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-r border-purple-100">
          Mejor
        </th>
        <th className="px-2 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-r border-purple-200">
          Lugar
        </th>
        {/* Total */}
        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-900 bg-yellow-50 w-16">
          TOTAL
        </th>
        <th className="px-2 py-3 text-center text-xs font-semibold text-slate-900 bg-yellow-50 w-14">
          Lugar
        </th>
      </tr>
      <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400">
        <th /><th />
        <th className="py-1 text-center font-normal border-r border-slate-100">1°</th>
        <th className="py-1 text-center font-normal border-r border-slate-100">2°</th>
        <th className="py-1 text-center font-normal border-r border-blue-200">3°</th>
        <th className="border-r border-blue-100" />
        <th className="border-r border-blue-200" />
        <th className="py-1 text-center font-normal border-r border-slate-100">1°</th>
        <th className="py-1 text-center font-normal border-r border-slate-100">2°</th>
        <th className="py-1 text-center font-normal border-r border-purple-200">3°</th>
        <th className="border-r border-purple-100" />
        <th className="border-r border-purple-200" />
        <th /><th />
      </tr>
    </thead>
  );
}

// ── Fila de atleta ────────────────────────────────────────────────────────────
function AthleteRow({
  result,
  lugares,
}: {
  result: WeightliftingAthleteResult;
  lugares: { snatchLugar: number | null; cnjLugar: number | null; totalLugar: number | null };
}) {
  const name =
    result.participation?.registration?.athlete?.name ?? "Sin nombre";
  const institution =
    result.participation?.registration?.athlete?.institution ?? null;
  const logoUrl = institution?.logoUrl;
  const seedNumber = result.participation?.registration?.seedNumber ?? null;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      {/* Seed */}
      <td className="px-3 py-3 text-center">
        <span className="text-sm font-semibold text-slate-500">
          {seedNumber ?? "—"}
        </span>
      </td>

      {/* Atleta */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img
              src={getImageUrl(logoUrl)}
              alt={institution?.name ?? ""}
              className="h-7 w-7 rounded-md object-contain bg-white border border-slate-100 p-0.5 flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div>
            <p className="font-semibold text-slate-900 text-sm">{name}</p>
            {institution && (
              <p className="text-xs text-slate-400">{institution.name}</p>
            )}
          </div>
        </div>
      </td>

      {/* Snatch 1, 2, 3 */}
      {[1, 2, 3].map((num) => (
        <AttemptCell
          key={`s${num}`}
          attempt={result.snatchAttempts?.find((a) => a.attemptNumber === num)}
        />
      ))}

      {/* Mejor Snatch */}
      <td className="px-3 py-3 text-center border-r border-blue-100">
        <span className={`font-bold text-sm ${result.bestSnatch ? "text-blue-700" : "text-slate-300"}`}>
          {result.bestSnatch ?? "—"}
        </span>
      </td>

      {/* Lugar Arranque */}
      <td className="px-2 py-3 text-center border-r border-blue-200">
        {lugares.snatchLugar !== null ? (
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${lugarStyle(lugares.snatchLugar)}`}>
            {lugares.snatchLugar}
          </span>
        ) : (
          <span className="text-slate-200 text-xs">—</span>
        )}
      </td>

      {/* C&J 1, 2, 3 */}
      {[1, 2, 3].map((num) => (
        <AttemptCell
          key={`c${num}`}
          attempt={result.cleanAndJerkAttempts?.find((a) => a.attemptNumber === num)}
        />
      ))}

      {/* Mejor C&J */}
      <td className="px-3 py-3 text-center border-r border-purple-100">
        <span className={`font-bold text-sm ${result.bestCleanAndJerk ? "text-purple-700" : "text-slate-300"}`}>
          {result.bestCleanAndJerk ?? "—"}
        </span>
      </td>

      {/* Lugar Envión */}
      <td className="px-2 py-3 text-center border-r border-purple-200">
        {lugares.cnjLugar !== null ? (
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${lugarStyle(lugares.cnjLugar)}`}>
            {lugares.cnjLugar}
          </span>
        ) : (
          <span className="text-slate-200 text-xs">—</span>
        )}
      </td>

      {/* Total */}
      <td className="px-3 py-3 text-center bg-yellow-50/50">
        <span className={`font-bold text-base ${result.total ? "text-slate-900" : "text-slate-300"}`}>
          {result.total ?? "—"}
        </span>
      </td>

      {/* Lugar Total */}
      <td className="px-2 py-3 text-center bg-yellow-50/50">
        {lugares.totalLugar !== null ? (
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${lugarStyle(lugares.totalLugar)}`}>
            {lugares.totalLugar}
          </span>
        ) : (
          <span className="text-slate-200 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

// ── Bloque de tabla para un grupo de atletas ──────────────────────────────────
function DivisionTable({ athletes }: { athletes: WeightliftingAthleteResult[] }) {
  const lugares = calcLugares(athletes);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <TableHead />
        <tbody>
          {athletes.map((result) => (
            <AthleteRow
              key={result.participation.participationId}
              result={result}
              lugares={
                lugares.get(result.participation.participationId) ?? {
                  snatchLugar: null,
                  cnjLugar: null,
                  totalLugar: null,
                }
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function WeightliftingResultsTable({ phaseId, phaseName }: Props) {
  const { data: results = [], isLoading } = useWeightliftingPhaseResults(phaseId);

  const hasDivisions = results.some(
    (r) => r.participation?.registration?.weightClass,
  );

  const groups = groupByDivision(results);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">{phaseName}</h4>
              {hasDivisions && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {groups.size} divisiones · lugar calculado por división
                </p>
              )}
            </div>
          </div>
          <Badge variant="primary">{results.length} atletas</Badge>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12 gap-3">
            <Spinner size="md" />
            <span className="text-slate-500 text-sm">Cargando resultados...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay resultados aún</p>
          </div>
        ) : hasDivisions ? (
          // ── Con divisiones: una tabla por división ────────────────────────
          <div className="divide-y divide-slate-200">
            {Array.from(groups.entries()).map(([div, athletes]) => (
              <div key={div}>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-700">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    {div ? `División ${div} kg` : "Sin división"}
                  </span>
                  <span className="text-xs text-slate-300">
                    — {athletes.length} atleta{athletes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <DivisionTable athletes={athletes} />
              </div>
            ))}
          </div>
        ) : (
          // ── Sin divisiones: tabla única ───────────────────────────────────
          <DivisionTable athletes={results} />
        )}
      </CardBody>
    </Card>
  );
}

// ── Celda de intento ──────────────────────────────────────────────────────────
function AttemptCell({
  attempt,
}: {
  attempt?: { weightKg?: number | null; result: string };
}) {
  if (!attempt || attempt.result === "not_attempted") {
    return (
      <td className="px-2 py-2 text-center border-r border-slate-100">
        <span className="text-slate-200 text-xs">—</span>
      </td>
    );
  }
  const valid = attempt.result === "valid";
  return (
    <td className={`px-2 py-2 text-center border-r border-slate-100 ${valid ? "bg-green-50" : "bg-red-50"}`}>
      <span className={`text-xs font-semibold block ${valid ? "text-green-700" : "text-red-500 line-through"}`}>
        {attempt.weightKg ?? "—"}
      </span>
      <span className="text-xs">{valid ? "✓" : "✗"}</span>
    </td>
  );
}
