import { Trophy, Clock, CheckCircle, XCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Match, Phase } from "../types";

interface BestOf3ViewProps {
  matches: Match[];
  phase: Phase;
  onRegisterResult?: (match: Match) => void;
}

export function BestOf3View({
  matches,
  phase,
  onRegisterResult,
}: BestOf3ViewProps) {
  // Ordenar partidos por matchNumber
  const sortedMatches = [...matches].sort(
    (a, b) => (a.matchNumber || 0) - (b.matchNumber || 0),
  );

  // Obtener los 2 participantes de la serie
  const allParticipations = sortedMatches.flatMap(
    (m) => m.participations || [],
  );
  const uniqueRegistrations = Array.from(
    new Map(
      allParticipations.map((p) => [p.registrationId, p.registration]),
    ).entries(),
  );

  // Calcular victorias por participante
  const victorias: Record<number, number> = {};
  sortedMatches
    .filter((m) => m.status === "finalizado")
    .forEach((m) => {
      if (m.winnerRegistrationId) {
        victorias[m.winnerRegistrationId] =
          (victorias[m.winnerRegistrationId] || 0) + 1;
      }
    });

  // Determinar ganador de la serie
  const ganadorRegistrationId = Object.entries(victorias).find(
    ([_, wins]) => wins >= 2,
  )?.[0];

  const getMatchIcon = (match: Match) => {
    switch (match.status) {
      case "finalizado":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "en_curso":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "cancelado":
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Partidos de la Serie */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-lg">Partidos</h4>

        {sortedMatches.map((match, index) => {
          const participants = match.participations || [];
          const hasParticipants = participants.length > 0;

          return (
            <div
              key={match.matchId}
              className={`
                p-5 rounded-lg border-2 transition-all
                ${
                  match.status === "finalizado"
                    ? "border-green-200 bg-green-50"
                    : match.status === "cancelado"
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : match.status === "en_curso"
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white"
                }
              `}
            >
              {/* Header del Partido */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getMatchIcon(match)}
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      Partido {match.matchNumber || index + 1} de 3
                    </h5>
                    {match.scheduledTime && (
                      <p className="text-sm text-gray-600">
                        📅{" "}
                        {new Date(match.scheduledTime).toLocaleString("es-ES")}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    match.status === "finalizado"
                      ? "success"
                      : match.status === "en_curso"
                        ? "primary"
                        : match.status === "cancelado"
                          ? "default"
                          : "warning"
                  }
                  size="sm"
                >
                  {match.status === "programado" && "Programado"}
                  {match.status === "en_curso" && "En Curso"}
                  {match.status === "finalizado" && "Finalizado"}
                  {match.status === "cancelado" && "No necesario"}
                </Badge>
              </div>

              {/* Participantes del Partido */}
              {hasParticipants ? (
                <div className="space-y-2 mb-4">
                  {participants.map((participation) => {
                    const reg = participation.registration;
                    const name = reg?.athlete
                      ? reg.athlete.name
                      : reg?.team?.name || "Sin nombre";
                    const institution =
                      reg?.athlete?.institution?.name ||
                      reg?.team?.institution?.name ||
                      "";
                    const isWinner =
                      match.winnerRegistrationId ===
                      participation.registrationId;

                    return (
                      <div
                        key={participation.participationId}
                        className={`
                          flex items-center justify-between p-3 rounded-md
                          ${
                            isWinner
                              ? "bg-green-100 border-2 border-green-300"
                              : "bg-white border border-gray-200"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          {isWinner && (
                            <Trophy className="h-4 w-4 text-green-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {name}
                            </p>
                            {institution && (
                              <p className="text-xs text-gray-600">
                                {institution}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            participation.corner === "blue" ||
                            participation.corner === "A"
                              ? "primary"
                              : "default"
                          }
                          size="sm"
                        >
                          {participation.corner === "blue" && "Azul"}
                          {participation.corner === "white" && "Blanco"}
                          {participation.corner === "A" && "Esquina A"}
                          {participation.corner === "B" && "Esquina B"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded">
                  Sin participantes asignados
                </div>
              )}

              {/* Botón de Acción */}
              {participants.length === 2 &&
                match.status !== "finalizado" &&
                match.status !== "cancelado" &&
                onRegisterResult && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onRegisterResult(match)}
                    className="w-full"
                  >
                    Registrar Resultado
                  </Button>
                )}

              {match.status === "cancelado" && (
                <p className="text-center text-sm text-gray-500 italic">
                  Este partido no se jugó porque la serie ya terminó
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje informativo si la serie no ha comenzado */}
      {sortedMatches.every((m) => m.status === "programado") && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ La serie comenzará cuando se registre el resultado del primer
            partido. Si un participante gana los 2 primeros partidos, el tercero
            no será necesario.
          </p>
        </div>
      )}
    </div>
  );
}
