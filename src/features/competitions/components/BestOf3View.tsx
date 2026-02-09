import { useState } from "react";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Circle,
  Edit,
  User,
  Crown,
  Users,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardBody } from "@/components/ui/Card";
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
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
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
        

        {/* Partidos */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-lg">
              Partidos de la Serie
            </h4>
          </div>

          <div className="space-y-4">
            {sortedMatches.map((match, index) => {
              const participants = match.participations || [];
              const hasParticipants = participants.length > 0;

              return (
                <Card
                  key={match.matchId}
                  className={`overflow-hidden transition-all ${
                    match.status === "finalizado"
                      ? "border-2 border-green-300 shadow-lg"
                      : match.status === "cancelado"
                        ? "border-2 border-gray-200 opacity-60"
                        : match.status === "en_curso"
                          ? "border-2 border-blue-300 shadow-lg"
                          : "border-2 border-slate-200 hover:shadow-md"
                  }`}
                >
                  {/* Header del partido */}
                  <div
                    className={`p-4 ${
                      match.status === "finalizado"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50"
                        : match.status === "en_curso"
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50"
                          : match.status === "cancelado"
                            ? "bg-gray-50"
                            : "bg-gradient-to-r from-slate-50 to-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            match.status === "finalizado"
                              ? "bg-green-100"
                              : match.status === "en_curso"
                                ? "bg-blue-100"
                                : "bg-slate-100"
                          }`}
                        >
                          {getMatchIcon(match)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900">
                            Partido {match.matchNumber || index + 1}
                          </h5>
                          {match.scheduledTime && (
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(match.scheduledTime).toLocaleString("es-ES", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
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
                        size="lg"
                        dot={match.status !== "finalizado" && match.status !== "cancelado"}
                      >
                        {match.status === "programado" && "Programado"}
                        {match.status === "en_curso" && "En Curso"}
                        {match.status === "finalizado" && "Finalizado"}
                        {match.status === "cancelado" && "No necesario"}
                      </Badge>
                    </div>
                  </div>

                  {/* Participantes */}
                  {hasParticipants ? (
                    <div className="p-5 space-y-3 bg-white">
                      {participants.map((participation) => {
                        const reg = participation.registration;
                        const name = reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                        const institution = reg?.athlete?.institution || reg?.team?.institution;
                        const logoUrl = institution?.logoUrl;
                        const isWinner =
                          match.winnerRegistrationId === participation.registrationId;
                        const isBlue = participation.corner === "blue" || participation.corner === "A";

                        return (
                          <div
                            key={participation.participationId}
                            className={`relative rounded-xl p-4 border-2 transition-all ${
                              isWinner
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md"
                                : isBlue
                                  ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                                  : "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200"
                            }`}
                          >
                            {isWinner && (
                              <div className="absolute -top-2 -right-2 z-10">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 shadow-lg">
                                  <Trophy className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              {/* Logo */}
                              {logoUrl ? (
                                <img
                                  src={getImageUrl(logoUrl)}
                                  alt={institution?.name}
                                  className="h-10 w-10 rounded-lg object-contain bg-white p-1.5 border border-slate-200 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <User className="h-5 w-5 text-slate-400" />
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-base line-clamp-1 ${isWinner ? "text-green-900" : "text-slate-900"}`}>
                                  {name}
                                </p>
                                {institution && (
                                  <p className="text-sm text-slate-600 line-clamp-1">
                                    {institution.name}
                                  </p>
                                )}
                              </div>

                              {/* Badge de esquina */}
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
                      <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <Users className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                        <p className="text-sm font-medium text-slate-600">
                          Sin participantes asignados
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer con botón */}
                  {participants.length === 2 && match.status !== "cancelado" && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <Button
                        variant={match.status === "finalizado" ? "outline" : "primary"}
                        size="md"
                        onClick={() => handleOpenModal(match)}
                        className="w-full font-semibold"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {match.status === "finalizado"
                          ? "Editar Resultado"
                          : "Registrar Resultado"}
                      </Button>
                    </div>
                  )}

                  {match.status === "cancelado" && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-center text-sm text-gray-600 italic flex items-center justify-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Este partido no se jugó porque la serie ya terminó
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mensaje informativo */}
        {sortedMatches.every((m) => m.status === "programado") && (
          <Card className="bg-blue-50 border-2 border-blue-200">
            <CardBody className="p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Información de la Serie
                  </p>
                  <p className="text-sm text-blue-800">
                    La serie comenzará cuando se registre el resultado del primer partido. Si un
                    participante gana los 2 primeros partidos, el tercero será marcado como "No
                    necesario".
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Modales */}
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
              <TableTennisMatchWrapper match={selectedMatch} eventCategory={eventCategory} />
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
