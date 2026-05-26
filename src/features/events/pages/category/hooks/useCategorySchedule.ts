import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { useMatches, useMatch } from "@/features/competitions/api/matches.queries";
import { useCreatePhase, useDeletePhase } from "@/features/competitions/api/phases.mutations";
import { useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/features/competitions/api/matches.mutations";
import {
  useCreateParticipation,
  useDeleteParticipation,  
} from "@/features/competitions/api/participations.mutations";
import { useAdvanceWinner, useGenerateBracket } from "@/features/competitions/api/bracket.mutations";
import { useInitializeRoundRobin } from "@/features/competitions/api/round-robin.mutations";
import { useUpdateStandings } from "@/features/competitions/api/standings.mutations";
import { useInitializeBestOf3 } from "@/features/competitions/api/best-of-3.mutations";
import { useInitializeWeightliftingPhase } from "@/features/competitions/api/weightlifting.mutations";
import { useAssignPhaseRegistration } from "@/features/competitions/api/phaseRegistrations.queries";
import { useAssignClimbingParticipant } from "@/features/competitions/api/climbing.queries";
import { useInitializePoomsaeGroupPhase } from "@/features/competitions/api/taekwondo.mutations";
import { FIELD_TABLE_KEY, TRACK_TABLE_KEY } from "@/features/competitions/api/athletics.queries";
import type { EventCategory } from "../../../types";
import type { Phase, Match } from "@/features/competitions/types";
import type { CombinedEventDraft } from "@/features/competitions/types/combined-events.config";

// ─── Tipos ───────────────────────────────────────────────────────────────────

/**
 * Nombres de cada modal — usados con openModal/closeModal
 * en lugar de 15 setIsXxxOpen independientes.
 */
export type ModalName =
  | "phase"
  | "match"
  | "assign"
  | "assignPhase"
  | "result"
  | "generateRoundRobin"
  | "collective"
  | "generateBestOf3"
  | "generateBracket"
  | "assignSeries"
  | "initPoomsae"
  | "initShooting"
  | "generateCombined"
  | "generateWeightlifting"
  | "generateSeries"
  | "generateKumitePhases"
  | "generateWrestlingPhases"
  | "generateWushuPhases"
  | "generateWushuTaoluPhases"
  | "assignTaolu";

const INITIAL_MODAL_STATE: Record<ModalName, boolean> = {
  phase: false,
  match: false,
  assign: false,
  assignPhase: false,
  result: false,
  generateRoundRobin: false,
  collective: false,
  generateBestOf3: false,
  generateBracket: false,
  assignSeries: false,
  initPoomsae: false,
  initShooting: false,
  generateCombined: false,
  generateWeightlifting: false,
  generateSeries: false,
  generateKumitePhases: false,
  generateWrestlingPhases: false,
  generateWushuPhases: false,
  generateWushuTaoluPhases: false,
  assignTaolu: false,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCategorySchedule(eventCategory: EventCategory) {
  // ── Selección ──────────────────────────────────────────────────────────────
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  // ── Modales (un solo useState para los 13 modales) ─────────────────────────
  const [modals, setModals] = useState<Record<ModalName, boolean>>(INITIAL_MODAL_STATE);

  const openModal = (name: ModalName) =>
    setModals((prev) => ({ ...prev, [name]: true }));

  const closeModal = (name: ModalName) =>
    setModals((prev) => ({ ...prev, [name]: false }));

  // ── Queries ────────────────────────────────────────────────────────────────
  const queryClient = useQueryClient();

  const { data: phases = [], isLoading: phasesLoading } = usePhases(
    eventCategory.eventCategoryId,
  );
  const { data: matches = [], isLoading: matchesLoading } = useMatches(
    selectedPhase?.phaseId,
  );
  const { data: fullMatch, isLoading: fullMatchLoading } = useMatch(
    selectedMatchId ?? 0,
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createPhaseMutation = useCreatePhase();
  const deletePhaseMutation = useDeletePhase();
  const createMatchMutation = useCreateMatch();
  const updateMatchMutation = useUpdateMatch();
  const deleteMatchMutation = useDeleteMatch();
  const createParticipationMutation = useCreateParticipation();
  const deleteParticipationMutation = useDeleteParticipation();
  const advanceWinnerMutation = useAdvanceWinner();
  const generateBracketMutation = useGenerateBracket();
  const initializeRoundRobinMutation = useInitializeRoundRobin();
  const updateStandingsMutation = useUpdateStandings();
  const initializeBestOf3Mutation = useInitializeBestOf3();
  const initializeWeightliftingMutation = useInitializeWeightliftingPhase();
  const assignPhaseRegistrationMutation = useAssignPhaseRegistration();
  // Depende de selectedPhase — React la re-ejecuta cuando cambia
  const assignClimbingMutation = useAssignClimbingParticipant(
    selectedPhase?.phaseId ?? 0,
  );
  const initializePoomsaeGroupMutation = useInitializePoomsaeGroupPhase();

  // ── Valores derivados ──────────────────────────────────────────────────────
  const totalMatches = phases.reduce(
    (sum, phase) => sum + (phase.matches?.length ?? 0),
    0,
  );

  const finishedMatches = phases.reduce(
    (sum, phase) =>
      sum + (phase.matches?.filter((m) => m.status === "finalizado").length ?? 0),
    0,
  );

  const availableRegistrations = useMemo(
    () =>
      eventCategory.registrations?.map((r) => ({
        registrationId: r.registrationId,
        displayName: r.athlete
          ? r.athlete.name
          : (r.team?.name ?? `Registro #${r.registrationId}`),
      })) ?? [],
    [eventCategory.registrations],
  );

  // ── Helpers de invalidación de cache ──────────────────────────────────────
  const invalidateAthleticsCache = async (phaseId: number) => {
    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });
    await queryClient.invalidateQueries({ queryKey: TRACK_TABLE_KEY(phaseId) });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreatePhase = async (data: any) => {
    await createPhaseMutation.mutateAsync(data);
    closeModal("phase");
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta fase? Se eliminarán todos sus partidos."))
      return;
    await deletePhaseMutation.mutateAsync(phaseId);
    if (selectedPhase?.phaseId === phaseId) setSelectedPhase(null);
  };

  const handleCreateMatch = async (data: any) => {
    await createMatchMutation.mutateAsync(data);
    closeModal("match");
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm("¿Estás seguro de eliminar este match?")) return;
    await deleteMatchMutation.mutateAsync(matchId);
    // Seguro extra: invalidar con el phaseId específico
    if (selectedPhase?.phaseId) {
      await queryClient.invalidateQueries({
        queryKey: ["matches", selectedPhase.phaseId],
      });
    }
  };

  const handleAssignParticipant = async (data: any) => {
    await createParticipationMutation.mutateAsync(data);
  };

  const handleRemoveParticipant = async (
    matchId: number,
    registrationId: number,
  ) => {
    if (!selectedPhase) return;
    await deleteParticipationMutation.mutateAsync({
      matchId,
      registrationId,
      phaseId: selectedPhase.phaseId,
    });
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
        data: { status: "finalizado", winnerRegistrationId: winnerId },
      });
      if (selectedPhase?.type === "grupo" && selectedPhase.phaseId) {
        await updateStandingsMutation.mutateAsync(selectedPhase.phaseId);
      }
    }
  };

  const handleGenerateRoundRobin = async (data: {
    phaseId: number;
    registrationIds: number[];
    emptyParticipantCount?: number;
  }) => {
    await initializeRoundRobinMutation.mutateAsync(data);
    closeModal("generateRoundRobin");
  };

  const handleGenerateBestOf3 = async (data: {
    phaseId: number;
    registrationIds: number[];
  }) => {
    await initializeBestOf3Mutation.mutateAsync(data);
    closeModal("generateBestOf3");
  };

  const handleGenerateBracket = async (data: {
    phaseId: number;
    registrationIds: number[];
    includeThirdPlace?: boolean;
  }) => {
    await generateBracketMutation.mutateAsync(data);
    closeModal("generateBracket");
  };

  const handleGenerateCombined = async (drafts: CombinedEventDraft[]) => {
    for (const draft of drafts) {
      await createPhaseMutation.mutateAsync({
        eventCategoryId: eventCategory.eventCategoryId,
        name: draft.name,
        type: `combined_${draft.tableType}`,
      });
    }
    closeModal("generateCombined");
  };

  const handleGenerateWeightlifting = async (entries: any) => {
    if (!selectedPhase) return;
    await initializeWeightliftingMutation.mutateAsync({
      phaseId: selectedPhase.phaseId,
      entries,
    });
    closeModal("generateWeightlifting");
  };

  /**
   * Asigna un participante a una serie (atletismo, natación, escalada, ajedrez, etc.)
   * e invalida el cache de athletics si aplica.
   */
  const handleAssignSeriesParticipant = async (
    registrationId: number,
    invalidateAthletics = false,
  ) => {
    if (!selectedPhase) return;
    await assignPhaseRegistrationMutation.mutateAsync({
      phaseId: selectedPhase.phaseId,
      registrationId,
    });
    if (invalidateAthletics) {
      await invalidateAthleticsCache(selectedPhase.phaseId);
    }
  };

  const handleAssignClimbingParticipant = async (registrationId: number) => {
    await assignClimbingMutation.mutateAsync(registrationId);
  };

  const handleAdvanceWinner = async (matchId: number, registrationId: number) => {
    await advanceWinnerMutation.mutateAsync({
      matchId,
      winnerRegistrationId: registrationId,
    });
  };

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    // Selección
    selectedPhase,
    setSelectedPhase,
    selectedMatch,
    setSelectedMatch,
    selectedMatchId,
    setSelectedMatchId,

    // Modales
    modals,
    openModal,
    closeModal,

    // Datos
    phases,
    phasesLoading,
    matches,
    matchesLoading,
    fullMatch,
    fullMatchLoading,
    queryClient,

    // Valores derivados
    totalMatches,
    finishedMatches,
    availableRegistrations,

    // Handlers
    handlers: {
      createPhase: handleCreatePhase,
      removeParticipant: handleRemoveParticipant,
      deletePhase: handleDeletePhase,
      createMatch: handleCreateMatch,
      deleteMatch: handleDeleteMatch,
      assignParticipant: handleAssignParticipant,
      registerResult: handleRegisterResult,
      generateRoundRobin: handleGenerateRoundRobin,
      generateBestOf3: handleGenerateBestOf3,
      generateBracket: handleGenerateBracket,
      generateCombined: handleGenerateCombined,
      generateWeightlifting: handleGenerateWeightlifting,
      assignSeriesParticipant: handleAssignSeriesParticipant,
      assignClimbingParticipant: handleAssignClimbingParticipant,
      advanceWinner: handleAdvanceWinner,
    },

    // Mutations (para los flags isPending en las vistas)
    mutations: {
      createPhase: createPhaseMutation,
      deleteParticipation: deleteParticipationMutation,
      deletePhase: deletePhaseMutation,
      createMatch: createMatchMutation,
      updateMatch: updateMatchMutation,
      deleteMatch: deleteMatchMutation,
      createParticipation: createParticipationMutation,
      advanceWinner: advanceWinnerMutation,
      generateBracket: generateBracketMutation,
      initializeRoundRobin: initializeRoundRobinMutation,
      updateStandings: updateStandingsMutation,
      initializeBestOf3: initializeBestOf3Mutation,
      initializeWeightlifting: initializeWeightliftingMutation,
      assignPhaseRegistration: assignPhaseRegistrationMutation,
      assignClimbing: assignClimbingMutation,
      initializePoomsaeGroup: initializePoomsaeGroupMutation,
    },
  };
}