import { useState } from "react";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy, Calendar, User, Crown, Clock, Target } from "lucide-react";
import { JudoScoreModal } from "@/features/competitions/components/judo/JudoScoreModal";
import { KyoruguiScoreModal } from "@/features/competitions/components/taekwondo/KyoruguiScoreModal";
import { TableTennisMatchWrapper } from "@/features/competitions/components/table-tennis/TableTennisMatchWrapper";
import { ResultModal } from "@/features/competitions/components/ResultModal";
import { useUpdateMatch } from "@/features/competitions/api/matches.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Match } from "@/features/competitions/types";

interface BestOf3ResultsTableProps {
  phaseId: number;
  eventCategory?: any;
}

export function BestOf3ResultsTable({
  phaseId,
  eventCategory,
}: BestOf3ResultsTableProps) {
  const { data: matches = [], isLoading } = useMatches(phaseId);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const updateMatchMutation = useUpdateMatch();

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

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsEditModalOpen(true);
  };

  const handleRegisterResult = async (matchId: number, winnerId: number) => {
    await updateMatchMutation.mutateAsync({
      id: matchId,
      data: {
        status: "finalizado",
        winnerRegistrationId: winnerId,
      },
    });
    setIsEditModalOpen(false);
    setSelectedMatch(null);
  };

  const sportType = getSportType();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" label="Cargando resultados..." />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No hay partidos en esta serie"
        description="Los partidos aparecerán cuando se programe la serie"
      />
    );
  }

  const participant1 = matches[0]?.participations?.find(
    (p) => p.corner === "blue" || p.corner === "A",
  );
  const participant2 = matches[0]?.participations?.find(
    (p) => p.corner === "white" || p.corner === "B",
  );

  const participant1Reg = participant1?.registration;
  const participant2Reg = participant2?.registration;

  const participant1Name =
    participant1Reg?.athlete?.name ||
    participant1Reg?.team?.name ||
    "Participante 1";
  const participant2Name =
    participant2Reg?.athlete?.name ||
    participant2Reg?.team?.name ||
    "Participante 2";

  const participant1Institution =
    participant1Reg?.athlete?.institution || participant1Reg?.team?.institution;
  const participant2Institution =
    participant2Reg?.athlete?.institution || participant2Reg?.team?.institution;

  const participant1Photo = participant1Reg?.athlete?.photoUrl;
  const participant2Photo = participant2Reg?.athlete?.photoUrl;

  const participant1Logo = participant1Institution?.logoUrl;
  const participant2Logo = participant2Institution?.logoUrl;

  const participant1Wins = matches.filter(
    (m) => m.winnerRegistrationId === participant1Reg?.registrationId,
  ).length;
  const participant2Wins = matches.filter(
    (m) => m.winnerRegistrationId === participant2Reg?.registrationId,
  ).length;

  const seriesWinner =
    participant1Wins >= 2
      ? participant1Name
      : participant2Wins >= 2
        ? participant2Name
        : null;

  return (
    <>
      <div className="space-y-6">
        {/* Card de VS */}
        <Card className="overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
            <div className="bg-white">
              <div className="grid md:grid-cols-3 gap-0 items-stretch">
                {/* Participante 1 */}
                <div
                  className={`
                    p-8 flex flex-col items-center justify-center relative transition-all
                    ${
                      seriesWinner === participant1Name
                        ? "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100"
                        : "bg-gradient-to-br from-blue-50 to-cyan-50"
                    }
                  `}
                >
                  {seriesWinner === participant1Name && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full p-3 shadow-lg animate-bounce">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Contenedor centrado */}
                  <div className="flex flex-col items-center w-full">
                    {/* Foto del atleta */}
                    {participant1Photo ? (
                      <img
                        src={getImageUrl(participant1Photo)}
                        alt={participant1Name}
                        className={`w-32 h-32 rounded-full object-cover shadow-xl mb-4 mx-auto ${
                          seriesWinner === participant1Name
                            ? "border-4 border-yellow-400 ring-4 ring-yellow-200"
                            : "border-4 border-white ring-4 ring-blue-200"
                        }`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement("div");
                            placeholder.className = `w-32 h-32 rounded-full mx-auto ${
                              seriesWinner === participant1Name
                                ? "bg-yellow-500 border-4 border-yellow-400 ring-4 ring-yellow-200"
                                : "bg-blue-500 border-4 border-white ring-4 ring-blue-200"
                            } flex items-center justify-center shadow-xl mb-4`;
                            const icon = document.createElementNS(
                              "http://www.w3.org/2000/svg",
                              "svg",
                            );
                            icon.setAttribute("class", "h-16 w-16 text-white");
                            icon.setAttribute("fill", "currentColor");
                            icon.setAttribute("viewBox", "0 0 24 24");
                            icon.innerHTML =
                              '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
                            placeholder.appendChild(icon);
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl mb-4 mx-auto ${
                          seriesWinner === participant1Name
                            ? "bg-yellow-500 border-4 border-yellow-400 ring-4 ring-yellow-200"
                            : "bg-blue-500 border-4 border-white ring-4 ring-blue-200"
                        }`}
                      >
                        <User className="h-16 w-16 text-white" />
                      </div>
                    )}

                    <h4 className="font-bold text-2xl text-slate-900 text-center mb-3 line-clamp-2 px-4">
                      {participant1Name}
                    </h4>

                    {participant1Institution && (
                      <div className="flex items-center justify-center gap-2 mb-6">
                        {participant1Logo && (
                          <img
                            src={getImageUrl(participant1Logo)}
                            alt={participant1Institution.name}
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <p className="text-sm text-slate-600 font-medium text-center">
                          {participant1Institution.name}
                        </p>
                      </div>
                    )}

                    {/* Victorias */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1 text-center">
                        Victorias
                      </p>
                      <p
                        className={`text-6xl font-bold text-center ${
                          seriesWinner === participant1Name
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }`}
                      >
                        {participant1Wins}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Centro: VS */}
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8 flex flex-col items-center justify-center border-x-4 border-orange-200">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 blur-2xl opacity-30"></div>
                    <Trophy className="h-16 w-16 text-orange-500 mb-4 relative z-10 mx-auto" />
                  </div>
                  <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600">
                    VS
                  </p>
                  <Badge variant="warning" size="lg" className="mt-4">
                    Mejor de 3
                  </Badge>
                </div>

                {/* Participante 2 */}
                <div
                  className={`
                    p-8 flex flex-col items-center justify-center relative transition-all
                    ${
                      seriesWinner === participant2Name
                        ? "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100"
                        : "bg-gradient-to-br from-slate-50 to-gray-100"
                    }
                  `}
                >
                  {seriesWinner === participant2Name && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full p-3 shadow-lg animate-bounce">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Contenedor centrado */}
                  <div className="flex flex-col items-center w-full">
                    {/* Foto del atleta */}
                    {participant2Photo ? (
                      <img
                        src={getImageUrl(participant2Photo)}
                        alt={participant2Name}
                        className={`w-32 h-32 rounded-full object-cover shadow-xl mb-4 mx-auto ${
                          seriesWinner === participant2Name
                            ? "border-4 border-yellow-400 ring-4 ring-yellow-200"
                            : "border-4 border-white ring-4 ring-slate-200"
                        }`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement("div");
                            placeholder.className = `w-32 h-32 rounded-full mx-auto ${
                              seriesWinner === participant2Name
                                ? "bg-yellow-500 border-4 border-yellow-400 ring-4 ring-yellow-200"
                                : "bg-slate-500 border-4 border-white ring-4 ring-slate-200"
                            } flex items-center justify-center shadow-xl mb-4`;
                            const icon = document.createElementNS(
                              "http://www.w3.org/2000/svg",
                              "svg",
                            );
                            icon.setAttribute("class", "h-16 w-16 text-white");
                            icon.setAttribute("fill", "currentColor");
                            icon.setAttribute("viewBox", "0 0 24 24");
                            icon.innerHTML =
                              '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
                            placeholder.appendChild(icon);
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl mb-4 mx-auto ${
                          seriesWinner === participant2Name
                            ? "bg-yellow-500 border-4 border-yellow-400 ring-4 ring-yellow-200"
                            : "bg-slate-500 border-4 border-white ring-4 ring-slate-200"
                        }`}
                      >
                        <User className="h-16 w-16 text-white" />
                      </div>
                    )}

                    <h4 className="font-bold text-2xl text-slate-900 text-center mb-3 line-clamp-2 px-4">
                      {participant2Name}
                    </h4>

                    {participant2Institution && (
                      <div className="flex items-center justify-center gap-2 mb-6">
                        {participant2Logo && (
                          <img
                            src={getImageUrl(participant2Logo)}
                            alt={participant2Institution.name}
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <p className="text-sm text-slate-600 font-medium text-center">
                          {participant2Institution.name}
                        </p>
                      </div>
                    )}

                    {/* Victorias */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1 text-center">
                        Victorias
                      </p>
                      <p
                        className={`text-6xl font-bold text-center ${
                          seriesWinner === participant2Name
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {participant2Wins}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detalle de Partidos */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-lg">
                Detalle de Partidos
              </h4>
            </div>

            <div className="space-y-4">
              {matches.map((match, index) => {
                const participants = match.participations || [];
                const p1 = participants.find(
                  (p) => p.corner === "blue" || p.corner === "A",
                );
                const p2 = participants.find(
                  (p) => p.corner === "white" || p.corner === "B",
                );

                const isP1Winner =
                  match.winnerRegistrationId === p1?.registration?.registrationId;
                const isP2Winner =
                  match.winnerRegistrationId === p2?.registration?.registrationId;

                return (
                  <Card
                    key={match.matchId}
                    className="overflow-hidden border-2 border-slate-200 hover:shadow-lg transition-all"
                  >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600 text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-bold text-slate-700">
                            Partido {index + 1}
                          </span>
                        </div>
                        <Badge
                          variant={
                            match.status === "finalizado"
                              ? "success"
                              : match.status === "en_curso"
                                ? "primary"
                                : "default"
                          }
                          dot={match.status !== "finalizado"}
                        >
                          {match.status === "programado" && "Programado"}
                          {match.status === "en_curso" && "En Curso"}
                          {match.status === "finalizado" && "Finalizado"}
                          {match.status === "cancelado" && "Cancelado"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 bg-white">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        {/* Participante 1 */}
                        <div className="text-right">
                          <p
                            className={`text-lg font-semibold line-clamp-2 ${
                              isP1Winner ? "text-green-600" : "text-slate-700"
                            }`}
                          >
                            {participant1Name}
                          </p>
                        </div>

                        {/* Marcador - NÚMEROS ENTEROS */}
                        <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-2xl py-4 px-6 border-2 border-slate-200 shadow-inner">
                          <div className="flex items-center justify-center gap-3">
                            <span
                              className={`text-4xl font-black ${
                                isP1Winner ? "text-green-600" : "text-slate-700"
                              }`}
                            >
                              {match.participant1Score != null
                                ? Math.floor(match.participant1Score)
                                : "-"}
                            </span>
                            <span className="text-slate-400 text-3xl font-bold">
                              :
                            </span>
                            <span
                              className={`text-4xl font-black ${
                                isP2Winner ? "text-green-600" : "text-slate-700"
                              }`}
                            >
                              {match.participant2Score != null
                                ? Math.floor(match.participant2Score)
                                : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Participante 2 */}
                        <div className="text-left">
                          <p
                            className={`text-lg font-semibold line-clamp-2 ${
                              isP2Winner ? "text-green-600" : "text-slate-700"
                            }`}
                          >
                            {participant2Name}
                          </p>
                        </div>
                      </div>

                      {/* Fecha */}
                      {match.scheduledTime && (
                        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <p className="text-xs text-slate-500 font-medium">
                            {new Date(match.scheduledTime).toLocaleString("es-ES", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modales de edición */}
      {selectedMatch && (
        <>
          {sportType === "judo" ? (
            <JudoScoreModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedMatch(null);
              }}
              match={selectedMatch}
            />
          ) : sportType === "kyorugi" ? (
            <KyoruguiScoreModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedMatch(null);
              }}
              match={selectedMatch}
            />
          ) : sportType === "table-tennis" ? (
            <Modal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedMatch(null);
              }}
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
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedMatch(null);
              }}
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
