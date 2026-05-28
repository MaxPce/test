// src/features/competitions/components/PhaseWithGroupsView.tsx

import { useState } from "react";
import { GitBranch, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GroupStageView } from "./GroupStageView";
import { BracketView } from "./BracketView";
import { SetupGroupStageModal } from "./SetupGroupStageModal";
import { GenerateBracketModal } from "./GenerateBracketModal";
import { useBracketStructure } from "../api/bracket.queries";
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

  const { data: bracketData, isLoading, isError, error } = useBracketStructure(phase.phaseId);

  console.log("=== BRACKET DIAGNOSTIC ===");
  console.log("phaseId:", phase.phaseId);
  console.log("isLoading:", isLoading);
  console.log("isError:", isError);
  console.log("error:", error);
  console.log("bracketData (raw):", bracketData);
  console.log("bracketData keys:", bracketData ? Object.keys(bracketData) : "null/undefined");
  console.log("bracketData.mainBracket:", bracketData?.mainBracket);
  console.log("bracketData.matches:", bracketData?.matches);
  console.log("bracketData.bracketByRound:", bracketData?.bracketByRound);
  console.log("==========================");
  const bracketMatches = (bracketData?.matches ?? []).filter(
    (m: any) => m.round !== "grupo"
  );
  const hasBracket = bracketMatches.length > 0;

  // Callback que llega desde GroupStageView al cerrar grupos
  const handleGroupsClosed = (qualifiedIds: number[]) => {
    setSeededIds(qualifiedIds);
    // Invalidar el query del bracket para que se refresquen los matches recién creados
    queryClient.invalidateQueries({
      queryKey: ["bracket", phase.phaseId, "structure"],
    });
    // NO abrimos GenerateBracketModal — el backend ya generó los matches
  };

  // Botón "Ir al Bracket" cuando los grupos ya están cerrados pero el bracket
  // por alguna razón no se cargó aún (caso raro, pero por si acaso)
  const handleGoToBracket = (qualifiedIds: number[]) => {
    setSeededIds(qualifiedIds);
    if (!hasBracket) {
      // Solo abrir el modal si realmente no hay bracket
      setShowBracket(true);
    } else {
      // Si ya hay bracket, solo refrescar el query
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
        availableRegistrations={availableRegistrations}
      />

      {/* Solo abrir GenerateBracketModal si el bracket NO existe aún */}
      {showBracket && !hasBracket && (
        <GenerateBracketModal
          isOpen={showBracket}
          onClose={() => setShowBracket(false)}
          phase={phase}
          preSelectedRegistrationIds={seededIds}
          availableRegistrations={availableRegistrations}
        />
      )}

    </div>
  );
}