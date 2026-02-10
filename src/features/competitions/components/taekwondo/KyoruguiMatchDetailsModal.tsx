import { X, Trophy, Clock, Calendar, MapPin, Circle, Award, Edit3, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useKyoruguiRounds } from "../../api/taekwondo.queries";
import { KyoruguiRoundsModal } from "./KyoruguiRoundsModal";
import type { KyoruguiMatch } from "../../types/taekwondo.types";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  match: KyoruguiMatch;
  isOpen: boolean;
  onClose: () => void;
}

export const KyoruguiMatchDetailsModal = ({ match, isOpen, onClose }: Props) => {
  const { data: rounds, isLoading } = useKyoruguiRounds(match.matchId);
  // 🆕 Estado para controlar el modal de registro de puntajes
  const [isRoundsModalOpen, setIsRoundsModalOpen] = useState(false);

  if (!isOpen) return null;

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "TBD";
    const athlete = participation.registration?.athlete;
    return athlete?.name || "TBD";
  };

  const getInstitution = (participation: typeof participant1) => {
    return participation?.registration?.athlete?.institution;
  };

  const getLogoUrl = (participation: typeof participant1) => {
    return participation?.registration?.athlete?.institution?.logoUrl;
  };

  const getAthletePhoto = (participation: typeof participant1) => {
    const photoUrl = participation?.registration?.athlete?.photoUrl;
    return photoUrl ? getImageUrl(photoUrl) : null;
  };

  const isWinner = (participationId: number) =>
    match.participations?.find((p) => p.participationId === participationId)
      ?.registrationId === match.winnerRegistrationId;

  // Calcular rounds ganados
  const calculateRoundsWon = () => {
    if (!rounds || rounds.length === 0) {
      return { p1Rounds: 0, p2Rounds: 0 };
    }

    let p1Rounds = 0;
    let p2Rounds = 0;

    rounds.forEach((round: any) => {
      if (round.score1 > round.score2) {
        p1Rounds++;
      } else if (round.score2 > round.score1) {
        p2Rounds++;
      }
    });

    return { p1Rounds, p2Rounds };
  };

  const { p1Rounds, p2Rounds } = calculateRoundsWon();

  // 🆕 Verificar si el match tiene ambos participantes para poder registrar puntaje
  const canRegisterScore = participant1 && participant2;
  const hasRounds = rounds && rounds.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
            <div>
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">
                    Match #{match.matchNumber}
                  </h2>
                  <p className="text-sm text-purple-100">
                    {match.round} • Kyorugui
                  </p>
                </div>
              </div>
            </div>
            
            {/* 🆕 Botón de registro de puntajes en el header */}
            <div className="flex items-center gap-2">
              {canRegisterScore && (
                <button
                  onClick={() => setIsRoundsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm backdrop-blur-sm"
                  title={hasRounds ? "Editar puntajes" : "Registrar puntajes"}
                >
                  {hasRounds ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar Puntajes</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Registrar Puntajes</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Match Info */}
          <div className="px-6 py-4 bg-gray-50 border-b grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {match.scheduledTime
                  ? new Date(match.scheduledTime).toLocaleDateString("es-ES")
                  : "Fecha pendiente"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {match.scheduledTime
                  ? new Date(match.scheduledTime).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Hora pendiente"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {match.platformNumber
                  ? `Plataforma ${match.platformNumber}`
                  : "Sin asignar"}
              </span>
            </div>
          </div>

          {/* Participants */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Participant 1 - Azul */}
              <div
                className={`border-2 rounded-lg p-6 transition-all ${
                  isWinner(participant1?.participationId || 0)
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {getAthletePhoto(participant1) ? (
                    <img
                      src={getAthletePhoto(participant1)!}
                      alt={getParticipantName(participant1)}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-4 border-blue-400"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement("div");
                          placeholder.className =
                            "w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0";
                          placeholder.textContent = getParticipantName(participant1).charAt(0);
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {getParticipantName(participant1).charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {getParticipantName(participant1)}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {getInstitution(participant1)?.name || "Sin institución"}
                        </p>
                      </div>
                      {getLogoUrl(participant1) && (
                        <img
                          src={getImageUrl(getLogoUrl(participant1)!)}
                          alt={getInstitution(participant1)?.name || ""}
                          className="w-12 h-12 object-contain ml-2 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-gray-600">Rounds ganados:</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-5 h-5 text-blue-600" />
                        <span className="text-3xl font-bold text-blue-600">
                          {p1Rounds}
                        </span>
                      </div>
                    </div>
                    {isWinner(participant1?.participationId || 0) && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        GANADOR
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Participant 2 - Rojo */}
              <div
                className={`border-2 rounded-lg p-6 transition-all ${
                  isWinner(participant2?.participationId || 0)
                    ? "border-red-500 bg-red-50 shadow-lg"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {getAthletePhoto(participant2) ? (
                    <img
                      src={getAthletePhoto(participant2)!}
                      alt={getParticipantName(participant2)}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-4 border-red-400"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement("div");
                          placeholder.className =
                            "w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0";
                          placeholder.textContent = getParticipantName(participant2).charAt(0);
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {getParticipantName(participant2).charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {getParticipantName(participant2)}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {getInstitution(participant2)?.name || "Sin institución"}
                        </p>
                      </div>
                      {getLogoUrl(participant2) && (
                        <img
                          src={getImageUrl(getLogoUrl(participant2)!)}
                          alt={getInstitution(participant2)?.name || ""}
                          className="w-12 h-12 object-contain ml-2 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-gray-600">Rounds ganados:</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-5 h-5 text-red-600" />
                        <span className="text-3xl font-bold text-red-600">
                          {p2Rounds}
                        </span>
                      </div>
                    </div>
                    {isWinner(participant2?.participationId || 0) && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        GANADOR
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            

            {/* Rounds Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Circle className="w-5 h-5" />
                  Detalle de Rounds
                </h3>
                
                
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando rounds...
                </div>
              ) : !rounds || rounds.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Circle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No hay rounds registrados aún</p>
                  <p className="text-sm mt-1">
                    {canRegisterScore 
                      ? "Usa el botón de arriba para comenzar a registrar"
                      : "Se necesitan ambos participantes para registrar puntajes"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rounds.map((round: any) => {
                    const roundWinner =
                      round.score1 > round.score2
                        ? "p1"
                        : round.score2 > round.score1
                        ? "p2"
                        : null;

                    return (
                      <div
                        key={round.gameId}
                        className={`border-2 rounded-lg p-4 ${
                          roundWinner === "p1"
                            ? "border-blue-500 bg-blue-50"
                            : roundWinner === "p2"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-700">
                              Round {round.gameNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Circle className="w-4 h-4 fill-blue-500 text-blue-500" />
                              <span className="text-2xl font-bold text-blue-600">
                                {round.score1 || 0}
                              </span>
                            </div>
                            <span className="text-gray-400 font-bold">-</span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-red-600">
                                {round.score2 || 0}
                              </span>
                              <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="mt-6 text-center">
              <span
                className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  match.status === "finalizado"
                    ? "bg-green-100 text-green-800"
                    : match.status === "en_curso"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {match.status === "programado" && "Programado"}
                {match.status === "en_curso" && "En Curso"}
                {match.status === "finalizado" && "Finalizado"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-between items-center rounded-b-xl">
            
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* 🆕 Modal de registro de puntajes */}
      {canRegisterScore && (
        <KyoruguiRoundsModal
          isOpen={isRoundsModalOpen}
          onClose={() => setIsRoundsModalOpen(false)}
          match={match}
        />
      )}
    </>
  );
};
