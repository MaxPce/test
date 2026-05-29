// src/features/competitions/components/PhaseWithGroupsView.tsx

import { useState } from "react";
import { GitBranch, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GroupStageView } from "./GroupStageView";
import { BracketView } from "./BracketView";
import { SetupGroupStageModal } from "./SetupGroupStageModal";
import { GenerateBracketModal } from "./GenerateBracketModal";
import { useBracketStructure } from "../api/bracket.queries";
import { usePhaseRegistrations } from "../api/phaseRegistrations.queries"; 
import { useQueryClient } from "@tanstack/react-query";
import type { Phase, AvailableRegistration } from "../types";

interface Props {
  phase: Phase;
  availableRegistrations: AvailableRegistration[];
}

export function PhaseWithGroupsView({ phase, availableRegistrations }: Props) {
  const [showSetupGroups, setShowSetupGroups] = useState(false);
  const [showBracket,     setShowBracket]     = useState(false);
  const [seededIds,       setSeededIds]       = useState<number[]>([]);

  const queryClient = useQueryClient();
  const hasSubPhases = (phase.subPhases ?? []).length > 0;

  const { data: phaseRegs = [] } = usePhaseRegistrations(phase.phaseId);

  const phaseAvailableRegistrations: AvailableRegistration[] = phaseRegs.map((pr) => {
    const original = availableRegistrations.find(
      (r) => r.registrationId === pr.registrationId,
    );
    return (
      original ?? {
        registrationId: pr.registrationId,
        displayName:
          pr.registration?.athlete?.name ??
          pr.registration?.team?.name ??
          `Participante #${pr.registrationId}`,
      }
    );
  });
  // ─────────────────────────────────────────────────────────────────────────

  const { data: bracketData, isLoading, isError, error } = useBracketStructure(phase.phaseId);


  const bracketMatches = (bracketData?.matches ?? []).filter(
    (m: any) => m.round !== "grupo"
  );
  const hasBracket = bracketMatches.length > 0;

  const handleGroupsClosed = (qualifiedIds: number[]) => {
    setSeededIds(qualifiedIds);
    queryClient.invalidateQueries({
      queryKey: ["bracket", phase.phaseId, "structure"],
    });
  };

  
  const handleGoToBracket = (qualifiedIds: number[]) => {
    setSeededIds(qualifiedIds);
    if (!hasBracket) {
      setShowBracket(true);
    } else {
      queryClient.invalidateQueries({
        queryKey: ["bracket", phase.phaseId, "structure"],
      });
    }
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

      {/* ── Fase de grupos ── */}
      {hasSubPhases && (
        <GroupStageView
          parentPhase={phase}
          onQualifiedReady={handleGroupsClosed}
        />
      )}

      {/* ── Bracket de eliminación ── */}
      {hasBracket && (
        <div className="mt-4">
          <BracketView
            matches={bracketMatches}
            phase={phase}
          />
        </div>
      )}

      {/* ── Modals ── */}
      <SetupGroupStageModal
        isOpen={showSetupGroups}
        onClose={() => setShowSetupGroups(false)}
        phase={phase}
      />

      {/* Solo abrir GenerateBracketModal si el bracket NO existe aún */}
      {showBracket && !hasBracket && (
        <GenerateBracketModal
          isOpen={showBracket}
          onClose={() => setShowBracket(false)}
          phase={phase}
          preSelectedRegistrationIds={seededIds}
          availableRegistrations={phaseAvailableRegistrations} 
        />
      )}

    </div>
  );
}