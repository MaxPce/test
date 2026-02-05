import { X, Trophy, Calendar, Clock, MapPin, Award, Target } from "lucide-react";
import type { KyoruguiMatch } from "../../types/taekwondo.types";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  match: KyoruguiMatch;
  isOpen: boolean;
  onClose: () => void;
}

export const PoomsaeMatchDetailsModal = ({ match, isOpen, onClose }: Props) => {
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

  // Calcular scores totales
  const p1Accuracy = parseFloat(match.participant1Accuracy as string) || 0;
  const p1Presentation = parseFloat(match.participant1Presentation as string) || 0;
  const p1Total = p1Accuracy + p1Presentation;

  const p2Accuracy = parseFloat(match.participant2Accuracy as string) || 0;
  const p2Presentation = parseFloat(match.participant2Presentation as string) || 0;
  const p2Total = p2Accuracy + p2Presentation;

  const hasScores = p1Total > 0 || p2Total > 0;

  if (!match.participations || match.participations.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Error: Participantes no encontrados
          </h2>
          <p className="text-gray-700 mb-4">
            Este match no tiene participantes asignados.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
          <div>
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">
                  Match #{match.matchNumber}
                </h2>
                <p className="text-sm text-indigo-100">
                  {match.round} • Poomsae
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
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
            {/* Participant 1 */}
            <div
              className={`border-2 rounded-lg p-6 transition-all ${
                isWinner(participant1?.participationId || 0)
                  ? "border-indigo-500 bg-indigo-50 shadow-lg"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                {getAthletePhoto(participant1) ? (
                  <img
                    src={getAthletePhoto(participant1)!}
                    alt={getParticipantName(participant1)}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-4 border-indigo-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const placeholder = document.createElement("div");
                        placeholder.className =
                          "w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0";
                        placeholder.textContent = getParticipantName(participant1).charAt(0);
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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

                  {/* Score total */}
                  <div className="mt-4 text-center bg-indigo-100 rounded-lg py-3">
                    <span className="text-sm text-gray-600 block mb-1">
                      Puntaje Total
                    </span>
                    <span className="text-4xl font-bold text-indigo-600">
                      {hasScores ? p1Total.toFixed(2) : "-"}
                    </span>
                  </div>

                  {/* Desglose */}
                  {hasScores && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Accuracy</span>
                        </div>
                        <span className="font-bold text-blue-600">
                          {p1Accuracy.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700">Presentación</span>
                        </div>
                        <span className="font-bold text-purple-600">
                          {p1Presentation.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {isWinner(participant1?.participationId || 0) && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      
                      GANADOR
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Participant 2 */}
            <div
              className={`border-2 rounded-lg p-6 transition-all ${
                isWinner(participant2?.participationId || 0)
                  ? "border-purple-500 bg-purple-50 shadow-lg"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                {getAthletePhoto(participant2) ? (
                  <img
                    src={getAthletePhoto(participant2)!}
                    alt={getParticipantName(participant2)}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-4 border-purple-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const placeholder = document.createElement("div");
                        placeholder.className =
                          "w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0";
                        placeholder.textContent = getParticipantName(participant2).charAt(0);
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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

                  {/* Score total */}
                  <div className="mt-4 text-center bg-purple-100 rounded-lg py-3">
                    <span className="text-sm text-gray-600 block mb-1">
                      Puntaje Total
                    </span>
                    <span className="text-4xl font-bold text-purple-600">
                      {hasScores ? p2Total.toFixed(2) : "-"}
                    </span>
                  </div>

                  {/* Desglose */}
                  {hasScores && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Accuracy</span>
                        </div>
                        <span className="font-bold text-blue-600">
                          {p2Accuracy.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700">Presentación</span>
                        </div>
                        <span className="font-bold text-purple-600">
                          {p2Presentation.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {isWinner(participant2?.participationId || 0) && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      GANADOR
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!hasScores && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">
                No hay puntajes registrados aún
              </p>
            </div>
          )}

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
  );
};
