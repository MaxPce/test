// src/features/competitions/components/athletics/AthleticsCombinedRanking.tsx
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { Spinner } from "@/components/ui/Spinner";
import {
  useAthleticsCombinedRanking,
  type CombinedType,
  type CombinedAthleteRow,
  type CombinedSubEventResult,
} from "../../api/athletics-results.queries";
import { calcIaafPoints } from "../../utils/iaaf-points.utils";

type GenderFilter = "all" | "F" | "M";

interface Props {
  externalEventId: number;
  localSportId: number;
  combinedType: CombinedType;
  genderFilter: GenderFilter;
}

// ── Badge posición ─────────────────────────────────────────────────────────────
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function PosBadge({ rank }: { rank: number }) {
  if (MEDAL[rank]) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-base">{MEDAL[rank]}</span>
        <span className="text-xs font-bold text-slate-400">{rank}°</span>
      </div>
    );
  }
  return <span className="text-sm font-semibold text-slate-400 pl-7">{rank}°</span>;
}

const ROW_BG: Record<number, string> = {
  1: "bg-yellow-50 border-l-4 border-yellow-400",
  2: "bg-slate-50 border-l-4 border-slate-400",
  3: "bg-orange-50 border-l-4 border-orange-400",
};

// ── Chip de marca según tipo de sub-prueba ─────────────────────────────────────
function MarkChip({
  sub,
  gender,
}: {
  sub: CombinedSubEventResult;
  gender: "M" | "F";
}) {
  const hasMark = sub.mark !== null;
  const pts =
    sub.iaafPoints > 0
      ? sub.iaafPoints
      : calcIaafPoints(sub.mark, sub.subEventName, gender);

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-center shadow-sm min-w-[80px]">
      <p className="text-[10px] text-slate-400 font-medium truncate leading-tight">
        {sub.subEventName}
      </p>
      <p className="text-[11px] font-mono text-slate-600 mt-0.5">
        {hasMark ? sub.mark : "—"}
      </p>
      <p
        className={`text-xs font-bold mt-0.5 ${
          pts > 0 ? "text-orange-600" : "text-slate-300"
        }`}
      >
        {pts > 0 ? pts.toLocaleString() : "—"}
        <span className="text-[9px] font-normal text-slate-400 ml-0.5">pts</span>
      </p>
    </div>
  );
}

// ── Fila de atleta con detalle expandible ──────────────────────────────────────
function AthleteRow({ row }: { row: CombinedAthleteRow }) {
  const [open, setOpen] = useState(false);

  const totalPts =
    row.totalIaafPoints > 0
      ? row.totalIaafPoints
      : row.subResults.reduce(
          (sum, sub) =>
            sum + calcIaafPoints(sub.mark, sub.subEventName, row.gender),
          0,
        );

  return (
    <>
      <tr
        className={`transition-colors cursor-pointer ${
          ROW_BG[row.rank] ?? "hover:bg-slate-50"
        }`}
        onClick={() => setOpen((p) => !p)}
      >
        {/* Posición */}
        <td className="px-3 py-3 whitespace-nowrap w-16">
          <PosBadge rank={row.rank} />
        </td>

        {/* Atleta */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-1.5">
            {open ? (
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {row.athleteName.toUpperCase()}
              </p>
              <p className="text-[10px] text-slate-400">
                {row.category} · {row.gender === "F" ? "Damas" : "Varones"}
              </p>
            </div>
          </div>
        </td>

        {/* Institución */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-1.5">
            {row.institutionLogo && (
              <img
                src={getImageUrl(row.institutionLogo)}
                alt={row.institutionName}
                className="h-5 w-5 object-contain shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="text-xs text-slate-600">
              {row.institutionAbrev ?? row.institutionName}
            </span>
          </div>
        </td>

        {/* Pruebas completadas */}
        <td className="px-3 py-3 text-center">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              row.isFinished
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {row.completedEvents}/{row.totalEvents}
            {row.isFinished ? " ✓" : " …"}
          </span>
        </td>

        {/* Total IAAF */}
        <td className="px-3 py-3 text-center">
          <span
            className={`text-sm font-bold tabular-nums ${
              row.rank <= 3 ? "text-orange-600" : "text-orange-500"
            }`}
          >
            {totalPts.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 ml-0.5">pts</span>
        </td>
      </tr>

      {/* Detalle expandido de sub-pruebas */}
      {open && (
        <tr className="bg-slate-50/80">
          <td colSpan={5} className="px-6 pb-3 pt-1">
            <p className="text-[10px] text-slate-400 mb-2">
              Sub-pruebas · haz clic en la fila para colapsar
            </p>
            <div className="flex flex-wrap gap-2">
              {[...row.subResults]
                .sort((a, b) => a.order - b.order)
                .map((sub) => (
                  <MarkChip
                    key={sub.subEventName}
                    sub={sub}
                    gender={row.gender}
                  />
                ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Componente exportable ──────────────────────────────────────────────────────
export function AthleticsCombinedRanking({
  externalEventId,
  localSportId,
  combinedType,
  genderFilter,
}: Props) {
  const { data, isLoading, isError } = useAthleticsCombinedRanking(
    externalEventId,
    localSportId,
    combinedType,
  );

  const label = combinedType === "heptatlon" ? "Heptatlón" : "Decatlón";

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner size="lg" label={`Cargando ${label}...`} />
      </div>
    );

  if (isError)
    return (
      <div className="text-center py-12 text-red-400 text-sm">
        Error al cargar {label}
      </div>
    );

  const athletes = (data?.athletes ?? [])
    .filter((a) => genderFilter === "all" || a.gender === genderFilter)
    .map((a) => ({
        ...a,
        // Recalcular totalPts en frontend por si el backend trae 0
        _computedPts:
        a.totalIaafPoints > 0
            ? a.totalIaafPoints
            : a.subResults.reduce(
                (sum, sub) => sum + calcIaafPoints(sub.mark, sub.subEventName, a.gender),
                0,
            ),
    }))
    .sort((a, b) => b._computedPts - a._computedPts)
    // Reasignar rank según orden real
    .map((a, i) => ({ ...a, rank: i + 1, totalIaafPoints: a._computedPts }));


  if (athletes.length === 0)
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm font-medium">Sin resultados de {label} aún</p>
        <p className="text-xs mt-1 text-slate-300">
          Los puntajes IAAF aparecerán conforme se registren las sub-pruebas
        </p>
      </div>
    );

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3 px-1">
        💡 Haz clic en un atleta para ver el desglose por sub-prueba.
      </p>
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide w-16">
                Pos.
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">
                Atleta
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">
                Institución
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide">
                Pruebas
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-bold text-orange-300 uppercase tracking-wide">
                Pts IAAF
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {athletes.map((athlete) => (
              <AthleteRow
                key={`${athlete.athleteId}-${athlete.category}-${athlete.gender}`}
                row={athlete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}