// src/components/JudoMedalTable.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client'; // ajusta la ruta según tu proyecto
import type { JudoMedalRow, JudoMedalSummaryResponse } from '../../types/judoMedalTable';

interface JudoMedalTableProps {
  externalEventId: number;
  localSportId: number;
  eventName?: string;
  eventLocation?: string;
}

const MEDAL_COLS = [
  { key: 'gold',    label: '1st place', color: 'text-amber-500'  },
  { key: 'silver',  label: '2nd place', color: 'text-slate-500'  },
  { key: 'bronze',  label: '3rd place', color: 'text-orange-600' },
  { key: 'fifth',   label: '5th place', color: 'text-sky-500'    },
  { key: 'seventh', label: '7th place', color: 'text-violet-500' },
] as const;

type MedalKey = typeof MEDAL_COLS[number]['key'];

export const JudoMedalTable: React.FC<JudoMedalTableProps> = ({
  externalEventId,
  localSportId,
  eventName = 'Medallero General',
  eventLocation = '',
}) => {
  const [rows, setRows]     = useState<JudoMedalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<JudoMedalSummaryResponse>(
        `/judo-medal-table/external/${externalEventId}/local-sport/${localSportId}/summary`,
      );
      setRows(Array.isArray(data.general) ? data.general : []);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Error desconocido');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [externalEventId, localSportId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
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

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-rose-600">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-sm font-medium">Error al cargar el medallero: {error}</p>
        <button
          onClick={fetchData}
          className="text-sm px-4 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
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

  // ── Table ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      {/* Header estilo FEDDUP */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-800 leading-tight truncate">
            Medallero General — {eventName}
          </h2>
          {eventLocation && (
            <p className="text-xs text-slate-500 mt-0.5">{eventLocation}</p>
          )}
        </div>
        <div className="shrink-0 bg-amber-100 border border-amber-300 text-amber-800 text-sm font-bold px-4 py-1.5 rounded-lg">
          Medals
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="w-10 py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              #
            </th>
            <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Universidad
            </th>
            {MEDAL_COLS.map((col) => (
              <th
                key={col.key}
                className={`w-24 py-2.5 px-3 text-center text-xs font-semibold uppercase tracking-wide ${col.color}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.institutionId}
              className="bg-white hover:bg-slate-50 transition-colors duration-100"
            >
              {/* Rank */}
              <td className="py-2.5 px-3 text-slate-500 font-medium text-sm">
                {row.rank}.
              </td>

              {/* Institución */}
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-400 leading-none">
                      {getInitials(row.institutionName)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    
                    <p className="text-xs text-slate-400 truncate max-w-[240px]">
                      {row.institutionName.toUpperCase()}
                    </p>
                  </div>
                </div>
              </td>

              {/* Medallas */}
              {MEDAL_COLS.map((col) => {
                const value = row[col.key as MedalKey];
                return (
                  <td key={col.key} className="py-2.5 px-3 text-center">
                    {value > 0 ? (
                      <span className={`font-bold text-base ${col.color}`}>
                        {value}
                      </span>
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
  );
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getAcronym(name: string): string {
  const stopWords = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en', 'a']);
  return name
    .split(/\s+/)
    .filter((w) => !stopWords.has(w.toLowerCase()))
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 5);
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default JudoMedalTable;