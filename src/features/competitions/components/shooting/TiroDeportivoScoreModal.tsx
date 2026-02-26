import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUpdateShootingScore, useSetShootingDns } from '../../api/shooting.mutations';
import type { ShootingParticipant } from '../../types/shooting.types';

interface Props {
  participant: ShootingParticipant;
  phaseId: number;
  isOpen: boolean;
  onClose: () => void;
  seriesCount?: number;
}

const ALL_SERIES_LABELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];

export const TiroDeportivoScoreModal = ({
  participant,
  phaseId,
  isOpen,
  onClose,
  seriesCount = 6,
}: Props) => {
  const [series, setSeries] = useState<string[]>(Array(seriesCount).fill(''));

  const updateMutation = useUpdateShootingScore();
  const dnsMutation = useSetShootingDns();

  useEffect(() => {
    if (participant.series && participant.series.length > 0) {
      const filled = Array(seriesCount).fill('');
      participant.series.forEach((val, i) => {
        if (i < seriesCount) filled[i] = String(val);
      });
      setSeries(filled);
    } else {
      setSeries(Array(seriesCount).fill(''));
    }
  }, [participant, seriesCount]);

  if (!isOpen) return null;

  // Solo las series con valor real (no vacíos)
  const parsedSeries = series
    .map((s) => parseFloat(s))
    .filter((n) => !isNaN(n));

  const total = parseFloat(parsedSeries.reduce((a, b) => a + b, 0).toFixed(1));

  // Permite guardar con al menos 1 serie ingresada
  const hasAnySeries = parsedSeries.length > 0;

  const handleSeriesChange = (index: number, value: string) => {
    if (value === '' || /^\d{1,3}(\.\d{0,1})?$/.test(value)) {
      const num = parseFloat(value);
      if (value === '' || num >= 0) {
        const updated = [...series];
        updated[index] = value;
        setSeries(updated);
      }
    }
  };

  const handleSubmit = () => {
    if (!hasAnySeries) {
      toast.error('Ingresa al menos una serie');
      return;
    }

    updateMutation.mutate(
      {
        participationId: participant.participationId,
        data: { series: parsedSeries },
      },
      {
        onSuccess: () => {
          toast.success('Puntaje guardado correctamente');
          onClose();
        },
        onError: () => {
          toast.error('Error al guardar el puntaje');
        },
      },
    );
  };

  const handleDns = () => {
    dnsMutation.mutate(participant.participationId, {
      onSuccess: () => {
        toast.success(`${participant.participantName} marcado como DNS`);
        onClose();
      },
      onError: () => {
        toast.error('Error al marcar DNS');
      },
    });
  };

  const isLoading = updateMutation.isPending || dnsMutation.isPending;

  const gridCols =
    seriesCount <= 3 ? 'grid-cols-3' :
    seriesCount <= 4 ? 'grid-cols-4' :
    seriesCount <= 6 ? 'grid-cols-3' :
    'grid-cols-4';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full mx-4 shadow-xl"
        style={{ maxWidth: seriesCount > 6 ? '560px' : '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🎯</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registrar Puntaje</h2>
            <p className="text-sm text-gray-500 font-medium">
              {participant.participantName}
            </p>
            <p className="text-xs text-gray-400">{participant.institution}</p>
          </div>
        </div>

        {/* Series inputs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Series
            </p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {seriesCount} serie{seriesCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={`grid ${gridCols} gap-3`}>
            {ALL_SERIES_LABELS.slice(0, seriesCount).map((label, index) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400 text-center">
                  {label}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={series[index]}
                  onChange={(e) => handleSeriesChange(index, e.target.value)}
                  className="w-full px-2 py-2 text-center border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             font-mono text-lg font-bold text-gray-800
                             hover:border-gray-300 transition-colors"
                  placeholder="—"
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide">
            Total
          </p>
          <span className="text-3xl font-bold text-blue-600 font-mono">
            {hasAnySeries ? total.toFixed(1) : '—'}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg
                       hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleDns}
            disabled={isLoading}
            className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg
                       hover:bg-orange-50 transition-colors text-sm font-medium"
          >
            DNS
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !hasAnySeries}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors disabled:bg-gray-300
                       disabled:cursor-not-allowed text-sm font-semibold"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
