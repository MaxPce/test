// src/features/competitions/components/athletics/AthleticsScheduleView.tsx

import { useMemo, useState } from "react";
import { Timer, Calendar, Settings2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
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
import { PhaseSettingsModal } from "@/features/competitions/components/athletics/PhaseSettingsModal";
import type { PhaseSettings } from "@/features/competitions/components/athletics/PhaseSettingsModal";
import { phasesApi } from "@/features/competitions/api/phases.api";
import { PhaseGrid } from "../PhaseGrid";
import { PhaseDetailPanel } from "../PhaseDetailPanel";
import type { Phase } from "@/features/competitions/types";
import type { SportViewProps } from "./types";
import type { FieldEventType } from "@/features/competitions/types/athletics.types";

// ─── Helpers ────────────────────────────────────────────────────────────────────

const getFieldEventType = (phase: Phase): FieldEventType => {
  const n = phase.name.toLowerCase();
  if (n.includes("garrocha") || n.includes("pértiga")) return "pole_vault";
  if (n.includes("salto alto"))  return "high_jump";
  if (n.includes("triple"))      return "triple_jump";
  if (n.includes("salto largo")) return "long_jump";
  if (n.includes("bala"))        return "shot_put";
  if (n.includes("disco"))       return "discus";
  if (n.includes("jabalina"))    return "javelin";
  if (n.includes("martillo"))    return "hammer";
  return "long_jump";
};

function renderTable(phase: Phase) {
  if (phase.type === "combined_altura")
    return <HeightAttemptsTable phaseId={phase.phaseId} />;
  if (phase.type === "combined_distancia")
    return <AthleticsFieldTable phaseId={phase.phaseId} eventType={getFieldEventType(phase)} />;
  return <AthleticsResultsTable phaseId={phase.phaseId} />;
}

const PHASE_TYPE_OPTIONS = [
  { value: "combined_pista",     label: "Pista / Vallas / Postas / Marcha"  },
  { value: "combined_distancia", label: "Saltos y Lanzamientos (distancia)" },
  { value: "combined_altura",    label: "Salto alto / Garrocha (altura)"    },
];

function getLevelLabelFromRegistration(reg: any): "Noveles" | "Avanzado" | null {
  return reg.levelLabel ?? null;
}

function getGroupData(
  gender?: "M" | "F" | "MIXTO",
  levelLabel?: "Noveles" | "Avanzado" | null,
  eventName?: string,
) {
  if (!gender || !levelLabel) return null;
  const base = eventName || "Atletismo";
  if (gender === "M" && levelLabel === "Noveles")  return { groupKey: "M-noveles",  groupLabel: `Varones Noveles ${base}`  };
  if (gender === "F" && levelLabel === "Noveles")  return { groupKey: "F-noveles",  groupLabel: `Damas Noveles ${base}`    };
  if (gender === "M" && levelLabel === "Avanzado") return { groupKey: "M-avanzado", groupLabel: `Varones Avanzado ${base}` };
  if (gender === "F" && levelLabel === "Avanzado") return { groupKey: "F-avanzado", groupLabel: `Damas Avanzado ${base}`   };
  return null;
}

// ─── Chips de estado que aparecen en cada card ─────────────────────────────────

const GENDER_LABEL: Record<string, string> = {
  damas:   "♀️ Damas",
  varones: "♂️ Varones",
  mixto:   "⚥ Mixto",
};
const LEVEL_LABEL: Record<string, string> = {
  noveles:   "Noveles",
  avanzados: "Avanzados",
};

function PhaseConfigChips({ phase }: { phase: Phase }) {
  const gLabel = phase.gender ? GENDER_LABEL[phase.gender] : null;
  const lLabel = phase.level  ? LEVEL_LABEL[phase.level]   : null;
  if (!gLabel && !lLabel && !phase.isRelay) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {gLabel && (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
          {gLabel}
        </span>
      )}
      {lLabel && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {lLabel}
        </span>
      )}
      {phase.isRelay && (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          ⚡ Posta
        </span>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────────

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

  const queryClient = useQueryClient();

  const [phaseToEdit,      setPhaseToEdit]      = useState<Phase | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // ── PATCH settings ───────────────────────────────────────────────────────────
  const handleSaveSettings = async (phaseId: number, settings: PhaseSettings) => {
    setIsSavingSettings(true);
    try {
      await phasesApi.updateSettings(phaseId, {
        gender:  settings.gender  ?? undefined,
        level:   settings.level   ?? undefined,
        isRelay: settings.isRelay,
      });

      // Refresca la lista de fases → las chips se actualizan en las cards
      await queryClient.invalidateQueries({
        queryKey: ["phases", eventCategory.eventCategoryId],
      });

      toast.success("Configuración guardada");
      setPhaseToEdit(null);
    } catch {
      toast.error("No se pudo guardar la configuración");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getCardVisual = (_phase: Phase) => ({
    headerHeight: "h-24" as const,
    gradientClass: "from-orange-500 to-red-600",
    ringClass:     "ring-orange-500",
    hoverTextClass: "group-hover:text-orange-600",
    icon:       <Timer className="h-6 w-6 text-white" />,
    badgeLabel: "Serie / Sección",
  });

  // Slot extra por card: botón ⚙ + chips de estado
  const getCardExtra = (phase: Phase) => (
    <>
      <PhaseConfigChips phase={phase} />
      <button
        type="button"
        aria-label={`Configurar ${phase.name}`}
        onClick={(e) => {
          e.stopPropagation(); // no activar onSelectPhase al mismo tiempo
          setPhaseToEdit(phase);
        }}
        className={[
          "absolute top-2 right-2 z-10",
          "flex items-center justify-center h-7 w-7 rounded-lg",
          "bg-white/20 backdrop-blur-sm text-white",
          "hover:bg-white/40 active:scale-95 transition-all duration-150",
        ].join(" ")}
      >
        <Settings2 className="h-3.5 w-3.5" />
      </button>
    </>
  );

  const registrationsForModal = useMemo(() => {
    const regs = eventCategory.registrations || [];
    return regs
      .map((reg: any) => {
        const athlete    = reg.athlete;
        const gender     = athlete?.gender as "M" | "F" | "MIXTO" | undefined;
        const levelLabel = getLevelLabelFromRegistration(reg);
        const group      = getGroupData(gender, levelLabel, eventCategory.category?.name || eventCategory.name);
        if (!group) return null;
        return {
          registrationId:  reg.registrationId,
          athleteId:       athlete?.athleteId,
          athleteName:     athlete?.name ?? `Registro ${reg.registrationId}`,
          institutionName: athlete?.institution?.name   ?? null,
          institutionLogo: athlete?.institution?.logoUrl ?? null,
          gender,
          levelLabel,
          groupKey:   group.groupKey,
          groupLabel: group.groupLabel,
        };
      })
      .filter(Boolean);
  }, [eventCategory]);

  const isTeamMode = useMemo(() => {
    const regs = eventCategory.registrations ?? [];
    if (regs.length === 0) return false;
    return regs.some((r: any) => r.team != null || r.teamId != null);
  }, [eventCategory.registrations]);


  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Atletismo"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => openModal("generateSeries")} variant="outline" size="lg">
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
          action={{ label: "Crear Primera Serie", onClick: () => openModal("phase") }}
        />
      ) : (
        <PhaseGrid
          phases={phases}
          selectedPhase={selectedPhase}
          getCardVisual={getCardVisual}
          getCardExtra={getCardExtra}
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Settings2 className="h-4 w-4" />}
                onClick={() => setPhaseToEdit(selectedPhase)}
              >
                Configurar serie
              </Button>
              <Button variant="outline" size="sm" onClick={() => openModal("assignSeries")}>
                Asignar Participante
              </Button>
            </div>
          }
        >
          {renderTable(selectedPhase)}
        </PhaseDetailPanel>
      )}

      {/* Modal: Nueva serie */}
      <Modal isOpen={modals.phase} onClose={() => closeModal("phase")} title="Crear Nueva Serie" size="md">
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

      {/* Modal: Generar series */}
      <GenerateAthleticsSeriesModal
        open={modals.generateSeries}
        onClose={() => closeModal("generateSeries")}
        eventCategoryId={eventCategory.eventCategoryId}
        categoryId={eventCategory.categoryId}
        eventName={eventCategory.category?.name || eventCategory.name}
        allRegistrations={eventCategory.registrations ?? []}
        sismasterEventId={eventCategory.externalEventId ?? undefined}
        sismasterSportId={eventCategory.externalSportId ?? undefined}
        isTeamMode={isTeamMode}
      />

      {/* Modal: Asignar participante */}
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

      {/* Modal: Configurar género / nivel / posta */}
      {phaseToEdit && (
        <PhaseSettingsModal
          isOpen
          onClose={() => setPhaseToEdit(null)}
          phase={phaseToEdit}
          onSave={handleSaveSettings}
          isLoading={isSavingSettings}
        />
      )}
    </div>
  );
}