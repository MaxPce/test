// src/features/competitions/components/SetupGroupStageModal.tsx

import { useState, useEffect } from "react";
import { Users, ChevronRight, Search, X } from "lucide-react";
import { Button }  from "@/components/ui/Button";
import { Modal }   from "@/components/ui/Modal";
import { useCreateGroupStage } from "../api/group-stage.mutations";
import { usePhaseRegistrations } from "../api/phaseRegistrations.queries";
import type { Phase } from "../types";

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  phase:   Phase;
}

const GROUP_LABELS = ["A","B","C","D","E","F","G","H"];

export function SetupGroupStageModal({ isOpen, onClose, phase }: Props) {
  const [numGroups,          setNumGroups]          = useState(2);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState(2);
  const [groups,             setGroups]             = useState<number[][]>(() => Array.from({ length: 2 }, () => []));
  const [unassigned,         setUnassigned]         = useState<Set<number>>(new Set());
  const [search,             setSearch]             = useState(""); // ← NUEVO

  const createGroupStage = useCreateGroupStage();

  const { data: phaseRegs = [], isLoading } = usePhaseRegistrations(
    isOpen ? phase.phaseId : null,
  );

  useEffect(() => {
    if (!isOpen) return;
    const ids = phaseRegs.map((pr) => pr.registrationId);
    setUnassigned(new Set(ids));
    setGroups(Array.from({ length: numGroups }, () => []));
    setSearch(""); // limpiar búsqueda al abrir
  }, [isOpen, phaseRegs]);

  const handleNumGroupsChange = (n: number) => {
    setNumGroups(n);
    setGroups((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? []));
  };

  const getName = (id: number) => {
    const pr = phaseRegs.find((r) => r.registrationId === id);
    return (
      pr?.registration?.athlete?.name ??
      pr?.registration?.team?.name ??
      `#${id}`
    );
  };

  const assign = (registrationId: number, groupIndex: number) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === groupIndex ? [...g, registrationId] : g)),
    );
    setUnassigned((prev) => { const s = new Set(prev); s.delete(registrationId); return s; });
  };

  const unassign = (registrationId: number, groupIndex: number) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === groupIndex ? g.filter((id) => id !== registrationId) : g)),
    );
    setUnassigned((prev) => new Set([...prev, registrationId]));
  };

  // ── Filtra el pool por el texto de búsqueda ──────────────────────────────
  const filteredUnassigned = [...unassigned].filter((id) =>
    getName(id).toLowerCase().includes(search.toLowerCase().trim()),
  );
  // ─────────────────────────────────────────────────────────────────────────

  const canSave = groups.every((g) => g.length >= 2) && !createGroupStage.isPending;

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

        {isLoading && (
          <div className="py-8 text-center text-sm text-slate-400 animate-pulse">
            Cargando participantes de la fase...
          </div>
        )}

        {!isLoading && (
          <>
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

            {/* ── Pool sin asignar + buscador ── */}
            {unassigned.size > 0 && (
              <div>
                {/* Header del pool con contador y buscador */}
                <div className="flex items-center justify-between mb-2 gap-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
                    Sin asignar ({unassigned.size})
                  </p>

                  {/* ── Buscador ── */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar atleta..."
                      className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg
                                 bg-white placeholder:text-slate-400 text-slate-700
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300
                                   hover:text-slate-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista filtrada */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[56px]">
                  {filteredUnassigned.length === 0 ? (
                    <p className="text-xs text-slate-400 w-full text-center py-2">
                      {search
                        ? `Sin resultados para "${search}"`
                        : "Todos asignados"}
                    </p>
                  ) : (
                    filteredUnassigned.map((id) => (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-white border border-slate-200
                                   rounded-lg px-2 py-1 text-sm text-slate-700"
                      >
                        <span>{getName(id)}</span>
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
                    ))
                  )}
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
          </>
        )}

      </div>
    </Modal>
  );
}