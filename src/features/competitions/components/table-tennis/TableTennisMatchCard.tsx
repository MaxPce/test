import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Trophy } from "lucide-react";
import type { LineupData } from "../../api/table-tennis.api";
import type { Match } from "../../types"; // ✅ AGREGAR

interface TableTennisMatchCardProps {
  lineups: LineupData[];
  match: Match; // ✅ AGREGAR
  result?: {
    team1: { wins: number; teamName: string };
    team2: { wins: number; teamName: string };
    score: string;
    isComplete: boolean;
    winner: any | null;
  } | null;
}

export function TableTennisMatchCard({
  lineups,
  match, // ✅ AGREGAR
  result,
}: TableTennisMatchCardProps) {
  if (lineups.length !== 2) {
    return (
      <Card>
        <CardBody className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Este match necesita 2 equipos</p>
        </CardBody>
      </Card>
    );
  }

  const team1 = lineups[0];
  const team2 = lineups[1];

  const getLineupLetters = (lineup: LineupData) => {
    const sorted = [...lineup.lineups]
      .filter((l) => !l.isSubstitute)
      .sort((a, b) => a.lineupOrder - b.lineupOrder);
    return sorted.map((l) => l.athlete.name.split(" ")[0]);
  };

  const team1Players = getLineupLetters(team1);
  const team2Players = getLineupLetters(team2);

  const isTeam1Winner =
    result?.winner?.registrationId ===
    team1.participation.registration.registrationId;
  const isTeam2Winner =
    result?.winner?.registrationId ===
    team2.participation.registration.registrationId;

  // ✅ NUEVA LÓGICA: Usar match.status en lugar de result.isComplete
  const getMatchStatusBadge = () => {
    if (match.status === "finalizado") {
      return <Badge variant="success">Finalizado</Badge>;
    }
    if (match.status === "en_curso") {
      return <Badge variant="warning">En curso</Badge>;
    }
    if (result && result.team1.wins + result.team2.wins > 0) {
      return <Badge variant="default">En juego</Badge>;
    }
    return <Badge variant="default">Programado</Badge>;
  };

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Equipo 1 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900">
                {team1.teamName}
              </h3>
            </div>
            <Badge variant="default" className="mb-2">
              {team1.institution}
            </Badge>
            <div className="flex items-center gap-2">
              {team1Players.map((name, index) => (
                <Badge
                  key={index}
                  variant="primary"
                  className="text-sm font-bold"
                >
                  {String.fromCharCode(65 + index)}: {name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Marcador Central */}
          <div className="text-center px-6">
            {result ? (
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {result.team1.wins} - {result.team2.wins}
                </div>
                {/* ✅ CAMBIAR ESTA LÍNEA: */}
                {getMatchStatusBadge()}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400 mb-2">
                  0 - 0
                </div>
                {/* ✅ AGREGAR badge incluso sin result */}
                {getMatchStatusBadge()}
              </div>
            )}
          </div>

          {/* Equipo 2 */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              {isTeam2Winner && <Trophy className="h-5 w-5 text-yellow-500" />}
              <h3 className="font-bold text-lg text-gray-900">
                {team2.teamName}
              </h3>
            </div>
            <div className="flex justify-end mb-2">
              <Badge variant="default">{team2.institution}</Badge>
            </div>
            <div className="flex items-center justify-end gap-2">
              {team2Players.map((name, index) => (
                <Badge
                  key={index}
                  variant="primary"
                  className="text-sm font-bold"
                >
                  {String.fromCharCode(88 + index)}: {name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
