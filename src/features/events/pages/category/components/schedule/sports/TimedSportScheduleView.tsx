import { useState } from "react";
import { Timer, Calendar, UserPlus, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { AssignSeriesParticipantModal } from "@/features/competitions/components/AssignSeriesParticipantModal";
import { SwimmingResultsTable } from "@/features/results/components/SwimmingResultsTable";
import { GenerateSwimmingSeriesModal } from "@/features/competitions/components/swimming";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";

export function TimedSportScheduleView({ eventCategory, schedule }: SportViewProps) {
  const { phases, phasesLoading, selectedPhase, setSelectedPhase,
          modals, openModal, closeModal, handlers, mutations } = schedule;

  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const getCardVisual = (_phase: Phase) => ({
    headerHeight: "h-24" as const,
    gradientClass: "from-blue-600 to-cyan-500",
    ringClass: "ring-blue-500",
    hoverTextClass: "group-hover:text-blue-600",
    icon: <Timer className="h-6 w-6 text-white" />,
    badgeLabel: "Serie / Grupo",
  });

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Gestionar Series"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setGenerateModalOpen(true)}
              variant="outline"
              size="lg"
              icon={<Layers className="h-5 w-5" />}
            >
              Generar Series
            </Button>
            <Button
              onClick={() => openModal("phase")}
              variant="gradient"
              size="lg"
              icon={<Timer className="h-5 w-5" />}
            >
              Nueva Serie
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
          title="No hay series creadas"
          description="Crea la primera serie para registrar tiempos, ej: 'Serie 1 Preliminares'"
          action={{ label: "Crear Primera Serie", onClick: () => openModal("phase") }}
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
        <PhaseDetailPanel
          phase={selectedPhase}
          onClose={() => setSelectedPhase(null)}
          variant="plain"
          plainIcon={<Timer className="h-5 w-5" />}
          iconColorClass="text-blue-600"
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={<UserPlus className="h-4 w-4" />}
              onClick={() => openModal("assignSeries")}
            >
              Asignar Participante
            </Button>
          }
        >
          <SwimmingResultsTable
            eventCategoryId={eventCategory.eventCategoryId}
            registrations={eventCategory.registrations ?? []}
            categoryName={selectedPhase.name}
            forcedPhaseId={selectedPhase.phaseId}
          />
        </PhaseDetailPanel>
      )}

      <Modal
        isOpen={modals.phase}
        onClose={() => closeModal("phase")}
        title="Crear Nueva Serie"
        size="md"
      >
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

      <GenerateSwimmingSeriesModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        eventCategoryId={eventCategory.eventCategoryId}
        eventName={eventCategory.category?.name ?? "Natación"}
        sismasterEventId={eventCategory.externalEventId ?? undefined}
        sismasterSportId={eventCategory.externalSportId ?? undefined}
        allRegistrations={eventCategory.registrations ?? []}
      />
    </div>
  );
}