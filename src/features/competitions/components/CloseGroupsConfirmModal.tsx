import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Phase } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  subPhases: Phase[];
}

export function CloseGroupsConfirmModal({
  isOpen, onClose, onConfirm, isPending, subPhases,
}: Props) {
  const totalQualifiers = subPhases.reduce(
    (acc, g) => acc + (g.qualifiersCount ?? 2), 0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cerrar Fase de Grupos"
      size="sm"
    >
      <div className="space-y-4 p-1">

        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Esta acción es irreversible</p>
            <p>Se calcularán las posiciones finales y se marcarán los clasificados.
               No se podrán registrar más resultados en los grupos.</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
          {subPhases.map((g) => (
            <div key={g.phaseId} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">
                Grupo {g.groupLabel ?? g.name}
              </span>
              <span className="text-xs text-slate-500">
                {g.groupStandings?.length ?? 0} participantes ·{" "}
                <span className="text-emerald-600 font-semibold">
                  {g.qualifiersCount ?? 2} clasifican
                </span>
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100">
            <span className="text-sm font-semibold text-slate-700">Total clasificados</span>
            <span className="text-sm font-bold text-emerald-700">{totalQualifiers}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="flex-1"
            isLoading={isPending}
            onClick={onConfirm}
          >
            Confirmar Cierre
          </Button>
        </div>
      </div>
    </Modal>
  );
}