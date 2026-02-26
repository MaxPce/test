import { Target, Medal } from 'lucide-react';
import { useShootingPhaseScores } from '../../api/shooting.queries';
import { getImageUrl } from '@/lib/utils/imageUrl';
import type { ShootingParticipant } from '../../types/shooting.types';

interface Props {
  phaseId: number;
  phaseName?: string;
}

const MEDAL_STYLES: Record<number, { bg: string; text: string; badge: string }> = {
  1: { bg: 'bg-yellow-50',  text: 'text-yellow-700', badge: 'bg-yellow-400 text-white' },
  2: { bg: 'bg-slate-50',   text: 'text-slate-500',  badge: 'bg-slate-400 text-white'  },
  3: { bg: 'bg-amber-50',   text: 'text-amber-700',  badge: 'bg-amber-600 text-white'  },
};

export const TiroDeportivoStandingsTable = ({ phaseId, phaseName }: Props) => {
  const { data, isLoading } = useShootingPhaseScores(phaseId);

  const rawParticipants: ShootingParticipant[] = Array.isArray(data) ? data : [];

  const participants = [...rawParticipants].sort((a, b) => {
    if (a.dns && !b.dns) return 1;
    if (!a.dns && b.dns) return -1;
    if (a.total === null && b.total === null) return 0;
    if (a.total === null) return 1;
    if (b.total === null) return -1;
    return (b.total ?? 0) - (a.total ?? 0);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Target className="h-14 w-14 mx-auto mb-3 text-gray-300" />
        <p className="font-semibold text-gray-600">No hay resultados registrados</p>
        <p className="text-sm mt-1">Los puntajes aparecerán aquí una vez ingresados</p>
      </div>
    );
  }

  const seriesCount = Math.max(...participants.map((p) => p.series?.length || 0), 0);

  return (
    <div className="space-y-3">
      {phaseName && (
        <div className="flex items-center gap-2 px-1">
          <Target className="h-4 w-4 text-blue-500" />
          <h4 className="font-bold text-slate-700 text-base">{phaseName}</h4>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wider w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Participante
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Institución
              </th>
              {Array.from({ length: seriesCount }, (_, i) => (
                <th
                  key={i}
                  className="px-3 py-3 text-center text-xs font-bold text-white/90 uppercase tracking-wider w-16"
                >
                  S{i + 1}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map((participant, index) => {
              const rank = participant.dns ? null : (participant.rank ?? index + 1);
              const medal = rank ? MEDAL_STYLES[rank] : null;

              return (
                <tr
                  key={participant.participationId}
                  className={`transition-colors ${
                    participant.dns
                      ? 'opacity-40 bg-gray-50'
                      : medal
                        ? medal.bg
                        : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Posición */}
                  <td className="px-3 py-3 text-center">
                    {participant.dns ? (
                      <span className="text-xs text-gray-400 font-bold">DNS</span>
                    ) : rank ? (
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          medal ? medal.badge : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rank}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Participante */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {rank && rank <= 3 && !participant.dns && (
                        <Medal className={`h-4 w-4 flex-shrink-0 ${medal?.text}`} />
                      )}
                      <div>
                        <p className={`font-semibold ${medal ? medal.text : 'text-slate-900'}`}>
                          {participant.participantName}
                        </p>
                        <p className="text-xs text-slate-400">{participant.gender}</p>
                      </div>
                    </div>
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
                        <span className="text-slate-200">—</span>
                      ) : participant.series?.[i] != null ? (
                        <span className="font-mono font-medium text-slate-700">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-500">
                        DNS
                      </span>
                    ) : participant.total != null ? (
                      <span className={`text-xl font-bold font-mono ${medal ? medal.text : 'text-blue-600'}`}>
                        {Number(participant.total).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
