import { useState } from "react";
import { Users, ChevronRight } from "lucide-react";
import { Button }  from "@/components/ui/Button";
import { Modal }   from "@/components/ui/Modal";
import { useCreateGroupStage } from "../api/group-stage.mutations";
import type { Phase }                from "../types";
import type { AvailableRegistration } from "../types"; // usa el mismo tipo que GenerateBracketModal

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  phase:     Phase;
  availableRegistrations: AvailableRegistration[];
}

const GROUP_LABELS = ["A","B","C","D","E","F","G","H"];

export function SetupGroupStageModal({
  isOpen, onClose, phase, availableRegistrations,
}: Props) {
  const [numGroups,          setNumGroups]          = useState(2);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState(2);
  // grupos[i] = array de registrationIds asignados al grupo i
  const [groups, setGroups] = useState<number[][]>(() =>
    Array.from({ length: 2 }, () => []),
  );
  const [unassigned, setUnassigned] = useState<Set<number>>(
    () => new Set(availableRegistrations.map((r) => r.registrationId)),
  );

  const createGroupStage = useCreateGroupStage();

  // ── Reconstruye el array de grupos al cambiar la cantidad ──
  const handleNumGroupsChange = (n: number) => {
    setNumGroups(n);
    setGroups((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? []));
  };

  const getName = (id: number) =>
    availableRegistrations.find((r) => r.registrationId === id)?.displayName ?? `#${id}`;

  // ── Asigna un participante sin asignar a un grupo ──
  const assign = (registrationId: number, groupIndex: number) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === groupIndex ? [...g, registrationId] : g)),
    );
    setUnassigned((prev) => { const s = new Set(prev); s.delete(registrationId); return s; });
  };

  // ── Quita un participante de un grupo y lo devuelve a sin asignar ──
  const unassign = (registrationId: number, groupIndex: number) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === groupIndex ? g.filter((id) => id !== registrationId) : g)),
    );
    setUnassigned((prev) => new Set([...prev, registrationId]));
  };

  const canSave =
    groups.every((g) => g.length >= 2) &&
    !createGroupStage.isPending;


  const handleSave = () => {
    createGroupStage.mutate(
      {
        parentPhaseId:    phase.phaseId,
        groups:           groups.map((ids, i) => ({
          label:           GROUP_LABELS[i] ?? `${i + 1}`,
          registrationIds: ids,
        })),
        qualifiersPerGroup,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fase de Grupos — ${phase.name}`}
      size="lg"
    >
      <div className="space-y-5 p-1">

        {/* ── Config rápida ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Número de grupos
            </label>
            <select
              value={numGroups}
              onChange={(e) => handleNumGroupsChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2,3,4,6,8].map((n) => (
                <option key={n} value={n}>{n} grupos</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Clasifican por grupo
            </label>
            <select
              value={qualifiersPerGroup}
              onChange={(e) => setQualifiersPerGroup(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Pool sin asignar ── */}
        {unassigned.size > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Sin asignar ({unassigned.size})
            </p>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[56px]">
              {[...unassigned].map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-1 bg-white border border-slate-200
                             rounded-lg px-2 py-1 text-sm text-slate-700"
                >
                  <span>{getName(id)}</span>
                  {/* Botones rápidos para asignar a grupo */}
                  <div className="flex gap-1 ml-1">
                    {groups.map((_, gi) => (
                      <button
                        key={gi}
                        type="button"
                        onClick={() => assign(id, gi)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700
                                   rounded px-1.5 py-0.5 font-medium transition-colors"
                        title={`Asignar al Grupo ${GROUP_LABELS[gi]}`}
                      >
                        {GROUP_LABELS[gi]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Grupos ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((memberIds, gi) => (
            <div
              key={gi}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <div className="bg-slate-50 px-3 py-2 flex items-center justify-between border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Grupo {GROUP_LABELS[gi]}
                </span>
                <span className="text-xs text-slate-400">{memberIds.length} participantes</span>
              </div>

              <div className="p-2 min-h-[80px] space-y-1">
                {memberIds.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Usa los botones de arriba para asignar
                  </p>
                )}
                {memberIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between px-2 py-1.5 bg-white
                               border border-slate-100 rounded-lg text-sm text-slate-800"
                  >
                    <span>{getName(id)}</span>
                    <button
                      type="button"
                      onClick={() => unassign(id, gi)}
                      className="text-slate-300 hover:text-red-400 transition-colors ml-2 text-base leading-none"
                      title="Quitar del grupo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {unassigned.size > 0
            ? `${unassigned.size} sin asignar (opcional)`
            : `✓ Todos asignados — ${groups.reduce((a, g) => a + g.length, 0)} participantes`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              size="sm"
              disabled={!canSave}
              isLoading={createGroupStage.isPending}
              icon={<ChevronRight className="h-4 w-4" />}
              onClick={handleSave}
            >
              Crear Grupos
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}