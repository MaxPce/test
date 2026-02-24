import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Users } from "lucide-react";
import { useMatches, useMatch } from "@/features/competitions/api/matches.queries";
import { MatchDetailsModal } from "./MatchDetailsModal";
import { KyoruguiMatchDetailsModal } from "@/features/competitions/components/taekwondo/KyoruguiMatchDetailsModal";
import { PoomsaeMatchDetailsModal } from "@/features/competitions/components/taekwondo/PoomsaeMatchDetailsModal";
import { JudoMatchDetailsModal } from "@/features/competitions/components/judo/JudoMatchDetailsModal";
import { KarateMatchDetailsModal } from "@/features/competitions/components/karate/KarateMatchDetailsModal";
import { WushuMatchDetailsModal } from "@/features/competitions/components/wushu/WushuMatchDetailsModal";
import { WushuTaoluMatchDetailsModal } from "@/features/competitions/components/wushu/WushuTaoluMatchDetailsModal";


import { getImageUrl } from "@/lib/utils/imageUrl";

interface SimpleBracketProps {
  phaseId: number;
  phase?: any;
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

export function SimpleBracket({ phaseId, phase, sportConfig }: SimpleBracketProps) {
  console.log("SimpleBracket props:", { phase: !!phase, sportType: sportConfig?.sportType });
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const { data: matches = [], isLoading } = useMatches(phaseId);
  const { data: fullMatch } = useMatch(selectedMatchId || 0);

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

  const realMatches = matches.filter((match) => match.phaseId === phaseId);

  if (realMatches.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-lg">No hay combates definidos aún</p>
          <p className="text-sm mt-1">
            Genera el bracket o crea combates manualmente para comenzar
          </p>
        </CardBody>
      </Card>
    );
  }

  const sixteenths  = realMatches.filter((m) => classifyRound(m.round) === "sixteenths");
  const eighths     = realMatches.filter((m) => classifyRound(m.round) === "eighths");
  const quarters    = realMatches.filter((m) => classifyRound(m.round) === "quarters");
  const semis       = realMatches.filter((m) => classifyRound(m.round) === "semis");
  const finals      = realMatches.filter((m) => classifyRound(m.round) === "final");
  const thirdMatches= realMatches.filter((m) => classifyRound(m.round) === "third");
  const others      = realMatches.filter((m) => classifyRound(m.round) === "other");

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
  const resolvedMatch = fullMatch || selectedMatch;

  const isKyorugui = sportConfig?.sportType === "kyorugi";
  const isPoomsae  = sportConfig?.sportType === "poomsae";
  const isJudo     = sportConfig?.sportType === "judo";
  const isKarate   = sportConfig?.sportType === "karate";  
  const isWushu      = sportConfig?.sportType === "wushu";      
  const isWushuTaolu = sportConfig?.sportType === "wushu-taolu";

