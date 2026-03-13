import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client'; 

interface AthleticsRow {
  phaseRegistrationId: number;
  registrationId: number;
  athleteName: string;
  institutionName: string;
  athleticsResultId: number | null;
  lane: number | null;
  section: string | null;
  time: string | null;
  notes: string | null;
  isDirty?: boolean;
}

interface Props {
  phaseId: number;
}

export default function AthleticsResultsTable({ phaseId }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<AthleticsRow[]>([]);

  const { data = [], isLoading } = useQuery<AthleticsRow[]>({
    queryKey: ['athletics-track-table', phaseId],
    queryFn: async () => {
      const res = await apiClient.get(`/competitions/phases/${phaseId}/athletics-track-table`);
      return res.data;
    },
    enabled: !!phaseId,
  });

  useEffect(() => {
    setRows(data.map((r) => ({ ...r, isDirty: false })));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (row: AthleticsRow) => {
      const payload = {
        phaseRegistrationId: row.phaseRegistrationId,
        lane: row.lane ?? null,
        section: row.section ?? null,
        time: row.time ?? null,
        notes: row.notes ?? null,
      };
      if (row.athleticsResultId) {
        await apiClient.patch(`/competitions/athletics/${row.athleticsResultId}`, payload);
      } else {
        await apiClient.post('/competitions/athletics', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletics-track-table', phaseId] });
      toast.success('Resultado guardado');
    },
    onError: () => {
      toast.error('Error al guardar el resultado');
    },
  });

  const handleChange = (id: number, patch: Partial<AthleticsRow>) => {
    setRows((prev) =>
      prev.map((r) =>
        r.phaseRegistrationId === id ? { ...r, ...patch, isDirty: true } : r,
      ),
    );
  };

  const handleSave = async (row: AthleticsRow) => {
    await saveMutation.mutateAsync(row);
    setRows((prev) =>
      prev.map((r) =>
        r.phaseRegistrationId === row.phaseRegistrationId
          ? { ...r, isDirty: false }
          : r,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No hay participantes asignados a esta serie. Usa "Asignar Participante" para agregar atletas.
      </div>
    );
  }

  // Ordenar por sección → tiempo
  const sorted = [...rows].sort((a, b) => {
    const sA = a.section ?? '';
    const sB = b.section ?? '';
    if (sA !== sB) return sA.localeCompare(sB);
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Sección</th>
              <th className="px-4 py-3 text-left">Carril</th>
              <th className="px-4 py-3 text-left">Atleta</th>
              <th className="px-4 py-3 text-left">Institución</th>
              <th className="px-4 py-3 text-left">Tiempo</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((row) => (
              <tr
                key={row.phaseRegistrationId}
                className={row.isDirty ? 'bg-amber-50' : 'hover:bg-slate-50 transition-colors'}
              >
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={row.section ?? ''}
                    placeholder="A"
                    maxLength={10}
                    onChange={(e) =>
                      handleChange(row.phaseRegistrationId, {
                        section: e.target.value || null,
                      })
                    }
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </td>

                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={row.lane ?? ''}
                    placeholder="1"
                    onChange={(e) =>
                      handleChange(row.phaseRegistrationId, {
                        lane: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </td>

                <td className="px-4 py-3 font-semibold text-slate-900">
                  {row.athleteName}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {row.institutionName || '—'}
                </td>

                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={row.time ?? ''}
                    placeholder="00:10.45"
                    onChange={(e) =>
                      handleChange(row.phaseRegistrationId, {
                        time: e.target.value || null,
                      })
                    }
                    className="w-28 rounded border border-slate-300 px-2 py-1 text-sm font-mono focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSave(row)}
                    disabled={saveMutation.isPending}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                      row.isDirty
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {saveMutation.isPending ? '...' : 'Guardar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
