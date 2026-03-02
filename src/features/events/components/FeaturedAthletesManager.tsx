import { useState } from 'react';

import { useFeaturedAthletesByCategory } from '../api/featured-athletes.queries'; 
import { useRegistrations } from '../api/registrations.queries';                  
import {
  useCreateFeaturedAthlete,
  useUpdateFeaturedAthlete,
  useDeleteFeaturedAthlete,
} from '../api/featured-athletes.mutations';

interface Props {
  eventCategoryId: number;
}

export function FeaturedAthletesManager({ eventCategoryId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // ✅ Hooks directos, sin useQuery wrapper
  const { data: featured = [] } = useFeaturedAthletesByCategory(eventCategoryId);
  const { data: registrations = [] } = useRegistrations({ eventCategoryId });

  const createMutation = useCreateFeaturedAthlete(eventCategoryId);
  const updateMutation = useUpdateFeaturedAthlete(eventCategoryId);
  const deleteMutation = useDeleteFeaturedAthlete(eventCategoryId);

  const resetForm = () => {
    setSelectedRegistrationId('');
    setReason('');
    setEditId(null);
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!reason.trim()) return;
    if (editId) {
      updateMutation.mutate({ id: editId, data: { reason } }, { onSuccess: resetForm });
    } else {
      if (!selectedRegistrationId) return;
      createMutation.mutate(
        { eventCategoryId, registrationId: Number(selectedRegistrationId), reason },
        { onSuccess: resetForm },
      );
    }
  };

  const handleEdit = (id: number, currentReason: string) => {
    setEditId(id);
    setReason(currentReason);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Atletas Destacados</h3>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          + Agregar destacado
        </button>
      </div>

      <ul className="space-y-2">
        {featured.map((fa) => {
          const name = fa.registration?.athlete?.name ?? fa.registration?.team?.name ?? '—';
          return (
            <li
              key={fa.featuredAthleteId}
              className="flex items-start justify-between rounded-lg border p-3 bg-white shadow-sm"
            >
              <div>
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-gray-500 mt-1">{fa.reason}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(fa.featuredAthleteId, fa.reason)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteMutation.mutate(fa.featuredAthleteId)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Quitar
                </button>
              </div>
            </li>
          );
        })}
        {featured.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No hay atletas destacados aún.
          </p>
        )}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
            <h4 className="font-semibold text-base">
              {editId ? 'Editar motivo' : 'Agregar atleta destacado'}
            </h4>

            {!editId && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Atleta participante</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={selectedRegistrationId}
                  onChange={(e) => setSelectedRegistrationId(Number(e.target.value))}
                >
                  <option value="">Selecciona un atleta...</option>
                  {registrations.map((reg) => {
                    const label = reg.athlete?.name ?? reg.team?.name ?? `#${reg.registrationId}`;
                    return (
                      <option key={reg.registrationId} value={reg.registrationId}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">¿Por qué es destacado?</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                rows={3}
                maxLength={500}
                placeholder="Ej: Mejor marca personal del torneo..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-gray-400 text-right">{reason.length}/500</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {editId ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
