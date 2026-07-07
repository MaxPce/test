// src/features/results/components/SwimmingMedalTable.tsx
import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Trophy, Medal, Star, FileText, FileSpreadsheet } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import {
  useSwimmingMedalTable,
  type SwimmingMedalRow,
} from '../api/swimmingMedalTable.queries';
import {
  applyTiedRanks,
  exportSwimmingPDF,
  exportSwimmingExcel,
} from '../utils/swimmingReport.utils';

interface SwimmingMedalTableProps {
  externalEventId: number;
  localSportId: number;
  eventName?: string; // nombre que aparece en el PDF/Excel
}

function getRankConfig(rank: number) {
  if (rank === 1) return { bg: 'bg-yellow-50', border: 'border-l-4 border-yellow-400', badge: 'bg-yellow-100 text-yellow-800', label: '🥇' };
  if (rank === 2) return { bg: 'bg-slate-50',  border: 'border-l-4 border-slate-400',  badge: 'bg-slate-100 text-slate-700',   label: '🥈' };
  if (rank === 3) return { bg: 'bg-amber-50',  border: 'border-l-4 border-amber-400',  badge: 'bg-amber-100 text-amber-800',   label: '🥉' };
  return null;
}

function MedalCell({ count, icon }: { count: number; icon: React.ReactNode }) {
  return (
    <td className="px-4 py-4 text-center whitespace-nowrap">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className={`text-sm font-bold tabular-nums ${count === 0 ? 'text-gray-300' : 'text-gray-800'}`}>
          {count}
        </span>
      </div>
    </td>
  );
}

function TableRow({ row }: { row: SwimmingMedalRow }) {
  const config = getRankConfig(row.rank);

  return (
    <tr className={`transition-colors hover:brightness-95 ${config ? `${config.bg} ${config.border}` : 'hover:bg-gray-50'}`}>
      {/* Posición */}
      <td className="px-4 py-4 whitespace-nowrap w-16">
        <div className="flex items-center gap-2">
          {config ? (
            <>
              <span className="text-xl">{config.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
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
          {row.institutionLogoUrl && (
            <img
              src={getImageUrl(row.institutionLogoUrl)}
              alt={row.institutionName}
              className="h-8 w-8 object-contain flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span className="text-sm font-semibold text-gray-900">{row.institutionName}</span>
        </div>
      </td>

      <MedalCell count={row.gold}   icon={<Trophy className="h-4 w-4 text-yellow-500" />} />
      <MedalCell count={row.silver} icon={<Medal  className="h-4 w-4 text-slate-400"  />} />
      <MedalCell count={row.bronze} icon={<Medal  className="h-4 w-4 text-amber-600"  />} />

      {/* Puntaje — con soporte de decimales */}
      <td className="px-4 py-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <Star className="h-4 w-4 text-blue-500" />
          <span className={`text-base font-bold tabular-nums ${row.rank <= 3 ? 'text-blue-700' : 'text-blue-500'}`}>
            {Number.isInteger(row.totalPoints)
              ? row.totalPoints
              : row.totalPoints.toFixed(2)}
          </span>
        </div>
      </td>
    </tr>
  );
}

export function SwimmingMedalTable({
  externalEventId,
  localSportId,
  eventName = 'Campeonato Nacional Universitario de Natación',
}: SwimmingMedalTableProps) {
  const { data, isLoading, isError } = useSwimmingMedalTable(externalEventId, localSportId);
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
          <Trophy className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p className="text-red-500 font-medium">Error al cargar el medallero</p>
        </CardBody>
      </Card>
    );
  }

  const rows = applyTiedRanks(data?.general ?? []);

  const handleExport = async (type: 'pdf' | 'xlsx') => {
    if (exporting) return;
    setExporting(type);
    try {
      if (type === 'pdf')  exportSwimmingPDF(rows, eventName);
      if (type === 'xlsx') exportSwimmingExcel(rows, eventName);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Medallero y Tabla de Puntajes</h3>
              <p className="text-blue-100 mt-1 text-sm">
                Clasificación general · Noveles + Avanzados
              </p>
            </div>
          </div>

          {/* Botones descarga — visibles solo si hay datos */}
          {rows.length > 0 && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!!exporting}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25
                           rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exporting === 'pdf' ? (
                  <Spinner size="sm" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                PDF
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={!!exporting}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25
                           rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exporting === 'xlsx' ? (
                  <Spinner size="sm" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda puntaje — basada en bases FEDUP art. 3.5.6 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-xs text-blue-700 font-medium mb-1">
          Escala de puntaje (FEDUP — art. 3.5.6):
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {([9, 7, 6, 5, 4, 3, 2, 1] as const).map((pts, i) => (
            <span key={i} className="text-xs text-blue-600">
              <b>{i + 1}°</b> = {pts} pts
            </span>
          ))}
          <span className="text-xs text-cyan-600 ml-2">
            · Postas: <b>doble puntaje</b>
          </span>
        </div>
        <p className="text-xs text-blue-500 mt-1">
          Máx. 2 ubicaciones/institución en individuales · Solo mejor posta por institución · Empate: oro → plata → bronce
        </p>
      </div>

      {/* Tabla */}
      <Card>
        {rows.length === 0 ? (
          <CardBody className="text-center py-16">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Sin resultados registrados aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Los puntajes aparecerán al ingresar tiempos y posiciones
            </p>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Pos.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Institución</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">🥇 Oro</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">🥈 Plata</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-amber-600 uppercase tracking-wider">🥉 Bronce</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">⭐ Pts</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row) => (
                  <TableRow key={row.institutionId} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}