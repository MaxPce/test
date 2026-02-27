import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  Plus,
  Calendar,
  Trophy,
  Clock,
  MapPin,
  Zap,
  Grid3x3,
  TrendingUp,
  Award,
  Timer,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { MatchForm } from "@/features/competitions/components/MatchForm";
import { AssignParticipantsModal } from "@/features/competitions/components/AssignParticipantsModal";
import { ResultModal } from "@/features/competitions/components/ResultModal";
import { BracketView } from "@/features/competitions/components/BracketView";
import { TableTennisMatchWrapper } from "@/features/competitions/components/table-tennis/TableTennisMatchWrapper";
import { KyoruguiBracketView } from "@/features/competitions/components/taekwondo/KyoruguiBracketView";
import { PoomsaeScoreModal } from "@/features/competitions/components/taekwondo/PoomsaeScoreModal";
import { PoomsaeScoreTable } from "@/features/competitions/components/taekwondo/PoomsaeScoreTable";
import { KyoruguiRoundsModal } from "@/features/competitions/components/taekwondo/KyoruguiRoundsModal";
import { JudoScoreModal } from "@/features/competitions/components/judo/JudoScoreModal";
import { KarateScoreModal } from "@/features/competitions/components/karate/KarateScoreModal";
import { WushuScoreModal } from "@/features/competitions/components/wushu/WushuScoreModal";
import { WushuTaoluScoreTable } from "@/features/competitions/components/wushu/WushuTaoluScoreTable";
import { WushuTaoluScoreModal } from "@/features/competitions/components/wushu/WushuTaoluScoreModal";
import { useAdvanceWinner } from "@/features/competitions/api/bracket.mutations";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { CollectiveScoreModal } from "@/features/competitions/components/collective/CollectiveScoreModal";
import { WrestlingScoreModal } from "@/features/competitions/components/wrestling/WrestlingScoreModal";
import { TiroDeportivoResultsTable } from "@/features/competitions/components/shooting/TiroDeportivoResultsTable";
import { TiroDeportivoScheduleTable } from "@/features/competitions/components/shooting/TiroDeportivoScheduleTable";

import {
  useMatches,
  useMatch,
} from "@/features/competitions/api/matches.queries";
import {
  useCreatePhase,
  useDeletePhase,
} from "@/features/competitions/api/phases.mutations";
import {
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
} from "@/features/competitions/api/matches.mutations";
import { useCreateParticipation } from "@/features/competitions/api/participations.mutations";
import type { EventCategory } from "../../types";
import type { Phase, Match } from "@/features/competitions/types";
import { GenerateRoundRobinModal } from "@/features/competitions/components/GenerateRoundRobinModal";
import { useInitializeRoundRobin } from "@/features/competitions/api/round-robin.mutations";
import { useUpdateStandings } from "@/features/competitions/api/standings.mutations";
import { BestOf3View } from "@/features/competitions/components/BestOf3View";
import { GenerateBestOf3Modal } from "@/features/competitions/components/GenerateBestOf3Modal";
import { useInitializeBestOf3 } from "@/features/competitions/api/best-of-3.mutations";
import { GenerateBracketModal } from "@/features/competitions/components/GenerateBracketModal";
import { useGenerateBracket } from "@/features/competitions/api/bracket.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { SwimmingResultsTable } from "@/features/results/components/SwimmingResultsTable";
import {
  usePhaseRegistrations,
  useAssignPhaseRegistration,
} from "@/features/competitions/api/phaseRegistrations.queries";
import { AssignSeriesParticipantModal } from "@/features/competitions/components/AssignSeriesParticipantModal";
import { WeightliftingAttemptsTable } from "@/features/competitions/components/weightlifting/WeightliftingAttemptsTable";

