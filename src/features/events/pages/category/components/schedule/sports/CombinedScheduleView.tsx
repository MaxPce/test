import { Timer, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { AssignSeriesParticipantModal } from "@/features/competitions/components/AssignSeriesParticipantModal";
import { GenerateCombinedModal } from "@/features/competitions/components/athletics/GenerateCombinedModal";
import AthleticsResultsTable from "@/features/competitions/components/athletics/AthleticsResultsTable";
import AthleticsFieldTable from "@/features/competitions/components/athletics/AthleticsFieldTable";
import HeightAttemptsTable from "@/features/competitions/components/athletics/HeightAttemptsTable";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";
import type { FieldEventType } from "@/features/competitions/types/athletics.types";
import type { CombinedType } from "../../../hooks/useSportDetection";

const COMBINED_LABELS: Record<string, string> = {
  combined_pista: "Pista",
  combined_distancia: "Distancia",
  combined_altura: "Altura",
};

const PHASE_TYPE_OPTIONS = [
  { value: "combined_pista", label: "Pista (tiempo)" },
  { value: "combined_distancia", label: "Distancia (m)" },
  { value: "combined_altura", label: "Altura (m)" },
];

const getFieldEventType = (phase: Phase): FieldEventType => {
  const n = phase.name.toLowerCase();
  if (n.includes("garrocha") || n.includes("pértiga")) return "pole_vault";
  if (n.includes("salto alto")) return "high_jump";
  if (n.includes("triple")) return "triple_jump";
  if (n.includes("salto largo")) return "long_jump";
  if (n.includes("bala")) return "shot_put";
  if (n.includes("disco")) return "discus";
  if (n.includes("jabalina")) return "javelin";
  if (n.includes("martillo")) return "hammer";
  return "long_jump";
};

function renderTable(phase: Phase) {
  if (phase.type === "combined_altura") return <HeightAttemptsTable phaseId={phase.phaseId} />;
  if (phase.type === "combined_distancia")
    return <AthleticsFieldTable phaseId={phase.phaseId} eventType={getFieldEventType(phase)} />;
  return <AthleticsResultsTable phaseId={phase.phaseId} />;
}

interface CombinedScheduleViewProps extends SportViewProps {
  combinedType: CombinedType;
}

export function CombinedScheduleView({ eventCategory, schedule, combinedType }: CombinedScheduleViewProps) {
  const { phases, phasesLoading, selectedPhase, setSelectedPhase,
          modals, openModal, closeModal, handlers, mutations } = schedule;

  const title = combinedType === "decatlon" ? "Decatlón" : "Heptatlón";

  const getCardVisual = (phase: Phase) => ({
    headerHeight: "h-24" as const,
    gradientClass: "from-orange-500 to-red-600",
    ringClass: "ring-orange-500",
    hoverTextClass: "group-hover:text-orange-600",
    icon: <Timer className="h-6 w-6 text-white" />,
    badgeLabel: COMBINED_LABELS[phase.type] ?? phase.type,
  });

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={title}
        actions={
          phases.length === 0 ? (
            <Button onClick={() => openModal("generateCombined")} variant="gradient" size="lg">
              Generar Fases
            </Button>
          ) : (
            <Button onClick={() => openModal("phase")} variant="outline" size="lg"
              icon={<Plus className="h-5 w-5" />}>
              Agregar Prueba
            </Button>
          )
        }
      />

      {phasesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : phases.length === 0 ? (
        <EmptyState icon={Calendar} title="No hay pruebas creadas"
          description={`Genera las pruebas del ${title} con el botón de arriba.`}
          action={{ label: "Generar Fases", onClick: () => openModal("generateCombined") }}
        />
      ) : (
        <PhaseGrid
          phases={phases}
          selectedPhase={selectedPhase}
          getCardVisual={getCardVisual}
          onSelectPhase={setSelectedPhase}
          onDeletePhase={handlers.deletePhase}
          toggleSelection
          gap="gap-6"
        />
      )}

      {selectedPhase && (
        <PhaseDetailPanel
          phase={selectedPhase}
          onClose={() => setSelectedPhase(null)}
          variant="plain"
          plainIcon={<Timer className="h-5 w-5" />}
          iconColorClass="text-orange-500"
          actions={
            <Button variant="outline" size="sm" onClick={() => openModal("assignSeries")}>
              Asignar Participante
            </Button>
          }
        >
          {renderTable(selectedPhase)}
        </PhaseDetailPanel>
      )}

      <Modal isOpen={modals.phase} onClose={() => closeModal("phase")}
        title="Agregar Prueba" size="md">
        <PhaseForm
          eventCategoryId={eventCategory.eventCategoryId}
          existingPhases={phases.length}
          onSubmit={handlers.createPhase}
          onCancel={() => closeModal("phase")}
          isLoading={mutations.createPhase.isPending}
          typeOptions={PHASE_TYPE_OPTIONS}
          defaultType="combined_pista"
        />
      </Modal>

      <GenerateCombinedModal
        isOpen={modals.generateCombined}
        onClose={() => closeModal("generateCombined")}
        combinedType={combinedType}
        onGenerate={handlers.generateCombined}
        isLoading={mutations.createPhase.isPending}
      />

      {selectedPhase && (
        <AssignSeriesParticipantModal
          isOpen={modals.assignSeries}
          onClose={() => closeModal("assignSeries")}
          phaseId={selectedPhase.phaseId}
          phaseName={selectedPhase.name}
          allRegistrations={eventCategory.registrations || []}
          onAssign={async (registrationId) => {
            await handlers.assignSeriesParticipant(registrationId, true);
          }}
          isLoading={mutations.assignPhaseRegistration.isPending}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          eventCategoryId={eventCategory.eventCategoryId}
        />
      )}
    </div>
  );
}