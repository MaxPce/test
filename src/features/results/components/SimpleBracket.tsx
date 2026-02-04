import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { useMatchDetails } from "@/features/competitions/api/table-tennis.queries";
import { MatchDetailsModal } from "./MatchDetailsModal";
import { KyoruguiMatchDetailsModal } from "@/features/competitions/components/taekwondo/KyoruguiMatchDetailsModal";
import { PoomsaeMatchDetailsModal } from "@/features/competitions/components/taekwondo/PoomsaeMatchDetailsModal";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface SimpleBracketProps {
  phaseId: number;
  sportConfig?: {
    sportType: string;
    scoreLabel: string;
    showScores: boolean;
  };
}

type RoundType = "sixteenths" | "eighths" | "quarters" | "semis" | "final" | "third" | "other";

function classifyRound(rawRound?: string | null): RoundType {
  const r = (rawRound || "").toLowerCase().trim();

  if (!r) return "other";

  if (r.includes("dieciseisavo") || r.includes("16avos") || r.includes("1/16")) return "sixteenths";
  if (r.includes("octavo") || r.includes("8vos") || r.includes("1/8")) return "eighths";
  if (r.includes("cuarto")) return "quarters";
  if (r.includes("semi")) return "semis";
  if (r.includes("tercer") || r.includes("3er") || r.includes("3°")) return "third";
  if (r.includes("final")) return "final";

  return "other";
}

