import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit2, Calendar, MapPin } from "lucide-react";
import type { Match, Participation } from "../types";

interface MatchCardProps {
  match: Match;
  participations: Participation[];
  onEdit: (match: Match) => void;
}

export function MatchCard({ match, participations, onEdit }: MatchCardProps) {
  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "success" | "primary" | "default" | "warning"
    > = {
      programado: "default",
      en_curso: "success",
      finalizado: "primary",
      cancelado: "warning",
    };
    return variants[status] || "default";
  };

  const getParticipantName = (participantId?: number) => {
    if (!participantId) return "TBD";
    const participation = participations.find(
      (p) => p.participationId === participantId
    );
    return participation?.athlete?.name || participation?.team?.name || "N/A";
  };

  const isWinner = (participantId?: number) => {
    return match.winnerParticipantId === participantId;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card hover>
      <CardBody>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {match.round && `Ronda ${match.round}`}
              {match.matchNumber && ` - Partido ${match.matchNumber}`}
            </div>
            <Badge variant={getStatusBadgeVariant(match.status)}>
              {match.status === "programado" && "Programado"}
              {match.status === "en_curso" && "En Curso"}
              {match.status === "finalizado" && "Finalizado"}
              {match.status === "cancelado" && "Cancelado"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div
              className={`flex items-center justify-between p-2 rounded ${
                isWinner(match.participantA) ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <span
                className={`font-medium ${
                  isWinner(match.participantA)
                    ? "text-green-900"
                    : "text-gray-900"
                }`}
              >
                {getParticipantName(match.participantA)}
              </span>
              <span
                className={`text-xl font-bold ${
                  isWinner(match.participantA)
                    ? "text-green-900"
                    : "text-gray-600"
                }`}
              >
                {match.scoreA ?? "-"}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-2 rounded ${
                isWinner(match.participantB) ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <span
                className={`font-medium ${
                  isWinner(match.participantB)
                    ? "text-green-900"
                    : "text-gray-900"
                }`}
              >
                {getParticipantName(match.participantB)}
              </span>
              <span
                className={`text-xl font-bold ${
                  isWinner(match.participantB)
                    ? "text-green-900"
                    : "text-gray-600"
                }`}
              >
                {match.scoreB ?? "-"}
              </span>
            </div>
          </div>

          {(match.scheduledTime || match.location) && (
            <div className="space-y-1 text-sm text-gray-600">
              {match.scheduledTime && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(match.scheduledTime)}</span>
                </div>
              )}
              {match.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{match.location}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(match)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Editar Resultado
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
