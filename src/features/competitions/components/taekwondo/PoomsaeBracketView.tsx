import { useKyoruguiBracket } from "../../api/taekwondo.queries";
import { PoomsaeMatchCard } from "./PoomsaeMatchCard";

interface Props {
  phaseId: number;
}

export const PoomsaeBracketView = ({ phaseId }: Props) => {
  const { data: matches, isLoading, error } = useKyoruguiBracket(phaseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar el bracket
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay enfrentamientos generados aún
      </div>
    );
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
              <PoomsaeMatchCard key={match.matchId} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
