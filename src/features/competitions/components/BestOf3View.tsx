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
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardBody } from "@/components/ui/Card";
import { JudoScoreModal } from "./judo/JudoScoreModal";
import { KyoruguiRoundsModal } from "./taekwondo/KyoruguiRoundsModal";
import { PoomsaeScoreModal } from "./taekwondo/PoomsaeScoreModal";
import { TableTennisMatchWrapper } from "./table-tennis/TableTennisMatchWrapper";
import { WalkoverDialog } from "./table-tennis/WalkoverDialog";
import { ResultModal } from "./ResultModal";
import { WushuScoreModal } from "./wushu/WushuScoreModal";
import { WushuTaoluScoreModal } from "./wushu/WushuTaoluScoreModal";
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

  const [walkoverMatch, setWalkoverMatch] = useState<Match | null>(null);
  const [showWalkoverDialog, setShowWalkoverDialog] = useState(false);

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

    if (sportName.includes("taekwondo")) {
      if (
        categoryName.includes("poomsae") ||
        categoryName.includes("formas") ||
        categoryName.includes("forma")
      )
        return "poomsae";
      if (
        categoryName.includes("kyorugi") ||
        categoryName.includes("combate") ||
        categoryName.includes("pelea")
      )
        return "kyorugi";
    }

    // ── NUEVO ────────────────────────────────────────────────────────────────
    if (sportName.includes("wushu")) {
      if (
        categoryName.includes("taolu") ||
        categoryName.includes("formas") ||
        categoryName.includes("forma")
      )
        return "wushu-taolu";
      return "wushu";
    }
    // ─────────────────────────────────────────────────────────────────────────

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

  const handleWalkoverConfirm = async (
    winnerRegistrationId: number,
    reason: string,
  ) => {
    if (!walkoverMatch) return;
    try {
      await updateMatchMutation.mutateAsync({
        id: walkoverMatch.matchId,
        data: {
          status: "finalizado",
          winnerRegistrationId,
          isWalkover: true,
          walkoverReason: reason,
        },
      });
      toast.success("Walkover registrado correctamente");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error al registrar walkover",
      );
    } finally {
      setShowWalkoverDialog(false);
      setWalkoverMatch(null);
    }
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
                              {new Date(match.scheduledTime).toLocaleString(
                                "es-ES",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                },
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
                        size="lg"
                        dot={
                          match.status !== "finalizado" &&
                          match.status !== "cancelado"
                        }
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

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-bold text-base line-clamp-1 ${isWinner ? "text-green-900" : "text-slate-900"}`}
                                >
                                  {name}
                                </p>
                                {institution && (
                                  <p className="text-sm text-slate-600 line-clamp-1">
                                    {institution.name}
                                  </p>
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
                      <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <Users className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                        <p className="text-sm font-medium text-slate-600">
                          Sin participantes asignados
                        </p>
                      </div>
                    </div>
                  )}

                  {participants.length === 2 &&
                    match.status !== "cancelado" && (
                      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                        <Button
                          variant={
                            match.status === "finalizado"
                              ? "outline"
                              : "primary"
                          }
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
      </div>

      {/* ── Modales de resultado ─────────────────────────────────────────── */}
      {selectedMatch && (
        <>
          {sportType === "judo" ? (
            <JudoScoreModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch}
            />
          ) : sportType === "kyorugi" ? (
            <KyoruguiRoundsModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch as any}
            />
          ) : sportType === "poomsae" ? (
            <PoomsaeScoreModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch as any}
              phase={phase}
            />
          ) : // ── NUEVO ──────────────────────────────────────────────────────────
          sportType === "wushu" ? (
            <WushuScoreModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch as any}
              phase={phase}
            />
          ) : sportType === "wushu-taolu" ? (
            <WushuTaoluScoreModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              match={selectedMatch as any}
              phase={phase}
            />
          ) : // ──────────────────────────────────────────────────────────────────

          sportType === "table-tennis" ? (
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

      {/* ── Walkover Dialog ──────────────────────────────────────────────── */}
      {showWalkoverDialog &&
        walkoverMatch &&
        (() => {
          const wP1 = walkoverMatch.participations?.[0];
          const wP2 = walkoverMatch.participations?.[1];
          const wP1Name =
            wP1?.registration?.athlete?.name ||
            wP1?.registration?.team?.name ||
            "Participante A";
          const wP2Name =
            wP2?.registration?.athlete?.name ||
            wP2?.registration?.team?.name ||
            "Participante B";

          return (
            <WalkoverDialog
              participant1Name={wP1Name}
              participant2Name={wP2Name}
              participant1RegistrationId={wP1?.registrationId ?? 0}
              participant2RegistrationId={wP2?.registrationId ?? 0}
              onConfirm={handleWalkoverConfirm}
              onCancel={() => {
                setShowWalkoverDialog(false);
                setWalkoverMatch(null);
              }}
              isLoading={updateMatchMutation.isPending}
            />
          );
        })()}
    </>
  );
}
