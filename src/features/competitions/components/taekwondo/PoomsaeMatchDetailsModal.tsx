import { X, Trophy, Calendar, Clock, MapPin, Users, User } from "lucide-react";
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

  // Detectar si es equipo o individual
  const isTeam = participant1?.registration?.team !== undefined && participant1?.registration?.team !== null;

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "TBD";
    
    if (isTeam) {
      return participation.registration?.team?.name || "TBD";
    } else {
      return participation.registration?.athlete?.name || "TBD";
    }
  };

  const getInstitution = (participation: typeof participant1) => {
    if (isTeam) {
      return participation?.registration?.team?.institution;
    }
    return participation?.registration?.athlete?.institution;
  };

  const getLogoUrl = (participation: typeof participant1) => {
    if (isTeam) {
      return participation?.registration?.team?.institution?.logoUrl;
    }
    return participation?.registration?.athlete?.institution?.logoUrl;
  };

  const getParticipantPhoto = (participation: typeof participant1) => {
    if (isTeam) {
      // Para equipos, usar el logo de la institución
      const logoUrl = participation?.registration?.team?.institution?.logoUrl;
      return logoUrl ? getImageUrl(logoUrl) : null;
    } else {
      // Para individuales, usar la foto del atleta
      const photoUrl = participation?.registration?.athlete?.photoUrl;
      return photoUrl ? getImageUrl(photoUrl) : null;
    }
  };

  const getInitial = (participation: typeof participant1) => {
    const name = getParticipantName(participation);
    return name.charAt(0);
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

  // Componente de tarjeta de participante
  const ParticipantCard = ({
    participant,
    color,
  }: {
    participant: typeof participant1;
    color: "indigo" | "purple";
  }) => {
    const isWinnerCard = isWinner(participant?.participationId || 0);
    const isParticipant1 = participant === participant1;
    const accuracy = isParticipant1 ? p1Accuracy : p2Accuracy;
    const presentation = isParticipant1 ? p1Presentation : p2Presentation;
    const total = isParticipant1 ? p1Total : p2Total;

    const colorClasses = {
      indigo: {
        border: "border-indigo-500",
        bg: "bg-indigo-50",
        photoBorder: "border-indigo-300",
        gradient: "from-indigo-400 to-indigo-600",
        scoreBg: "bg-indigo-100",
        scoreText: "text-indigo-600",
        badgeBg: "bg-indigo-600",
      },
      purple: {
        border: "border-purple-500",
        bg: "bg-purple-50",
        photoBorder: "border-purple-300",
        gradient: "from-purple-400 to-purple-600",
        scoreBg: "bg-purple-100",
        scoreText: "text-purple-600",
        badgeBg: "bg-purple-600",
      },
    };

    const classes = colorClasses[color];

    return (
      <div
        className={`border-2 rounded-lg p-6 transition-all ${
          isWinnerCard
            ? `${classes.border} ${classes.bg} shadow-lg`
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar / Logo */}
          {getParticipantPhoto(participant) ? (
            <img
              src={getParticipantPhoto(participant)!}
              alt={getParticipantName(participant)}
              className={`w-16 h-16 rounded-full ${
                isTeam ? "object-contain p-2 bg-white" : "object-cover"
              } flex-shrink-0 border-4 ${classes.photoBorder}`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = document.createElement("div");
                  placeholder.className = `w-16 h-16 bg-gradient-to-br ${classes.gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`;
                  placeholder.textContent = getInitial(participant);
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div
              className={`w-16 h-16 bg-gradient-to-br ${classes.gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}
            >
              {getInitial(participant)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isTeam ? (
                    <Users className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <User className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-500 font-semibold uppercase">
                    {isTeam ? "Equipo" : "Individual"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {getParticipantName(participant)}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {getInstitution(participant)?.name || "Sin institución"}
                </p>
              </div>
              {getLogoUrl(participant) && !isTeam && (
                <img
                  src={getImageUrl(getLogoUrl(participant)!)}
                  alt={getInstitution(participant)?.name || ""}
                  className="w-12 h-12 object-contain ml-2 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Score total */}
            <div className={`text-center ${classes.scoreBg} rounded-lg py-3`}>
              <span className="text-sm text-gray-600 block mb-1">
                Puntaje Total
              </span>
              <span className={`text-4xl font-bold ${classes.scoreText}`}>
                {hasScores ? total.toFixed(2) : "-"}
              </span>
            </div>

            {/* Desglose */}
            {hasScores && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-700">Accuracy</span>
                  <span className="font-bold text-blue-600">
                    {accuracy.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-700">Presentación</span>
                  <span className="font-bold text-purple-600">
                    {presentation.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Badge ganador */}
            {isWinnerCard && (
              <div className={`mt-3 inline-flex items-center gap-2 ${classes.badgeBg} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                <Trophy className="h-4 w-4" />
                GANADOR
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
                <p className="text-sm text-indigo-100 flex items-center gap-2">
                  {match.round} • Poomsae •{" "}
                  {isTeam ? (
                    <>
                      <Users className="h-3.5 w-3.5" />
                      Equipo
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5" />
                      Individual
                    </>
                  )}
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
            <ParticipantCard participant={participant1} color="indigo" />
            <ParticipantCard participant={participant2} color="purple" />
          </div>

          {!hasScores && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No hay puntajes registrados aún</p>
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
