import { useKyoruguiBracket } from "../../api/taekwondo.queries";
import { KyoruguiMatchCard } from "./KyoruguiMatchCard";
import type { KyoruguiMatch } from "../../types/taekwondo.types";

interface Props {
  phaseId: number;
  /** Matches desde useMatches — incluyen datos completos de atletas (fix TBD) */
  externalMatches?: any[];
}

export const KyoruguiBracketView = ({ phaseId, externalMatches }: Props) => {
  const { data: fetchedMatches, isLoading, error } = useKyoruguiBracket(phaseId);

  // Si vienen matches desde el padre (con athlete data), los usamos
  // Si no, usamos los del hook propio (pueden mostrar TBD si el endpoint no los incluye)
  const matches: KyoruguiMatch[] = (externalMatches?.length ? externalMatches : fetchedMatches) ?? [];

  if (isLoading && !externalMatches?.length) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error && !externalMatches?.length) {
    return <div className="text-center py-8 text-red-600">Error al cargar el bracket</div>;
  }

  if (!matches.length) {
    return <div className="text-center py-8 text-gray-500">No hay combates generados aún</div>;
  }

  const matchesByRound = matches.reduce(
    (acc, match) => {
      const round = match.round || "Sin ronda";
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    },
    {} as Record<string, typeof matches>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(matchesByRound).map(([round, roundMatches]) => (
        <div key={round}>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">{round}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roundMatches.map((match) => (
              <KyoruguiMatchCard key={match.matchId} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};