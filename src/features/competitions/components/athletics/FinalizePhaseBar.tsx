import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, LockOpen } from "lucide-react";
import {
  useClassificationStatus,
  CLASSIFICATION_STATUS_KEY,
} from "../../api/athletics.queries";
import { useClassifyPhase, useReopenPhase } from "../../api/athletics.mutations";

interface Props {
  phaseId: number;
}

export default function FinalizePhaseBar({ phaseId }: Props) {
  const queryClient = useQueryClient();
  const { data: classificationStatus } = useClassificationStatus(phaseId);
  const phaseFinalized = classificationStatus?.isFinalized ?? false;

  const classifyMutation = useClassifyPhase(phaseId);
  const reopenMutation = useReopenPhase(phaseId);

  const handleFinalizePhase = async () => {
    if (phaseFinalized) return;
    if (
      !confirm(
        "¿Finalizar la fase? Los resultados quedarán bloqueados. Podrás reabrirla si necesitas hacer cambios.",
      )
    )
      return;
    try {
      await classifyMutation.mutateAsync();
      queryClient.invalidateQueries({
        queryKey: CLASSIFICATION_STATUS_KEY(phaseId),
      });
    } catch {
      // El toast de error lo maneja useClassifyPhase.onError
    }
  };

  const handleReopenPhase = async () => {
    if (
      !confirm(
        "¿Reabrir la fase? Se borrarán las clasificaciones actuales y podrás volver a editar.",
      )
    )
      return;
    await reopenMutation.mutateAsync();
    toast.success("Fase reabierta — ya puedes editar los resultados");
  };

  if (!phaseFinalized) {
    return (
      <button
        type="button"
        onClick={handleFinalizePhase}
        disabled={classifyMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {classifyMutation.isPending ? "Procesando..." : "Finalizar Fase"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
        <Lock className="h-4 w-4" />
        Fase Finalizada
      </span>
      <button
        type="button"
        onClick={handleReopenPhase}
        disabled={reopenMutation.isPending}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        <LockOpen className="h-4 w-4" />
        {reopenMutation.isPending ? "Reabriendo..." : "Reabrir Fase"}
      </button>
    </div>
  );
}