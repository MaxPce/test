import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, UserPlus, Trophy, Clock, MapPin, Award,
  ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { MatchForm } from "@/features/competitions/components/MatchForm";
import { AssignParticipantsModal } from "@/features/competitions/components/AssignParticipantsModal";
import { ResultModal } from "@/features/competitions/components/ResultModal";
import { apiClient } from "@/lib/api/client";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Phase, Match } from "@/features/competitions/types";
import type { Registration } from "@/features/events/types";

interface Props {
  group: Phase;
  allRegistrations: Registration[];
  /** Generación de partidos (round robin del grupo) */
  onGenerateMatches?: (group: Phase) => void;
  isGenerating?: boolean;
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { variant: "primary" | "success" | "default" | "warning"; label: string; dot: boolean }> = {
    programado: { variant: "primary",  label: "Programado", dot: true  },
    en_curso:   { variant: "success",  label: "En Curso",   dot: true  },
    finalizado: { variant: "default",  label: "Finalizado", dot: false },
    cancelado:  { variant: "warning",  label: "Cancelado",  dot: false },
  };
  return configs[status] ?? configs.programado;
};

export function GroupMatchesPanel({
  group,
  allRegistrations,
  onGenerateMatches,
  isGenerating = false,
}: Props) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded]       = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMatchForm,  setShowMatchForm]  = useState(false);
  const [showAssign,     setShowAssign]     = useState(false);
  const [showResult,     setShowResult]     = useState(false);

  // ── Fetch partidos del grupo ──────────────────────────────────────────────
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["matches", "group", group.phaseId],
    queryFn: async () => {
      const { data } = await apiClient.get("/competitions/matches", {
        params: { phaseId: group.phaseId },
      });
      return data;
    },
    enabled: expanded, // solo carga cuando el panel está abierto
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["matches", "group", group.phaseId] });

  // ── Crear partido manual ──────────────────────────────────────────────────
  const handleCreateMatch = async (dto: any) => {
    await apiClient.post("/competitions/matches", { ...dto, phaseId: group.phaseId });
    invalidate();
    setShowMatchForm(false);
  };

  // ── Asignar participante ──────────────────────────────────────────────────
  const handleAssign = async (matchId: number, registrationId: number, corner: string) => {
    await apiClient.post("/competitions/participations", { matchId, registrationId, corner });
    invalidate();
    setShowAssign(false);
    setSelectedMatch(null);
  };

  // ── Registrar resultado ───────────────────────────────────────────────────
  const handleResult = async (matchId: number, winnerId: number) => {
    await apiClient.patch(`/competitions/matches/${matchId}`, {
        winnerRegistrationId: winnerId,
        status: "finalizado",
    });

    await apiClient.post(`/competitions/phases/${group.phaseId}/standings/update`);

    invalidate();
    queryClient.invalidateQueries({ queryKey: ["phases"] });
    setShowResult(false);
    setSelectedMatch(null);
    };


  // ── Eliminar partido ──────────────────────────────────────────────────────
  const handleDelete = async (matchId: number) => {
    if (!confirm("¿Eliminar este partido?")) return;
    await apiClient.delete(`/competitions/matches/${matchId}`);
    invalidate();
  };

  const finishedCount = matches.filter((m) => m.status === "finalizado").length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mt-2">

      {/* ── Header colapsable ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3
                   bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            Partidos — {group.groupLabel ?? group.name}
          </span>
          {matches.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
              {finishedCount}/{matches.length} finalizados
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp  className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </button>

      {/* ── Contenido ── */}
      {expanded && (
        <div className="border-t border-slate-200">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <span className="text-xs text-slate-500">
              {matches.length === 0
                ? "Sin partidos generados"
                : `${matches.length} partidos en este grupo`}
            </span>
            <div className="flex gap-2">
              {matches.length === 0 && onGenerateMatches && (
                <Button
                  size="sm"
                  variant="gradient"
                  isLoading={isGenerating}
                  onClick={() => onGenerateMatches(group)}
                >
                  Generar Round Robin
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setShowMatchForm(true)}
              >
                Nuevo Partido
              </Button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && matches.length === 0 && (
            <div className="px-4 py-6">
              <EmptyState title="No hay partidos en este grupo" />
            </div>
          )}

          {/* Lista de partidos */}
          {!isLoading && matches.length > 0 && (
            <div className="divide-y divide-slate-100">
              {matches.map((match) => {
                const participants = match.participations ?? [];
                const statusConfig = getStatusConfig(match.status);

                return (
                  <div key={match.matchId} className="px-4 py-3 hover:bg-slate-50 transition-colors">

                    {/* Encabezado del partido */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {match.matchNumber && (
                          <span className="text-xs font-bold text-slate-700">
                            #{match.matchNumber}
                          </span>
                        )}
                        {match.round && (
                          <Badge variant="default" size="sm">{match.round}</Badge>
                        )}
                        <Badge
                          variant={statusConfig.variant}
                          dot={statusConfig.dot}
                          size="sm"
                        >
                          {statusConfig.label}
                        </Badge>
                        {match.scheduledTime && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {new Date(match.scheduledTime).toLocaleString("es-ES")}
                          </span>
                        )}
                        {match.platformNumber && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            Plataforma {match.platformNumber}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(match.matchId)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg
                                   text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label="Eliminar partido"
                      >
                        ×
                      </button>
                    </div>

                    {/* Participantes */}
                    {participants.length > 0 ? (
                      <div className="space-y-1.5 mb-2">
                        {participants.map((p) => {
                          const reg         = p.registration;
                          const name        = reg?.athlete?.name ?? reg?.team?.name ?? "Sin nombre";
                          const institution = reg?.athlete?.institution ?? reg?.team?.institution;
                          const logoUrl     = institution?.logoUrl;
                          const isWinner    = match.winnerRegistrationId === p.registrationId;

                          return (
                            <div
                              key={p.participationId}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                                isWinner
                                  ? "bg-emerald-50 border border-emerald-200"
                                  : "bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {logoUrl ? (
                                  <img
                                    src={getImageUrl(logoUrl)}
                                    alt={institution?.name ?? ""}
                                    className="h-7 w-7 rounded object-contain bg-white p-0.5"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded bg-slate-200 flex items-center justify-center">
                                    <Trophy className="h-3.5 w-3.5 text-slate-400" />
                                  </div>
                                )}
                                <span className="font-medium text-slate-800">{name}</span>
                                {institution && (
                                  <span className="text-xs text-slate-400">
                                    ({institution.name})
                                  </span>
                                )}
                                {isWinner && (
                                  <Award className="h-4 w-4 text-emerald-500 ml-1" />
                                )}
                              </div>
                              <Badge
                                variant={
                                  p.corner === "A" || p.corner === "blue"
                                    ? "primary"
                                    : "default"
                                }
                                size="sm"
                              >
                                {p.corner === "blue"  ? "Azul"
                                 : p.corner === "white" ? "Blanco"
                                 : p.corner === "A"     ? "Equipo A"
                                 : p.corner === "B"     ? "Equipo B"
                                 : p.corner}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-slate-50 rounded-lg mb-2">
                        <p className="text-xs text-slate-400">Sin participantes asignados</p>
                      </div>
                    )}

                    {/* Acciones del partido */}
                    <div className="flex flex-wrap gap-1.5">
                      {participants.length < 2 && match.status !== "finalizado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<UserPlus className="h-3.5 w-3.5" />}
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowAssign(true);
                          }}
                        >
                          Asignar
                        </Button>
                      )}

                      {participants.length === 1 && match.status !== "finalizado" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={async () => {
                            const p    = participants[0];
                            const name = p.registration?.athlete?.name
                              ?? p.registration?.team?.name
                              ?? "este participante";
                            if (confirm(`¿Avanzar a ${name} automáticamente (BYE)?`)) {
                              await apiClient.post(
                                `/competitions/matches/${match.matchId}/advance-winner`,
                                { winnerRegistrationId: p.registrationId },
                              );
                              invalidate();
                              queryClient.invalidateQueries({ queryKey: ["phases"] });
                            }
                          }}
                        >
                          Pasar (BYE)
                        </Button>
                      )}

                      {participants.length === 2 && match.status !== "finalizado" && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowResult(true);
                          }}
                        >
                          Registrar Resultado
                        </Button>
                      )}

                      {participants.length === 2 && match.status === "finalizado" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowResult(true);
                          }}
                        >
                          Editar Resultado
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modales ── */}
      {showMatchForm && (
        <Modal
          isOpen={showMatchForm}
          onClose={() => setShowMatchForm(false)}
          title={`Nuevo Partido — ${group.groupLabel ?? group.name}`}
          size="md"
        >
          <MatchForm
            phase={group}
            existingMatches={matches}
            onSubmit={handleCreateMatch}
            onCancel={() => setShowMatchForm(false)}
            isLoading={false}
          />
        </Modal>
      )}

      {showAssign && selectedMatch && (
        <AssignParticipantsModal
          isOpen={showAssign}
          onClose={() => { setShowAssign(false); setSelectedMatch(null); }}
          match={selectedMatch}
          registrations={allRegistrations}
          onAssign={handleAssign}
          isLoading={false}
        />
      )}

      {showResult && selectedMatch && (
        <ResultModal
            isOpen={showResult}
            onClose={() => { setShowResult(false); setSelectedMatch(null); }}
            match={selectedMatch}
            onSubmit={handleResult}
            isLoading={false}
        />
        )}
    </div>
  );
}