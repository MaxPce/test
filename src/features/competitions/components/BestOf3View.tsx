import { useState } from "react";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Circle,
  Edit,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { JudoScoreModal } from "./judo/JudoScoreModal";
import { KyoruguiScoreModal } from "./taekwondo/KyoruguiScoreModal";
import { TableTennisMatchWrapper } from "./table-tennis/TableTennisMatchWrapper";
import { ResultModal } from "./ResultModal";
import { useUpdateMatch } from "../api/matches.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Match, Phase } from "../types";

interface BestOf3ViewProps {
  matches: Match[];
  phase: Phase;
  eventCategory?: any;
}

export function BestOf3View({
  matches,
  phase,
  eventCategory,
}: BestOf3ViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateMatchMutation = useUpdateMatch();

  const sortedMatches = [...matches].sort(
    (a, b) => (a.matchNumber || 0) - (b.matchNumber || 0),
  );

  const allParticipations = sortedMatches.flatMap(
    (m) => m.participations || [],
  );
  const uniqueRegistrations = Array.from(
    new Map(
      allParticipations.map((p) => [p.registrationId, p.registration]),
    ).entries(),
  );

  const victorias: Record<number, number> = {};
  sortedMatches
    .filter((m) => m.status === "finalizado")
    .forEach((m) => {
      if (m.winnerRegistrationId) {
        victorias[m.winnerRegistrationId] =
          (victorias[m.winnerRegistrationId] || 0) + 1;
      }
    });

  const ganadorRegistrationId = Object.entries(victorias).find(
    ([_, wins]) => wins >= 2,
  )?.[0];

  const getSportType = () => {
    if (!eventCategory) return "generic";

    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    const categoryName = eventCategory.category?.name?.toLowerCase() || "";

    if (sportName.includes("judo")) return "judo";
    if (sportName.includes("taekwondo") && categoryName.includes("kyorugi"))
      return "kyorugi";
    if (
      sportName.includes("tenis de mesa") ||
      sportName.includes("table tennis") ||
      sportName.includes("ping pong")
    )
      return "table-tennis";

    return "generic";
  };

  const handleOpenModal = (match: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const handleRegisterResult = async (matchId: number, winnerId: number) => {
    await updateMatchMutation.mutateAsync({
      id: matchId,
      data: {
        status: "finalizado",
        winnerRegistrationId: winnerId,
      },
    });
    handleCloseModal();
  };

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

  const sportType = getSportType();

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg">Partidos</h4>

          {sortedMatches.map((match, index) => {
            const participants = match.participations || [];
            const hasParticipants = participants.length > 0;

            return (
              <div
                key={match.matchId}
                className={`
                rounded-xl border-2 transition-all overflow-hidden
                ${
                  match.status === "finalizado"
                    ? "border-green-300 shadow-lg"
                    : match.status === "cancelado"
                      ? "border-gray-200 opacity-60"
                      : match.status === "en_curso"
                        ? "border-blue-300 shadow-lg"
                        : "border-gray-200 shadow-md hover:shadow-lg"
                }
              `}
              >
                <div
                  className={`
                  p-4
                  ${
                    match.status === "finalizado"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50"
                      : match.status === "en_curso"
                        ? "bg-gradient-to-r from-blue-50 to-cyan-50"
                        : "bg-gradient-to-r from-gray-50 to-slate-50"
                  }
                `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMatchIcon(match)}
                      <div>
                        <h5 className="font-bold text-gray-900">
                          Partido {match.matchNumber || index + 1} de 3
                        </h5>
                        {match.scheduledTime && (
                          <p className="text-xs text-gray-600">
                            📅{" "}
                            {new Date(match.scheduledTime).toLocaleString(
                              "es-ES",
                            )}
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
                </div>

                {hasParticipants ? (
                  <div className="p-5 space-y-3 bg-white">
                    {participants.map((participation) => {
                      const reg = participation.registration;
                      const name =
                        reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                      const institution =
                        reg?.athlete?.institution || reg?.team?.institution;
                      const logoUrl = institution?.logoUrl;
                      const isWinner =
                        match.winnerRegistrationId ===
                        participation.registrationId;
                      const isBlue =
                        participation.corner === "blue" ||
                        participation.corner === "A";

                      return (
                        <div
                          key={participation.participationId}
                          className={`
                            relative rounded-xl p-4 transition-all
                            ${
                              isWinner
                                ? "bg-gradient-to-r from-green-100 via-emerald-50 to-green-100 border-2 border-green-400 shadow-md"
                                : isBlue
                                  ? "bg-gradient-to-r from-white-50 to-white-50 border-2 border-white -200"
                                  : "bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200"
                            }
                          `}
                        >
                          {isWinner && (
                            <div className="absolute -top-2 -right-2">
                              <div className="bg-green-500 rounded-full p-2 shadow-lg">
                                <Trophy className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p
                                className={`font-bold text-lg ${isWinner ? "text-green-900" : "text-gray-900"}`}
                              >
                                {name}
                              </p>
                              {institution && (
                                <div className="flex items-center gap-2 mt-1">
                                  {logoUrl && (
                                    <img
                                      src={getImageUrl(logoUrl)}
                                      alt={institution.name}
                                      className="h-6 w-6 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  )}
                                  <p className="text-sm text-gray-600 font-medium">
                                    {institution.name}
                                  </p>
                                </div>
                              )}
                            </div>

                            <Badge
                              variant={isBlue ? "primary" : "default"}
                              size="lg"
                              className="font-bold"
                            >
                              {participation.corner === "blue" && "Azul"}
                              {participation.corner === "white" && "Blanco"}
                              {participation.corner === "A" && "A"}
                              {participation.corner === "B" && "B"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 bg-white">
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <User className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p>Sin participantes asignados</p>
                    </div>
                  </div>
                )}

                {participants.length === 2 && match.status !== "cancelado" && (
                  <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleOpenModal(match)}
                      className="w-full font-semibold"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {match.status === "finalizado"
                        ? "Editar Puntaje"
                        : "Registrar Puntaje"}
                    </Button>
                  </div>
                )}

                {match.status === "cancelado" && (
                  <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                    <p className="text-center text-sm text-gray-500 italic">
                      Este partido no se jugó porque la serie ya terminó
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sortedMatches.every((m) => m.status === "programado") && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              ℹ️ La serie comenzará cuando se registre el resultado del primer
              partido. Si un participante gana los 2 primeros partidos, el
              tercero no será necesario.
            </p>
          </div>
        )}
      </div>

      {selectedMatch && (
        <>
          {sportType === "judo" ? (
            <JudoScoreModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch}
            />
          ) : sportType === "kyorugi" ? (
            <KyoruguiScoreModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch}
            />
          ) : sportType === "table-tennis" ? (
            <Modal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title="Gestionar Match - Tenis de Mesa"
              size="full"
            >
              <TableTennisMatchWrapper
                match={selectedMatch}
                eventCategory={eventCategory}
              />
            </Modal>
          ) : (
            <ResultModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch}
              onSubmit={handleRegisterResult}
              isLoading={updateMatchMutation.isPending}
            />
          )}
        </>
      )}
    </>
  );
}