export function CategorySchedulePage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const { eventId, sportId, categoryId } = useParams();

  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isCollectiveModalOpen, setIsCollectiveModalOpen] = useState(false);
  const [isGenerateBestOf3ModalOpen, setIsGenerateBestOf3ModalOpen] =
    useState(false);
  const [isGenerateBracketModalOpen, setIsGenerateBracketModalOpen] =
    useState(false);
  const [isAssignSeriesModalOpen, setIsAssignSeriesModalOpen] = useState(false);

  const initializeRoundRobinMutation = useInitializeRoundRobin();
  const updateStandingsMutation = useUpdateStandings();
  const initializeBestOf3Mutation = useInitializeBestOf3();
  const generateBracketMutation = useGenerateBracket();
  const advanceWinnerMutation = useAdvanceWinner();

  const { data: phases = [], isLoading: phasesLoading } = usePhases(
    eventCategory.eventCategoryId,
  );
  const { data: matches = [], isLoading: matchesLoading } = useMatches(
    selectedPhase?.phaseId,
  );
  const { data: fullMatch, isLoading: fullMatchLoading } = useMatch(
    selectedMatchId || 0,
  );

  const createPhaseMutation = useCreatePhase();
  const deletePhaseMutation = useDeletePhase();
  const createMatchMutation = useCreateMatch();
  const updateMatchMutation = useUpdateMatch();
  const deleteMatchMutation = useDeleteMatch();
  const createParticipationMutation = useCreateParticipation();

  const isTableTennis = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return (
      sportName.includes("tenis de mesa") ||
      sportName.includes("tennis de mesa") ||
      sportName.includes("ping pong") ||
      sportName.includes("table tennis")
    );
  };

  const isJudo = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return sportName.includes("judo");
  };

  const isKarate = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return sportName.includes("karate");
  };

  const isWushu = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return sportName.includes("wushu");
  };

  const isWrestling = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return (
      sportName.includes("lucha olímpica") ||
      sportName.includes("lucha olimpica")
    );
  };

  const isCollectiveSport = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return (
      sportName.includes("fútbol") ||
      sportName.includes("futbol") ||
      sportName.includes("futsal") ||
      sportName.includes("basquetbol") ||
      sportName.includes("básquetbol") ||
      sportName.includes("basketball") ||
      sportName.includes("voleybol") ||
      sportName.includes("voleibol") ||
      sportName.includes("volleyball") ||
      sportName.includes("rugby")
    );
  };

  const isWeightlifting = () =>
    sportName.includes("halterofilia") ||
    sportName.includes("weightlifting") ||
    sportName.includes("levantamiento de pesas");

  const getTaekwondoType = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    if (!sportName.includes("taekwondo")) return null;

    const categoryName = eventCategory.category?.name?.toLowerCase() || "";
    if (
      categoryName.includes("poomsae") ||
      categoryName.includes("formas") ||
      categoryName.includes("forma")
    ) {
      return "poomsae";
    }

    if (
      categoryName.includes("kyorugi") ||
      categoryName.includes("kyorugui") ||
      categoryName.includes("combate") ||
      categoryName.includes("pelea") ||
      categoryName.includes("lucha")
    ) {
      return "kyorugui";
    }
    if (
      selectedPhase?.type === "eliminacion" ||
      selectedPhase?.type === "grupo"
    ) {
      return "kyorugui";
    }
  };

  const getWushuType = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    if (!sportName.includes("wushu")) return null;

    const categoryName = eventCategory.category?.name?.toLowerCase() || "";
    if (
      categoryName.includes("taolu") ||
      categoryName.includes("formas") ||
      categoryName.includes("forma")
    ) {
      return "taolu";
    }
    return "sanda"; // combate por defecto
  };

  const handleCreatePhase = async (data: any) => {
    await createPhaseMutation.mutateAsync(data);
    setIsPhaseModalOpen(false);
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (
      confirm(
        "¿Estás seguro de eliminar esta fase? Se eliminarán todos sus partidos.",
      )
    ) {
      await deletePhaseMutation.mutateAsync(phaseId);
      if (selectedPhase?.phaseId === phaseId) {
        setSelectedPhase(null);
      }
    }
  };

  const handleCreateMatch = async (data: any) => {
    await createMatchMutation.mutateAsync(data);
    setIsMatchModalOpen(false);
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (confirm("¿Estás seguro de eliminar este partido?")) {
      await deleteMatchMutation.mutateAsync(matchId);
    }
  };

  const handleAssignParticipant = async (data: any) => {
    await createParticipationMutation.mutateAsync(data);
  };

  const handleRegisterResult = async (matchId: number, winnerId: number) => {
    if (selectedPhase?.type === "eliminacion") {
      await advanceWinnerMutation.mutateAsync({
        matchId,
        winnerRegistrationId: winnerId,
      });
    } else {
      await updateMatchMutation.mutateAsync({
        id: matchId,
        data: {
          status: "finalizado",
          winnerRegistrationId: winnerId,
        },
      });

      if (selectedPhase?.type === "grupo") {
        await updateStandingsMutation.mutateAsync(selectedPhase.phaseId);
      }
    }
  };

  const handleGenerateBestOf3 = async (data: {
    phaseId: number;
    registrationIds: number[];
  }) => {
    await initializeBestOf3Mutation.mutateAsync(data);
    setIsGenerateBestOf3ModalOpen(false);
  };

  const handleGenerateBracket = async (data: {
    phaseId: number;
    registrationIds: number[];
    includeThirdPlace?: boolean;
  }) => {
    await generateBracketMutation.mutateAsync(data);
    setIsGenerateBracketModalOpen(false);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      programado: {
        variant: "primary" as const,
        label: "Programado",
        dot: true,
      },
      en_curso: { variant: "success" as const, label: "En Curso", dot: true },
      finalizado: {
        variant: "default" as const,
        label: "Finalizado",
        dot: false,
      },
      cancelado: {
        variant: "warning" as const,
        label: "Cancelado",
        dot: false,
      },
    };
    return configs[status as keyof typeof configs] || configs.programado;
  };

  const getPhaseTypeConfig = (type: string) => {
    const configs = {
      grupo: { label: "Grupos", icon: Grid3x3, color: "blue" },
      eliminacion: { label: "Eliminación", icon: Trophy, color: "purple" },
      repechaje: { label: "Repechaje", icon: TrendingUp, color: "amber" },
      mejor_de_3: { label: "Mejor de 3", icon: Award, color: "emerald" },
    };
    return (
      configs[type as keyof typeof configs] || {
        label: type,
        icon: Trophy,
        color: "blue",
      }
    );
  };

  const handleGenerateRoundRobin = async (data: {
    phaseId: number;
    registrationIds: number[];
  }) => {
    await initializeRoundRobinMutation.mutateAsync(data);
    setIsGenerateModalOpen(false);
  };

  const totalMatches = phases.reduce(
    (sum, phase) => sum + (phase.matches?.length || 0),
    0,
  );
  const finishedMatches = phases.reduce(
    (sum, phase) =>
      sum +
      (phase.matches?.filter((m) => m.status === "finalizado").length || 0),
    0,
  );

  const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
  const isTimedSport =
    sportName.includes("natación") ||
    sportName.includes("natacion") ||
    sportName.includes("atletismo") ||
    sportName.includes("ciclismo");

  const isTiroDeportivo =
    sportName.includes("tiro deportivo") ||
    sportName.includes("tiro al blanco") ||
    sportName.includes("shooting");

  if (isTimedSport) {
    return (
      <div className="space-y-6 animate-in">
        <PageHeader
          title="Gestionar Series"
          actions={
            <Button
              onClick={() => setIsPhaseModalOpen(true)}
              variant="gradient"
              size="lg"
              icon={<Plus className="h-5 w-5" />}
            >
              Nueva Serie
            </Button>
          }
        />

        {phasesLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : phases.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No hay series creadas"
            description='Crea la primera serie para registrar tiempos (ej: "Serie 1 Preliminares")'
            action={{
              label: "Crear Primera Serie",
              onClick: () => setIsPhaseModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((phase) => (
              <Card
                key={phase.phaseId}
                variant="elevated"
                padding="none"
                hover
                onClick={() => setSelectedPhase(phase)}
                className={`cursor-pointer transition-all ${
                  selectedPhase?.phaseId === phase.phaseId
                    ? "ring-2 ring-blue-500 shadow-strong"
                    : ""
                }`}
              >
                <div className="relative h-24 bg-gradient-to-br from-blue-600 to-cyan-500 overflow-hidden rounded-t-xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Timer className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhase(phase.phaseId);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <CardBody>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {phase.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">
                      Serie / Grupo
                    </Badge>
                    <span className="text-xs text-slate-500">
                      ID: {phase.phaseId}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* ── Panel de detalle al hacer clic en una serie ── */}
        {selectedPhase && (
          <div className="space-y-2">
            {/* Título de la serie activa */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-bold text-slate-800">
                  {selectedPhase.name}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<UserPlus className="h-4 w-4" />}
                  onClick={() => setIsAssignSeriesModalOpen(true)}
                >
                  Asignar Participante
                </Button>
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  × Cerrar
                </button>
              </div>
            </div>

            {/* Tabla de tiempos directamente */}
            <SwimmingResultsTable
              eventCategoryId={eventCategory.eventCategoryId}
              registrations={eventCategory.registrations || []}
              categoryName={selectedPhase.name}
              forcedPhaseId={selectedPhase.phaseId}
            />
          </div>
        )}

        {/* Modal crear serie */}
        <Modal
          isOpen={isPhaseModalOpen}
          onClose={() => setIsPhaseModalOpen(false)}
          title="Crear Nueva Serie"
          size="md"
        >
          <PhaseForm
            eventCategoryId={eventCategory.eventCategoryId}
            existingPhases={phases.length}
            onSubmit={handleCreatePhase}
            onCancel={() => setIsPhaseModalOpen(false)}
            isLoading={createPhaseMutation.isPending}
          />
        </Modal>

        {selectedPhase && (
          <AssignSeriesParticipantModal
            isOpen={isAssignSeriesModalOpen}
            onClose={() => setIsAssignSeriesModalOpen(false)}
            phaseId={selectedPhase.phaseId}
            phaseName={selectedPhase.name}
            allRegistrations={eventCategory.registrations || []}
          />
        )}
      </div>
    );
  }

  if (phasesLoading) {
    return (
      <div className="flex justify-center items-center h-96">Cargando...</div>
    );
  }

  if (isWeightlifting()) {
    return (
      <div className="space-y-6 animate-in">
        <PageHeader
          title="Levantamiento de Pesas"
          actions={
            <Button
              onClick={() => setIsPhaseModalOpen(true)}
              variant="gradient"
              size="lg"
              icon={<Plus className="h-5 w-5" />}
            >
              Nueva Fase
            </Button>
          }
        />

        {phasesLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : phases.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No hay fases creadas"
            description='Crea la primera fase para registrar intentos (ej: "Grupo A", "Final")'
            action={{
              label: "Crear Primera Fase",
              onClick: () => setIsPhaseModalOpen(true),
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Selector de fase (cards en la parte superior) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.map((phase) => {
                const phaseTypeConfig = getPhaseTypeConfig(phase.type);
                const Icon = phaseTypeConfig.icon;
                return (
                  <Card
                    key={phase.phaseId}
                    hover
                    variant="elevated"
                    padding="none"
                    onClick={() =>
                      setSelectedPhase(
                        selectedPhase?.phaseId === phase.phaseId ? null : phase,
                      )
                    }
                    className={`group cursor-pointer overflow-hidden transition-all ${
                      selectedPhase?.phaseId === phase.phaseId
                        ? "ring-2 ring-blue-500 shadow-strong"
                        : ""
                    }`}
                  >
                    <div
                      className={`relative h-20 bg-gradient-to-br from-${phaseTypeConfig.color}-600 to-${phaseTypeConfig.color}-700 overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhase(phase.phaseId);
                        }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <CardBody>
                      <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {phase.name}
                      </h4>
                      <Badge variant="primary" size="sm">
                        {phaseTypeConfig.label}
                      </Badge>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* 🏋️ Tabla de intentos de la fase seleccionada */}
            {selectedPhase && (
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {selectedPhase.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Planilla de intentos IWF — Haz clic en ✏️ para
                          registrar
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPhase(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm"
                    >
                      × Cerrar
                    </button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <WeightliftingAttemptsTable phaseId={selectedPhase.phaseId} />
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Modal crear fase */}
        <Modal
          isOpen={isPhaseModalOpen}
          onClose={() => setIsPhaseModalOpen(false)}
          title="Crear Nueva Fase"
          size="md"
        >
          <PhaseForm
            eventCategoryId={eventCategory.eventCategoryId}
            existingPhases={phases.length}
            onSubmit={handleCreatePhase}
            onCancel={() => setIsPhaseModalOpen(false)}
            isLoading={createPhaseMutation.isPending}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <PageHeader
        title="Programación & Competencia"
        actions={
          <Button
            onClick={() => setIsPhaseModalOpen(true)}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Nueva Fase
          </Button>
        }
      />

      {phases.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No hay fases creadas"
          description="Crea la primera fase para comenzar a organizar la competencia"
          action={{
            label: "Crear Primera Fase",
            onClick: () => setIsPhaseModalOpen(true),
          }}
        />
      ) : (
        <>
          {/* Grid de Fases */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((phase) => {
              const phaseTypeConfig = getPhaseTypeConfig(phase.type);
              const Icon = phaseTypeConfig.icon;
              const matchesCount = phase.matches?.length || 0;
              const finishedCount =
                phase.matches?.filter((m) => m.status === "finalizado")
                  .length || 0;

              return (
                <Card
                  key={phase.phaseId}
                  hover
                  variant="elevated"
                  padding="none"
                  onClick={() => setSelectedPhase(phase)}
                  className={`group cursor-pointer overflow-hidden transition-all ${
                    selectedPhase?.phaseId === phase.phaseId
                      ? "ring-2 ring-blue-500 shadow-strong"
                      : ""
                  }`}
                >
                  <div
                    className={`relative h-24 bg-gradient-to-br from-${phaseTypeConfig.color}-600 to-${phaseTypeConfig.color}-700 overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhase(phase.phaseId);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <CardBody>
                    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {phase.name}
                    </h4>
                    <Badge variant="primary" size="sm" className="mb-4">
                      {phaseTypeConfig.label}
                    </Badge>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-blue-900">
                          {matchesCount}
                        </p>
                        <p className="text-xs text-blue-700 font-medium">
                          Partidos
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-emerald-900">
                          {finishedCount}
                        </p>
                        <p className="text-xs text-emerald-700 font-medium">
                          Finalizados
                        </p>
                      </div>
                    </div>
                  </CardBody>

                  <div
                    className={`h-1 bg-gradient-to-r from-${phaseTypeConfig.color}-600 to-${phaseTypeConfig.color}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </Card>
              );
            })}
          </div>

          {/* Detalle de Fase Seleccionada */}
          {selectedPhase && (
            <Card variant="elevated">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Info de la fase */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-strong">
                      {(() => {
                        const Icon = getPhaseTypeConfig(
                          selectedPhase.type,
                        ).icon;
                        return <Icon className="h-7 w-7 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">
                        {selectedPhase.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {getTaekwondoType() === "poomsae" ||
                        getWushuType() === "taolu"
                          ? `${eventCategory.registrations?.length || 0} participante${
                              eventCategory.registrations?.length !== 1
                                ? "s"
                                : ""
                            }`
                          : `${matches.length} partido${matches.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2">
                    {selectedPhase.type === "eliminacion" &&
                      matches.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsGenerateBracketModalOpen(true)}
                        >
                          Generar Bracket
                        </Button>
                      )}

                    {!(
                      getTaekwondoType() === "poomsae" ||
                      getWushuType() === "taolu" ||
                      isTiroDeportivo
                    ) &&
                      selectedPhase.type === "grupo" &&
                      matches.length === 0 && (
                        <Button onClick={() => setIsGenerateModalOpen(true)}>
                          Generar Partidos
                        </Button>
                      )}

                    {!(
                      getTaekwondoType() === "poomsae" ||
                      getWushuType() === "taolu" ||
                      isTiroDeportivo
                    ) &&
                      selectedPhase.type === "grupo" && (
                        <Button onClick={() => setIsMatchModalOpen(true)}>
                          Nuevo Partido
                        </Button>
                      )}

                    {selectedPhase.type === "mejor_de_3" &&
                      matches.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsGenerateBestOf3ModalOpen(true)}
                        >
                          Generar Serie
                        </Button>
                      )}

                    {!(
                      (getTaekwondoType() === "poomsae" ||
                        getWushuType() === "taolu" ||
                        isTiroDeportivo) &&
                      selectedPhase.type === "grupo"
                    ) && (
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => setIsMatchModalOpen(true)}
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Nuevo Partido
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                {(() => {
                  console.log("isTiroDeportivo:", isTiroDeportivo);
                  console.log("sportName:", sportName);
                  console.log("selectedPhase.type:", selectedPhase.type);
                  console.log("matches.length:", matches.length);
                  return null;
                })()}
                {matchesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-600">Cargando partidos...</p>
                  </div>
                ) : isTiroDeportivo && selectedPhase.type === "grupo" ? (
                  // ── Tiro Deportivo: tabla de series y totales ──────────────────────
                  <TiroDeportivoScheduleTable phaseId={selectedPhase.phaseId} />
                ) : (getTaekwondoType() === "poomsae" ||
                    getWushuType() === "taolu") &&
                  selectedPhase.type !== "eliminacion" &&
                  selectedPhase.type !== "mejor_de_3" ? (
                  getTaekwondoType() === "poomsae" ? (
                    <PoomsaeScoreTable phaseId={selectedPhase.phaseId} />
                  ) : (
                    <WushuTaoluScoreTable phaseId={selectedPhase.phaseId} />
                  )
                ) : selectedPhase.type === "mejor_de_3" ? (
                  <BestOf3View
                    matches={matches}
                    phase={selectedPhase}
                    eventCategory={eventCategory}
                  />
                ) : matches.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="No hay partidos en esta fase"
                    description="Agrega partidos manualmente o genera automáticamente"
                    action={{
                      label: "Crear Primer Partido",
                      onClick: () => setIsMatchModalOpen(true),
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => {
                      const participants = match.participations || [];
                      const hasParticipants = participants.length > 0;
                      const isTaekwondoKyorugui =
                        getTaekwondoType() === "kyorugui";
                      const isJudoMatch = isJudo();
                      const isKarateMatch = isKarate();
                      const isWushuMatch = isWushu();
                      const isWrestlingMatch = isWrestling();
                      const isCollectiveMatch = isCollectiveSport();
                      const statusConfig = getStatusConfig(match.status);

                      return (
                        <Card
                          key={match.matchId}
                          variant="elevated"
                          padding="md"
                          hover
                          className="group"
                        >
                          {/* Header del partido */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
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

                              {/* Info adicional */}
                              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                {match.scheduledTime && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {new Date(
                                        match.scheduledTime,
                                      ).toLocaleString("es-ES")}
                                    </span>
                                  </div>
                                )}
                                {match.platformNumber && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      Plataforma {match.platformNumber}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Puntajes */}
                              {(getTaekwondoType() === "poomsae" ||
                                getTaekwondoType() === "kyorugui" ||
                                isJudoMatch ||
                                isKarateMatch ||
                                isWushuMatch ||
                                isWrestlingMatch ||
                                isCollectiveMatch) &&
                                match.participant1Score !== null &&
                                match.participant2Score !== null && (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <p className="text-sm font-semibold text-slate-700 mb-1">
                                      Puntaje Final
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                      {getTaekwondoType() === "poomsae" ||
                                      (isWushuMatch &&
                                        getWushuType() === "taolu")
                                        ? `${Number(match.participant1Score).toFixed(2)} - ${Number(match.participant2Score).toFixed(2)}`
                                        : `${Math.floor(Number(match.participant1Score))} - ${Math.floor(Number(match.participant2Score))}`}
                                    </p>
                                    {(getTaekwondoType() === "poomsae" ||
                                      (isWushuMatch &&
                                        getWushuType() === "taolu")) &&
                                      match.participant1Accuracy !== null && (
                                        <p className="text-xs text-slate-600 mt-1">
                                          {Number(
                                            match.participant1Accuracy,
                                          ).toFixed(2)}{" "}
                                          +{" "}
                                          {Number(
                                            match.participant1Presentation,
                                          ).toFixed(2)}{" "}
                                          -{" "}
                                          {Number(
                                            match.participant2Accuracy,
                                          ).toFixed(2)}{" "}
                                          +{" "}
                                          {Number(
                                            match.participant2Presentation,
                                          ).toFixed(2)}
                                        </p>
                                      )}
                                  </div>
                                )}
                            </div>

                            {/* Botón eliminar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMatch(match.matchId)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <span className="text-xl">×</span>
                            </Button>
                          </div>

                          {/* Participantes */}
                          {hasParticipants ? (
                            <div className="space-y-2 mb-4">
                              {participants.map((participation) => {
                                const reg = participation.registration;
                                const name = reg?.athlete
                                  ? reg.athlete.name
                                  : reg?.team?.name || "Sin nombre";
                                const institution =
                                  reg?.athlete?.institution ||
                                  reg?.team?.institution;
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
                                            e.currentTarget.style.display =
                                              "none";
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
                                          <p className="text-xs text-slate-600">
                                            {institution.name}
                                          </p>
                                        )}
                                      </div>

                                      {isWinner && (
                                        <Award className="h-5 w-5 text-emerald-600 ml-2" />
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
                                      {participation.corner === "blue" &&
                                        "Azul"}
                                      {participation.corner === "white" &&
                                        "Blanco"}
                                      {participation.corner === "A" &&
                                        "Equipo A"}
                                      {participation.corner === "B" &&
                                        "Equipo B"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl mb-4">
                              <Trophy className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-slate-500 text-sm">
                                Sin participantes asignados
                              </p>
                            </div>
                          )}

                          {/* Acciones del partido */}
                          <div className="flex flex-wrap gap-2">
                            {participants.length === 1 &&
                              match.status !== "finalizado" && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={async () => {
                                    const participant = participants[0];
                                    if (
                                      confirm(
                                        `¿Avanzar a ${
                                          participant.registration?.athlete
                                            ?.name ||
                                          participant.registration?.team
                                            ?.name ||
                                          "este participante"
                                        } automáticamente?`,
                                      )
                                    ) {
                                      try {
                                        await advanceWinnerMutation.mutateAsync(
                                          {
                                            matchId: match.matchId,
                                            winnerRegistrationId:
                                              participant.registrationId!,
                                          },
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Error al avanzar participante:",
                                          error,
                                        );
                                      }
                                    }
                                  }}
                                  disabled={advanceWinnerMutation.isPending}
                                >
                                  {advanceWinnerMutation.isPending
                                    ? "Procesando..."
                                    : "Pasar Participante"}
                                </Button>
                              )}

                            {participants.length < 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setIsAssignModalOpen(true);
                                }}
                              >
                                Asignar Participantes
                              </Button>
                            )}

                            {participants.length === 2 && (
                              <>
                                {/* ── Taekwondo, Judo, Karate, Wushu → modal de puntaje propio ── */}
                                {getTaekwondoType() === "poomsae" ||
                                getTaekwondoType() === "kyorugui" ||
                                isJudoMatch ||
                                isKarateMatch ||
                                isWrestlingMatch ||
                                isWushuMatch ? (
                                  <Button
                                    variant="gradient"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMatchId(match.matchId);
                                      setSelectedMatch(match);
                                      setIsResultModalOpen(true);
                                    }}
                                  >
                                    {(match.participant1Score !== null &&
                                      match.participant1Score !== undefined) ||
                                    (match.participant2Score !== null &&
                                      match.participant2Score !== undefined) ||
                                    match.status === "finalizado"
                                      ? "Editar Puntaje"
                                      : "Registrar Puntaje"}
                                  </Button>
                                ) : isTableTennis() ? (
                                  <Button
                                    variant="gradient"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMatch(match);
                                      setIsResultModalOpen(true);
                                    }}
                                  >
                                    {match.status === "finalizado"
                                      ? "Ver/Editar Match"
                                      : "Gestionar Match"}
                                  </Button>
                                ) : (
                                  match.status !== "finalizado" && (
                                    <Button
                                      variant="gradient"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMatch(match);
                                        setIsResultModalOpen(true);
                                      }}
                                    >
                                      Registrar Resultado
                                    </Button>
                                  )
                                )}
                              </>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════
          MODALES
      ═══════════════════════════════════════ */}
      <Modal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        title="Crear Nueva Fase"
        size="md"
      >
        <PhaseForm
          eventCategoryId={eventCategory.eventCategoryId}
          existingPhases={phases.length}
          onSubmit={handleCreatePhase}
          onCancel={() => setIsPhaseModalOpen(false)}
          isLoading={createPhaseMutation.isPending}
        />
      </Modal>

      {selectedPhase && (
        <>
          <Modal
            isOpen={isMatchModalOpen}
            onClose={() => setIsMatchModalOpen(false)}
            title="Crear Nuevo Partido"
            size="md"
          >
            <MatchForm
              phase={selectedPhase}
              onSubmit={handleCreateMatch}
              onCancel={() => setIsMatchModalOpen(false)}
              isLoading={createMatchMutation.isPending}
            />
          </Modal>

          {selectedPhase.type === "grupo" && (
            <GenerateRoundRobinModal
              isOpen={isGenerateModalOpen}
              onClose={() => setIsGenerateModalOpen(false)}
              phase={selectedPhase}
              registrations={eventCategory.registrations || []}
              onGenerate={handleGenerateRoundRobin}
              isLoading={initializeRoundRobinMutation.isPending}
            />
          )}

          {selectedPhase.type === "mejor_de_3" && (
            <GenerateBestOf3Modal
              isOpen={isGenerateBestOf3ModalOpen}
              onClose={() => setIsGenerateBestOf3ModalOpen(false)}
              phase={selectedPhase}
              registrations={eventCategory.registrations || []}
              onGenerate={handleGenerateBestOf3}
              isLoading={initializeBestOf3Mutation.isPending}
            />
          )}

          {selectedPhase.type === "eliminacion" && (
            <GenerateBracketModal
              isOpen={isGenerateBracketModalOpen}
              onClose={() => setIsGenerateBracketModalOpen(false)}
              phase={selectedPhase}
              availableRegistrations={
                eventCategory.registrations?.map((r) => r.registrationId) || []
              }
            />
          )}

          {selectedMatch && (
            <>
              <AssignParticipantsModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                  setIsAssignModalOpen(false);
                  setSelectedMatch(null);
                }}
                match={selectedMatch}
                registrations={eventCategory.registrations || []}
                onAssign={handleAssignParticipant}
                isLoading={createParticipationMutation.isPending}
              />

              {getTaekwondoType() === "poomsae" ? (
                <PoomsaeScoreModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch}
                  phase={selectedPhase}
                />
              ) : getTaekwondoType() === "kyorugui" ? (
                <KyoruguiRoundsModal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    setSelectedMatchId(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  match={fullMatch || (selectedMatch as any)}
                />
              ) : isJudo() ? (
                <JudoScoreModal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  match={selectedMatch as any}
                  phase={selectedPhase}
                />
              ) : isKarate() ? (
                <KarateScoreModal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  match={selectedMatch as any}
                  phase={selectedPhase}
                />
              ) : isWushu() && getWushuType() === "taolu" ? (
                <WushuTaoluScoreModal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  match={selectedMatch as any}
                  phase={selectedPhase}
                />
              ) : isWushu() ? (
                <WushuScoreModal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  match={selectedMatch as any}
                  phase={selectedPhase}
                />
              ) : isTableTennis() ? (
                <Modal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  title="Gestionar Match - Tenis de Mesa"
                  size="full"
                >
                  <TableTennisMatchWrapper
                    match={selectedMatch}
                    eventCategory={eventCategory}
                  />
                </Modal>
              ) : isCollectiveSport() ? (
                <CollectiveScoreModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch as any}
                  phase={selectedPhase}
                />
              ) : isWrestling() ? (
                <WrestlingScoreModal
                  isOpen={isResultModalOpen}
                  onClose={async () => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                    if (
                      selectedPhase?.type === "grupo" &&
                      selectedPhase?.phaseId
                    ) {
                      await updateStandingsMutation.mutateAsync(
                        selectedPhase.phaseId,
                      );
                    }
                  }}
                  match={selectedMatch as any}
                  phase={selectedPhase}
                />
              ) : (
                <ResultModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch}
                  onSubmit={handleRegisterResult}
                  isLoading={
                    selectedPhase?.type === "eliminacion"
                      ? advanceWinnerMutation.isPending
                      : updateMatchMutation.isPending
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
