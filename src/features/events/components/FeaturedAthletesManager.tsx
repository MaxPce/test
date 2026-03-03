import { useState } from 'react';

import { usePhases }                  from '@/features/competitions/api/phases.queries';
import { usePhaseRegistrations }       from '@/features/competitions/api/phaseRegistrations.queries';
import { useFeaturedAthletesByCategory,
         useFeaturedAthletesByPhase }  from '../api/featured-athletes.queries';
import { useRegistrations }            from '../api/registrations.queries';
import {
  useCreateFeaturedAthlete,
  useUpdateFeaturedAthlete,
  useDeleteFeaturedAthlete,
  useUpsertFeaturedAthleteByPhase,
  useDeleteFeaturedAthleteByPhase,
} from '../api/featured-athletes.mutations';

// ─────────────────────────────────────────────────────────────────────────────
// Normalización: unifica PhaseRegistration[] y Registration[] en una sola forma
// ─────────────────────────────────────────────────────────────────────────────

interface NormalizedReg {
  key: number;
  registrationId: number;
  registration: any;
}

function toNormalizedRegs(
  phaseRegs: any[],
  fallback: any[],
): NormalizedReg[] {
  // Si la fase tiene registrations asignadas, usarlas
  if (phaseRegs.length > 0) {
    return phaseRegs.map((pr) => ({
      key:            pr.phaseRegistrationId,
      registrationId: pr.registrationId,
      registration:   pr.registration,
    }));
  }
  // Si no, usar todas las registrations de la categoría como fallback
  return fallback.map((reg) => ({
    key:            reg.registrationId,
    registrationId: reg.registrationId,
    registration:   reg,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper para mostrar el nombre de un atleta/equipo dado su Registration
// ─────────────────────────────────────────────────────────────────────────────

function getNameFromRegistration(registration: any): string {
  if (!registration) return '—';
  const a = registration.athlete;
  if (a) {
    // Soportar tanto firstName+lastName como campo name único
    if (a.firstName) {
      return `${a.firstName}${a.lastName ? ' ' + a.lastName : ''}`.trim();
    }
    if (a.name) return a.name;
    return `#${registration.registrationId}`;
  }
  const t = registration.team;
  if (t) return t.name ?? `#${registration.registrationId}`;
  return `Inscripción #${registration?.registrationId ?? '?'}`;
}

const phaseTypeLabel: Record<string, string> = {
  eliminacion: 'Eliminación',
  grupo:       'Grupos',
  mejor_de_3:  'Mejor de 3',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: fila de gestión de destacado por fase
// ─────────────────────────────────────────────────────────────────────────────

interface PhaseRowProps {
  phase:                   { phaseId: number; name: string; type: string };
  eventCategoryId:         number;
  fallbackRegistrations:   any[];  // ← registrations de la categoría completa
}

function PhaseFeaturedAthleteRow({ phase, eventCategoryId, fallbackRegistrations }: PhaseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [regId,     setRegId]     = useState('');
  const [reason,    setReason]    = useState('');

  const { data: featuredList = [] } = useFeaturedAthletesByPhase(phase.phaseId);
  const { data: phaseRegs    = [] } = usePhaseRegistrations(phase.phaseId);
  const upsert = useUpsertFeaturedAthleteByPhase();
  const remove = useDeleteFeaturedAthleteByPhase(phase.phaseId);

  // ← FIX #1: Si la fase no tiene registrations asignadas,
  //           usar las registrations de la categoría como fallback
  const normalizedRegs = toNormalizedRegs(phaseRegs, fallbackRegistrations);

  const current = featuredList[0] ?? null;

  // ← FIX #2: Buscar en normalizedRegs (no en phaseRegs vacío)
  const currentRegistration = current
    ? normalizedRegs.find((r) => r.registrationId === current.registrationId)?.registration ?? null
    : null;

  const handleOpenEdit = () => {
    setRegId(current ? String(current.registrationId) : '');
    setReason(current?.reason ?? '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setRegId('');
    setReason('');
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!regId) return;
    upsert.mutate(
      { phaseId: phase.phaseId, eventCategoryId, registrationId: Number(regId), reason },
      { onSuccess: handleCancel },
    );
  };

  const handleDelete = () => {
    if (current) remove.mutate(current.featuredAthleteId);
  };

  return (
    <li className="rounded-lg border p-3 bg-white shadow-sm space-y-2">

      {/* ── Cabecera de la fase ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{phase.name}</p>
          <p className="text-xs text-gray-400">
            {phaseTypeLabel[phase.type] ?? phase.type}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleOpenEdit}
            className="text-xs px-2.5 py-1 rounded-md border border-blue-300
                       text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {current ? 'Editar' : '+ Designar'}
          </button>
        )}
      </div>

      {/* ── Atleta designado (solo lectura) ────────────────────────────── */}
      {current && !isEditing && (
        <div className="flex items-center justify-between bg-amber-50
                        border border-amber-200 rounded-lg px-3 py-2">
          <div className="min-w-0">
            {/* ← FIX #2: Ahora usa currentRegistration en lugar de athleteReg?.registration */}
            <p className="text-sm font-medium text-amber-900 truncate">
              ⭐ {getNameFromRegistration(currentRegistration)}
            </p>
            {current.reason && (
              <p className="text-xs text-amber-700 mt-0.5 truncate max-w-xs">
                {current.reason}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={remove.isPending}
            className="shrink-0 ml-3 text-xs text-red-500 hover:text-red-700
                       disabled:opacity-50 transition-colors"
          >
            Quitar
          </button>
        </div>
      )}

      {/* ── Formulario de designación / edición ────────────────────────── */}
      {isEditing && (
        <div className="space-y-2 pt-1">
          <select
            value={regId}
            onChange={(e) => setRegId(e.target.value)}
            className="w-full text-sm border rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">— Seleccionar atleta —</option>
            {/* ← FIX #1: Ahora usa normalizedRegs (nunca vacío si hay inscritos) */}
            {normalizedRegs.map((nr) => (
              <option key={nr.key} value={String(nr.registrationId)}>
                {getNameFromRegistration(nr.registration)}
              </option>
            ))}
          </select>

          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo por el que es destacado (opcional)..."
            maxLength={300}
            className="w-full text-sm border rounded-md px-3 py-2 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-400
                       placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 text-right">{reason.length}/300</p>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="text-xs px-3 py-1.5 rounded-md border hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!regId || upsert.isPending}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white
                         hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {upsert.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  eventCategoryId: number;
}

export function FeaturedAthletesManager({ eventCategoryId }: Props) {
  const [open,                    setOpen]                    = useState(false);
  const [selectedRegistrationId,  setSelectedRegistrationId]  = useState<number | ''>('');
  const [reason,                  setReason]                  = useState('');
  const [editId,                  setEditId]                  = useState<number | null>(null);

  const { data: featured      = [] } = useFeaturedAthletesByCategory(eventCategoryId);
  const { data: registrations = [] } = useRegistrations({ eventCategoryId });
  const { data: phases        = [] } = usePhases(eventCategoryId);

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
    <div className="space-y-6">

      {/* ── Sección: Por Categoría ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Atletas Destacados</h3>
            <p className="text-xs text-gray-400 mt-0.5">Destacados generales de la categoría</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Agregar destacado
          </button>
        </div>

        <ul className="space-y-2">
          {featured.map((fa) => {
            const name =
              fa.registration?.athlete?.name ??
              fa.registration?.team?.name ??
              '—';
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
                    onClick={() => handleEdit(fa.featuredAthleteId, fa.reason ?? '')}
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
      </div>

      {/* ── Sección: Por Fase ───────────────────────────────────────────── */}
      {phases.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <div>
            <h4 className="text-base font-semibold text-gray-700">Destacado por Fase</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Un atleta destacado por cada fase de la categoría
            </p>
          </div>
          <ul className="space-y-2">
            {phases.map((phase) => (
              <PhaseFeaturedAthleteRow
                key={phase.phaseId}
                phase={phase}
                eventCategoryId={eventCategoryId}
                fallbackRegistrations={registrations} 
              />
            ))}
          </ul>
        </div>
      )}

      {/* ── Modal: Agregar / Editar destacado por categoría ────────────── */}
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
                    const label =
                      reg.athlete?.name ?? reg.team?.name ?? `#${reg.registrationId}`;
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
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md
                           hover:bg-blue-700 disabled:opacity-50"
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
