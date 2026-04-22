// src/competitions/components/score-tables/ScoreTables.tsx
import React, { useState } from 'react';
import { useScoreTables } from '../../hooks/useScoreTables';
import type { ScoreRow, ScoreTableKey, ScoreTab } from '../../types/score-tables.types';

// ─── Constantes ───────────────────────────────────────────────────────────────

const TABS: ScoreTab[] = [
  { key: 'general',   label: 'General'   },
  { key: 'damas',     label: 'Damas'     },
  { key: 'varones',   label: 'Varones'   },
  { key: 'noveles',   label: 'Noveles'   },
  { key: 'avanzados', label: 'Avanzados' },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[6, 40, 10, 8, 8, 8].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-4 w-${w} rounded bg-orange-100`} />
        </td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="mb-4 h-12 w-12 text-orange-200"
            fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3h16.5M3.75 3H2.25M20.25 3h1.5M9 7.5h6M9 10.5h6M9 13.5h3"
            />
          </svg>
          <p className="text-sm font-medium text-gray-400">Aún no hay puntajes registrados</p>
          <p className="mt-1 text-xs text-gray-300">
            Los puntajes aparecerán aquí una vez que se clasifiquen las fases.
          </p>
        </div>
      </td>
    </tr>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white shadow-sm">1</span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700">2</span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">3</span>
    );
  return <span className="text-sm font-medium text-gray-500">{rank}</span>;
}

function ScoreTableRow({ row, index }: { row: ScoreRow; index: number }) {
  const isFirst = row.rank === 1;
  return (
    <tr className={[
      'transition-colors duration-150',
      isFirst
        ? 'bg-gradient-to-r from-amber-50 to-orange-50 font-semibold'
        : index % 2 === 0
        ? 'bg-white hover:bg-orange-50/40'
        : 'bg-gray-50/60 hover:bg-orange-50/40',
    ].join(' ')}>
      <td className="w-12 px-4 py-3 text-center">
        <RankBadge rank={row.rank} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {isFirst && <span className="text-amber-400" aria-hidden="true">★</span>}
          <span className={['text-sm', isFirst ? 'font-semibold text-orange-700' : 'text-gray-700'].join(' ')}>
            {row.institutionName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={['text-sm font-bold tabular-nums', isFirst ? 'text-orange-600' : 'text-gray-800'].join(' ')}>
          {row.points}
        </span>
      </td>
      {[
        { emoji: '🥇', label: 'Oro',    val: row.gold   },
        { emoji: '🥈', label: 'Plata',  val: row.silver },
        { emoji: '🥉', label: 'Bronce', val: row.bronze },
      ].map(({ emoji, label, val }) => (
        <td key={label} className="px-4 py-3 text-center">
          <span className="inline-flex items-center gap-1 text-sm tabular-nums">
            <span aria-label={label}>{emoji}</span>
            <span className="font-medium text-gray-700">{val}</span>
          </span>
        </td>
      ))}
    </tr>
  );
}

function ScoreTable({ rows, loading }: { rows: ScoreRow[]; loading: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-orange-100 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            {['Pos.', 'Universidad', 'Pts', '🥇', '🥈', '🥉'].map((col, i) => (
              <th
                key={col}
                className={[
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider',
                  i === 1 ? 'text-left' : 'text-center',
                ].join(' ')}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-orange-50">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : rows.length === 0 ? (
            <EmptyState />
          ) : (
            rows.map((row, index) => (
              <ScoreTableRow key={row.institutionId} row={row} index={index} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ScoreTablesProps {
  externalEventId: number | string;
  localSportId: number | string;      
}

export function ScoreTables({ externalEventId, localSportId }: ScoreTablesProps) {
  const [activeTab, setActiveTab] = useState<ScoreTableKey>('general');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useScoreTables(externalEventId, localSportId);

  const activeRows: ScoreRow[] = data?.[activeTab] ?? [];
  const loading = isLoading || isFetching;

  const errorMessage = isError
    ? ((error as any)?.response?.data?.message ?? 'Error al cargar los puntajes.')
    : null;

  return (
    <section className="w-full space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tabla de Puntajes</h2>
          
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          aria-label="Actualizar puntajes"
          className={[
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
            'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm',
            'transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-md',
            'active:scale-95 disabled:cursor-not-allowed disabled:opacity-60',
          ].join(' ')}
        >
          <svg
            className={['h-4 w-4', loading ? 'animate-spin' : ''].join(' ')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.75a.75.75 0 00-1.5 0v4.5zm.75-6a.75.75 0 110-1.5.75.75 0 010 1.5z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Categorías de puntaje"
        className="flex flex-wrap gap-1 rounded-xl border border-orange-100 bg-orange-50/60 p-1"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
                'min-w-[70px] whitespace-nowrap',
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-orange-100 hover:text-orange-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel activo */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <ScoreTable rows={activeRows} loading={loading} />
      </div>

      {!loading && activeRows.length > 0 && (
        <p className="text-right text-xs text-gray-400">
          * Empate desempatado por mayor cantidad de 🥇 → 🥈 → 🥉
        </p>
      )}
    </section>
  );
}

export default ScoreTables;