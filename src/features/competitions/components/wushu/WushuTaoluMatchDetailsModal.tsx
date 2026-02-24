import {
  X, Trophy, Calendar, Clock, Users, User,
  TrendingUp, Edit3, PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { WushuTaoluScoreModal } from "./WushuTaoluScoreModal";
import type { Match } from "../../types";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  phase?: any;
}

export const WushuTaoluMatchDetailsModal = ({ match, isOpen, onClose, phase }: Props) => {
  const advanceWinnerMutation = useAdvanceWinner();
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  if (!isOpen) return null;

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const isTeam =
    participant1?.registration?.team !== undefined &&
    participant1?.registration?.team !== null;

  const getParticipantName = (participation: typeof participant1) => {
    if (!participation) return "TBD";
    return isTeam
      ? participation.registration?.team?.name || "TBD"
      : participation.registration?.athlete?.name || "TBD";
  };

  const getInstitution = (participation: typeof participant1) =>
    isTeam
      ? participation?.registration?.team?.institution
      : participation?.registration?.athlete?.institution;

  const getLogoUrl = (participation: typeof participant1) =>
    isTeam
      ? participation?.registration?.team?.institution?.logoUrl
      : participation?.registration?.athlete?.institution?.logoUrl;

  const getParticipantPhoto = (participation: typeof participant1) => {
    if (isTeam) {
      const logoUrl = participation?.registration?.team?.institution?.logoUrl;
      return logoUrl ? getImageUrl(logoUrl) : null;
    }
    const photoUrl = participation?.registration?.athlete?.photoUrl;
    return photoUrl ? getImageUrl(photoUrl) : null;
  };

  const getInitial = (participation: typeof participant1) =>
    getParticipantName(participation).charAt(0);

  const isWinner = (participationId: number) =>
    match.participations
      ?.find((p) => p.participationId === participationId)
      ?.registrationId === match.winnerRegistrationId;

  const p1Accuracy     = parseFloat(match.participant1Accuracy     as string) || 0;
  const p1Presentation = parseFloat(match.participant1Presentation as string) || 0;
  const p1Total        = p1Accuracy + p1Presentation;

  const p2Accuracy     = parseFloat(match.participant2Accuracy     as string) || 0;
  const p2Presentation = parseFloat(match.participant2Presentation as string) || 0;
  const p2Total        = p2Accuracy + p2Presentation;

  const hasScores = p1Total > 0 || p2Total > 0;

  const participations        = match.participations || [];
  const hasOnlyOneParticipant = participations.length === 1;
  const canAdvance            = hasOnlyOneParticipant && match.status !== "finalizado";
  const canRegisterScore      = participant1 && participant2;

  const handleAdvanceParticipant = async () => {
    if (!participations[0]) return;
    const participantName = isTeam
      ? participations[0].registration?.team?.name
      : participations[0].registration?.athlete?.name;
    const displayName = participantName || (isTeam ? "este equipo" : "este participante");

    if (confirm(`¿Avanzar a ${displayName} automáticamente?`)) {
      try {
        await advanceWinnerMutation.mutateAsync({
          matchId: match.matchId,
          winnerRegistrationId: participations[0].registrationId!,
        });
      } catch {
        alert("Hubo un error al avanzar al participante. Por favor intenta nuevamente.");
      }
    }
  };

  if (!match.participations || match.participations.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Error: Participantes no encontrados
          </h2>
          <p className="text-gray-700 mb-4">Este match no tiene participantes asignados.</p>
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

  // ── Tarjeta de participante ──────────────────────────────────
  const ParticipantCard = ({
    participant,
    color,
  }: {
    participant: typeof participant1;
    color: "red" | "orange";
  }) => {
    if (!participant) {
      return (
        <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              ?
            </div>
            <p className="text-xl font-bold text-gray-400">TBD</p>
            <p className="text-sm text-gray-500">Sin asignar</p>
          </div>
        </div>
      );
    }

    const isWinnerCard  = isWinner(participant?.participationId || 0);
    const isParticipant1 = participant === participant1;
    const accuracy      = isParticipant1 ? p1Accuracy     : p2Accuracy;
    const presentation  = isParticipant1 ? p1Presentation : p2Presentation;
    const total         = isParticipant1 ? p1Total        : p2Total;

    const colorClasses = {
      red: {
        border:      "border-red-500",
        bg:          "bg-red-50",
        photoBorder: "border-red-300",
        gradient:    "from-red-400 to-red-600",
        scoreBg:     "bg-red-100",
        scoreText:   "text-red-600",
        badgeBg:     "bg-red-600",
      },
      orange: {
        border:      "border-orange-500",
        bg:          "bg-orange-50",
        photoBorder: "border-orange-300",
        gradient:    "from-orange-400 to-orange-600",
        scoreBg:     "bg-orange-100",
        scoreText:   "text-orange-600",
        badgeBg:     "bg-orange-600",
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
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </div>

            {/* Score total */}
            <div className={`text-center ${classes.scoreBg} rounded-lg py-3`}>
              <span className="text-sm text-gray-600 block mb-1">Puntaje Total</span>
              <span className={`text-4xl font-bold ${classes.scoreText}`}>
                {hasScores ? total.toFixed(2) : "-"}
              </span>
            </div>

            {/* Desglose */}
            {hasScores && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-700">Accuracy</span>
                  <span className="font-bold text-red-600">{accuracy.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-700">Presentación</span>
                  <span className="font-bold text-orange-600">{presentation.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Badge ganador */}
            {isWinnerCard && (
              <div
                className={`mt-3 inline-flex items-center gap-2 ${classes.badgeBg} text-white px-3 py-1 rounded-full text-sm font-bold`}
              >
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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Match #{match.matchNumber}</h2>
                <p className="text-sm text-red-100 flex items-center gap-2">
                  {match.round} • Taolu •{" "}
                  {isTeam ? (
                    <><Users className="h-3.5 w-3.5" /> Equipo</>
                  ) : (
                    <><User className="h-3.5 w-3.5" /> Individual</>
                  )}
                </p>
              </div>
            </div>

            {/* Botones de acción en el header */}
            <div className="flex items-center gap-2">
              {canAdvance && (
                <button
                  onClick={handleAdvanceParticipant}
                  disabled={advanceWinnerMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm shadow-lg"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {advanceWinnerMutation.isPending ? "Procesando..." : "Pasar Participante"}
                  </span>
                </button>
              )}

              {canRegisterScore && (
                <button
                  onClick={() => setIsScoreModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm backdrop-blur-sm"
                >
                  {hasScores ? (
                    <><Edit3 className="w-4 h-4" /><span className="hidden sm:inline">Editar Puntajes</span></>
                  ) : (
                    <><PlusCircle className="w-4 h-4" /><span className="hidden sm:inline">Registrar Puntajes</span></>
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
          <div className="px-6 py-4 bg-gray-50 border-b grid grid-cols-2 gap-4 text-sm">
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
          </div>

          {/* Banner participante único */}
          {canAdvance && (
            <div className="mx-6 mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm font-semibold text-amber-900">
                {isTeam ? "Equipo sin oponente" : "Participante sin oponente"}
              </p>
            </div>
          )}

          {/* Participants */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ParticipantCard participant={participant1} color="red" />
              <ParticipantCard participant={participant2} color="orange" />
            </div>

            {!hasScores && participations.length === 2 && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700">No hay puntajes registrados aún</p>
                <p className="text-sm text-gray-500 mt-1">
                  {canRegisterScore
                    ? "Usa el botón de arriba para comenzar a registrar"
                    : "Se necesitan ambos participantes para registrar puntajes"}
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
                {match.status === "en_curso"   && "En Curso"}
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

      {/* Modal de puntajes */}
      <WushuTaoluScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        match={match}
        phase={phase}
      />
    </>
  );
};
