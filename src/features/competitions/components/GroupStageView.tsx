import { useState } from "react";
import { Users, CheckCircle2, ChevronRight, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GroupStandingsTable } from "./GroupStandingsTable";
import { CloseGroupsConfirmModal } from "./CloseGroupsConfirmModal";
import { useCloseGroups } from "../api/group-stage.mutations";
import { GroupMatchesPanel } from "./GroupMatchesPanel";
import type { Phase } from "../types";
import type { Registration } from "@/features/events/types";

interface Props {
  parentPhase: Phase;
  onQualifiedReady?: (qualifiedIds: number[]) => void;
  allRegistrations?: Registration[];                   
  onGenerateGroupMatches?: (group: Phase) => void;    
  isGeneratingMatches?: boolean;                       
}


export function GroupStageView({
  parentPhase,
  onQualifiedReady,
  allRegistrations = [],
  onGenerateGroupMatches,
  isGeneratingMatches = false,
}: Props) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const closeGroups = useCloseGroups();

  const subPhases = parentPhase.subPhases ?? [];
  const hasGroups = subPhases.length > 0;

  // ¿Todos los grupos están cerrados?
  const allGroupsClosed = hasGroups &&
    subPhases.every((g) =>
      (g.groupStandings ?? []).some((s) => s.qualified),
    );

  // Recolecta clasificados en orden: 1ro Grupo A, 1ro Grupo B..., 2do Grupo A, etc.
  const getQualifiedInSeedOrder = (): number[] => {
    const qualifiersPerGroup = subPhases[0]?.qualifiersCount ?? 2;
    const result: number[] = [];

    for (let rank = 1; rank <= qualifiersPerGroup; rank++) {
      for (const group of subPhases) {
        const standings = [...(group.groupStandings ?? [])]
          .filter((s) => s.qualified)
          .sort((a, b) => (a.finalRank ?? 99) - (b.finalRank ?? 99));
        const qualifier = standings[rank - 1];
        if (qualifier) result.push(qualifier.registrationId);
      }
    }
    return result;
  };

  const handleClose = () => {
    closeGroups.mutate(parentPhase.phaseId, {
      onSuccess: (qualifiedIds) => {
        setShowCloseConfirm(false);
        onQualifiedReady?.(qualifiedIds);
      },
    });
  };

  if (!hasGroups) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Aún no hay grupos configurados para esta fase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header de la sección */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-800">
            Fase de Grupos
          </h3>
          <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
            {subPhases.length} grupos · {subPhases[0]?.qualifiersCount ?? 2} clasifican c/u
          </span>
        </div>

        {/* Acción de cierre */}
        {!allGroupsClosed ? (
          <Button
            size="sm"
            variant="gradient"
            icon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => setShowCloseConfirm(true)}
            disabled={closeGroups.isPending}
          >
            Cerrar Grupos
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Grupos cerrados
            </span>
            <Button
              size="sm"
              variant="gradient"
              icon={<ChevronRight className="h-4 w-4" />}
              onClick={() => onQualifiedReady?.(getQualifiedInSeedOrder())}
            >
              Ir al Bracket
            </Button>
          </div>
        )}
      </div>

      {/* Grilla de grupos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {subPhases.map((group) => (
            <div key={group.phaseId} className="flex flex-col">
            <GroupStandingsTable group={group} />
            <GroupMatchesPanel
                group={group}
                allRegistrations={allRegistrations}
                onGenerateMatches={onGenerateGroupMatches}
                isGenerating={isGeneratingMatches}
            />
            </div>
        ))}
        </div>

      {/* Banner de clasificados (cuando ya están cerrados) */}
      {allGroupsClosed && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 mb-1">
                Clasificados para la fase de eliminación
              </p>
              <div className="flex flex-wrap gap-2">
                {getQualifiedInSeedOrder().map((regId, idx) => {
                  // Buscar el nombre desde los standings
                  const standing = subPhases
                    .flatMap((g) => g.groupStandings ?? [])
                    .find((s) => s.registrationId === regId);
                  const name =
                    standing?.registration?.athlete?.name ??
                    standing?.registration?.team?.name ??
                    `#${regId}`;
                  return (
                    <span
                      key={regId}
                      className="flex items-center gap-1 bg-white border border-emerald-200
                                 rounded-lg px-2 py-1 text-xs text-slate-700"
                    >
                      <span className="text-emerald-600 font-bold">#{idx + 1}</span>
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación cierre */}
      <CloseGroupsConfirmModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleClose}
        isPending={closeGroups.isPending}
        subPhases={subPhases}
      />
    </div>
  );
}