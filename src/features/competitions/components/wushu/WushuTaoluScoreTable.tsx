import { useState, useMemo } from 'react';                          
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';                              
import {
  getWushuTaoluScoreTable,
  updateWushuTaoluScore,
} from '../../api/wushu.api';
import type { WushuTaoluParticipant } from '../../types/wushu.types';

interface Props {
  phaseId: number;
}

export function WushuTaoluScoreTable({ phaseId }: Props) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [search, setSearch]         = useState<string>('');         

  const { data: participants = [], isLoading } = useQuery<WushuTaoluParticipant[]>({
    queryKey: ['wushu-taolu-scores', phaseId],
    queryFn: () => getWushuTaoluScoreTable(phaseId),
  });

  // ← filtrado por nombre
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) =>
      p.participantName.toLowerCase().includes(q),
    );
  }, [participants, search]);

  const mutation = useMutation({
    mutationFn: ({
      participationId,
      total,
    }: {
      participationId: number;
      total: number;
    }) => updateWushuTaoluScore(participationId, { total }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-scores', phaseId] });
      setEditingId(null);
      setInputValue('');
    },
  });

  const handleStartEdit = (p: WushuTaoluParticipant) => {
    setEditingId(p.participationId);
    setInputValue(p.total !== null && p.total !== undefined ? String(p.total) : '');
  };

  const handleSave = (participationId: number) => {
    const total = parseFloat(inputValue);
    if (isNaN(total) || total < 0) return;
    mutation.mutate({ participationId, total });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    participationId: number,
  ) => {
    if (e.key === 'Enter') handleSave(participationId);
    if (e.key === 'Escape') { setEditingId(null); setInputValue(''); }
  };

  const formatTotal = (total: number | string | null) => {
    if (total === null || total === undefined) return '—';
    const num = typeof total === 'string' ? parseFloat(total) : total;
    return isNaN(num) ? '—' : num.toFixed(3);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Cargando tabla de puntuaciones...
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
        <span>No hay participantes registrados en esta fase.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">                      

      {/* ── Buscador ──────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar participante..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg
                     bg-white focus:outline-none focus:ring-2 focus:ring-blue-300
                     focus:border-blue-400 transition-colors placeholder:text-gray-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                       hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Atleta</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Institución</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Total</th>
              <th className="px-4 py-3 w-32" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No se encontraron participantes con ese nombre.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (                                 
                <tr key={p.participationId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono tabular-nums">
                    {p.rank ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {search.trim()
                      ? highlightMatch(p.participantName, search.trim())
                      : p.participantName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.institution ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === p.participationId ? (
                      <input
                        type="number"
                        min={0}
                        step={0.001}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, p.participationId)}
                        autoFocus
                        className="w-24 text-center border border-blue-400 rounded px-2 py-1
                                   focus:outline-none focus:ring-2 focus:ring-blue-300
                                   font-mono tabular-nums text-sm"
                      />
                    ) : (
                      <span className={`font-mono tabular-nums font-semibold ${
                        p.total !== null ? 'text-gray-800' : 'text-gray-300'
                      }`}>
                        {formatTotal(p.total)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === p.participationId ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSave(p.participationId)}
                          disabled={mutation.isPending}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded
                                     hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          {mutation.isPending ? '...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setInputValue(''); }}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded
                                     hover:bg-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border
                                   border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contador al filtrar */}
      {search.trim() && (
        <p className="text-xs text-gray-400 text-right">
          {filtered.length} de {participants.length} participante{participants.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ── Resalta la coincidencia en el nombre ──────────────────────────────────────
function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}