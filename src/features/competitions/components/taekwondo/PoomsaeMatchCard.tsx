import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Trophy, Edit2 } from "lucide-react";
import { PoomsaeScoreModal } from "./PoomsaeScoreModal";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Match } from "../../types";

interface Props {
  match: Match;
}

export const PoomsaeMatchCard = ({ match }: Props) => {
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const participants = match.participations || [];

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "success" | "primary" | "default" | "warning"
    > = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
      cancelado: "warning",
    };
    return variants[status] || "default";
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {match.matchNumber && (
                <span className="text-xs font-semibold text-gray-600">
                  #{match.matchNumber}
                </span>
              )}
              <Badge variant={getStatusBadgeVariant(match.status)} size="sm">
                {match.status === "programado" && "Programado"}
                {match.status === "en_curso" && "En Curso"}
                {match.status === "finalizado" && "Finalizado"}
                {match.status === "cancelado" && "Cancelado"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScoreModalOpen(true)}
              disabled={participants.length < 2}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Sin participantes asignados
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participation) => {
                const reg = participation.registration;
                const name = reg?.athlete
                  ? reg.athlete.name
                  : reg?.team?.name || "TBD";
                const institution =
                  reg?.athlete?.institution || reg?.team?.institution;
                const isWinner =
                  match.winnerRegistrationId === participation.registrationId;

                const accuracy = participation.accuracy || 0;
                const presentation = participation.presentation || 0;
                const total = accuracy + presentation;

                return (
                  <div
                    key={participation.participationId}
                    className={`p-3 rounded-lg border-2 ${
                      isWinner
                        ? "bg-green-50 border-green-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {isWinner && (
                          <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {name}
                          </p>
                          {institution && (
                            <div className="flex items-center gap-1 mt-1">
                              {institution.logoUrl && (
                                <img
                                  src={getImageUrl(institution.logoUrl)}
                                  alt={institution.name}
                                  className="h-4 w-4 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                              <p className="text-xs text-gray-500 truncate">
                                {institution.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {match.status !== "programado" && (
                      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Accuracy</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {accuracy > 0 ? accuracy.toFixed(1) : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Presentation</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {presentation > 0 ? presentation.toFixed(1) : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">
                            Total
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {total > 0 ? total.toFixed(1) : "-"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {match.scheduledTime && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {new Date(match.scheduledTime).toLocaleString("es-ES")}
              </p>
            </div>
          )}

          {match.platformNumber && (
            <p className="text-xs text-gray-600 mt-1">
              Plataforma {match.platformNumber}
            </p>
          )}
        </CardBody>
      </Card>

      {isScoreModalOpen && (
        <PoomsaeScoreModal
          match={match}
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
        />
      )}
    </>
  );
};
