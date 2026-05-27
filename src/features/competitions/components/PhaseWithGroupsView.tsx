import { useState } from "react";
import { GitBranch, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GroupStageView } from "./GroupStageView";
import { SetupGroupStageModal } from "./SetupGroupStageModal";
import { GenerateBracketModal } from "./GenerateBracketModal";
import type { Phase, AvailableRegistration } from "../types";

interface Props {
  phase: Phase;
  availableRegistrations: AvailableRegistration[];
}

export function PhaseWithGroupsView({ phase, availableRegistrations }: Props) {
  const [showSetupGroups, setShowSetupGroups]   = useState(false);
  const [showBracket,     setShowBracket]       = useState(false);
  const [seededIds,       setSeededIds]         = useState<number[]>([]);

  const hasSubPhases = (phase.subPhases ?? []).length > 0;

  const handleQualifiedReady = (qualifiedIds: number[]) => {
    setSeededIds(qualifiedIds);
    setShowBracket(true);
  };

  return (
    <div className="space-y-6">

      {/* ── Cabecera de la fase eliminatoria ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">{phase.name}</h2>
        </div>

        {!hasSubPhases && (
          <Button
            size="sm"
            variant="outline"
            icon={<Users className="h-4 w-4" />}
            onClick={() => setShowSetupGroups(true)}
          >
            Agregar Fase de Grupos
          </Button>
        )}
      </div>

      {/* ── Fase de grupos (si existe) ── */}
      {hasSubPhases && (
        <GroupStageView
          parentPhase={phase}
          onQualifiedReady={handleQualifiedReady}
        />
      )}

      {/* ── Bracket de eliminación (si ya hay clasificados del grupo
              o si la fase no tiene grupos) ── */}
      {phase.matches && phase.matches.length > 0 && (
        <div className="mt-4">
          {/* Aquí va tu BracketView o componente equivalente */}
          {/* <BracketView phase={phase} /> */}
        </div>
      )}

      {/* ── Modals ── */}
      <SetupGroupStageModal
        isOpen={showSetupGroups}
        onClose={() => setShowSetupGroups(false)}
        phase={phase}
        availableRegistrations={availableRegistrations}
      />

      {showBracket && (
        <GenerateBracketModal
          isOpen={showBracket}
          onClose={() => setShowBracket(false)}
          phase={phase}
          // Le pasas los clasificados ya ordenados como seeding
          preSelectedRegistrationIds={seededIds}
          availableRegistrations={availableRegistrations}
        />
      )}

    </div>
  );
}