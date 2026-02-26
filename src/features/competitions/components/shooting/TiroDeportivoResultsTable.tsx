import { useState } from 'react';
import { useShootingPhaseScores } from '../../api/shooting.queries';
import { TiroDeportivoScoreModal } from './TiroDeportivoScoreModal';
import { getImageUrl } from '@/lib/utils/imageUrl';
import type { ShootingParticipant } from '../../types/shooting.types';

interface Props {
  phaseId: number;
  isAdmin?: boolean;
  sortByScore?: boolean;
}

const MEDAL_COLORS: Record<number, string> = {
  1: 'text-yellow-600',
  2: 'text-gray-500',
  3: 'text-amber-700',
};

export const TiroDeportivoResultsTable = ({
  phaseId,
  isAdmin = false,
  sortByScore = false,
}: Props) => {
  const { data, isLoading } = useShootingPhaseScores(phaseId);

  const rawParticipants: ShootingParticipant[] = Array.isArray(data) ? data : [];

  const participants = sortByScore
    ? [...rawParticipants].sort((a, b) => {
        if (a.dns && !b.dns) return 1;
        if (!a.dns && b.dns) return -1;
        if (a.total === null && b.total === null) return 0;
        if (a.total === null) return 1;
        if (b.total === null) return -1;
        return (b.total ?? 0) - (a.total ?? 0);
      })
    : rawParticipants;

  const [editingParticipant, setEditingParticipant] =
    useState<ShootingParticipant | null>(null);

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
        <p>No hay participantes inscritos en esta fase</p>
        <p className="text-sm mt-2">
          Usa el botón "Agregar Participantes" para añadirlos
        </p>
      </div>
    );
  }

  const seriesCount = Math.max(
    ...participants.map((p) => p.series?.length || 0),
    6,
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nombre y Apellido
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Institución
              </th>
              {Array.from({ length: seriesCount }, (_, i) => (
                <th
                  key={i}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-14"
                >
                  S{i + 1}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                TOTAL
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.map((participant, index) => {
              const displayRank = participant.rank ?? (participant.dns ? null : index + 1);
              const medalColor = displayRank ? MEDAL_COLORS[displayRank] : '';

              return (
                <tr
                  key={participant.participationId}
                  className={`hover:bg-gray-50 transition-colors ${
                    participant.dns ? 'opacity-50' : ''
                  }`}
                >
                  {/* Posición */}
                  <td className="px-3 py-3 text-center">
                    {participant.dns ? (
                      <span className="text-xs text-gray-400 font-medium">DNS</span>
                    ) : displayRank ? (
                      <span className={`text-sm font-bold ${medalColor || 'text-gray-700'}`}>
                        {displayRank}°
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {participant.participantName}
                    </div>
                    <div className="text-xs text-gray-500">{participant.gender}</div>
                  </td>

                  {/* Institución */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      {participant.institutionLogo && (
                        <img
                          src={getImageUrl(participant.institutionLogo)}
                          alt={participant.institution}
                          className="h-5 w-5 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-gray-700">{participant.institution}</span>
                    </div>
                  </td>

                  {/* Series */}
                  {Array.from({ length: seriesCount }, (_, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      <span className="font-mono text-gray-800">
                        {participant.series?.[i] != null
                          ? participant.series[i].toFixed(1)
                          : '—'}
                      </span>
                    </td>
                  ))}

                  {/* Total */}
                  <td className="px-4 py-3 text-center">
                    {participant.dns ? (
                      <span className="text-sm font-bold text-gray-400">DNS</span>
                    ) : participant.total != null ? (
                      <span className="text-lg font-bold text-blue-700 font-mono">
                        {Number(participant.total).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Acciones (solo admin) */}
                  {isAdmin && (
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditingParticipant(participant)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editingParticipant && (
        <TiroDeportivoScoreModal
          participant={editingParticipant}
          phaseId={phaseId}
          isOpen={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
        />
      )}
    </>
  );
};
