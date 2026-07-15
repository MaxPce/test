// src/features/competitions/components/shared/MedalDetailModal.tsx
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useMedalDetail } from '../../api/medalDetail.queries';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  externalEventId: number;
  localSportId: number;
  institutionId: number;
  institutionName: string;
}

const MEDAL_LABELS: Record<string, { label: string; color: string }> = {
  gold:    { label: '🥇 Oro',    color: 'text-amber-500' },
  silver:  { label: '🥈 Plata',  color: 'text-slate-400' },
  bronze:  { label: '🥉 Bronce', color: 'text-orange-600' },
  fifth:   { label: '5° Puesto', color: 'text-sky-500' },
  seventh: { label: '7° Puesto', color: 'text-violet-500' },
};

export const MedalDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  endpoint,
  externalEventId,
  localSportId,
  institutionId,
  institutionName,
}) => {
  const { data: athletes = [], isLoading } = useMedalDetail(
    endpoint,
    externalEventId,
    localSportId,
    institutionId,
  );

  return (
    // size="lg" = max-w-2xl (~672px), suficiente para las 4 columnas sin desbordar
    <Modal isOpen={isOpen} onClose={onClose} title={`Medallas — ${institutionName}`} size="lg">
      {/* Sin ancho forzado: dejamos que el Modal controle el max-width.
          overflow-x-auto solo por seguridad en pantallas muy angostas. */}
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && athletes.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">
            No se encontraron medallas para esta institución.
          </p>
        )}

        {!isLoading && athletes.length > 0 && (
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[20%]" />
              <col className="w-[32%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Atleta</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Categoría</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Fase</th>
                <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase">Medalla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {athletes.map((row) => {
                const medal = MEDAL_LABELS[row.medalType];
                return (
                  <tr key={`${row.registrationId}-${row.categoryName}-${row.phaseName}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-900 text-[13px] leading-snug break-words">
                      {row.athleteName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block max-w-full truncate rounded bg-sky-50 text-sky-700 text-xs font-medium px-2 py-1">
                        {row.categoryName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-xs leading-snug break-words">
                      {row.phaseName}
                    </td>
                    <td className={`py-2.5 px-3 text-center font-bold text-xs whitespace-nowrap ${medal.color}`}>
                      {medal.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
};

export default MedalDetailModal;