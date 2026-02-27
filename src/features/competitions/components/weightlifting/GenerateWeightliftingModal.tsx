import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/utils/imageUrl';
import type { Registration } from '@/features/events/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phaseId: number;
  registrations: Registration[];
  onGenerate: (entries: { registrationId: number; weightClass: string | null }[]) => void;
  isLoading: boolean;
}

export function GenerateWeightliftingModal({
  isOpen,
  onClose,
  phaseId,
  registrations,
  onGenerate,
  isLoading,
}: Props) {
  // Estado: mapa registrationId → { selected, weightClass }
  const [entries, setEntries] = useState<
    Record<number, { selected: boolean; weightClass: string }>
  >(
    () =>
      Object.fromEntries(
        registrations.map((r) => [
          r.registrationId,
          { selected: true, weightClass: r.weightClass ?? '' },
        ]),
      ),
  );

  const toggleAll = () => {
    const allSelected = Object.values(entries).every((e) => e.selected);
    setEntries((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, e]) => [
          id,
          { ...e, selected: !allSelected },
        ]),
      ),
    );
  };

  const toggle = (id: number) =>
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }));

  const setWeightClass = (id: number, value: string) =>
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], weightClass: value },
    }));

  const selectedCount = Object.values(entries).filter((e) => e.selected).length;

  const handleSubmit = () => {
    const result = Object.entries(entries)
      .filter(([, e]) => e.selected)
      .map(([id, e]) => ({
        registrationId: Number(id),
        weightClass: e.weightClass.trim() || null,
      }));
    onGenerate(result);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar atletas a la fase" size="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-sm text-slate-600">
            {selectedCount} de {registrations.length} seleccionados
          </span>
          <button
            onClick={toggleAll}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {selectedCount === registrations.length
              ? 'Deseleccionar todos'
              : 'Seleccionar todos'}
          </button>
        </div>

        {/* Sub-header columnas */}
        <div className="grid grid-cols-[auto_1fr_80px] gap-3 px-1 text-xs font-semibold text-slate-400 uppercase">
          <span />
          <span>Atleta</span>
          <span className="text-center">División</span>
        </div>

        {/* Lista */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {registrations.map((reg) => {
            const entry = entries[reg.registrationId];
            const name = reg.athlete?.name ?? reg.team?.name ?? 'Sin nombre';
            const institution = reg.athlete?.institution ?? reg.team?.institution;
            const logoUrl = institution?.logoUrl;

            return (
              <div
                key={reg.registrationId}
                className={`grid grid-cols-[auto_1fr_80px] items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  entry.selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white opacity-50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggle(reg.registrationId)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    entry.selected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                  }`}
                >
                  {entry.selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Atleta */}
                <div className="flex items-center gap-2 min-w-0">
                  {logoUrl ? (
                    <img
                      src={getImageUrl(logoUrl)}
                      alt={institution?.name ?? ''}
                      className="h-7 w-7 rounded-md object-contain bg-white border border-slate-100 flex-shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-md bg-slate-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{name}</p>
                    {institution && (
                      <p className="text-xs text-slate-400 truncate">{institution.name}</p>
                    )}
                  </div>
                </div>

                {/* Input división */}
                <input
                  type="text"
                  placeholder="ej: 89"
                  value={entry.weightClass}
                  onChange={(e) => setWeightClass(reg.registrationId, e.target.value)}
                  disabled={!entry.selected}
                  maxLength={10}
                  className="w-full text-center text-sm border border-slate-300 rounded-lg px-2 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40
                             disabled:cursor-not-allowed bg-white"
                />
              </div>
            );
          })}
        </div>

        

        {/* Footer */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            className="flex-1"
            onClick={handleSubmit}
            disabled={selectedCount === 0 || isLoading}
            isLoading={isLoading}
          >
            Asignar {selectedCount > 0 ? `(${selectedCount})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
