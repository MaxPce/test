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
    const variants: Record<string, "success" | "primary" | "default" | "warning"> = {
      programado: "default",
      en_curso: "success",
      finalizado: "primary",
      cancelado: "warning",
    };
    return variants[status] || "default";
  };

  // ── NUEVO: busca participaciones por corner, no por índice ──────────────────
  const matchParticipantIds = [match.participantA, match.participantB].filter(Boolean);

  const getParticipantByCorner = (corner: 'blue' | 'A' | 'white' | 'B') => {
    // Primero intenta desde match.participations (tienen el corner del match)
    const fromMatch = match.participations?.find(
      (p) => p.corner === corner || p.corner === (corner === 'blue' ? 'A' : 'B')
    );
    if (fromMatch) {
      // Obtiene el nombre desde el array de participations prop
      const full = participations.find(
        (p) => p.participationId === fromMatch.participationId
      );
      return {
        id: fromMatch.participationId,
        name:
          full?.athlete?.name ??
          full?.team?.name ??
          fromMatch.registration?.athlete?.name ??
          fromMatch.registration?.team?.name ??
          "TBD",
      };
    }
    // Fallback: si no hay corner, usa participantA=azul / participantB=blanco
    const fallbackId = corner === 'blue' || corner === 'A'
      ? match.participantA
      : match.participantB;
    if (!fallbackId) return { id: undefined, name: "TBD" };
    const full = participations.find((p) => p.participationId === fallbackId);
    return {
      id: fallbackId,
      name: full?.athlete?.name ?? full?.team?.name ?? "N/A",
    };
  };

  const blue  = getParticipantByCorner('blue');
  const white = getParticipantByCorner('white');
  // ───────────────────────────────────────────────────────────────────────────

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
            {/* Azul — siempre arriba */}
            <div className={`flex items-center justify-between p-2 rounded ${
              isWinner(blue.id) ? "bg-green-50" : "bg-gray-50"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  Azul
                </span>
                <span className={`font-medium ${isWinner(blue.id) ? "text-green-900" : "text-gray-900"}`}>
                  {blue.name}
                </span>
              </div>
              <span className={`text-xl font-bold ${isWinner(blue.id) ? "text-green-900" : "text-gray-600"}`}>
                {match.scoreA ?? "-"}
              </span>
            </div>

            {/* Blanco — siempre abajo */}
            <div className={`flex items-center justify-between p-2 rounded ${
              isWinner(white.id) ? "bg-green-50" : "bg-gray-50"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">
                  Blanco
                </span>
                <span className={`font-medium ${isWinner(white.id) ? "text-green-900" : "text-gray-900"}`}>
                  {white.name}
                </span>
              </div>
              <span className={`text-xl font-bold ${isWinner(white.id) ? "text-green-900" : "text-gray-600"}`}>
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