// src/features/events/components/PhaseFeaturedAthlete.tsx
import { Star } from 'lucide-react';
import { useFeaturedAthletesByPhase } from '@/features/events/api/featured-athletes.queries';
import { usePhaseRegistrations }       from '@/features/competitions/api/phaseRegistrations.queries';

interface Props {
  phaseId:         number;
  eventCategoryId: number; // se mantiene en la firma para no tocar CategoryStandingsPage
}

function getAthleteName(registration: any): string {
  const a = registration?.athlete;
  if (a) {
    const full = [a.firstName, a.lastName].filter(Boolean).join(' ');
    return full || a.name || `#${registration.registrationId}`;
  }
  return registration?.team?.name ?? `Inscripción #${registration?.registrationId ?? '?'}`;
}

export function PhaseFeaturedAthlete({ phaseId }: Props) {
  const { data: featuredList = [], isLoading } = useFeaturedAthletesByPhase(phaseId);
  const { data: phaseRegs    = [] }            = usePhaseRegistrations(phaseId);

  // ← Si no hay destacado asignado, no renderiza NADA
  if (isLoading || featuredList.length === 0) return null;

  const current     = featuredList[0];
  const athleteReg  = phaseRegs.find((pr) => pr.registrationId === current.registrationId);
  const athleteName = getAthleteName(athleteReg?.registration);

  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                    rounded-xl px-4 py-3 mt-2">
      <Star className="h-4 w-4 shrink-0 text-amber-500 fill-amber-400" />
      <div className="min-w-0">
        <span className="text-sm font-semibold text-amber-900">{athleteName}</span>
        {current.reason && (
          <span className="ml-2 text-xs text-amber-700 bg-amber-100
                           rounded-full px-2 py-0.5 truncate max-w-xs inline-block align-middle">
            {current.reason}
          </span>
        )}
      </div>
    </div>
  );
}