export function SimpleBracket({ phaseId, sportConfig }: SimpleBracketProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const { data: matches = [], isLoading } = useMatches(phaseId);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando bracket...</p>
        </CardBody>
      </Card>
    );
  }

  const realMatches = matches.filter((match) => {
    if (match.phaseId !== phaseId) return false;
    
    if (!match.participations || match.participations.length === 0) return false;
    
    if (match.participations.length === 1) {
      const p1 = match.participations[0]?.registration;
      return p1 && (p1.athlete || p1.team);
    }
    
    const p1 = match.participations[0]?.registration;
    const p2 = match.participations[1]?.registration;
    
    return p1 && p2 && (p1.athlete || p1.team) && (p2.athlete || p2.team);
  });

  if (realMatches.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12 text-gray-500">
          <p className="font-medium">No hay combates definidos aún</p>
          <p className="text-sm mt-1">
            Los combates aparecerán cuando se asignen los participantes
          </p>
        </CardBody>
      </Card>
    );
  }

  const sixteenths = realMatches.filter((m) => classifyRound(m.round) === "sixteenths");
  const eighths = realMatches.filter((m) => classifyRound(m.round) === "eighths");
  const quarters = realMatches.filter((m) => classifyRound(m.round) === "quarters");
  const semis = realMatches.filter((m) => classifyRound(m.round) === "semis");
  const finals = realMatches.filter((m) => classifyRound(m.round) === "final");
  const thirdMatches = realMatches.filter((m) => classifyRound(m.round) === "third");
  const others = realMatches.filter((m) => classifyRound(m.round) === "other");

  const final = finals[0] || null;
  const third = thirdMatches[0] || null;

  const hasBracketLayout =
    sixteenths.length > 0 ||
    eighths.length > 0 ||
    quarters.length > 0 ||
    semis.length > 0 ||
    final ||
    third;

  const selectedMatch = realMatches.find((m) => m.matchId === selectedMatchId);
  const isKyorugui = sportConfig?.sportType === "kyorugi";
  const isPoomsae = sportConfig?.sportType === "poomsae";

  return (
    <>
      {selectedMatchId && isKyorugui && selectedMatch && (
        <KyoruguiMatchDetailsModal
          match={selectedMatch}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
      
      {selectedMatchId && isPoomsae && selectedMatch && (
        <PoomsaeMatchDetailsModal
          match={selectedMatch}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
      
      {selectedMatchId && !isKyorugui && !isPoomsae && (
        <MatchDetailsModal
          matchId={selectedMatchId}
          sportConfig={sportConfig}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      <div className="space-y-6">
        {hasBracketLayout ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <div className="min-w-max">
              <div className="flex gap-6 items-center justify-center">
                
                {sixteenths.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-center font-bold text-gray-700 mb-2 text-sm">
                      Dieciseisavos
                    </h3>
                    {sixteenths.map((match) => (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        size="sm"
                        sportConfig={sportConfig}
                        onClick={() => setSelectedMatchId(match.matchId)}
                      />
                    ))}
                  </div>
                )}

                {sixteenths.length > 0 && eighths.length > 0 && (
                  <div className="flex items-center">
                    <div className="h-px w-6 bg-gray-300" />
                  </div>
                )}

                {eighths.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-center font-bold text-gray-700 mb-2">
                      Octavos de Final
                    </h3>
                    {eighths.map((match) => (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        size="sm"
                        sportConfig={sportConfig}
                        onClick={() => setSelectedMatchId(match.matchId)}
                      />
                    ))}
                  </div>
                )}

                {eighths.length > 0 && quarters.length > 0 && (
                  <div className="flex items-center">
                    <div className="h-px w-6 bg-gray-300" />
                  </div>
                )}

                {quarters.length > 0 && (
                  <div className="space-y-12">
                    <h3 className="text-center font-bold text-gray-700 mb-2">
                      Cuartos de Final
                    </h3>
                    {quarters.map((match) => (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        sportConfig={sportConfig}
                        onClick={() => setSelectedMatchId(match.matchId)}
                      />
                    ))}
                  </div>
                )}

                {quarters.length > 0 && semis.length > 0 && (
                  <div className="flex items-center">
                    <div className="h-px w-8 bg-gray-300" />
                  </div>
                )}

                {semis.length > 0 && (
                  <div className="space-y-24">
                    <h3 className="text-center font-bold text-gray-700 mb-2">
                      Semifinales
                    </h3>
                    {semis.map((match) => (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        size="lg"
                        sportConfig={sportConfig}
                        onClick={() => setSelectedMatchId(match.matchId)}
                      />
                    ))}
                  </div>
                )}

                {semis.length > 0 && final && (
                  <div className="flex items-center">
                    <div className="h-px w-8 bg-gray-300" />
                  </div>
                )}

                {final && (
                  <div>
                    <h3 className="text-center font-bold text-yellow-600 mb-2 flex items-center justify-center gap-2">
                      FINAL
                    </h3>
                    <MatchCard
                      match={final}
                      size="xl"
                      isFinal
                      sportConfig={sportConfig}
                      onClick={() => setSelectedMatchId(final.matchId)}
                    />
                  </div>
                )}
              </div>

              {third && (
                <div className="mt-10 flex justify-center">
                  <div className="max-w-md">
                    <h3 className="text-center font-bold text-amber-600 mb-2">
                      Tercer Lugar
                    </h3>
                    <MatchCard
                      match={third}
                      sportConfig={sportConfig}
                      onClick={() => setSelectedMatchId(third.matchId)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <h3 className="font-bold text-gray-800">
                Combates de eliminación
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 md:grid-cols-2">
                {realMatches.map((match) => (
                  <MatchCard
                    key={match.matchId}
                    match={match}
                    sportConfig={sportConfig}
                    onClick={() => setSelectedMatchId(match.matchId)}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {others.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800">
                Otras rondas ({others.length})
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 md:grid-cols-2">
                {others.map((match) => (
                  <MatchCard
                    key={match.matchId}
                    match={match}
                    sportConfig={sportConfig}
                    onClick={() => setSelectedMatchId(match.matchId)}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
}

interface MatchCardProps {
  match: any;
  size?: "sm" | "lg" | "xl";
  isFinal?: boolean;
  onClick?: () => void;
  sportConfig?: {
    sportType: string;
    scoreLabel: string;
    showScores: boolean;
  };
}

function MatchCard({
  match,
  size = "sm",
  isFinal = false,
  onClick,
  sportConfig,
}: MatchCardProps) {
  const shouldFetchTT = sportConfig?.sportType === "table-tennis";

  const { data: ttDetails } = useMatchDetails(
    shouldFetchTT ? match.matchId : 0,
  );

  const p1Data = match.participations?.[0]?.registration;
  const p2Data = match.participations?.[1]?.registration;

  const isBye = !p2Data || match.participations?.length === 1;

  const name1 = p1Data?.athlete?.name || p1Data?.team?.name || "Por definir";
  const name2 = p2Data?.athlete?.name || p2Data?.team?.name || "BYE";

  const institution1 =
    p1Data?.athlete?.institution || p1Data?.team?.institution;
  const institution2 =
    p2Data?.athlete?.institution || p2Data?.team?.institution;

  const logo1 = institution1?.logoUrl;
  const logo2 = institution2?.logoUrl;

  const calculateTableTennisSets = (games: any[]): [number, number] => {
    if (!games || games.length === 0) return [0, 0];

    let p1SetsWon = 0;
    let p2SetsWon = 0;

    games.forEach((game) => {
      if (!game.sets || game.sets.length === 0) return;

      let p1GameSets = 0;
      let p2GameSets = 0;

      game.sets.forEach((set: any) => {
        if (set.player1Score > set.player2Score) {
          p1GameSets++;
        } else if (set.player2Score > set.player1Score) {
          p2GameSets++;
        }
      });

      if (p1GameSets > p2GameSets) p1SetsWon++;
      else if (p2GameSets > p1GameSets) p2SetsWon++;
    });

    return [p1SetsWon, p2SetsWon];
  };

  const formatScore = (score: any, isParticipant1: boolean): string => {
    if (sportConfig?.sportType === "table-tennis") {
      if (
        match.status === "finalizado" &&
        score !== null &&
        score !== undefined
      ) {
        return String(score);
      }

      if (ttDetails?.games && ttDetails.games.length > 0) {
        const [p1Sets, p2Sets] = calculateTableTennisSets(ttDetails.games);
        return String(isParticipant1 ? p1Sets : p2Sets);
      }

      return "-";
    }

    if (score === null || score === undefined) return "-";

    if (!sportConfig) return String(score);

    const sportType = sportConfig.sportType;

    if (sportType === "poomsae") {
      const numScore = parseFloat(score);
      if (isNaN(numScore)) return "-";
      return numScore.toFixed(2);
    }

    if (sportType === "judo") {
      if (score === 10 || score === "10") return "Ippon";
      return String(score);
    }

    if (sportType === "kyorugi") {
      return String(score);
    }

    return String(score);
  };

  const score1 = formatScore(match.participant1Score, true);
  const score2 = formatScore(match.participant2Score, false);

  const winnerId = match.winnerRegistrationId;
  const isP1Winner = winnerId === p1Data?.registrationId;
  const isP2Winner = winnerId === p2Data?.registrationId;

  const p1Corner = match.participations?.[0]?.corner;
  const p2Corner = match.participations?.[1]?.corner;

  const sizeClasses = {
    sm: "w-64",
    lg: "w-72",
    xl: "w-80",
  } as const;

  const textSizeClasses = {
    sm: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  } as const;

  const getScoreClass = (score: string, isWinner: boolean) => {
    const baseSize =
      size === "xl" ? "text-3xl" : size === "lg" ? "text-2xl" : "text-xl";
    const smallSize =
      size === "xl" ? "text-xl" : size === "lg" ? "text-lg" : "text-base";

    const fontSize = score.length > 3 ? smallSize : baseSize;
    const color = isWinner ? "text-green-600" : "text-gray-500";

    return `${fontSize} font-bold ml-2 flex-shrink-0 ${color}`;
  };

  return (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} border-2 ${
        isFinal
          ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
          : "border-gray-300 bg-white"
      } rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105`}
    >
      <div
        className={`flex items-center justify-between p-3 ${
          isP1Winner
            ? "bg-green-100 border-b-2 border-green-500"
            : p1Corner === "blue"
              ? "bg-blue-50 border-b-2 border-blue-300"
              : "bg-gray-50 border-b-2 border-gray-300"
        } rounded-t-xl`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {p1Data?.seedNumber && (
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold">
              {p1Data.seedNumber}
            </div>
          )}
          
          {logo1 && (
            <img
              src={getImageUrl(logo1)}
              alt={institution1?.name || ""}
              className="h-6 w-6 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <div className="min-w-0 flex-1">
            <p
              className={`font-bold text-gray-900 truncate ${textSizeClasses[size]}`}
            >
              {name1}
            </p>
            {institution1 && (
              <p className="text-xs text-gray-600 truncate">
                {institution1.abrev || institution1.name}
              </p>
            )}
          </div>
        </div>
        <span className={getScoreClass(score1, isP1Winner)}>{score1}</span>
      </div>

      <div
        className={`flex items-center justify-between p-3 ${
          isBye
            ? "bg-gray-100"
            : isP2Winner
              ? "bg-green-100"
              : p2Corner === "white"
                ? "bg-gray-50"
                : "bg-white"
        } rounded-b-xl`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isBye && p2Data?.seedNumber && (
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold">
              {p2Data.seedNumber}
            </div>
          )}
          
          {!isBye && logo2 && (
            <img
              src={getImageUrl(logo2)}
              alt={institution2?.name || ""}
              className="h-6 w-6 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <div className="min-w-0 flex-1">
            <p
              className={`font-bold ${isBye ? 'text-gray-400 italic' : 'text-gray-900'} truncate ${textSizeClasses[size]}`}
            >
              {name2}
            </p>
            {!isBye && institution2 && (
              <p className="text-xs text-gray-600 truncate">
                {institution2.abrev || institution2.name}
              </p>
            )}
          </div>
        </div>
        {!isBye && <span className={getScoreClass(score2, isP2Winner)}>{score2}</span>}
      </div>

      <div className="px-3 py-2 bg-gray-50 rounded-b-xl border-t">
        <div className="flex items-center justify-between">
          <Badge
            variant={
              match.status === "finalizado"
                ? "success"
                : match.status === "en_curso"
                  ? "primary"
                  : "default"
            }
            size="sm"
          >
            {match.status === "finalizado" && "Finalizado"}
            {match.status === "en_curso" && "En Curso"}
            {match.status === "programado" && "Programado"}
          </Badge>
          {match.platformNumber && (
            <span className="text-xs text-gray-500">
              P{match.platformNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
