import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserPlus, Check } from 'lucide-react';
import {
  usePhaseRegistrations,
  useAssignPhaseRegistration,
} from '../api/phaseRegistrations.queries';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phaseId: number;
  phaseName: string;
  allRegistrations: any[];
}

export function AssignSeriesParticipantModal({
  isOpen,
  onClose,
  phaseId,
  phaseName,
  allRegistrations,
}: Props) {
  const { data: phaseRegs = [] } = usePhaseRegistrations(phaseId);
  const assignMutation = useAssignPhaseRegistration();

  const assignedIds = new Set(phaseRegs.map((pr) => pr.registrationId));

  const handleAssign = async (registrationId: number) => {
    await assignMutation.mutateAsync({ phaseId, registrationId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar Participantes — ${phaseName}`}
      size="md"
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allRegistrations.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No hay inscritos en esta categoría
          </p>
        )}

        {allRegistrations.map((reg) => {
          const isAssigned = assignedIds.has(reg.registrationId);
          const name =
            reg.athlete?.name || reg.team?.name || 'Sin nombre';
          const institution =
            reg.athlete?.institution || reg.team?.institution;

          return (
            <div
              key={reg.registrationId}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isAssigned
                  ? 'bg-green-50 border-green-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-slate-900">{name}</p>
                {institution && (
                  <p className="text-xs text-slate-500">{institution.name}</p>
                )}
              </div>

              {isAssigned ? (
                <Badge
                  variant="success"
                  className="flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Asignado
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<UserPlus className="h-4 w-4" />}
                  onClick={() => handleAssign(reg.registrationId)}
                  disabled={assignMutation.isPending}
                >
                  Agregar
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t">
        <Button variant="gradient" onClick={onClose}>
          Listo
        </Button>
      </div>
    </Modal>
  );
}
