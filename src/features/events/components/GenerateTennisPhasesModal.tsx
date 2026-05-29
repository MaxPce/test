// src/features/competitions/components/GenerateTennisPhasesModal.tsx
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Swords, Users, Trophy } from 'lucide-react';
import {
  useGenerateTennisPhases,
  type TennisGenerationMode,
} from '@/features/competitions/api/tennis-phases.mutations';
import type { TennisPhaseFormat } from '@/features/competitions/api/tennis-phases.api';

// ─── Opciones de formato (igual que Wushu) ────────────────────────────────────

const FORMAT_OPTIONS: {
  value: TennisPhaseFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: 'single_elimination',
    label: 'Eliminación Directa',
    description: 'Los atletas compiten en llaves de eliminación directa.',
    icon: <Swords size={14} />,
    activeClass: 'border-red-500 bg-red-50 text-red-700',
  },
  {
    value: 'round_robin',
    label: 'Round Robin',
    description: 'Todos los atletas se enfrentan entre sí.',
    icon: <Users size={14} />,
    activeClass: 'border-blue-500 bg-blue-50 text-blue-700',
  },
  {
    value: 'best_of_3',
    label: 'Mejor de 3',
    description: 'Las series se deciden al mejor de 3 partidos.',
    icon: <Trophy size={14} />,
    activeClass: 'border-amber-500 bg-amber-50 text-amber-700',
  },
];

// ─── Opciones de modo de generación ──────────────────────────────────────────

const MODE_OPTIONS: {
  value: TennisGenerationMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'with_matches',
    label: 'Fases + Matches',
    description: 'Genera las fases con todos los matches del cuadro listos.',
  },
  {
    value: 'phases_only',
    label: 'Solo fases (sin matches)',
    description:
      'Genera las fases con los atletas asignados. Puedes crear grupos y clasificar después.',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GenerateTennisPhasesModalProps {
  isOpen: boolean;   
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  allRegistrations: any[];
}


// ─── Componente ───────────────────────────────────────────────────────────────

export function GenerateTennisPhasesModal({
  isOpen,
  onClose,
  eventCategoryId,
  categoryName,
  allRegistrations,
}: GenerateTennisPhasesModalProps) {
  const mutation = useGenerateTennisPhases();

  const [selectedFormat, setSelectedFormat] =
    useState<TennisPhaseFormat>('single_elimination');
  const [selectedMode, setSelectedMode] =
    useState<TennisGenerationMode>('with_matches');

  const registrationIds = useMemo(
    () => allRegistrations.map((r) => r.registrationId as number),
    [allRegistrations],
  );

  const handleGenerate = async () => {
    if (registrationIds.length === 0) return;

    // Nombre de la fase según el formato
    const phaseNameMap: Record<TennisPhaseFormat, string> = {
      single_elimination: 'Cuadro de Eliminación',
      round_robin: 'Fase de Grupos',
      best_of_3: 'Serie Mejor de 3',
    };

    try {
      await mutation.mutateAsync({
        eventCategoryId,
        format: selectedFormat,
        mode: selectedMode,
        registrationIds,
        // ↓ estos dos campos extras que el backend necesita
        generateMatches: selectedMode === 'with_matches',
        groups: [
          {
            name: phaseNameMap[selectedFormat],
            format: selectedFormat,
            registrationIds,
          },
        ],
      });
      onClose();
    } catch (err: any) {
      console.error('Error generando fases Tennis:', err?.response?.data ?? err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Generar Fases — ${categoryName}`}
      size="md"
    >
      <div className="space-y-5">

        {/* Formato */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Tipo de formato
          </p>
          <div className="flex flex-col gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all',
                  selectedFormat === opt.value
                    ? opt.activeClass
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={selectedFormat === opt.value}
                  onChange={() => setSelectedFormat(opt.value)}
                  className="mt-0.5 accent-current"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    {opt.icon}
                    {opt.label}
                  </div>
                  <p className="mt-0.5 text-xs opacity-75">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Modo de generación */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            ¿Qué deseas generar?
          </p>
          <div className="flex flex-col gap-2">
            {MODE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all',
                  selectedMode === opt.value
                    ? 'border-slate-600 bg-slate-50 text-slate-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="mode"
                  value={opt.value}
                  checked={selectedMode === opt.value}
                  onChange={() => setSelectedMode(opt.value)}
                  className="mt-0.5 accent-slate-700"
                />
                <div>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Resumen */}
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Se procesarán{' '}
          <span className="font-semibold text-slate-700">
            {registrationIds.length} atleta(s)
          </span>{' '}
          inscrito(s) en esta categoría.
        </p>

        {/* Acciones */}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={registrationIds.length === 0 || mutation.isPending}
          >
            {mutation.isPending
              ? 'Generando...'
              : `Generar fases (${registrationIds.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}