  return (
    <>
      {selectedMatchId && isKyorugui && resolvedMatch && (
        <KyoruguiMatchDetailsModal
          match={resolvedMatch}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {selectedMatchId && isPoomsae && resolvedMatch && (
        <PoomsaeMatchDetailsModal
          match={resolvedMatch}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {selectedMatchId && isJudo && resolvedMatch && phase && (
        <JudoMatchDetailsModal
          match={resolvedMatch}
          phase={phase}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {selectedMatchId && isKarate && resolvedMatch && phase && (
        <KarateMatchDetailsModal
          match={resolvedMatch as any}
          phase={phase}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {selectedMatchId && isWushu && resolvedMatch && phase && (
        <WushuMatchDetailsModal
          match={resolvedMatch as any}
          phase={phase}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {selectedMatchId && isWushuTaolu && resolvedMatch && phase && (
        <WushuTaoluMatchDetailsModal
          match={resolvedMatch as any}
          phase={phase}
          isOpen={true}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {/* {selectedMatchId && !isKyorugui && !isPoomsae && !isJudo && (
        <MatchDetailsModal
          matchId={selectedMatchId}
          match={resolvedMatch}
          sportConfig={sportConfig}
          onClose={() => setSelectedMatchId(null)}
        />
      )} */}
      

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
                      <Trophy className="w-5 h-5" />
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
              <h3 className="font-bold text-gray-800">Combates de eliminación</h3>
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
  const participations = match.participations || [];
  const p1Data = participations[0]?.registration;
  const p2Data = participations[1]?.registration;

  const isEmpty = participations.length === 0;
  const hasOnlyOne = participations.length === 1 && p1Data;

  const roundName = (match.round || "").toLowerCase();
  const isFirstRound =
    roundName.includes("cuarto") ||
    roundName.includes("octavo") ||
    roundName.includes("dieciseisavo") ||
    roundName.includes("16avo") ||
    roundName.includes("8vo");

  const isRealBye = hasOnlyOne && isFirstRound;
  const isWaitingForWinner = hasOnlyOne && !isFirstRound;
  const isByeProcessed = isRealBye && match.status === "finalizado";

  const name1 = isEmpty
    ? "Por definir"
    : p1Data?.athlete?.name || p1Data?.team?.name || "Por definir";

  const name2 = isEmpty
    ? "Por definir"
    : isRealBye
      ? "BYE"
      : isWaitingForWinner
        ? "Por definir"
        : p2Data?.athlete?.name || p2Data?.team?.name || "Por definir";

  const institution1 = p1Data?.athlete?.institution || p1Data?.team?.institution;
  const institution2 = p2Data?.athlete?.institution || p2Data?.team?.institution;

  const logo1 = institution1?.logoUrl;
  const logo2 = institution2?.logoUrl;

  const formatScore = (score: any, _isParticipant1: boolean): string => {
    if (sportConfig?.sportType === "table-tennis") {
      if (score !== null && score !== undefined) {
        return String(Math.floor(Number(score)));
      }
      return "-";
    }

    if (score === null || score === undefined) return "";

    if (!sportConfig) {
      const numScore = parseFloat(score);
      if (isNaN(numScore)) return "-";
      return String(Math.floor(numScore));
    }

    const sportType = sportConfig.sportType;

    if (sportType === "poomsae" || sportType === "wushu-taolu") {
      const numScore = parseFloat(score);
      if (isNaN(numScore)) return "-";
      return numScore.toFixed(2);
    }
    if (sportType === "judo") {
      if (score === 10 || score === "10") return "10 (Ippon)";
      const numScore = parseFloat(score);
      if (isNaN(numScore)) return String(score);
      return String(Math.floor(numScore));
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore)) return String(score);
    return String(Math.floor(numScore));
  };

  const score1 = formatScore(match.participant1Score, true);
  const score2 = formatScore(match.participant2Score, false);

  const winnerId = match.winnerRegistrationId;
  const isP1Winner = winnerId === p1Data?.registrationId;
  const isP2Winner = winnerId === p2Data?.registrationId;

  const p1Corner = participations[0]?.corner;
  const p2Corner = participations[1]?.corner;

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
          : isEmpty
            ? "border-dashed border-gray-300 bg-gray-50"
            : "border-gray-300 bg-white"
      } rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105 ${
        isEmpty ? "opacity-75" : ""
      }`}
    >
      {/* Participant 1 */}
      <div
        className={`flex items-center justify-between p-3 ${
          isEmpty
            ? "bg-gray-100 border-b-2 border-gray-200"
            : isP1Winner
              ? "bg-green-100 border-b-2 border-green-500"
              : p1Corner === "blue"
                ? "bg-blue-50 border-b-2 border-blue-300"
                : "bg-gray-50 border-b-2 border-gray-300"
        } rounded-t-xl`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isEmpty && p1Data?.seedNumber && (
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold">
              {p1Data.seedNumber}
            </div>
          )}

          {!isEmpty && logo1 && (
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
              className={`font-bold ${
                isEmpty ? "text-gray-400 italic" : "text-gray-900"
              } truncate ${textSizeClasses[size]}`}
            >
              {name1}
            </p>
            {!isEmpty && institution1 && (
              <p className="text-xs text-gray-600 truncate">
                {institution1.abrev || institution1.name}
              </p>
            )}
          </div>
        </div>
        <span className={getScoreClass(score1, isP1Winner)}>{score1}</span>
      </div>

      {/* Participant 2 */}
      <div
        className={`flex items-center justify-between p-3 ${
          isEmpty
            ? "bg-gray-100"
            : isByeProcessed
              ? "bg-green-50"
              : isRealBye
                ? "bg-gray-100"
                : isWaitingForWinner
                  ? "bg-blue-50"
                  : isP2Winner
                    ? "bg-green-100"
                    : p2Corner === "white"
                      ? "bg-gray-50"
                      : "bg-white"
        } rounded-b-xl`}
      >
        {isByeProcessed ? (
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
            <p className="font-medium text-green-700 text-sm italic">
              Avance Directo
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {!isEmpty && !isRealBye && !isWaitingForWinner && p2Data?.seedNumber && (
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold">
                  {p2Data.seedNumber}
                </div>
              )}

              {!isEmpty && !isRealBye && !isWaitingForWinner && logo2 && (
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
                  className={`font-bold ${
                    isEmpty
                      ? "text-gray-400 italic"
                      : isRealBye
                        ? "text-gray-400 italic"
                        : isWaitingForWinner
                          ? "text-blue-500 italic"
                          : "text-gray-900"
                  } truncate ${textSizeClasses[size]}`}
                >
                  {name2}
                </p>
                {!isEmpty && !isRealBye && !isWaitingForWinner && institution2 && (
                  <p className="text-xs text-gray-600 truncate">
                    {institution2.abrev || institution2.name}
                  </p>
                )}
              </div>
            </div>
            {!isEmpty && !isRealBye && !isWaitingForWinner && (
              <span className={getScoreClass(score2, isP2Winner)}>{score2}</span>
            )}
          </>
        )}
      </div>

      {/* Footer */}
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
          {match.platformNumber ? (
            <span className="text-xs text-gray-500">
              P{match.platformNumber}
            </span>
          ) : (
            isEmpty && (
              <span className="text-xs text-gray-400 italic">Sin asignar</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
