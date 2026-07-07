// src/features/results/components/SwimmingPhaseResults.tsx
import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ClipboardList, FileText, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import {
  useSwimmingFullResults,
  type SwimmingEventResult,
} from '../api/swimmingResults.queries';
import {
  exportSwimmingResultsPDF,
  exportSwimmingResultsExcel,
} from '../utils/swimmingReport.utils';

interface SwimmingPhaseResultsProps {
  externalEventId: number;
  localSportId: number;
  eventName?: string;
}

// ─── Sub-componente: fila de un resultado ────────────────────────────────────

function ResultRow({
  entry,
  index,
}: {
  entry: SwimmingEventResult['entries'][number];
  index: number;
}) {
  const isDisq =
    entry.notes && ['DQ', 'DNS', 'DNF', 'NS'].some((d) => entry.notes!.includes(d));

  const rowBg =
    isDisq           ? 'bg-white opacity-50' :
    entry.rank === 1 ? 'bg-yellow-50 border-l-4 border-yellow-400' :
    entry.rank === 2 ? 'bg-slate-50  border-l-4 border-slate-400'  :
    entry.rank === 3 ? 'bg-amber-50  border-l-4 border-amber-400'  :
    index % 2 === 0  ? 'bg-white'    : 'bg-gray-50';

  const rankLabel =
    entry.rank === 0 ? (
      <span className="text-xs text-gray-400">{entry.notes ?? '---'}</span>
    ) : (
      <span className="text-sm font-semibold text-gray-700 tabular-nums">
        {entry.isTied && <span className="text-blue-400 mr-0.5 text-xs">*</span>}
        {entry.rank}°
      </span>
    );

  return (
    <tr className={`transition-colors hover:brightness-95 ${rowBg}`}>
      <td className="px-3 py-2.5 text-center w-12">{rankLabel}</td>
      <td className="px-3 py-2.5 text-sm text-gray-800">{entry.athleteName}</td>
      <td className="px-3 py-2.5 text-center text-sm text-gray-500 w-12 tabular-nums">
        {entry.age ?? '—'}
      </td>
      <td className="px-3 py-2.5 text-sm text-gray-700">
        <span title={entry.institutionName}>
          {entry.institutionAbbrev ?? entry.institutionName}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center font-mono text-sm text-gray-700 whitespace-nowrap">
        {entry.finalTime ? (
          <>
            {entry.isExcluded && <span className="text-gray-400 mr-0.5">x</span>}
            {entry.finalTime}
            {entry.notes?.includes('MM') && (
              <span className="ml-1 text-xs font-bold text-cyan-600">MM</span>
            )}
          </>
        ) : (
          <span className="text-gray-400 text-xs">{entry.notes ?? '---'}</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-center w-14">
        {entry.points > 0 ? (
          <span
            className={`text-sm font-bold tabular-nums ${
              entry.rank <= 3 ? 'text-blue-700' : 'text-blue-500'
            }`}
          >
            {Number.isInteger(entry.points) ? entry.points : entry.points.toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-300 text-sm">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Sub-componente: card colapsable por prueba ───────────────────────────────

function EventCard({ ev }: { ev: SwimmingEventResult }) {
  const [open, setOpen] = useState(false);

  const hasDecimalPts = ev.entries.some(
    (e) => !Number.isInteger(e.points) && e.points > 0,
  );

  return (
    <Card>
      {/* Header colapsable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4
                   bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl
                   hover:brightness-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-blue-400 tabular-nums w-16 text-left shrink-0">
            Ev. {ev.eventNumber}
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">{ev.eventName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ev.categoryName}
              {ev.isRelay && ' · Posta — puntaje doble'}
              {ev.minMark && (
                <span className="ml-2 text-cyan-600 font-medium">MM: {ev.minMark}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {ev.entries.length} participantes
          </span>
          {open
            ? <ChevronUp   className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {/* Tabla colapsable */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-12">Pos.</th>
                <th className="px-3 py-2 text-left   text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-12">Edad</th>
                <th className="px-3 py-2 text-left   text-xs font-bold text-gray-700 uppercase tracking-wider">Institución</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Tiempo Final</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-blue-600 uppercase tracking-wider w-14">⭐ Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ev.entries.map((entry, i) => (
                <ResultRow key={i} entry={entry} index={i} />
              ))}
            </tbody>
          </table>

          {/* Nota al pie solo si hubo empate de tiempo en esta prueba */}
          {hasDecimalPts && (
            <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
              * Los puntos <span className="font-semibold">.50</span> corresponden
              a empates de tiempo divididos equitativamente.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SwimmingPhaseResults({
  externalEventId,
  localSportId,
  eventName = 'Campeonato Nacional Universitario de Natación',
}: SwimmingPhaseResultsProps) {
  const { data, isLoading, isError } = useSwimmingFullResults(externalEventId, localSportId);
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-16">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="text-center py-16">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p className="text-red-500 font-medium">Error al cargar los resultados</p>
        </CardBody>
      </Card>
    );
  }

  const events = data?.events ?? [];

  const handleExport = async (type: 'pdf' | 'xlsx') => {
    if (exporting || events.length === 0) return;
    setExporting(type);
    try {
      if (type === 'pdf')  exportSwimmingResultsPDF(events, eventName);
      if (type === 'xlsx') exportSwimmingResultsExcel(events, eventName);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header — mismo estilo que SwimmingMedalTable */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Resultados por Prueba</h3>
              <p className="text-blue-100 mt-1 text-sm">
                {events.length} pruebas · Todas las categorías
              </p>
            </div>
          </div>

          {events.length > 0 && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!!exporting}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25
                           rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exporting === 'pdf'
                  ? <Spinner size="sm" />
                  : <FileText className="h-4 w-4" />}
                PDF
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={!!exporting}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25
                           rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exporting === 'xlsx'
                  ? <Spinner size="sm" />
                  : <FileSpreadsheet className="h-4 w-4" />}
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de pruebas o estado vacío */}
      {events.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Sin resultados registrados aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Los resultados aparecerán al ingresar tiempos y posiciones
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <EventCard key={ev.eventCategoryId} ev={ev} />
          ))}
        </div>
      )}
    </div>
  );
}