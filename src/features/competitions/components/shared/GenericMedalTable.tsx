// src/features/competitions/components/shared/GenericMedalTable.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { GenericMedalRow, GenericMedalSummaryResponse } from '../../hooks/genericMedalTable';
import { MedalDetailModal } from './MedalDetailModal';

interface Props {
  externalEventId: number;
  localSportId: number;
  endpoint: string;         // e.g. "taekwondo-kyorugui-medal-table"
  queryKey: string;         // e.g. "taekwondo-kyorugui-medal-table"
  eventName?: string;
}

const MEDAL_COLS = [
  { key: 'gold',   label: '🥇 Oro',   color: 'text-amber-500'  },
  { key: 'silver', label: '🥈 Plata', color: 'text-slate-400'  },
  { key: 'bronze', label: '🥉 Bronce',color: 'text-orange-600' },
] as const;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export const GenericMedalTable: React.FC<Props> = ({
  externalEventId,
  localSportId,
  endpoint,
  queryKey,
  eventName = 'Medallero',
}) => {
  // ── Estado del modal de detalle por institución ──────────────────────
  const [selectedInstitution, setSelectedInstitution] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data: rows = [], isLoading, error, refetch } = useQuery<GenericMedalRow[]>({
    queryKey: [queryKey, externalEventId, localSportId],
    queryFn: async () => {
      const { data } = await apiClient.get<GenericMedalSummaryResponse>(
        `/${endpoint}/external/${externalEventId}/local-sport/${localSportId}/summary`,
      );
      return Array.isArray(data.general) ? data.general : [];
    },
    enabled: !!externalEventId && !!localSportId,
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
        <div className="h-16 bg-slate-100" />
        <div className="h-10 bg-slate-50" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-white border-t border-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (error instanceof Error ? error.message : 'Error desconocido');
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-rose-600">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-sm font-medium">Error al cargar el medallero: {message}</p>
        <button
          onClick={() => refetch()}
          className="text-sm px-4 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
        <p className="text-sm">Aún no hay medallas registradas para este deporte.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800 leading-tight truncate">
            Medallero General — {eventName}
          </h2>
          <div className="shrink-0 bg-amber-100 border border-amber-300 text-amber-800 text-sm font-bold px-4 py-1.5 rounded-lg">
            Medals
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-10 py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Universidad</th>
              {MEDAL_COLS.map((col) => (
                <th key={col.key} className={`w-24 py-2.5 px-3 text-center text-xs font-semibold uppercase tracking-wide ${col.color}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row.institutionId}
                onClick={() =>
                  setSelectedInstitution({ id: row.institutionId, name: row.institutionName })
                }
                className="bg-white hover:bg-slate-50 transition-colors duration-100 cursor-pointer"
              >
                <td className="py-2.5 px-3 text-slate-500 font-medium text-sm">{row.rank}.</td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                      {row.institutionLogoUrl ? (
                        <img src={row.institutionLogoUrl} alt={row.institutionName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 leading-none">
                          {getInitials(row.institutionName)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[240px]">
                      {row.institutionName.toUpperCase()}
                    </p>
                  </div>
                </td>
                {MEDAL_COLS.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="py-2.5 px-3 text-center">
                      {value > 0 ? (
                        <span className={`font-bold text-base ${col.color}`}>{value}</span>
                      ) : (
                        <span className="text-slate-200">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal de detalle por institución ── */}
      {selectedInstitution && (
        <MedalDetailModal
          isOpen={!!selectedInstitution}
          onClose={() => setSelectedInstitution(null)}
          endpoint={endpoint}
          externalEventId={externalEventId}
          localSportId={localSportId}
          institutionId={selectedInstitution.id}
          institutionName={selectedInstitution.name}
        />
      )}
    </>
  );
};

export default GenericMedalTable;