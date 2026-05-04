// src/features/competitions/components/wrestling/WrestlingMedalTable.tsx
import { useState } from "react";
import { Trophy, Medal, Star, BarChart2, Table2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { getImageUrl } from "@/lib/utils/imageUrl";
import {
  useWrestlingScoreboard,
  type WrestlingScoreboardRow,
} from "../../api/wrestlingScoreboard.queries";

interface Props {
  externalEventId: number;
  localSportId: number;
}

const MEDAL_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// ─── Vista 1: Tabla por categorías (imagen UWW) ────────────────────────────

function CategoryBreakdownTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: WrestlingScoreboardRow[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide w-14 border border-gray-700">
              Lugar
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide border border-gray-700 min-w-[120px]">
              Equipo
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide border border-gray-700 min-w-[60px]"
              >
                {col}
              </th>
            ))}
            <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide border border-gray-700 bg-orange-700 min-w-[70px]">
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isTop3 = row.rank <= 3;
            const rowBg =
              row.rank === 1 ? "bg-yellow-50" :
              row.rank === 2 ? "bg-slate-50" :
              row.rank === 3 ? "bg-amber-50" :
              i % 2 === 0 ? "bg-white" : "bg-gray-50";

            return (
              <tr key={row.institutionId} className={`${rowBg} hover:brightness-95 transition-all`}>
                {/* Lugar */}
                <td className="px-3 py-2.5 text-center w-14 border border-gray-100">
                  <div className="flex items-center justify-center gap-1">
                    {MEDAL_EMOJI[row.rank] ? (
                      <span className="text-lg">{MEDAL_EMOJI[row.rank]}</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">{row.rank}</span>
                    )}
                  </div>
                </td>
                {/* Equipo */}
                <td className="px-3 py-2.5 border border-gray-100">
                  <div className="flex items-center gap-2">
                    {row.logoUrl && (
                      <img
                        src={getImageUrl(row.logoUrl)}
                        alt={row.institutionName}
                        className="h-6 w-6 object-contain flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                    <span className="text-sm font-bold text-gray-800">
                      {row.institutionAbrev || row.institutionName}
                    </span>
                  </div>
                </td>
                {/* Puntos por categoría */}
                {columns.map((col) => {
                  const pts = row.byCategory[col];
                  return (
                    <td key={col} className="px-3 py-2.5 text-center border border-gray-100">
                      {pts != null && pts > 0 ? (
                        <span className={`font-semibold tabular-nums ${isTop3 ? "text-orange-700" : "text-gray-700"}`}>
                          {pts}
                        </span>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  );
                })}
                {/* Total */}
                <td className="px-3 py-2.5 text-center border border-gray-200 bg-orange-50">
                  <span className={`font-bold tabular-nums text-base ${isTop3 ? "text-orange-700" : "text-gray-800"}`}>
                    {row.totalPoints}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Vista 2: Medallero clásico ───────────────────────────────────────────

function MedalStandingsTable({ rows }: { rows: WrestlingScoreboardRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
              Pos.
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Institución
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
              🥇 Oro
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              🥈 Plata
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-amber-600 uppercase tracking-wider">
              🥉 Bronce
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-orange-600 uppercase tracking-wider">
              ⭐ Pts
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map((row) => {
            const rankStyle =
              row.rank === 1 ? { row: "bg-yellow-50 border-l-4 border-yellow-400", badge: "bg-yellow-100 text-yellow-800", label: "🥇" } :
              row.rank === 2 ? { row: "bg-slate-50 border-l-4 border-slate-400",  badge: "bg-slate-100 text-slate-700",   label: "🥈" } :
              row.rank === 3 ? { row: "bg-amber-50 border-l-4 border-amber-400",  badge: "bg-amber-100 text-amber-800",   label: "🥉" } :
              null;

            return (
              <tr key={row.institutionId} className={`transition-colors hover:brightness-95 ${rankStyle?.row ?? "hover:bg-gray-50"}`}>
                {/* Posición */}
                <td className="px-4 py-4 w-16 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {rankStyle ? (
                      <>
                        <span className="text-xl">{rankStyle.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rankStyle.badge}`}>
                          {row.rank}°
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500 ml-8">{row.rank}°</span>
                    )}
                  </div>
                </td>
                {/* Institución */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {row.logoUrl && (
                      <img
                        src={getImageUrl(row.logoUrl)}
                        alt={row.institutionName}
                        className="h-8 w-8 object-contain flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{row.institutionName}</p>
                      <p className="text-xs text-gray-400">{row.institutionAbrev}</p>
                    </div>
                  </div>
                </td>
                {/* Oro */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className={`text-sm font-bold tabular-nums ${row.gold === 0 ? "text-gray-300" : "text-gray-800"}`}>
                      {row.gold}
                    </span>
                  </div>
                </td>
                {/* Plata */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Medal className="h-4 w-4 text-slate-400" />
                    <span className={`text-sm font-bold tabular-nums ${row.silver === 0 ? "text-gray-300" : "text-gray-800"}`}>
                      {row.silver}
                    </span>
                  </div>
                </td>
                {/* Bronce */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Medal className="h-4 w-4 text-amber-600" />
                    <span className={`text-sm font-bold tabular-nums ${row.bronze === 0 ? "text-gray-300" : "text-gray-800"}`}>
                      {row.bronze}
                    </span>
                  </div>
                </td>
                {/* Puntos totales */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span className={`text-base font-bold tabular-nums ${row.rank <= 3 ? "text-orange-700" : "text-orange-500"}`}>
                      {row.totalPoints}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

type ViewMode = "breakdown" | "medals";

export function WrestlingMedalTable({ externalEventId, localSportId }: Props) {
  const [view, setView] = useState<ViewMode>("breakdown");
  const { data, isLoading, isError } = useWrestlingScoreboard(
    externalEventId,
    localSportId,
  );

  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];

  return (
    <div className="space-y-4">
      {/* Header con switcher integrado */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Tabla de Puntajes — Lucha</h3>
                    
            </div>
          </div>
          {/* Switcher */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setView("breakdown")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "breakdown"
                  ? "bg-white text-orange-700 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/20"
              }`}
            >
              <Table2 className="h-4 w-4" />
              Por peso
            </button>
            <button
              onClick={() => setView("medals")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "medals"
                  ? "bg-white text-orange-700 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/20"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              Medallero
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda UWW */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
        <p className="text-xs text-orange-700 font-medium mb-1">
          Puntos de clasificación por lugar (UWW):
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[["1°", 25], ["2°", 20], ["3°/4°", 15], ["5°/6°", 10], ["7°", 8], ["8°", 2]].map(
            ([place, pts]) => (
              <span key={String(place)} className="text-xs text-orange-600">
                <b>{place}</b> = {pts} pts
              </span>
            ),
          )}
        </div>
      </div>

      {/* Tabla */}
      <Card>
        {isLoading ? (
          <CardBody className="flex justify-center items-center py-16">
            <Spinner size="lg" />
          </CardBody>
        ) : isError ? (
          <CardBody className="text-center py-16">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-red-300" />
            <p className="text-red-500 font-medium">Error al cargar la tabla de puntajes</p>
          </CardBody>
        ) : rows.length === 0 ? (
          <CardBody className="text-center py-16">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Sin resultados registrados aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Los puntajes aparecerán al finalizar combates y asignar posiciones
            </p>
          </CardBody>
        ) : view === "breakdown" ? (
          <CategoryBreakdownTable columns={columns} rows={rows} />
        ) : (
          <MedalStandingsTable rows={rows} />
        )}
      </Card>
    </div>
  );
}

export default WrestlingMedalTable;