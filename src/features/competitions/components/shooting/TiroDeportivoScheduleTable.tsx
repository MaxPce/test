import { useState } from 'react';
import { Target, Edit2 } from 'lucide-react';
import { useShootingPhaseScores } from '../../api/shooting.queries';
import { TiroDeportivoScoreModal } from './TiroDeportivoScoreModal';
import { getImageUrl } from '@/lib/utils/imageUrl';
import type { ShootingParticipant } from '../../types/shooting.types';

interface Props {
  phaseId: number;
}

export const TiroDeportivoScheduleTable = ({ phaseId }: Props) => {
  const { data, isLoading } = useShootingPhaseScores(phaseId);
  const participants: ShootingParticipant[] = Array.isArray(data) ? data : [];
  const [editingParticipant, setEditingParticipant] = useState<ShootingParticipant | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No hay participantes inscritos en esta fase</p>
      </div>
    );
  }

  const seriesCount = Math.max(...participants.map((p) => p.series?.length || 0), 0);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                Participante
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                Institución
              </th>
              {Array.from({ length: seriesCount }, (_, i) => (
                <th
                  key={i}
                  className="px-3 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider w-16"
                >
                  S{i + 1}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map((participant) => (
              <tr
                key={participant.participationId}
                className={`transition-colors hover:bg-slate-50 ${
                  participant.dns ? 'opacity-50 bg-gray-50' : ''
                }`}
              >
                {/* Participante */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    {participant.participantName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{participant.gender}</p>
                </td>

                {/* Institución */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {participant.institutionLogo && (
                      <img
                        src={getImageUrl(participant.institutionLogo)}
                        alt={participant.institution}
                        className="h-5 w-5 object-contain flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-slate-600 text-xs leading-tight">
                      {participant.institution}
                    </span>
                  </div>
                </td>

                {/* Series */}
                {Array.from({ length: seriesCount }, (_, i) => (
                  <td key={i} className="px-3 py-3 text-center">
                    {participant.dns ? (
                      <span className="text-slate-300">—</span>
                    ) : participant.series?.[i] != null ? (
                      <span className="font-mono font-medium text-slate-800">
                        {participant.series[i].toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}

                {/* Total */}
                <td className="px-4 py-3 text-center">
                  {participant.dns ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                      DNS
                    </span>
                  ) : participant.total != null ? (
                    <span className="text-lg font-bold text-blue-600 font-mono">
                      {Number(participant.total).toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setEditingParticipant(participant)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                               text-xs font-semibold text-blue-600 border border-blue-200
                               hover:bg-blue-50 hover:border-blue-400 transition-all"
                  >
                    <Edit2 className="h-3 w-3" />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingParticipant && (
        <TiroDeportivoScoreModal
          participant={editingParticipant}
          phaseId={phaseId}
          isOpen={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
          seriesCount={seriesCount || 6}
        />
      )}
    </>
  );
};
