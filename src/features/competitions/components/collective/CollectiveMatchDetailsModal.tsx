import { X, Trophy, Clock, Calendar, MapPin, Award } from "lucide-react";
import { useState } from "react";
import { useAdvanceWinner } from "../../api/bracket.mutations";
import { CollectiveScoreModal } from "./CollectiveScoreModal";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Phase } from "../../types";

interface CollectiveMatch {
  matchId: number;
  matchNumber?: number;
  status: string;
  round?: string;
  scheduledTime?: string;
  platformNumber?: number;
  winnerRegistrationId?: number | null;
  participant1Score?: number | null;
  participant2Score?: number | null;
  participations?: Array<{
    participationId: number;
    registrationId: number;
    corner?: string;
    registration?: {
      registrationId: number;
      athlete?: {
        name: string;
        institution?: { name: string; logoUrl?: string };
      };
      team?: {
        name: string;
        institution?: { name: string; logoUrl?: string };
      };
    };
  }>;
}

interface Props {
  match: CollectiveMatch;
  phase: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export const CollectiveMatchDetailsModal = ({
  match,
  phase,
  isOpen,
  onClose,
}: Props) => {
  const advanceWinnerMutation = useAdvanceWinner();
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  if (!isOpen) return null;

  const participant1 = match.participations?.[0];
  const participant2 = match.participations?.[1];

  const getParticipantName = (participation: typeof participant1): string => {
    if (!participation) return "Por definir";
    const reg = participation.registration;
    return reg?.team?.name || reg?.athlete?.name || "Por definir";
  };

  const getInstitution = (participation: typeof participant1) =>
    participation?.registration?.team?.institution ||
    participation?.registration?.athlete?.institution;

  const isWinner = (participation: typeof participant1) =>
    participation?.registrationId === match.winnerRegistrationId;

  const formatScore = (score: any): string => {
    if (score === null || score === undefined) return "-";
    const n = Math.floor(Number(score));
    return isNaN(n) ? "-" : String(n);
  };

  const hasScore =
    match.participant1Score !== null && match.participant1Score !== undefined;

  const participations = match.participations || [];
  const canRegisterScore = participations.length >= 2;
  const hasOnlyOneParticipant = participations.length === 1;
  const canAdvance = hasOnlyOneParticipant && match.status !== "finalizado";

  const handleAdvanceParticipant = async () => {
    if (!participations[0]) return;
    const name = getParticipantName(participations[0]);
    if (confirm(`¿Avanzar a ${name} automáticamente?`)) {
      try {
        await advanceWinnerMutation.mutateAsync({
          matchId: match.matchId,
          winnerRegistrationId: participations[0].registrationId!,
        });
      } catch {
        alert("Hubo un error al avanzar al participante.");
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-700 to-emerald-500 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">
                  Partido #{match.matchNumber}
                </h2>
                <p className="text-sm text-green-100">{match.round}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canAdvance && (
                <button
                  onClick={handleAdvanceParticipant}
                  disabled={advanceWinnerMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 rounded-lg transition-colors font-medium text-sm"
                >
                  {advanceWinnerMutation.isPending
                    ? "Procesando..."
                    : "Pasar Participante"}
                </button>
              )}

              {canRegisterScore && (
                <button
                  onClick={() => setIsScoreModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm backdrop-blur-sm"
                >
                  {hasScore ? "Editar Resultado" : "Registrar Resultado"}
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
                  ? `Campo ${match.platformNumber}`
                  : "Sin asignar"}
              </span>
            </div>
          </div>

          {canAdvance && (
            <div className="mx-6 mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm font-semibold text-amber-900">
                Equipo sin oponente asignado
              </p>
            </div>
          )}

          {/* Participants */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Equipo 1 — Local */}
              {[participant1, participant2].map((p, idx) => {
                const institution = getInstitution(p);
                const won = isWinner(p);
                const score =
                  idx === 0
                    ? formatScore(match.participant1Score)
                    : formatScore(match.participant2Score);
                const colorWin =
                  idx === 0
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-blue-500 bg-blue-50 shadow-lg";
                const colorScore =
                  idx === 0 ? "text-green-700" : "text-blue-700";
                const colorAward =
                  idx === 0 ? "text-green-600" : "text-blue-600";

                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-6 transition-all ${
                      won ? colorWin : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {institution?.logoUrl ? (
                        <img
                          src={getImageUrl(institution.logoUrl)}
                          alt={institution.name}
                          className="w-16 h-16 object-contain flex-shrink-0 rounded-lg border border-gray-100 bg-white p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-xl font-bold text-gray-500 flex-shrink-0">
                          {getParticipantName(p).charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {getParticipantName(p)}
                        </h3>
                        <p className="text-sm text-gray-500 truncate mb-3">
                          {institution?.name || "Sin institución"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Award className={`w-5 h-5 ${colorAward}`} />
                          <span
                            className={`text-4xl font-black ${won ? colorScore : "text-gray-400"}`}
                          >
                            {score}
                          </span>
                        </div>
                        {won && (
                          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            <Trophy className="w-3 h-3" />
                            GANADOR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Marcador central */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Resultado del Partido
              </h3>

              {!hasScore ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="font-medium">No hay resultado registrado aún</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-6">
                  <div
                    className={`rounded-xl p-6 text-center border-2 flex-1 ${
                      isWinner(participant1)
                        ? "bg-green-100 border-green-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      {getParticipantName(participant1)}
                    </p>
                    <p
                      className={`text-5xl font-black ${
                        isWinner(participant1)
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatScore(match.participant1Score)}
                    </p>
                  </div>

                  <div className="text-3xl font-black text-gray-300">-</div>

                  <div
                    className={`rounded-xl p-6 text-center border-2 flex-1 ${
                      isWinner(participant2)
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      {getParticipantName(participant2)}
                    </p>
                    <p
                      className={`text-5xl font-black ${
                        isWinner(participant2)
                          ? "text-blue-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatScore(match.participant2Score)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
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
        <CollectiveScoreModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          match={match as any}
          phase={phase}
        />
      )}
    </>
  );
};
