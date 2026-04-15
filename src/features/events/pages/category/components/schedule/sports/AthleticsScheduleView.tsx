import { useMemo } from "react";
import { Timer, Calendar, Plus, UserPlus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { AssignSeriesParticipantModal } from "@/features/competitions/components/AssignSeriesParticipantModal";
import { GenerateAthleticsSeriesModal } from "@/features/competitions/components/athletics/GenerateAthleticsSeriesModal";
import AthleticsResultsTable from "@/features/competitions/components/athletics/AthleticsResultsTable";
import AthleticsFieldTable from "@/features/competitions/components/athletics/AthleticsFieldTable";
import HeightAttemptsTable from "@/features/competitions/components/athletics/HeightAttemptsTable";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";
import type { FieldEventType } from "@/features/competitions/types/athletics.types";

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
  if (phase.type === "combined_altura") {
    return <HeightAttemptsTable phaseId={phase.phaseId} />;
  }
  if (phase.type === "combined_distancia") {
    return (
      <AthleticsFieldTable
        phaseId={phase.phaseId}
        eventType={getFieldEventType(phase)}
      />
    );
  }
  return <AthleticsResultsTable phaseId={phase.phaseId} />;
}

const PHASE_TYPE_OPTIONS = [
  { value: "combined_pista", label: "Pista / Vallas / Postas / Marcha" },
  { value: "combined_distancia", label: "Saltos y Lanzamientos (distancia)" },
  { value: "combined_altura", label: "Salto alto / Garrocha (altura)" },
];

// Ajusta esta función según tu data real
function getLevelLabelFromRegistration(reg: any): "Noveles" | "Avanzado" | null {
  // ejemplos posibles:
  // if (reg.level === "noveles") return "Noveles";
  // if (reg.level === "avanzado") return "Avanzado";
  // if (reg.categoryLevel === "advanced") return "Avanzado";

  // TEMPORAL: adaptar a tu estructura real
  return reg.levelLabel ?? null;
}

function getGroupData(
  gender?: "M" | "F" | "MIXTO",
  levelLabel?: "Noveles" | "Avanzado" | null,
  eventName?: string,
) {
  if (!gender || !levelLabel) return null;

  const baseName = eventName || "Atletismo";

  if (gender === "M" && levelLabel === "Noveles") {
    return {
      groupKey: "M-noveles",
      groupLabel: `Varones Noveles ${baseName}`,
    };
  }

  if (gender === "F" && levelLabel === "Noveles") {
    return {
      groupKey: "F-noveles",
      groupLabel: `Damas Noveles ${baseName}`,
    };
  }

  if (gender === "M" && levelLabel === "Avanzado") {
    return {
      groupKey: "M-avanzado",
      groupLabel: `Varones Avanzado ${baseName}`,
    };
  }

  if (gender === "F" && levelLabel === "Avanzado") {
    return {
      groupKey: "F-avanzado",
      groupLabel: `Damas Avanzado ${baseName}`,
    };
  }

  return null;
}

export function AthleticsScheduleView({ eventCategory, schedule }: SportViewProps) {
  const {
    phases,
    phasesLoading,
    selectedPhase,
    setSelectedPhase,
    modals,
    openModal,
    closeModal,
    handlers,
    mutations,
  } = schedule;

  const getCardVisual = (_phase: Phase) => ({
    headerHeight: "h-24" as const,
    gradientClass: "from-orange-500 to-red-600",
    ringClass: "ring-orange-500",
    hoverTextClass: "group-hover:text-orange-600",
    icon: <Timer className="h-6 w-6 text-white" />,
    badgeLabel: "Serie / Sección",
  });

  const registrationsForModal = useMemo(() => {
    const regs = eventCategory.registrations || [];

    return regs
      .map((reg: any) => {
        const athlete = reg.athlete;
        const gender = athlete?.gender as "M" | "F" | "MIXTO" | undefined;
        const levelLabel = getLevelLabelFromRegistration(reg);

        const group = getGroupData(
          gender,
          levelLabel,
          eventCategory.category?.name || eventCategory.name,
        );

        if (!group) return null;

        return {
          registrationId: reg.registrationId,
          athleteId: athlete?.athleteId,
          athleteName: athlete?.name ?? `Registro ${reg.registrationId}`,
          institutionName: athlete?.institution?.name ?? null,
          institutionLogo: athlete?.institution?.logoUrl ?? null,
          gender,
          levelLabel,
          groupKey: group.groupKey,
          groupLabel: group.groupLabel,
        };
      })
      .filter(Boolean);
  }, [eventCategory]);

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Atletismo"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => openModal("generateSeries")}
              variant="outline"
              size="lg"
            >
              Generar Series
            </Button>

            <Button onClick={() => openModal("phase")} variant="gradient" size="lg">
              Nueva Serie
            </Button>
          </div>
        }
      />

      {phasesLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : phases.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No hay series creadas"
          description="Crea la primera serie o genera series automáticamente"
          action={{
            label: "Crear Primera Serie",
            onClick: () => openModal("phase"),
          }}
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
          iconColorClass="text-orange-500"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("assignSeries")}
            >
              Asignar Participante
            </Button>
          }
        >
          {renderTable(selectedPhase)}
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
          typeOptions={PHASE_TYPE_OPTIONS}
          defaultType="combined_pista"
        />
      </Modal>

      <GenerateAthleticsSeriesModal
        open={modals.generateSeries}
        onClose={() => closeModal("generateSeries")}
        eventCategoryId={eventCategory.eventCategoryId}
        eventName={eventCategory.category?.name || eventCategory.name}
        allRegistrations={eventCategory.registrations ?? []}  
        sismasterEventId={eventCategory.externalEventId ?? undefined}   
        sismasterSportId={eventCategory.externalSportId ?? undefined}   
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