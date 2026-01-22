import { useQuery } from "@tanstack/react-query";
import { getJudoBracket } from "../../api/judo.api";
import { JudoMatchCard } from "./JudoMatchCard";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  phaseId: number;
}

export function JudoBracketView({ phaseId }: Props) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["judo-bracket", phaseId],
    queryFn: () => getJudoBracket(phaseId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Agrupar por ronda
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">{round}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roundMatches.map((match) => (
              <JudoMatchCard key={match.matchId} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
