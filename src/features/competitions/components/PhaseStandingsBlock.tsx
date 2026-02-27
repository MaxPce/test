// src/features/competitions/components/PhaseStandingsBlock.tsx

import { useState } from "react";
import { Trophy, BarChart3, User, Calendar } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useStandings } from "@/features/competitions/api/standings.queries";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { CollectiveMatchDetailsModal } from "@/features/competitions/components/collective/CollectiveMatchDetailsModal";
import { getImageUrl } from "@/lib/utils/imageUrl";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface SportConfig {
  title: string;
  subtitle: string;
  headers: {
    wins: string;
    draws: string;
    losses: string;
    scoreFor: string;
    scoreAgainst: string;
    scoreDiff: string;
  };
  legend: {
    wins: string;
    draws: string;
    losses: string;
    scores?: string;
  };
  showScores: boolean;
}

interface PhaseStandingsBlockProps {
  phase: any;
  config: SportConfig;
}

// ── Helpers puros ────────────────────────────────────────────────────────────

function getMatchStatusConfig(status: string) {
  const configs: Record<string, { label: string; className: string }> = {
    programado: { label: "Programado", className: "bg-blue-100 text-blue-700" },
    en_curso:   { label: "En Curso",   className: "bg-green-100 text-green-700 animate-pulse" },
    finalizado: { label: "Finalizado", className: "bg-gray-100 text-gray-600" },
    cancelado:  { label: "Cancelado",  className: "bg-red-100 text-red-600" },
  };
  return configs[status] ?? configs.programado;
}

function getParticipantName(participation: any): string {
  const reg = participation?.registration;
  return (
    reg?.team?.name ??
    reg?.athlete?.name ??
    `Participante #${participation?.participationId ?? "?"}`
  );
}

function getParticipantInstitution(participation: any): string {
  const reg = participation?.registration;
  return (
    reg?.team?.institution?.abrev ??
    reg?.athlete?.institution?.abrev ??
    ""
  );
}

function getParticipantLogo(participation: any): string | undefined {
  const reg = participation?.registration;
  return reg?.team?.institution?.logoUrl ?? reg?.athlete?.institution?.logoUrl;
}

// ── Componente ───────────────────────────────────────────────────────────────

