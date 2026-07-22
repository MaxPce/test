import { Trophy, Plus, UserPlus, Calendar, Clock, MapPin, Award, Users, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { MatchForm } from "@/features/competitions/components/MatchForm";
import { AssignParticipantsModal } from "@/features/competitions/components/AssignParticipantsModal";
import { ResultModal } from "@/features/competitions/components/ResultModal";
import { BestOf3View } from "@/features/competitions/components/BestOf3View";
import { GenerateBracketModal } from "@/features/competitions/components/GenerateBracketModal";
import { GenerateRoundRobinModal } from "@/features/competitions/components/GenerateRoundRobinModal";
import { GenerateBestOf3Modal } from "@/features/competitions/components/GenerateBestOf3Modal";
import { InitializePoomsaeGroupModal } from "@/features/competitions/components/InitializePoomsaeGroupModal";
import { InitializeShootingGroupModal } from "@/features/competitions/components/InitializeShootingGroupModal";
import { TableTennisMatchWrapper } from "@/features/competitions/components/table-tennis/TableTennisMatchWrapper";
import { PoomsaeScoreModal } from "@/features/competitions/components/taekwondo/PoomsaeScoreModal";
import { PoomsaeScoreTable } from "@/features/competitions/components/taekwondo/PoomsaeScoreTable";
import { KyoruguiRoundsModal } from "@/features/competitions/components/taekwondo/KyoruguiRoundsModal";
import { JudoScoreModal } from "@/features/competitions/components/judo/JudoScoreModal";
import { KarateScoreModal } from "@/features/competitions/components/karate/KarateScoreModal";
import { WushuScoreModal } from "@/features/competitions/components/wushu/WushuScoreModal";
import { WushuTaoluScoreModal } from "@/features/competitions/components/wushu/WushuTaoluScoreModal";
import { WushuTaoluScoreTable } from "@/features/competitions/components/wushu/WushuTaoluScoreTable";
import { CollectiveScoreModal } from "@/features/competitions/components/collective/CollectiveScoreModal";
import { WrestlingScoreModal } from "@/features/competitions/components/wrestling/WrestlingScoreModal";
import { TiroDeportivoScheduleTable } from "@/features/competitions/components/shooting/TiroDeportivoScheduleTable";
import { TiroDeportivoResultsTable } from "@/features/competitions/components/shooting/TiroDeportivoResultsTable";
import { GenerateTableTennisPhasesModal } from "@/features/events/components/GenerateTableTennisPhasesModal";
import { GenerateTennisPhasesModal } from "@/features/events/components/GenerateTennisPhasesModal";
import { GenerateKumitePhasesModal } from "@/features/competitions/components/judo/GenerateKumitePhasesModal";
import { GeneratePoomsaePhasesModal } from '@/features/competitions/components/taekwondo/GeneratePoomsaePhasesModal';
import { AssignPhaseParticipantModal } from "@/features/competitions/components/AssignPhaseParticipantModal";
import { GenerateWushuTaoluPhasesModal } from "@/features/competitions/components/wushu/GenerateWushuTaoluPhasesModal";
import { AssignTaoluParticipantsModal } from "@/features/competitions/components/wushu/AssignTaoluParticipantsModal";
import { SetupGroupStageModal }   from "@/features/competitions/components/SetupGroupStageModal";
import { GroupStandingsTable }    from "@/features/competitions/components/GroupStandingsTable";
import { useCloseGroups }         from "@/features/competitions/api/group-stage.mutations";
import { GroupMatchesPanel }      from "@/features/competitions/components/GroupMatchesPanel";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { GenericViewProps } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { useMedallero } from "@/features/competitions/hooks/useMedallero";
import { MedalleroPanel } from "@/features/competitions/components/MedalleroPanel";
import { GenerateShootingPhasesModal } from "@/features/competitions/components/shooting/GenerateShootingPhasesModal";




// ─── Helpers ──────────────────────────────────────────────────────────────────



const PHASE_COLORS: Record<string, string> = {
  grupo:       "from-blue-600 to-blue-700",
  eliminacion: "from-purple-600 to-purple-700",
  repechaje:   "from-amber-500 to-amber-600",
  mejor_de_3:  "from-emerald-600 to-emerald-700",
};


const PHASE_TYPE_LABELS: Record<string, string> = {
  grupo:       "Grupos",
  eliminacion: "Eliminación",
  repechaje:   "Repechaje",
  mejor_de_3:  "Mejor de 3",
};


const getStatusConfig = (status: string) => {
  const configs = {
    programado: { variant: "primary" as const, label: "Programado", dot: true  },
    en_curso:   { variant: "success" as const, label: "En Curso",   dot: true  },
    finalizado: { variant: "default" as const, label: "Finalizado", dot: false },
    cancelado:  { variant: "warning" as const, label: "Cancelado",  dot: false },
  };
  return configs[status as keyof typeof configs] || configs.programado;
};



// ─── Componente ───────────────────────────────────────────────────────────────



export function GenericScheduleView({ eventCategory, schedule, sport }: GenericViewProps) {
  const {
    phases, phasesLoading, matches, matchesLoading,
    selectedPhase, setSelectedPhase,
    selectedMatch, setSelectedMatch,
    selectedMatchId, setSelectedMatchId,
    modals, openModal, closeModal,
    handlers, mutations, availableRegistrations,
  } = schedule;


  const { getTaekwondoType, getWushuType, isTiroDeportivo, isTableTennis } = sport;
  const taekwondoType = getTaekwondoType(selectedPhase);
  const wushuType     = getWushuType();
  const closeGroups = useCloseGroups();
  const queryClient = useQueryClient();

  const medals = useMedallero({
    phases,
    matches,
    taekwondoType,
    wushuType,
    isJudo:        sport.isJudo,
    isKarate:      sport.isKarate,
    isTennis:      sport.isTennis,
    isTableTennis,
    isWrestling:   sport.isWrestling,
  });



  // ── Card visual por fase ──────────────────────────────────────────────────


  const getCardVisual = (phase: Phase) => {
    const matchesCount  = phase.matches?.length ?? 0;
    const finishedCount = phase.matches?.filter((m) => m.status === "finalizado").length ?? 0;
    return {
      headerHeight:   "h-24" as const,
      gradientClass:  PHASE_COLORS[phase.type] ?? "from-blue-600 to-blue-700",
      ringClass:      "ring-blue-500",
      hoverTextClass: "group-hover:text-blue-600",
      icon:           <Trophy className="h-6 w-6 text-white" />,
      badgeLabel:     PHASE_TYPE_LABELS[phase.type] ?? phase.type,
      
    };
  };


  // ── Contenido del panel de detalle ────────────────────────────────────────


  const renderPhaseContent = () => {
    if (!selectedPhase) return null;


    if (taekwondoType === "poomsae" && selectedPhase.type === "grupo")
      return <PoomsaeScoreTable phaseId={selectedPhase.phaseId} />;


    if (wushuType === "taolu" && selectedPhase.type !== "eliminacion" && selectedPhase.type !== "mejor_de_3")
      return <WushuTaoluScoreTable phaseId={selectedPhase.phaseId} />;


    if (isTiroDeportivo)
      return selectedPhase.type === "grupo"
        ? <TiroDeportivoScheduleTable phaseId={selectedPhase.phaseId} />
        : <TiroDeportivoResultsTable  phaseId={selectedPhase.phaseId} />;
    
    // DESPUÉS — muestra grupos Y el bracket de eliminación debajo
    if (
      selectedPhase.type === "eliminacion" &&
      selectedPhase.subPhases &&
      selectedPhase.subPhases.length > 0
    ) {
      // Matches de la fase padre (bracket de eliminación)
      const eliminationMatches = matches.filter(
        (m) => m.phaseId === selectedPhase.phaseId
      );

      return (
        <div className="p-4 space-y-6">
          {/* ── Sección grupos ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700">Fase de Grupos</h3>
              <Button
                variant="outline"
                size="sm"
                isLoading={closeGroups.isPending}
                onClick={() => {
                  if (confirm("¿Cerrar todos los grupos y clasificar a los mejores al bracket?")) {
                    closeGroups.mutate(selectedPhase.phaseId);
                  }
                }}
              >
                Cerrar grupos y clasificar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPhase.subPhases.map((group) => (
                <div key={group.phaseId} className="flex flex-col gap-0">
                  <GroupStandingsTable group={group} />
                  <GroupMatchesPanel
                    group={group}
                    allRegistrations={eventCategory.registrations ?? []}
                    eventCategory={eventCategory}
                    sport={{
                      isJudo: sport.isJudo,
                      isKarate: sport.isKarate,
                      isWushu: sport.isWushu,
                      isWrestling: sport.isWrestling,
                      isCollectiveSport: sport.isCollectiveSport,
                      isTableTennis,
                      taekwondoType,
                      wushuType,
                    }}
                    onGenerateMatches={(g) =>
                      handlers.generateRoundRobin({
                        phaseId: g.phaseId,
                        registrationIds: (g.groupStandings ?? []).map(
                          (gs) => gs.registrationId
                        ),
                      })
                    }
                    isGenerating={mutations.initializeRoundRobin.isPending}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Sección bracket de eliminación ── */}
          {eliminationMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-semibold text-slate-700">
                  Bracket de Eliminación
                </h3>
                <Badge variant="default" size="sm">
                  {eliminationMatches.length} partidos
                </Badge>
              </div>

              <div className="space-y-3">
                {eliminationMatches.map((match) => {
                  const participants = match.participations || [];
                  const statusConfig = getStatusConfig(match.status);

                  const canReassign =
                    participants.length > 0 &&
                    match.status !== "finalizado" &&
                    wushuType !== "taolu" &&
                    !isTiroDeportivo;

                  return (
                    <Card key={match.matchId} variant="elevated" padding="md" hover className="group">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {match.matchNumber && (
                              <span className="text-sm font-bold text-slate-900">
                                Partido #{match.matchNumber}
                              </span>
                            )}
                            {match.round && (
                              <Badge variant="default" size="sm">
                                {match.round}
                              </Badge>
                            )}
                            <Badge
                              variant={statusConfig.variant}
                              dot={statusConfig.dot}
                              size="sm"
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                            {match.scheduledTime && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(match.scheduledTime).toLocaleString("es-ES")}
                                </span>
                              </div>
                            )}
                            {match.platformNumber && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>Plataforma {match.platformNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlers.deleteMatch(match.matchId);
                          }}
                          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                          aria-label="Eliminar partido"
                        >
                          ×
                        </button>
                      </div>

                      {/* Participantes */}
                      {participants.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {participants.map((participation) => {
                            const reg = participation.registration;
                            const name =
                              reg?.athlete?.name ?? reg?.team?.name ?? "Sin nombre";
                            const institution =
                              reg?.athlete?.institution ?? reg?.team?.institution;
                            const logoUrl = institution?.logoUrl;
                            const isWinner =
                              match.winnerRegistrationId ===
                              participation.registrationId;

                            return (
                              <div
                                key={participation.participationId}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                  isWinner
                                    ? "bg-gradient-to-r from-emerald-100 to-emerald-50 border-2 border-emerald-300"
                                    : "bg-slate-50 hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {logoUrl ? (
                                    <img
                                      src={getImageUrl(logoUrl)}
                                      alt={institution?.name || ""}
                                      className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                      <Trophy className="h-5 w-5 text-slate-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-sm text-slate-900">
                                      {name}
                                    </p>
                                    {institution && (
                                      <p className="text-xs text-slate-500">
                                        {institution.name}
                                      </p>
                                    )}
                                  </div>
                                  {isWinner && (
                                    <Award className="h-5 w-5 text-emerald-600 ml-1" />
                                  )}
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
                                  {participation.corner === "blue"
                                    ? "Azul"
                                    : participation.corner === "white"
                                    ? "Blanco"
                                    : participation.corner === "A"
                                    ? "Equipo A"
                                    : participation.corner === "B"
                                    ? "Equipo B"
                                    : participation.corner}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-slate-50 rounded-xl mb-4">
                          <Trophy className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-sm text-slate-400">
                            Sin participantes asignados
                          </p>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex flex-wrap gap-2">
                        {participants.length === 1 &&
                          match.status !== "finalizado" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={async () => {
                                const p = participants[0];
                                const name =
                                  p.registration?.athlete?.name ??
                                  p.registration?.team?.name ??
                                  "este participante";
                                if (
                                  confirm(`¿Avanzar a ${name} automáticamente?`)
                                )
                                  await handlers.advanceWinner(
                                    match.matchId,
                                    p.registrationId!
                                  );
                              }}
                            >
                              Pasar Participante
                            </Button>
                          )}

                        {participants.length < 2 &&
                          match.status !== "finalizado" &&
                          wushuType !== "taolu" &&
                          !isTiroDeportivo && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<UserPlus className="h-4 w-4" />}
                              onClick={() => {
                                closeModal("result");
                                setSelectedMatch(match);
                                openModal("assign");
                              }}
                            >
                              Asignar
                            </Button>
                          )}

                        {participants.length === 2 && (
                          <>
                            {(sport.isJudo ||
                              sport.isKarate ||
                              sport.isWushu ||
                              sport.isWrestling ||
                              !!taekwondoType) && (
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => {
                                  closeModal("assign");
                                  setSelectedMatch(match);
                                  setSelectedMatchId(match.matchId);
                                  openModal("result");
                                }}
                              >
                                {match.participant1Score !== null ||
                                match.status === "finalizado"
                                  ? "Editar Puntaje"
                                  : "Registrar Puntaje"}
                              </Button>
                            )}
                            {sport.isCollectiveSport && (
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  openModal("result");
                                }}
                              >
                                {match.status === "finalizado"
                                  ? "Editar Resultado"
                                  : "Registrar Resultado"}
                              </Button>
                            )}
                            {(isTableTennis || sport.isTennis) && (
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  openModal("result");
                                }}
                              >
                                {match.status === "finalizado"
                                  ? "Ver/Editar Match"
                                  : "Gestionar Match"}
                              </Button>
                            )}
                            {!sport.isJudo &&
                              !sport.isKarate &&
                              !sport.isWushu &&
                              !sport.isWrestling &&
                              !sport.isCollectiveSport &&
                              !taekwondoType &&
                              !isTableTennis && !sport.isTennis &&
                              match.status !== "finalizado" && (
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    openModal("result");
                                  }}
                                >
                                  Registrar Resultado
                                </Button>
                              )}
                          </>
                        )}

                        {/* ── Invertir posición de participantes ── */}
                        {participants.length === 2 && match.status !== "finalizado" && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<ArrowUpDown className="h-4 w-4" />}
                            onClick={() => handlers.swapParticipants(match.matchId)}
                          >
                            Invertir
                          </Button>
                        )}

                        {canReassign && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<UserPlus className="h-4 w-4" />}
                            disabled={mutations.deleteParticipation.isPending}
                            onClick={() => {
                              const names = participants
                                .map(
                                  (p) =>
                                    p.registration?.athlete?.name ??
                                    p.registration?.team?.name ??
                                    "Participante"
                                )
                                .join(" y ");
                              if (
                                window.confirm(
                                  `¿Quitar a ${names} de este partido para reasignarlos?`
                                )
                              ) {
                                participants.forEach((p) => {
                                  if (p.registrationId) {
                                    handlers.removeParticipant(
                                      match.matchId,
                                      p.registrationId
                                    );
                                  }
                                });
                              }
                            }}
                          >
                            Reasignar
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }


    if (selectedPhase.type === "mejor_de_3")
      return (
        <BestOf3View
          matches={matches}
          phase={selectedPhase}
          eventCategory={eventCategory}
        />
      );


    if (matchesLoading)
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      );


    if (matches.length === 0)
      return (
        <div className="p-6">
          <EmptyState title="No hay partidos en esta fase" />
        </div>
      );


    return (
      <div className="space-y-4 p-4">
        {matches.map((match) => {
          const participants = match.participations || [];
          const statusConfig = getStatusConfig(match.status);

          // Guard compartida: mismas condiciones que el botón "Asigna"
          const canReassign =
            participants.length > 0 &&
            match.status !== "finalizado" &&
            wushuType !== "taolu" &&
            !isTiroDeportivo;


            console.log("🔍 canReassign debug", {
              matchId: match.matchId,
              participantsLength: participants.length,
              status: match.status,
              taekwondoType,
              wushuType,
              isTiroDeportivo,
              canReassign,
            });

          return (
            <Card key={match.matchId} variant="elevated" padding="md" hover className="group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {match.matchNumber && (
                      <span className="text-sm font-bold text-slate-900">
                        Partido #{match.matchNumber}
                      </span>
                    )}
                    {match.round && <Badge variant="default" size="sm">{match.round}</Badge>}
                    <Badge variant={statusConfig.variant} dot={statusConfig.dot} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    {match.scheduledTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(match.scheduledTime).toLocaleString("es-ES")}</span>
                      </div>
                    )}
                    {match.platformNumber && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>Plataforma {match.platformNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlers.deleteMatch(match.matchId);
                  }}
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Eliminar partido"
                >
                  ×
                </button>
              </div>


              {/* Participantes */}
              {participants.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {participants.map((participation) => {
                    const reg         = participation.registration;
                    const name        = reg?.athlete?.name ?? reg?.team?.name ?? "Sin nombre";
                    const institution = reg?.athlete?.institution ?? reg?.team?.institution;
                    const logoUrl     = institution?.logoUrl;
                    const isWinner    = match.winnerRegistrationId === participation.registrationId;


                    return (
                      <div
                        key={participation.participationId}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          isWinner
                            ? "bg-gradient-to-r from-emerald-100 to-emerald-50 border-2 border-emerald-300"
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {logoUrl ? (
                            <img
                              src={getImageUrl(logoUrl)}
                              alt={institution?.name || ""}
                              className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm text-slate-900">{name}</p>
                            {institution && <p className="text-xs text-slate-500">{institution.name}</p>}
                          </div>
                          {isWinner && <Award className="h-5 w-5 text-emerald-600 ml-1" />}
                        </div>
                        <Badge
                          variant={participation.corner === "blue" || participation.corner === "A" ? "primary" : "default"}
                          size="sm"
                        >
                          {participation.corner === "blue"  ? "Azul"
                           : participation.corner === "white" ? "Blanco"
                           : participation.corner === "A"     ? "Equipo A"
                           : participation.corner === "B"     ? "Equipo B"
                           : participation.corner}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-xl mb-4">
                  <Trophy className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-sm text-slate-400">Sin participantes asignados</p>
                </div>
              )}


              {/* Acciones */}
              <div className="flex flex-wrap gap-2">
                {participants.length === 1 && match.status !== "finalizado" && (
                  <Button
                    variant="success" size="sm"
                    onClick={async () => {
                      const p    = participants[0];
                      const name = p.registration?.athlete?.name ?? p.registration?.team?.name ?? "este participante";
                      if (confirm(`¿Avanzar a ${name} automáticamente?`))
                        await handlers.advanceWinner(match.matchId, p.registrationId!);
                    }}
                  >
                    Pasar Participante
                  </Button>
                )}

                {participants.length < 2 && match.status !== "finalizado"
                   && wushuType !== "taolu" && !isTiroDeportivo && (
                  <Button
                    variant="outline" size="sm"
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => {
                      closeModal("result");
                      setSelectedMatch(match);
                      openModal("assign");
                    }}
                  >
                    Asigna
                  </Button>
                )}

                {participants.length === 2 && (
                  <>
                    {(sport.isJudo || sport.isKarate || sport.isWushu || sport.isWrestling || !!taekwondoType) && (
                      <Button variant="gradient" size="sm"
                        onClick={() => {
                          closeModal("assign");
                          setSelectedMatch(match);
                          setSelectedMatchId(match.matchId);
                          openModal("result");
                        }}>
                        {match.participant1Score !== null || match.status === "finalizado" ? "Editar Puntaje" : "Registrar Puntaje"}
                      </Button>
                    )}
                    {sport.isCollectiveSport && (
                      <Button variant="gradient" size="sm"
                        onClick={() => { setSelectedMatch(match); openModal("result"); }}>
                        {match.status === "finalizado" ? "Editar Resultado" : "Registrar Resultado"}
                      </Button>
                    )}
                    {(isTableTennis || sport.isTennis) && (
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => {
                          setSelectedMatch(match);
                          openModal("result");
                        }}
                      >
                        {match.status === "finalizado"
                          ? "Ver/Editar Match"
                          : "Gestionar Match"}
                      </Button>
                    )}
                    {!sport.isJudo && !sport.isKarate && !sport.isWushu && !sport.isWrestling
                      && !sport.isCollectiveSport && !taekwondoType && !isTableTennis && !sport.isTennis
                      && match.status !== "finalizado" && (
                      <Button variant="gradient" size="sm"
                        onClick={() => { setSelectedMatch(match); openModal("result"); }}>
                        Registrar Resultado
                      </Button>
                    )}
                  </>
                )}

                {/* ── Invertir posición de participantes ── */}
                {participants.length === 2 && match.status !== "finalizado" && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ArrowUpDown className="h-4 w-4" />}
                    onClick={() => handlers.swapParticipants(match.matchId)}
                  >
                    Invertir
                  </Button>
                )}

                {/* ── Reasignar participantes ── */}
                {canReassign && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<UserPlus className="h-4 w-4" />}
                    disabled={mutations.deleteParticipation.isPending}
                    onClick={() => {
                      const names = participants
                        .map((p) => p.registration?.athlete?.name ?? p.registration?.team?.name ?? "Participante")
                        .join(" y ");
                      if (window.confirm(`¿Quitar a ${names} de este partido para reasignarlos?`)) {
                        participants.forEach((p) => {
                          if (p.registrationId) {
                            handlers.removeParticipant(match.matchId, p.registrationId);
                          }
                        });
                      }
                    }}
                  >
                    Reasignar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };


  // ── Botones del header del panel ──────────────────────────────────────────


  const renderPanelActions = () => {
    if (!selectedPhase) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {taekwondoType === "poomsae" && selectedPhase.type === "grupo" && matches.length === 0 && (
          <Button variant="gradient" size="sm" onClick={() => openModal("initPoomsae")}>
            Inicializar Fase Poomsae
          </Button>
        )}
        {isTiroDeportivo && selectedPhase.type === "grupo" && matches.length === 0 && (
          <Button variant="gradient" size="sm" onClick={() => openModal("initShooting")}>
            Inicializar Fase Tiro
          </Button>
        )}

        {wushuType === "taolu" && (
          <Button
            variant="outline"
            size="sm"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => openModal("assignTaolu")}
          >
            Asignar Participantes
          </Button>
        )}

        {selectedPhase.type === "eliminacion" &&
          (!selectedPhase.subPhases || selectedPhase.subPhases.length === 0) && (
          <Button
            variant="outline"
            size="sm"
            icon={<Users className="h-4 w-4" />}
            onClick={() => openModal("setupGroupStage")}
          >
            Fase de Grupos
          </Button>
        )}

        {selectedPhase.type === "eliminacion" && matches.length === 0 && (
          <Button variant="outline" size="sm" onClick={() => openModal("generateBracket")}>
            Generar Bracket
          </Button>
        )}
        {!taekwondoType && wushuType !== "taolu" && !isTiroDeportivo
          && selectedPhase.type === "grupo" && matches.length === 0 && (
          <Button size="sm" onClick={() => openModal("generateRoundRobin")}>
            Generar Partidos
          </Button>
        )}
        {selectedPhase.type === "mejor_de_3" && matches.length === 0 && (
          <Button variant="outline" size="sm" onClick={() => openModal("generateBestOf3")}>
            Generar Serie
          </Button>
        )}
        {(() => {
          const hasSubPhases =
            selectedPhase.type === "eliminacion" &&
            !!selectedPhase.subPhases?.length;

          return (
            <>
              {!taekwondoType && wushuType !== "taolu" && !isTiroDeportivo && !hasSubPhases
                && (selectedPhase.type === "grupo" || selectedPhase.type === "eliminacion") && (
                <Button variant="outline" size="sm" icon={<UserPlus className="h-4 w-4" />} onClick={() => {
                  closeModal("result");
                  openModal("assignPhase");
                }}>
                  Asignar
                </Button>
              )}
              {!taekwondoType && wushuType !== "taolu" && !isTiroDeportivo
                && (!hasSubPhases || sport.isTennis)
                && (selectedPhase.type === "grupo" || selectedPhase.type === "eliminacion" || selectedPhase.type === "repechaje") && (
                <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openModal("match")}>
                  Nuevo Partido
                </Button>
              )}
            </>
          );
        })()}
      </div>
    );
  };


  // ── Render ────────────────────────────────────────────────────────────────
  console.log('[Debug Modal Tenis] registrations count:', eventCategory.registrations?.length ?? 0);
  console.log('[Debug Modal Tenis] primer registro:', JSON.stringify(eventCategory.registrations?.[0], null, 2));

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Programación Competencia"
        actions={
          <div className="flex flex-wrap gap-2">
            {sport.isJudo && (
              <Button onClick={() => openModal("generateKumitePhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}

            {isTiroDeportivo && (
              <Button onClick={() => openModal("generateShootingPhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}

            {taekwondoType === "poomsae" && (
              <Button onClick={() => openModal("generatePoomsaePhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}

            {taekwondoType === 'kyorugui' && (
              <Button onClick={() => openModal('generateKyoruguiPhases')} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}
            
            {sport.isWrestling && (
              <Button onClick={() => openModal("generateWrestlingPhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}
            {sport.isWushu && wushuType === "sanda" && (
              <Button onClick={() => openModal("generateWushuPhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}
            {sport.isWushu && wushuType === "taolu" && (
              <Button onClick={() => openModal("generateWushuTaoluPhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}

            {sport.isTennis && (
              <Button onClick={() => openModal("generateTennisPhases")} variant="outline" size="lg">
                Generar Fases
              </Button>
            )}

            <Button
              onClick={() => openModal("phase")}
              variant="gradient"
              size="lg"
              icon={<Plus className="h-5 w-5" />}
            >
              Nueva Fase
            </Button>
          </div>
        }
      />

      {phasesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : phases.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No hay fases creadas"
          description="Crea la primera fase para comenzar la programación."
          action={{ label: "Nueva Fase", onClick: () => openModal("phase") }}
        />
      ) : (
        <PhaseGrid
          phases={phases}
          selectedPhase={selectedPhase}
          getCardVisual={getCardVisual}
          onSelectPhase={setSelectedPhase}
          onDeletePhase={handlers.deletePhase}
          gap="gap-6"
        />
      )}

      {selectedPhase && (
        <>
          {/* ── MEDALLERO: visible solo cuando hay ganadores determinados ── */}
          {medals.length > 0 && !isTiroDeportivo && (
            <MedalleroPanel medals={medals} />
          )}

          <PhaseDetailPanel
            phase={selectedPhase}
            onClose={() => setSelectedPhase(null)}
            variant="card"
            headerIcon={<Trophy className="h-7 w-7 text-white" />}
            bodyNoPadding
            actions={renderPanelActions()}
          >
            {renderPhaseContent()}
          </PhaseDetailPanel>
        </>
      )}

      {/* ── Modal nueva fase ── */}
      {modals.phase && (
        <Modal isOpen={modals.phase} onClose={() => closeModal("phase")} title="Crear Nueva Fase" size="md">
          <PhaseForm
            eventCategoryId={eventCategory.eventCategoryId}
            existingPhases={phases.length}
            onSubmit={handlers.createPhase}
            onCancel={() => closeModal("phase")}
            isLoading={mutations.createPhase.isPending}
          />
        </Modal>
      )}

      {/* ── Modales que dependen de selectedPhase ── */}
      {selectedPhase && (
        <>
          {modals.match && (
            <Modal isOpen={modals.match} onClose={() => closeModal("match")} title="Crear Nuevo Partido" size="md">
              <MatchForm
                phase={selectedPhase}
                existingMatches={matches}
                onSubmit={handlers.createMatch}
                onCancel={() => closeModal("match")}
                isLoading={mutations.createMatch.isPending}
              />
            </Modal>
          )}

          {modals.assignPhase && (
            <AssignPhaseParticipantModal
              isOpen={modals.assignPhase}
              onClose={() => closeModal("assignPhase")}
              phaseId={selectedPhase.phaseId}
              phaseName={selectedPhase.name}
              allRegistrations={eventCategory.registrations ?? []}
              sismasterEventId={eventCategory.externalEventId ?? undefined}
              sismasterSportId={eventCategory.externalSportId ?? undefined}
              eventCategoryId={eventCategory.eventCategoryId}
            />
          )}

          {modals.assignTaolu && wushuType === "taolu" && (
            <AssignTaoluParticipantsModal
              isOpen={modals.assignTaolu}
              onClose={() => closeModal("assignTaolu")}
              phaseId={selectedPhase.phaseId}
              phaseName={selectedPhase.name}
              eventCategoryId={eventCategory.eventCategoryId}
              allRegistrations={eventCategory.registrations ?? []}
              assignedRegistrationIds={
                matches
                  .flatMap((m) => m.participations ?? [])
                  .map((p) => p.registrationId)
                  .filter((id): id is number => id != null)
              }
            />
          )}

          {modals.assign && selectedMatch && (
            <AssignParticipantsModal
              isOpen={modals.assign}
              onClose={() => { closeModal("assign"); setSelectedMatch(null); }}
              match={selectedMatch}
              registrations={eventCategory.registrations ?? []}
              onAssign={handlers.assignParticipant}
              isLoading={mutations.createParticipation.isPending}
            />
          )}

          {modals.generateRoundRobin && !isTableTennis && (
            <GenerateRoundRobinModal
              isOpen={modals.generateRoundRobin}
              onClose={() => closeModal("generateRoundRobin")}
              phase={selectedPhase}
              registrations={eventCategory.registrations ?? []}
              onGenerate={handlers.generateRoundRobin}
              isLoading={mutations.initializeRoundRobin.isPending}
              sismasterEventId={eventCategory.externalEventId ?? undefined}
              sismasterSportId={eventCategory.externalSportId ?? undefined}
              eventCategoryId={eventCategory.eventCategoryId}
            />
          )}

          {modals.generateRoundRobin && isTableTennis && (
            <GenerateTableTennisPhasesModal
              isOpen={modals.generateRoundRobin}
              onClose={() => closeModal("generateRoundRobin")}
              eventCategoryId={eventCategory.eventCategoryId}
              phaseId={selectedPhase.phaseId}
            />
          )}

          {modals.generateBracket && (() => {
            // Extraer IDs de participantes asignados directamente a esta fase
            // Para fase "eliminacion": se sacan de las participations de sus matches
            // Para fase "grupo": se sacan de los groupStandings
            const phaseRegistrationIds = new Set<number>([
              // Desde matches directos de la fase (eliminacion sin subPhases)
              ...(selectedPhase.matches ?? [])
                .flatMap((m) => m.participations ?? [])
                .map((p) => p.registrationId)
                .filter((id): id is number => id != null),
              // Desde groupStandings (si los tuviera como fase padre)
              ...(selectedPhase.groupStandings ?? [])
                .map((gs) => gs.registrationId),
            ]);

            // Si no hay ninguno asignado aún → mostrar todos (fallback seguro)
            const bracketRegistrations =
              phaseRegistrationIds.size > 0
                ? availableRegistrations.filter((r) =>
                    phaseRegistrationIds.has(r.registrationId)
                  )
                : availableRegistrations;

            return (
              <GenerateBracketModal
                isOpen={modals.generateBracket}
                onClose={() => closeModal("generateBracket")}
                phase={selectedPhase}
                availableRegistrations={bracketRegistrations}
                sismasterEventId={eventCategory.externalEventId ?? undefined}
                sismasterSportId={eventCategory.externalSportId ?? undefined}
                eventCategoryId={eventCategory.eventCategoryId}
              />
            );
          })()}

          {modals.generateBestOf3 && (
            <GenerateBestOf3Modal
              isOpen={modals.generateBestOf3}
              onClose={() => closeModal("generateBestOf3")}
              phase={selectedPhase}
              registrations={eventCategory.registrations ?? []}
              onGenerate={handlers.generateBestOf3}
              isLoading={mutations.initializeBestOf3.isPending}
              sismasterEventId={eventCategory.externalEventId ?? undefined}
              sismasterSportId={eventCategory.externalSportId ?? undefined}
              eventCategoryId={eventCategory.eventCategoryId}
            />
          )}

          {modals.initPoomsae && (
            <InitializePoomsaeGroupModal
              isOpen={modals.initPoomsae}
              onClose={() => closeModal("initPoomsae")}
              phase={selectedPhase}
              availableRegistrations={availableRegistrations}
              sismasterEventId={eventCategory.externalEventId ?? undefined}
              sismasterSportId={eventCategory.externalSportId ?? undefined}
              eventCategoryId={eventCategory.eventCategoryId}
            />
          )}

          {modals.initShooting && (
            <InitializeShootingGroupModal
              isOpen={modals.initShooting}
              onClose={() => closeModal("initShooting")}
              phase={selectedPhase}
              availableRegistrations={availableRegistrations}
              sismasterEventId={eventCategory.externalEventId ?? undefined}
              sismasterSportId={eventCategory.externalSportId ?? undefined}
              eventCategoryId={eventCategory.eventCategoryId}
            />
          )}
          {modals.setupGroupStage && (
            <SetupGroupStageModal
              isOpen={modals.setupGroupStage}
              onClose={() => closeModal("setupGroupStage")}
              phase={selectedPhase}
              availableRegistrations={availableRegistrations}
            />
          )}

          {/* ── Score modals ── */}
          {modals.result && selectedMatch && (
            <>
              {sport.isJudo && (
                <JudoScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch as any} phase={selectedPhase} />
              )}
              {sport.isKarate && (
                <KarateScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch as any} phase={selectedPhase} />
              )}
              {sport.isWushu && wushuType === "sanda" && (
                <WushuScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch as any} phase={selectedPhase} />
              )}
              {wushuType === "taolu" && (
                <WushuTaoluScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch as any} phase={selectedPhase} />
              )}
              {sport.isWrestling && (
                <WrestlingScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch as any} phase={selectedPhase} />
              )}
              {sport.isCollectiveSport && (
                <CollectiveScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch as any} phase={selectedPhase} />
              )}
              {taekwondoType === "poomsae" && (
                <PoomsaeScoreModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch} phase={selectedPhase} />
              )}
              {taekwondoType === "kyorugui" && (
                <KyoruguiRoundsModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); setSelectedMatchId(null); }}
                  match={selectedMatch} />
              )}
              {sport.isTennis && (
                <ResultModal
                  isOpen
                  onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch}
                  onSubmit={handlers.registerResult}
                  isLoading={selectedPhase.type === "eliminacion"
                    ? mutations.advanceWinner?.isPending
                    : mutations.updateMatch?.isPending}
                />
              )}
              {isTableTennis && (
                <Modal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  title="Gestionar Match - Tenis de Mesa" size="full">
                  <TableTennisMatchWrapper
                    key={`${selectedMatch.matchId}-${(selectedMatch.participations ?? []).map(p => p.corner).join("-")}`}
                    match={selectedMatch}
                    eventCategory={eventCategory}
                    onMatchUpdate={async () => {
                      // 1. Invalida todas las queries relevantes
                      await queryClient.invalidateQueries({
                        queryKey: ["matches", selectedPhase.phaseId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["match", selectedMatch.matchId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["phases", eventCategory.eventCategoryId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["phase", selectedPhase.phaseId],
                      });

                      // 2. Lee el match actualizado desde el cache y actualiza selectedMatch
                      const updatedMatches = queryClient.getQueryData<any[]>(
                        ["matches", selectedPhase.phaseId]
                      );
                      if (updatedMatches) {
                        const refreshed = updatedMatches.find(
                          (m) => m.matchId === selectedMatch.matchId
                        );
                        if (refreshed) setSelectedMatch(refreshed);
                      }
                    }}
                  />
                </Modal>
              )}
              {!sport.isJudo && !sport.isKarate && !sport.isWushu && !sport.isWrestling
                && !sport.isCollectiveSport && !taekwondoType && !isTableTennis && !sport.isTennis && (
                <ResultModal isOpen onClose={() => { closeModal("result"); setSelectedMatch(null); }}
                  match={selectedMatch} onSubmit={handlers.registerResult}
                  isLoading={selectedPhase.type === "eliminacion" ? mutations.advanceWinner?.isPending : mutations.updateMatch?.isPending}
                />
              )}
            </>
          )}
        </>
      )}

      {/* ── Modales de generación de fases (fuera de selectedPhase) ── */}

      {modals.generateKumitePhases && sport.isJudo && (
        <GenerateKumitePhasesModal
          open={modals.generateKumitePhases}
          onClose={() => closeModal("generateKumitePhases")}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? "Categoría"}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          haymasterEventId={eventCategory.haymasterEventId ?? undefined}
          allRegistrations={eventCategory.registrations ?? []}
        />
      )}

      {modals.generateWrestlingPhases && sport.isWrestling && (
        <GenerateKumitePhasesModal
          open={modals.generateWrestlingPhases}
          onClose={() => closeModal("generateWrestlingPhases")}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? "Categoría"}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          haymasterEventId={eventCategory.haymasterEventId ?? undefined}
          allRegistrations={eventCategory.registrations ?? []}
        />
      )}

      {modals.generateWushuPhases && sport.isWushu && wushuType === "sanda" && (
        <GenerateKumitePhasesModal
          open={modals.generateWushuPhases}
          onClose={() => closeModal("generateWushuPhases")}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? "Categoría"}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          haymasterEventId={eventCategory.haymasterEventId ?? undefined}
          allRegistrations={eventCategory.registrations ?? []}
        />
      )}

      {modals.generateWushuTaoluPhases && sport.isWushu && wushuType === "taolu" && (
        <GenerateWushuTaoluPhasesModal
          open={modals.generateWushuTaoluPhases}
          onClose={() => closeModal("generateWushuTaoluPhases")}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? "Taolu"}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          allRegistrations={eventCategory.registrations ?? []}
        />
      )}

      {modals.generatePoomsaePhases && taekwondoType === "poomsae" && (
          <GeneratePoomsaePhasesModal
            open={modals.generatePoomsaePhases}
            onClose={() => closeModal("generatePoomsaePhases")}
            eventCategoryId={eventCategory.eventCategoryId}
            categoryName={eventCategory.category?.name ?? "Poomsae"}
            sismasterEventId={eventCategory.externalEventId ?? undefined}   
            sismasterSportId={eventCategory.externalSportId ?? undefined}  
            allRegistrations={eventCategory.registrations ?? []}
          />
        )}

      {modals.generateShootingPhases && isTiroDeportivo && (
        <GenerateShootingPhasesModal
          open={modals.generateShootingPhases}
          onClose={() => closeModal("generateShootingPhases")}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? "Tiro Deportivo"}
          allRegistrations={eventCategory.registrations ?? []}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
        />
      )}

      {modals.generateKyoruguiPhases && taekwondoType === 'kyorugui' && (
        <GenerateKumitePhasesModal
          open={modals.generateKyoruguiPhases}
          onClose={() => closeModal('generateKyoruguiPhases')}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? 'Kyourugui'}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          haymasterEventId={eventCategory.haymasterEventId ?? undefined}
          allRegistrations={eventCategory.registrations ?? []}
        />
      )}

      {modals.generateTennisPhases && sport.isTennis && (
        <GenerateTennisPhasesModal
          isOpen={modals.generateTennisPhases}
          onClose={() => closeModal('generateTennisPhases')}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? 'Categoría'}
          allRegistrations={eventCategory.registrations ?? []}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
        />
        )}
    </div>
  );
}