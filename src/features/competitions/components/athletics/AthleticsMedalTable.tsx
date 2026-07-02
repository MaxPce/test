// src/features/competitions/components/athletics/AthleticsMedalTable.tsx
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import {
  useAthleticsResultsByEvent,
  useAthleticsParticipatingInstitutions,
} from "../../api/athletics-results.queries";
import { Spinner } from "@/components/ui/Spinner";
import { AthleticsEventTable } from "./AthleticsEventTable";
import { AthleticsReportPDF } from "./AthleticsReportPDF";
import { AthleticsCombinedRanking } from "./AthleticsCombinedRanking";

type GenderFilter = "all" | "F" | "M";
type ViewMode = "results" | "heptatlon" | "decatlon";

interface Props {
  externalEventId: number;
  localSportId: number;
  eventName?: string;
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

  const { data = [], isLoading } = useAthleticsResultsByEvent(
    externalEventId,
    localSportId,
  );
  const { data: participatingInstitutions = [] } =
    useAthleticsParticipatingInstitutions(externalEventId, localSportId);

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

      {/* ── Tab: Resultados (código original sin cambios) ─────────────────── */}
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
    </div>
  );
}