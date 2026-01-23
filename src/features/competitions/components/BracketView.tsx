import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Trophy, Edit, Zap, Award } from "lucide-react";
import type { Match, Phase } from "../types";
import { EditMatchParticipantsModal } from "./EditMatchParticipantsModal";
import { ResultModal } from "./ResultModal";
import { useAdvanceWinner } from "../api/bracket.mutations";
import {
  useBracketChampion,
  useBracketThirdPlace,
} from "../api/bracket.queries";

interface BracketViewProps {
  matches: Match[];
  phase: Phase;
}

export function BracketView({ matches, phase }: BracketViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const advanceWinner = useAdvanceWinner();

  // Obtener campeón y tercer lugar
  const { data: champion } = useBracketChampion(phase.phaseId, true);
  const { data: thirdPlace } = useBracketThirdPlace(phase.phaseId, true);

  // Organizar partidos por ronda
  const rounds: Record<string, Match[]> = {};
  let thirdPlaceMatch: Match | null = null;

  matches.forEach((match) => {
    if (match.round === "tercer_lugar") {
      thirdPlaceMatch = match;
    } else {
      const round = match.round || "sin_ronda";
      if (!rounds[round]) {
        rounds[round] = [];
      }
      rounds[round].push(match);
    }
  });

  // Orden de rondas para bracket
  const roundOrder = [
    "dieciseisavos",
    "octavos",
    "cuartos",
    "semifinal",
    "final",
  ];

  const orderedRounds = roundOrder.filter((r) => rounds[r]);

  const getRoundLabel = (round: string) => {
    const labels: Record<string, string> = {
      final: "Final",
      semifinal: "Semifinales",
      cuartos: "Cuartos",
      octavos: "Octavos",
      dieciseisavos: "Dieciseisavos",
    };
    return labels[round] || round;
  };

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsEditModalOpen(true);
  };

  const handleSetResult = (match: Match) => {
    setSelectedMatch(match);
    setIsResultModalOpen(true);
  };

  const handleAdvanceWinner = (matchId: number, winnerId: number) => {
    advanceWinner.mutate({
      matchId,
      winnerRegistrationId: winnerId,
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Campeón y Tercer Lugar */}
        {(champion || thirdPlace) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {champion && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-2 border-yellow-400">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <h3 className="text-xl font-bold text-yellow-900">
                    🏆 Campeón
                  </h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {champion.registration?.athlete?.name ||
                    champion.registration?.team?.name}
                </p>
                {(champion.registration?.athlete?.institution?.name ||
                  champion.registration?.team?.institution?.name) && (
                  <p className="text-sm text-gray-600">
                    {champion.registration.athlete?.institution?.name ||
                      champion.registration.team?.institution?.name}
                  </p>
                )}
              </div>
            )}

            {thirdPlace && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-400">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="h-8 w-8 text-orange-600" />
                  <h3 className="text-xl font-bold text-orange-900">
                    🥉 Tercer Lugar
                  </h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {thirdPlace.registration?.athlete?.name ||
                    thirdPlace.registration?.team?.name}
                </p>
                {(thirdPlace.registration?.athlete?.institution?.name ||
                  thirdPlace.registration?.team?.institution?.name) && (
                  <p className="text-sm text-gray-600">
                    {thirdPlace.registration.athlete?.institution?.name ||
                      thirdPlace.registration.team?.institution?.name}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bracket principal */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-8 p-4 min-w-full">
            {orderedRounds.map((roundKey) => (
              <div key={roundKey} className="flex flex-col gap-4 min-w-[280px]">
                {/* Título de la ronda */}
                <div className="text-center mb-2">
                  <h5 className="font-semibold text-gray-900">
                    {getRoundLabel(roundKey)}
                  </h5>
                </div>

                {/* Partidos de la ronda */}
                <div className="space-y-6">
                  {rounds[roundKey].map((match) => (
                    <MatchCard
                      key={match.matchId}
                      match={match}
                      onEdit={handleEditMatch}
                      onSetResult={handleSetResult}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match de tercer lugar */}
        {thirdPlaceMatch && (
          <div className="mt-8 pt-8 border-t">
            <h5 className="text-center font-semibold text-gray-900 mb-4">
              🥉 Partido de Tercer Lugar
            </h5>
            <div className="flex justify-center">
              <div className="w-80">
                <MatchCard
                  match={thirdPlaceMatch}
                  onEdit={handleEditMatch}
                  onSetResult={handleSetResult}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {selectedMatch && (
        <>
          <EditMatchParticipantsModal
            match={selectedMatch}
            phaseId={phase.phaseId}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMatch(null);
            }}
          />
          <ResultModal
            match={selectedMatch}
            isOpen={isResultModalOpen}
            onClose={() => {
              setIsResultModalOpen(false);
              setSelectedMatch(null);
            }}
            onSubmit={handleAdvanceWinner}
            isLoading={advanceWinner.isPending}
          />
        </>
      )}
    </>
  );
}

// Componente separado para cada match
function MatchCard({
  match,
  onEdit,
  onSetResult,
}: {
  match: Match;
  onEdit: (match: Match) => void;
  onSetResult: (match: Match) => void;
}) {
  const participants = match.participations || [];
  const canSetResult =
    match.status !== "finalizado" && participants.length === 2;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header del partido */}
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            {match.matchNumber && `#${match.matchNumber}`}
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                match.status === "finalizado"
                  ? "default"
                  : match.status === "en_curso"
                    ? "success"
                    : "primary"
              }
              size="sm"
            >
              {match.status === "programado" && "Programado"}
              {match.status === "en_curso" && "En Curso"}
              {match.status === "finalizado" && "Finalizado"}
            </Badge>
            {canSetResult && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSetResult(match)}
                className="p-1 h-6 w-6"
                title="Registrar resultado"
              >
                <Zap className="h-3 w-3 text-green-600" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(match)}
              className="p-1 h-6 w-6"
              title="Editar participantes"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Participantes */}
      <div className="divide-y divide-gray-200">
        {participants.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            Sin participantes
          </div>
        ) : (
          participants.map((participation) => {
            const reg = participation.registration;
            const name = reg?.athlete
              ? reg.athlete.name
              : reg?.team?.name || "TBD";
            const institution =
              reg?.athlete?.institution?.name || reg?.team?.institution?.name;
            const isWinner =
              match.winnerRegistrationId === participation.registrationId;

            return (
              <div
                key={participation.participationId}
                className={`p-3 ${
                  isWinner ? "bg-green-50 font-semibold" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {isWinner && (
                      <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          isWinner ? "text-green-900" : "text-gray-900"
                        }`}
                      >
                        {name}
                      </p>
                      {institution && (
                        <p className="text-xs text-gray-500 truncate">
                          {institution}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      participation.corner === "blue" ||
                      participation.corner === "A"
                        ? "primary"
                        : "default"
                    }
                    size="sm"
                  >
                    {participation.corner === "blue" && "Azul"}
                    {participation.corner === "white" && "Blanco"}
                    {participation.corner === "A" && "A"}
                    {participation.corner === "B" && "B"}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info adicional */}
      {match.scheduledTime && (
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            📅{" "}
            {new Date(match.scheduledTime).toLocaleString("es-ES", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
