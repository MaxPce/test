// src/features/competitions/components/athletics/AthleticsMedalTable.tsx
import { useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Search, X } from "lucide-react";
import {
  useAthleticsResultsByEvent,
  useAthleticsParticipatingInstitutions,
  useAthleticsCombinedRanking,
} from "../../api/athletics-results.queries";
import type { AthleticsCategoryData } from "../../api/athletics-results.queries";
import { Spinner } from "@/components/ui/Spinner";
import { AthleticsEventTable } from "./AthleticsEventTable";
import { AthleticsReportPDF } from "./AthleticsReportPDF";
import { AthleticsCombinedRanking } from "./AthleticsCombinedRanking";
import { InstitutionMedalsDrawer } from "./InstitutionMedalsDrawer";

type GenderFilter = "all" | "F" | "M";
type ViewMode = "results" | "heptatlon" | "decatlon" | "medals";


interface Props {
  externalEventId: number;
  localSportId: number;
  eventName?: string;
}


interface MedalRow {
  university: string;
  universityAbrev: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}


// ─── Helper: contar medallas desde todas las categorías ───────────────────────
function buildMedalTable(data: AthleticsCategoryData[]): MedalRow[] {
  const map = new Map<string, MedalRow>();

  for (const cat of data) {
    for (const ev of cat.events) {
      for (const r of [...ev.femaleResults, ...ev.maleResults]) {
        if (r.position < 1 || r.position > 3) continue;
        const key = r.universityAbrev || r.university;
        if (!map.has(key)) {
          map.set(key, {
            university:      r.university,
            universityAbrev: r.universityAbrev,
            gold: 0, silver: 0, bronze: 0, total: 0,
          });
        }
        const medalCount =
          r.isRelay && r.teamMembers && r.teamMembers.length > 0
            ? r.teamMembers.length
            : 1;

        const row = map.get(key)!;
        if (r.position === 1) row.gold   += medalCount;
        if (r.position === 2) row.silver += medalCount;
        if (r.position === 3) row.bronze += medalCount;
        row.total += medalCount;

      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze,
  );
}


// ─── Helper: filtro de género reutilizable ────────────────────────────────────
function GenderToggle({
  value,
  onChange,
}: {
  value: GenderFilter;
  onChange: (v: GenderFilter) => void;
}) {
  const opts: { key: GenderFilter; label: string }[] = [
    { key: "all", label: "Todos"   },
    { key: "F",   label: "Damas"   },
    { key: "M",   label: "Varones" },
  ];
  return (
    <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {opts.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={[
            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
            value === key
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}


// ─── Componente principal ─────────────────────────────────────────────────────
export function AthleticsMedalTable({
  externalEventId,
  localSportId,
  eventName,
}: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("results");
  const [selectedInstitution, setSelectedInstitution] = useState<{
    universityAbrev: string;
    universityName: string;
  } | null>(null);

  const [medalSearch, setMedalSearch] = useState("");

  const { data = [], isLoading } = useAthleticsResultsByEvent(
    externalEventId,
    localSportId,
  );
  const { data: participatingInstitutions = [] } =
    useAthleticsParticipatingInstitutions(externalEventId, localSportId);

  // ── Hooks de pruebas combinadas (siempre se llaman, sin condiciones) ────────
  const { data: heptatlonData } = useAthleticsCombinedRanking(
    externalEventId,
    localSportId,
    "heptatlon",
  );
  const { data: decatlonData } = useAthleticsCombinedRanking(
    externalEventId,
    localSportId,
    "decatlon",
  );

  // ── Tabla de medallas (memorizada) ───────────────────────────────────────
  const medalRows = useMemo(() => buildMedalTable(data), [data]);

  const filteredMedalRows = useMemo(() => {
    const q = medalSearch.toLowerCase().trim();
    if (!q) return medalRows;
    return medalRows.filter(
      (r) =>
        r.university.toLowerCase().includes(q) ||
        r.universityAbrev.toLowerCase().includes(q),
    );
  }, [medalRows, medalSearch]);


  // ─── Estados de carga / vacío ─────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Cargando resultados de atletismo..." />
      </div>
    );

  if (data.length === 0)
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="font-medium">No hay resultados registrados aún.</p>
      </div>
    );


  const activeCategory = category ?? data[0]?.category;
  const currentData = data.find((d) => d.category === activeCategory);

  // ─── Tabs de vista principal ──────────────────────────────────────────────
  const VIEW_TABS: { key: ViewMode; label: string }[] = [
    { key: "results",   label: "📋 Resultados" },
    { key: "medals",    label: "🥇 Medallero"  },
    { key: "heptatlon", label: "⚡ Heptatlón"  },
    { key: "decatlon",  label: "🔥 Decatlón"   },
  ];


  return (
    <div className="space-y-5">

      {/* ── Selector de vista ─────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
        {VIEW_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={[
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
              viewMode === key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>


      {/* ── Tab: Medallero ────────────────────────────────────────────────── */}
      {viewMode === "medals" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-bold text-white text-sm tracking-wide uppercase">
              🥇 Medallero — Todas las categorías
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-yellow-200 pointer-events-none" />
              <input
                type="text"
                value={medalSearch}
                onChange={(e) => setMedalSearch(e.target.value)}
                placeholder="Buscar institución…"
                className="pl-8 pr-8 py-1.5 text-xs rounded-lg bg-white/20 border border-white/30 text-white placeholder-yellow-100 focus:outline-none focus:ring-2 focus:ring-white/50 w-52"
              />
              {medalSearch && (
                <button
                  onClick={() => setMedalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-200 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          {filteredMedalRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400 italic">
              {medalSearch
                ? `Sin resultados para "${medalSearch}".`
                : "Sin medallas registradas aún."}
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-12 px-3 py-2 text-center">Pos</th>
                  <th className="px-4 py-2 text-left">Institución</th>
                  <th className="w-16 px-3 py-2 text-center text-yellow-600">🥇 Oro</th>
                  <th className="w-16 px-3 py-2 text-center text-slate-500">🥈 Plata</th>
                  <th className="w-16 px-3 py-2 text-center text-orange-700">🥉 Bronce</th>
                  <th className="w-16 px-3 py-2 text-center font-bold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedalRows.map((row, i) => {
                  const posBadge =
                    i === 0
                      ? "bg-yellow-400 text-yellow-900"
                      : i === 1
                      ? "bg-slate-300 text-slate-700"
                      : i === 2
                      ? "bg-orange-400 text-orange-900"
                      : "bg-slate-100 text-slate-500";

                  return (
                    <tr
                      key={row.universityAbrev}
                      onClick={() =>
                        setSelectedInstitution({
                          universityAbrev: row.universityAbrev || row.university,
                          universityName:  row.university,
                        })
                      }
                      className="hover:bg-amber-50 cursor-pointer transition-colors group"
                      title={`Ver medallas de ${row.university}`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${posBadge}`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {row.university}
                        </div>
                        {row.universityAbrev && row.universityAbrev !== row.university && (
                          <div className="text-xs text-slate-400">{row.universityAbrev}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-yellow-600 text-base">
                        {row.gold || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-500 text-base">
                        {row.silver || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-orange-700 text-base">
                        {row.bronze || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-700 text-base">
                        {row.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}


      {/* ── Tab: Heptatlón ────────────────────────────────────────────────── */}
      {viewMode === "heptatlon" && (
        <div className="space-y-3">
          <GenderToggle value={gender} onChange={setGender} />
          <AthleticsCombinedRanking
            externalEventId={externalEventId}
            localSportId={localSportId}
            combinedType="heptatlon"
            genderFilter={gender}
          />
        </div>
      )}


      {/* ── Tab: Decatlón ─────────────────────────────────────────────────── */}
      {viewMode === "decatlon" && (
        <div className="space-y-3">
          <GenderToggle value={gender} onChange={setGender} />
          <AthleticsCombinedRanking
            externalEventId={externalEventId}
            localSportId={localSportId}
            combinedType="decatlon"
            genderFilter={gender}
          />
        </div>
      )}


      {/* ── Tab: Resultados ───────────────────────────────────────────────── */}
      {viewMode === "results" && (
        <>
          <div className="flex flex-wrap gap-3 items-center justify-between">

            <div className="flex flex-wrap gap-3 items-center">
              {/* Selector de categoría */}
              {data.length > 1 && (
                <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {data.map((d) => (
                    <button
                      key={d.category}
                      onClick={() => setCategory(d.category)}
                      className={[
                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide",
                        activeCategory === d.category
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      ].join(" ")}
                    >
                      {d.category}
                    </button>
                  ))}
                </div>
              )}

              {/* Filtro de género */}
              <GenderToggle value={gender} onChange={setGender} />
            </div>

            {/* Botón PDF */}
            {data.length > 0 && (
              <PDFDownloadLink
                document={
                  <AthleticsReportPDF
                    data={data}
                    eventName={eventName}
                    participatingInstitutions={participatingInstitutions}
                    combinedRankings={{
                      heptatlon: heptatlonData?.athletes ?? [],
                      decatlon:  decatlonData?.athletes  ?? [],
                    }}
                  />
                }
                fileName={`atletismo_${(eventName ?? "reporte").replace(/\s+/g, "_")}_completo.pdf`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                {({ loading }) =>
                  loading ? (
                    <><Spinner size="sm" /> Generando...</>
                  ) : (
                    <><FileDown className="h-3.5 w-3.5" /> Descargar PDF (todas las categorías)</>
                  )
                }
              </PDFDownloadLink>
            )}
          </div>

          {/* Tablas de eventos */}
          {currentData && (
            <div className="space-y-4">
              {currentData.events.map((event) => (
                <AthleticsEventTable
                  key={event.eventName}
                  event={event}
                  genderFilter={gender}
                />
              ))}
            </div>
          )}
        </>
      )}
    {selectedInstitution && (
        <InstitutionMedalsDrawer
          universityAbrev={selectedInstitution.universityAbrev}
          universityName={selectedInstitution.universityName}
          data={data}
          onClose={() => setSelectedInstitution(null)}
        />
      )}
    </div>
  );
}
