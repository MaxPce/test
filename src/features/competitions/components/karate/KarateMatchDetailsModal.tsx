import { X, Trophy, Clock, Calendar, MapPin, Award } from "lucide-react";
import { useState } from "react";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { KarateScoreModal } from "./KarateScoreModal";
import type { KarateMatch } from "../../types/karate.types";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  match: KarateMatch;
  phase: any;
  isOpen: boolean;
  onClose: () => void;
}

export const KarateMatchDetailsModal = ({ match, phase, isOpen, onClose }: Props) => {
  const advanceWinnerMutation = useAdvanceWinner();
  const [isKarateModalOpen, setIsKarateModalOpen] = useState(false);

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

  const formatScore = (score: any): string => {
    if (score === null || score === undefined) return "-";
    const n = parseFloat(score);
    if (isNaN(n)) return String(score);
    return String(Math.floor(n));
  };

  const canRegisterScore = participant1 && participant2;
  const hasScore =
    match.participant1Score !== null && match.participant1Score !== undefined;

  const participations = match.participations || [];
  const hasOnlyOneParticipant = participations.length === 1;
  const canAdvance = hasOnlyOneParticipant && match.status !== "finalizado";

  const handleAdvanceParticipant = async () => {
    if (!participations[0]) return;
    const participantName =
      participations[0].registration?.athlete?.name || "este participante";
    if (confirm(`¿Avanzar a ${participantName} automáticamente?`)) {
      try {
        await advanceWinnerMutation.mutateAsync({
          matchId: match.matchId,
          winnerRegistrationId: participations[0].registrationId!,
        });
      } catch (error) {
        console.error("Error al avanzar participante:", error);
        alert("Hubo un error al avanzar al participante. Por favor intenta nuevamente.");
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">
                  Match #{match.matchNumber}
                </h2>
                <p className="text-sm text-orange-100">
                  {match.round} • Karate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canAdvance && (
                <button
                  onClick={handleAdvanceParticipant}
                  disabled={advanceWinnerMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm backdrop-blur-sm shadow-lg"
                >
                  <span className="hidden sm:inline">
                    {advanceWinnerMutation.isPending ? "Procesando..." : "Pasar Participante"}
                  </span>
                </button>
              )}

              {canRegisterScore && (
                <button
                  onClick={() => setIsKarateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm backdrop-blur-sm"
                >
                  <span className="hidden sm:inline">
                    {hasScore ? "Editar Puntaje" : "Registrar Puntaje"}
                  </span>
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

          {canAdvance && (
            <div className="mx-6 mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm font-semibold text-amber-900">
                Participante sin oponente
              </p>
            </div>
          )}

          {/* Participants */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Participant 1 - Rojo */}
              <div
                className={`border-2 rounded-lg p-6 transition-all ${
                  isWinner(participant1?.participationId || 0)
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {getAthletePhoto(participant1) ? (
                    <img
                      src={getAthletePhoto(participant1)!}
                      alt={getParticipantName(participant1)}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-4 border-orange-400"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement("div");
                          placeholder.className =
                            "w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0";
                          placeholder.textContent = getParticipantName(participant1).charAt(0);
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-gray-600">Puntos:</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-5 h-5 text-orange-600" />
                        <span className="text-3xl font-bold text-orange-600">
                          {formatScore(match.participant1Score)}
                        </span>
                      </div>
                    </div>
                    {isWinner(participant1?.participationId || 0) && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        GANADOR
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Participant 2 - Azul */}
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
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-gray-600">Puntos:</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-5 h-5 text-red-600" />
                        <span className="text-3xl font-bold text-red-600">
                          {formatScore(match.participant2Score)}
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

            {/* Detalle del Combate */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Detalle del Combate
              </h3>

              {!hasScore ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-medium">No hay puntaje registrado aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`rounded-lg p-4 text-center border-2 ${
                      isWinner(participant1?.participationId || 0)
                        ? "bg-orange-100 border-orange-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {getParticipantName(participant1)}
                    </p>
                    <p
                      className={`text-4xl font-bold ${
                        isWinner(participant1?.participationId || 0)
                          ? "text-orange-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatScore(match.participant1Score)}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg p-4 text-center border-2 ${
                      isWinner(participant2?.participationId || 0)
                        ? "bg-red-100 border-red-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {getParticipantName(participant2)}
                    </p>
                    <p
                      className={`text-4xl font-bold ${
                        isWinner(participant2?.participationId || 0)
                          ? "text-red-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatScore(match.participant2Score)}
                    </p>
                  </div>
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
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end rounded-b-xl">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {canRegisterScore && (
        <KarateScoreModal
          isOpen={isKarateModalOpen}
          onClose={() => setIsKarateModalOpen(false)}
          match={match}
          phase={phase}
        />
      )}
    </>
  );
};
