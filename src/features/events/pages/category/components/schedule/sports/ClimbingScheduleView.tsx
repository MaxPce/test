import { Trophy, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { ClimbingScoreTable } from "@/features/competitions/components/climbing/ClimbingScoreTable";
import { AssignSeriesParticipantModal } from "@/features/competitions/components/AssignSeriesParticipantModal";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";

export function ClimbingScheduleView({ eventCategory, schedule }: SportViewProps) {
  const { phases, phasesLoading, selectedPhase, setSelectedPhase,
          modals, openModal, closeModal, handlers, mutations } = schedule;

  const getCardVisual = (_phase: Phase) => ({
    headerHeight: "h-20" as const,
    gradientClass: "from-emerald-600 to-teal-700",
    ringClass: "ring-emerald-500",
    hoverTextClass: "group-hover:text-emerald-600",
    icon: <Trophy className="h-5 w-5 text-white" />,
    badgeLabel: "Escalada",
  });

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Escalada"
        actions={
          <Button onClick={() => openModal("phase")} variant="gradient" size="lg"
            icon={<Plus className="h-5 w-5" />}>
            Nueva Fase
          </Button>
        }
      />

      {phasesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      ) : phases.length === 0 ? (
        <EmptyState title="No hay fases creadas" />
      ) : (
        <div className="space-y-8">
          <PhaseGrid
            phases={phases}
            selectedPhase={selectedPhase}
            getCardVisual={getCardVisual}
            onSelectPhase={setSelectedPhase}
            onDeletePhase={handlers.deletePhase}
            toggleSelection
            gap="gap-4"
          />

          {selectedPhase && (
            <PhaseDetailPanel
              phase={selectedPhase}
              onClose={() => setSelectedPhase(null)}
              variant="card"
              headerIcon={<Trophy className="h-5 w-5 text-white" />}
              bodyNoPadding
              actions={
                <Button variant="outline" size="sm"
                  icon={<UserPlus className="h-4 w-4" />}
                  onClick={() => openModal("assignSeries")}>
                  Asignar atletas
                </Button>
              }
            >
              <ClimbingScoreTable phaseId={selectedPhase.phaseId} />
            </PhaseDetailPanel>
          )}
        </div>
      )}

      <Modal isOpen={modals.phase} onClose={() => closeModal("phase")}
        title="Crear Nueva Fase" size="md">
        <PhaseForm
          eventCategoryId={eventCategory.eventCategoryId}
          existingPhases={phases.length}
          onSubmit={handlers.createPhase}
          onCancel={() => closeModal("phase")}
          isLoading={mutations.createPhase.isPending}
        />
      </Modal>

      {selectedPhase && (
        <AssignSeriesParticipantModal
          isOpen={modals.assignSeries}
          onClose={() => closeModal("assignSeries")}
          phaseId={selectedPhase.phaseId}
          phaseName={selectedPhase.name}
          allRegistrations={eventCategory.registrations || []}
          onAssign={handlers.assignClimbingParticipant}
          isLoading={mutations.assignClimbing.isPending}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          eventCategoryId={eventCategory.eventCategoryId}
        />
      )}
    </div>
  );
}