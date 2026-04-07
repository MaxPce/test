import { Trophy, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { AssignSeriesParticipantModal } from "@/features/competitions/components/AssignSeriesParticipantModal";
import ChessRoundsTable from "@/features/competitions/components/chess/ChessRoundsTable";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";

export function ChessScheduleView({ eventCategory, schedule }: SportViewProps) {
  const { phases, phasesLoading, selectedPhase, setSelectedPhase,
          modals, openModal, closeModal, handlers, mutations } = schedule;

  const getCardVisual = (_phase: Phase) => ({
    headerHeight: "h-20" as const,
    gradientClass: "from-indigo-600 to-violet-700",
    ringClass: "ring-indigo-500",
    hoverTextClass: "group-hover:text-indigo-600",
    icon: <span className="text-xl">♟</span>,
    badgeLabel: "Modalidad",
  });

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Ajedrez"
        actions={
          <Button onClick={() => openModal("phase")} variant="gradient" size="lg"
            icon={<Plus className="h-5 w-5" />}>
            Nueva Fase
          </Button>
        }
      />

      {phasesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : phases.length === 0 ? (
        <EmptyState icon={Trophy} title="No hay fases creadas"
          description="Crea la primera fase de ajedrez. Ej: 'Categoría Abierta', 'Sub-18'"
          action={{ label: "Nueva Fase", onClick: () => openModal("phase") }}
        />
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
              headerIcon={<span className="text-lg">♟</span>}
              actions={
                <Button variant="outline" size="sm"
                  icon={<UserPlus className="h-4 w-4" />}
                  onClick={() => openModal("assignSeries")}>
                  Asignar Jugadores
                </Button>
              }
            >
              <ChessRoundsTable phaseId={selectedPhase.phaseId} participants={[]} />
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
          onAssign={(id) => handlers.assignSeriesParticipant(id)}
          isLoading={mutations.assignPhaseRegistration.isPending}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          eventCategoryId={eventCategory.eventCategoryId}
        />
      )}
    </div>
  );
}