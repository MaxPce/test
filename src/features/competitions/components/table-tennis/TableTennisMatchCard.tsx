import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Trophy, ArrowLeftRight, Loader2 } from "lucide-react";
import type { LineupData } from "../../api/table-tennis.api";
import type { Match } from "../../types";

interface TableTennisMatchCardProps {
  lineups: LineupData[];
  match: Match;
  result?: {
    team1: { wins: number; teamName: string; participation?: any };
    team2: { wins: number; teamName: string; participation?: any };
    score: string;
    isComplete: boolean;
    winner: any | null;
  } | null;
  onSwap?: () => void;
  isSwapping?: boolean;
}

export function TableTennisMatchCard({
  lineups,
  match,
  result,
  onSwap,
  isSwapping = false,
}: TableTennisMatchCardProps) {

  const canSwap =
    onSwap &&
    match.status === "programado" &&
    match.participations?.length === 2;

  if (lineups.length !== 2) {
    return (
      <Card>
        <CardBody className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Este match necesita 2 equipos</p>
          {canSwap && (
            <button
              onClick={onSwap}
              disabled={isSwapping}
              className="mt-3 flex items-center gap-1 mx-auto text-xs text-gray-500
                         hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors px-3 py-1.5 rounded border border-gray-300
                         hover:border-gray-500"
              title="Intercambiar posición de los equipos en el bracket"
            >
              {isSwapping ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeftRight className="h-3 w-3" />}
              {isSwapping ? "Intercambiando..." : "Swap equipos"}
            </button>
          )}
        </CardBody>
      </Card>
    );
  }

  const team1 = lineups[0];
  const team2 = lineups[1];

  // ── Normalizar result para que team1/team2 coincidan con el orden de lineups ──
  const normalizedResult = (() => {
    if (!result) return null;

    const lineup0RegId = team1.participation?.registration?.registrationId;
    const resultTeam1RegId = result.team1?.participation?.registration?.registrationId;

    // Si el result viene invertido respecto a lineups, hacer swap
    const isInverted =
      lineup0RegId &&
      resultTeam1RegId &&
      lineup0RegId !== resultTeam1RegId;

    if (isInverted) {
      return {
        ...result,
        team1: result.team2,
        team2: result.team1,
        score: `${result.team2.wins} - ${result.team1.wins}`,
      };
    }

    return result;
  })();

  const getLineupLetters = (lineup: LineupData) => {
    const sorted = [...lineup.lineups]
      .filter((l) => !l.isSubstitute)
      .sort((a, b) => a.lineupOrder - b.lineupOrder);
    return sorted.map((l) => l.athlete.name.split(" ")[0]);
  };

  const team1Players = getLineupLetters(team1);
  const team2Players = getLineupLetters(team2);

  const isTeam1Winner =
    normalizedResult?.winner?.registrationId ===
    team1.participation.registration.registrationId;
  const isTeam2Winner =
    normalizedResult?.winner?.registrationId ===
    team2.participation.registration.registrationId;

  const getMatchStatusBadge = () => {
    if (match.status === "finalizado") return <Badge variant="success">Finalizado</Badge>;
    if (match.status === "en_curso") return <Badge variant="warning">En curso</Badge>;
    if (normalizedResult && normalizedResult.team1.wins + normalizedResult.team2.wins > 0)
      return <Badge variant="default">En juego</Badge>;
    return <Badge variant="default">Programado</Badge>;
  };

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between gap-4">

          {/* Equipo 1 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isTeam1Winner && <Trophy className="h-5 w-5 text-yellow-500" />}
              <h3 className="font-bold text-lg text-gray-900">{team1.teamName}</h3>
            </div>
            <Badge variant="default" className="mb-2">{team1.institution}</Badge>
            <div className="flex items-center gap-2">
              {team1Players.map((name, index) => (
                <Badge key={index} variant="primary" className="text-sm font-bold">
                  {String.fromCharCode(65 + index)}: {name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Centro: marcador + swap */}
          <div className="text-center px-6 flex flex-col items-center gap-2">
            {normalizedResult ? (
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {normalizedResult.team1.wins} - {normalizedResult.team2.wins}
                </div>
                {getMatchStatusBadge()}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400 mb-2">0 - 0</div>
                {getMatchStatusBadge()}
              </div>
            )}
            {canSwap && (
              <button
                onClick={onSwap}
                disabled={isSwapping}
                className="flex items-center gap-1 text-xs text-gray-400
                           hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors px-2 py-1 rounded border border-gray-200
                           hover:border-gray-400 mt-1"
                title="Intercambiar posición de los equipos en el bracket"
              >
                {isSwapping ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeftRight className="h-3 w-3" />}
                {isSwapping ? "Cambiando..." : "Swap"}
              </button>
            )}
          </div>

          {/* Equipo 2 */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              {isTeam2Winner && <Trophy className="h-5 w-5 text-yellow-500" />}
              <h3 className="font-bold text-lg text-gray-900">{team2.teamName}</h3>
            </div>
            <div className="flex justify-end mb-2">
              <Badge variant="default">{team2.institution}</Badge>
            </div>
            <div className="flex items-center justify-end gap-2">
              {team2Players.map((name, index) => (
                <Badge key={index} variant="primary" className="text-sm font-bold">
                  {String.fromCharCode(65 + index)}: {name}
                </Badge>
              ))}
            </div>
          </div>

        </div>
      </CardBody>
    </Card>
  );
}