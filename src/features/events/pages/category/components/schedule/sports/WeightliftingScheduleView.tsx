import { Trophy, Plus, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/PageHeader";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { WeightliftingAttemptsTable } from "@/features/competitions/components/weightlifting/WeightliftingAttemptsTable";
import { GenerateWeightliftingModal } from "@/features/competitions/components/weightlifting/GenerateWeightliftingModal";
import { GenerateWeightliftingPhasesModal } from "@/features/competitions/components/weightlifting/GenerateWeightliftingPhasesModal";
import { useFinalizeWeightliftingPhase } from "@/features/competitions/hooks/useFinalizeWeightliftingPhase";
import { useWeightliftingMedallero } from "@/features/competitions/hooks/useWeightliftingMedallero";
import { MedalleroPanel } from "@/features/competitions/components/MedalleroPanel";
// ──────────────────────────────────────────────────────────────────────────────
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";


const PHASE_COLORS: Record<string, string> = {
  grupo: "from-blue-600 to-blue-700",
  eliminacion: "from-purple-600 to-purple-700",
  repechaje: "from-amber-500 to-amber-600",
  mejor_de_3: "from-emerald-600 to-emerald-700",
};


export function WeightliftingScheduleView({ eventCategory, schedule }: SportViewProps) {
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

  
  const medals = useWeightliftingMedallero(selectedPhase?.phaseId);
  const finalizeMutation = useFinalizeWeightliftingPhase(
    selectedPhase?.phaseId ?? 0,
  );

  const getCardVisual = (phase: Phase) => ({
    headerHeight: "h-20" as const,
    gradientClass: PHASE_COLORS[phase.type] ?? "from-blue-600 to-blue-700",
    ringClass: "ring-blue-500",
    hoverTextClass: "group-hover:text-blue-600",
    icon: <Trophy className="h-5 w-5 text-white" />,
    badgeLabel: phase.type,
  });

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Levantamiento de Pesas"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => openModal("generateWeightliftingPhases")}
              variant="outline"
              size="lg"
            >
              Generar Fases
            </Button>
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
            <>
              {/* ── NUEVO: medallero encima del panel de fase ─────────────────
                  Solo se muestra si hay atletas con total registrado.
                  Si hay divisiones, muestra un MedalleroPanel por división.
              ──────────────────────────────────────────────────────────────── */}
              {medals.length > 0 && (
                <MedalleroPorDivision medals={medals} />
              )}

              <PhaseDetailPanel
                phase={selectedPhase}
                onClose={() => setSelectedPhase(null)}
                variant="card"
                headerIcon={<Trophy className="h-5 w-5 text-white" />}
                bodyNoPadding
                actions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<UserPlus className="h-4 w-4" />}
                      onClick={() => openModal("generateWeightlifting")}
                    >
                      Asignar atletas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                      isLoading={finalizeMutation.isPending}
                      onClick={() => {
                        if (window.confirm('¿Finalizar fase? Se calcularán los rankings de arranque, envión y total.')) {
                          finalizeMutation.mutate();
                        }
                      }}
                    >
                      Finalizar Fase
                    </Button>
                  </>
                }
              >
                <WeightliftingAttemptsTable phaseId={selectedPhase.phaseId} />
              </PhaseDetailPanel>
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={modals.phase}
        onClose={() => closeModal("phase")}
        title="Crear Nueva Fase"
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
        <GenerateWeightliftingModal
          isOpen={modals.generateWeightlifting}
          onClose={() => closeModal("generateWeightlifting")}
          phaseId={selectedPhase.phaseId}
          registrations={eventCategory.registrations ?? []}
          onGenerate={handlers.generateWeightlifting}
          isLoading={mutations.initializeWeightlifting.isPending}
        />
      )}

      {modals.generateWeightliftingPhases && (
        <GenerateWeightliftingPhasesModal
          open={modals.generateWeightliftingPhases}
          onClose={() => closeModal("generateWeightliftingPhases")}
          eventCategoryId={eventCategory.eventCategoryId}
          categoryName={eventCategory.category?.name ?? "Levantamiento de Pesas"}
          sismasterEventId={eventCategory.externalEventId ?? undefined}
          sismasterSportId={eventCategory.externalSportId ?? undefined}
          haymasterEventId={eventCategory.haymasterEventId ?? undefined}  
          allRegistrations={eventCategory.registrations ?? []}
        />
      )}
    </div>
  );
}


// ─── Sub-componente: agrupa medallas por división y renderiza un panel por cada una ───

function MedalleroPorDivision({ medals }: { medals: ReturnType<typeof useWeightliftingMedallero> }) {
  // Detectar si hay múltiples "grupos" de medallas (oro, plata, bronce de distintas divisiones)
  // Un grupo = 3 medallas consecutivas gold→silver→bronze
  // Si el total es <= 3 es una sola división → un solo panel sin título de división

  if (medals.length <= 3) {
    return <MedalleroPanel medals={medals} />;
  }

  // Agrupar en ternas: cada 3 entradas es una división
  const groups: Array<{ division: string; entries: typeof medals }> = [];
  for (let i = 0; i < medals.length; i += 3) {
    const chunk = medals.slice(i, i + 3);
    // El nombre de la división lo inferimos del institution o simplemente numeramos
    groups.push({
      division: `División ${Math.floor(i / 3) + 1}`,
      entries: chunk,
    });
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <MedalleroPanel key={g.division} medals={g.entries} title={g.division} />
      ))}
    </div>
  );
}