export function PhaseStandingsBlock({ phase, config }: PhaseStandingsBlockProps) {
  const { data: standings = [], isLoading } = useStandings(phase.phaseId);
  const { data: matches = [], isLoading: matchesLoading } = useMatches(phase.phaseId);

  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedPhase, setSelectedPhase] = useState<any>(null);
  const [isMatchDetailOpen, setIsMatchDetailOpen] = useState(false);
  const [showMatches, setShowMatches] = useState(true);

  const phaseMatches = phase.matches || [];
  const allMatchesFinished =
    phaseMatches.length > 0 &&
    phaseMatches
      .filter((m: any) => (m.participations?.length ?? 0) >= 2)
      .every((m: any) => m.status === "finalizado");

  const handleCloseModal = () => {
    setIsMatchDetailOpen(false);
    setSelectedMatch(null);
    setSelectedPhase(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-lg">{phase.name}</h4>
          <Badge variant="primary">{standings.length} participantes</Badge>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando posiciones...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">No hay datos de posiciones</p>
          </div>
        ) : (
          <>
            {/* ── Tabla de posiciones ──────────────────────────────────────── */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      PJ
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {config.headers.wins}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {config.headers.draws}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {config.headers.losses}
                    </th>
                    {config.showScores && (
                      <>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          {config.headers.scoreFor}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          {config.headers.scoreAgainst}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          {config.headers.scoreDiff}
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {standings.map((standing, index) => {
                    const reg = standing.registration;
                    const isAthlete = !!reg?.athlete;
                    const name =
                      reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                    const institution =
                      reg?.athlete?.institution || reg?.team?.institution;
                    const photoUrl = reg?.athlete?.photoUrl;
                    const logoUrl = institution?.logoUrl;
                    const isQualified = allMatchesFinished && index < 2;

                    return (
                      <tr
                        key={standing.standingId}
                        className={`${
                          isQualified
                            ? "bg-gradient-to-r from-green-50 to-emerald-50"
                            : "hover:bg-gray-50"
                        } transition-colors`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isQualified && (
                              <Trophy className="h-4 w-4 text-green-600" />
                            )}
                            <Badge
                              variant={isQualified ? "success" : "default"}
                              size="sm"
                              className="font-bold"
                            >
                              {standing.rankPosition || index + 1}°
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {isAthlete && photoUrl ? (
                              <img
                                src={getImageUrl(photoUrl)}
                                alt={name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {name}
                              </p>
                              {institution && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  {logoUrl && (
                                    <img
                                      src={getImageUrl(logoUrl)}
                                      alt={institution.name}
                                      className="h-4 w-4 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  )}
                                  <p className="text-xs text-gray-600 font-medium">
                                    {institution.abrev || institution.name}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          {standing.matchesPlayed}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-green-600 font-bold">
                          {standing.wins}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 font-medium">
                          {standing.draws}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-red-600 font-bold">
                          {standing.losses}
                        </td>
                        {config.showScores && (
                          <>
                            <td className="px-4 py-3 text-center text-sm font-medium">
                              {standing.scoreFor}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-medium">
                              {standing.scoreAgainst}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-bold">
                              <span
                                className={
                                  standing.scoreDiff > 0
                                    ? "text-green-600"
                                    : standing.scoreDiff < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }
                              >
                                {standing.scoreDiff > 0 && "+"}
                                {standing.scoreDiff}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant="primary"
                            className="font-bold text-base px-3"
                          >
                            {standing.points}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Leyenda ──────────────────────────────────────────────────── */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600">
                <span><strong>PJ:</strong> Partidos Jugados</span>
                <span><strong>{config.headers.wins}:</strong> {config.legend.wins}</span>
                <span><strong>{config.headers.draws}:</strong> {config.legend.draws}</span>
                <span><strong>{config.headers.losses}:</strong> {config.legend.losses}</span>
                {config.showScores && config.legend.scores && (
                  <span>
                    <strong>
                      {config.headers.scoreFor}/{config.headers.scoreAgainst}:
                    </strong>{" "}
                    {config.legend.scores} A Favor/En Contra
                  </span>
                )}
                <span><strong>Pts:</strong> Puntos</span>
              </div>
            </div>

            {/* ── Sección de partidos ──────────────────────────────────────── */}
            <div className="border-t-2 border-gray-200">
              <button
                onClick={() => setShowMatches((prev) => !prev)}
                className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-700 text-sm">
                    Partidos
                  </span>
                  <Badge variant="default" size="sm">
                    {matchesLoading
                      ? "..."
                      : `${matches.length} partido${matches.length !== 1 ? "s" : ""}`}
                  </Badge>
                </div>
                <span className="text-slate-400 text-xs font-medium">
                  {showMatches ? "▲ Ocultar" : "▼ Ver partidos"}
                </span>
              </button>

              {showMatches && (
                <>
                  {matchesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No hay partidos registrados</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {matches.map((match: any) => {
                        const [partA, partB] = match.participations ?? [];
                        const nameA = getParticipantName(partA);
                        const nameB = getParticipantName(partB);
                        const instA = getParticipantInstitution(partA);
                        const instB = getParticipantInstitution(partB);
                        const logoA = getParticipantLogo(partA);
                        const logoB = getParticipantLogo(partB);
                        const statusCfg = getMatchStatusConfig(match.status);
                        const isFinished = match.status === "finalizado";

                        // ✅ Fix scores: cubre participant1Score y scoreA
                        const scoreA = match.scoreA ?? match.participant1Score ?? "-";
                        const scoreB = match.scoreB ?? match.participant2Score ?? "-";

                        // ✅ Fix winner: cubre winnerRegistrationId y winnerParticipantId
                        const winnerRegId =
                          match.winnerRegistrationId ?? match.winnerParticipantId;
                        const aWon =
                          isFinished && winnerRegId != null &&
                          winnerRegId === partA?.registrationId;
                        const bWon =
                          isFinished && winnerRegId != null &&
                          winnerRegId === partB?.registrationId;

                        return (
                          <div
                            key={match.matchId}
                            onClick={() => {
                              setSelectedMatch(match);
                              setSelectedPhase(phase);
                              setIsMatchDetailOpen(true);
                            }}
                            className="px-4 py-3 hover:bg-blue-50/40 transition-colors cursor-pointer"
                          >
                            {/* Número y estado */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400 font-medium">
                                {match.matchNumber
                                  ? `Partido #${match.matchNumber}`
                                  : `ID ${match.matchId}`}
                                {match.round ? ` · Ronda ${match.round}` : ""}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}
                              >
                                {statusCfg.label}
                              </span>
                            </div>

                            {/* Equipo A — Score — Equipo B */}
                            <div className="flex items-center gap-3">
                              {/* Equipo A */}
                              <div
                                className={`flex-1 flex flex-col items-end gap-0.5 transition-opacity ${
                                  isFinished && !aWon ? "opacity-40" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {logoA && (
                                    <img
                                      src={getImageUrl(logoA)}
                                      alt={instA}
                                      className="h-5 w-5 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  )}
                                  <span
                                    className={`text-sm font-bold text-right leading-tight ${
                                      aWon ? "text-green-700" : "text-gray-800"
                                    }`}
                                  >
                                    {nameA}
                                  </span>
                                  {aWon && (
                                    <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                                  )}
                                </div>
                                {instA && (
                                  <span className="text-xs text-gray-400">
                                    {instA}
                                  </span>
                                )}
                              </div>

                              {/* Marcador */}
                              <div className="flex items-center gap-1 min-w-[72px] justify-center shrink-0">
                                {isFinished ? (
                                  <div className="flex items-center gap-1 bg-gray-900 rounded-lg px-2.5 py-1">
                                    <span
                                      className={`text-lg font-black leading-none ${
                                        aWon ? "text-green-400" : "text-gray-400"
                                      }`}
                                    >
                                      {scoreA}
                                    </span>
                                    <span className="text-gray-500 font-bold text-xs">
                                      –
                                    </span>
                                    <span
                                      className={`text-lg font-black leading-none ${
                                        bWon ? "text-green-400" : "text-gray-400"
                                      }`}
                                    >
                                      {scoreB}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg tracking-widest">
                                    vs
                                  </span>
                                )}
                              </div>

                              {/* Equipo B */}
                              <div
                                className={`flex-1 flex flex-col items-start gap-0.5 transition-opacity ${
                                  isFinished && !bWon ? "opacity-40" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {bWon && (
                                    <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                                  )}
                                  <span
                                    className={`text-sm font-bold leading-tight ${
                                      bWon ? "text-green-700" : "text-gray-800"
                                    }`}
                                  >
                                    {nameB}
                                  </span>
                                  {logoB && (
                                    <img
                                      src={getImageUrl(logoB)}
                                      alt={instB}
                                      className="h-5 w-5 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  )}
                                </div>
                                {instB && (
                                  <span className="text-xs text-gray-400">
                                    {instB}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Fecha y lugar */}
                            {(match.scheduledTime || match.location) && (
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                {match.scheduledTime && (
                                  <span>
                                    📅{" "}
                                    {new Date(match.scheduledTime).toLocaleString(
                                      "es-PE",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                )}
                                {match.location && (
                                  <span>📍 {match.location}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardBody>

      {/* ── Modal detalle del partido ─────────────────────────────────────── */}
      {selectedMatch && selectedPhase && (
        <CollectiveMatchDetailsModal
          isOpen={isMatchDetailOpen}
          onClose={handleCloseModal}
          match={selectedMatch}
          phase={selectedPhase}
        />
      )}
    </Card>
  );
}
