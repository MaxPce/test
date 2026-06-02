// src/features/competitions/components/SetupGroupStageModal.tsx

import { useState, useEffect } from "react";
import { Users, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal }  from "@/components/ui/Modal";
import { useCreateGroupStage } from "../api/group-stage.mutations";
import { usePhaseRegistrations } from "../api/phaseRegistrations.queries";
import type { Phase } from "../types";


interface Props {
  isOpen:  boolean;
  onClose: () => void;
  phase:   Phase;
}


function getLabel(index: number, mode: "letter" | "number"): string {
  if (mode === "number") return String(index + 1);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let label = "";
  let n = index;
  do {
    label = alphabet[n % 26] + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}


// ── helpers para tipo de registro y miembros ───────────────────────
type RegKind = "individual" | "doubles" | "mixed_doubles" | "team";

function getRegKind(pr: { registration: any }): RegKind {
  const reg = pr?.registration;
  if (!reg?.team) return "individual";
  const members: any[] = reg.team?.members ?? [];
  if (members.length === 2) {
    const genders = members.map((m) => m?.athlete?.gender ?? m?.gender ?? "");
    const hasBoth = genders.includes("M") && genders.includes("F");
    return hasBoth ? "mixed_doubles" : "doubles";
  }
  return "team";
}

function getMemberNames(pr: { registration: any }): string[] {
  const members: any[] = pr?.registration?.team?.members ?? [];
  return members.map((m) => m?.athlete?.name ?? m?.athleteName ?? "?");
}

const KIND_CONFIG: Record<RegKind, { label: string; cls: string }> = {
  individual:    { label: "Ind",    cls: "bg-violet-100 text-violet-700" },
  doubles:       { label: "Dbl",    cls: "bg-emerald-100 text-emerald-700" },
  mixed_doubles: { label: "Mix",    cls: "bg-pink-100 text-pink-700" },
  team:          { label: "Equipo", cls: "bg-amber-100 text-amber-700" },
};
// ── FIN NUEVO ─────────────────────────────────────────────────────────────


export function SetupGroupStageModal({ isOpen, onClose, phase }: Props) {
  const [numGroups,          setNumGroups]          = useState(2);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState(2);
  const [labelMode,          setLabelMode]          = useState<"letter" | "number">("letter");
  const [groups,             setGroups]             = useState<number[][]>(() => Array.from({ length: 2 }, () => []));
  const [unassigned,         setUnassigned]         = useState<Set<number>>(new Set());
  const [search,             setSearch]             = useState("");


  const createGroupStage = useCreateGroupStage();


  const { data: phaseRegs = [], isLoading } = usePhaseRegistrations(
    isOpen ? phase.phaseId : null,
  );


  useEffect(() => {
    if (!isOpen) return;
    const ids = phaseRegs.map((pr) => pr.registrationId);
    setUnassigned(new Set(ids));
    setGroups(Array.from({ length: numGroups }, () => []));
    setSearch("");
  }, [isOpen, phaseRegs]);


  const handleNumGroupsChange = (raw: string) => {
    const n = Math.min(50, Math.max(2, parseInt(raw, 10) || 2));
    setNumGroups(n);
    setGroups((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? []));
  };


  // ── helper para buscar el phaseReg por id ──────────────────────
  const getPhaseReg = (id: number) =>
    phaseRegs.find((r) => r.registrationId === id);
  // ── FIN NUEVO ──────────────────────────────────────────────────────────

  const getName = (id: number) => {
    // sin cambios
    const pr = getPhaseReg(id); // usa getPhaseReg en vez de phaseRegs.find inline
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


  const filteredUnassigned = [...unassigned].filter((id) =>
    getName(id).toLowerCase().includes(search.toLowerCase().trim()),
  );


  const canSave = groups.every((g) => g.length >= 2) && !createGroupStage.isPending;


  const handleSave = () => {
    createGroupStage.mutate(
      {
        parentPhaseId: phase.phaseId,
        groups: groups.map((ids, i) => ({
          label:           getLabel(i, labelMode),
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
            {/* ── Config ── */}
            <div className="grid grid-cols-3 gap-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número de grupos
                </label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={numGroups}
                  onChange={(e) => handleNumGroupsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Etiquetas
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setLabelMode("letter")}
                    className={`flex-1 py-2 font-medium transition-colors ${
                      labelMode === "letter"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    A, B, C…
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelMode("number")}
                    className={`flex-1 py-2 font-medium transition-colors border-l border-slate-300 ${
                      labelMode === "number"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    1, 2, 3…
                  </button>
                </div>
              </div>
            </div>


            {numGroups > 0 && (
              <p className="text-xs text-slate-400 -mt-2">
                Vista previa:{" "}
                {Array.from({ length: Math.min(numGroups, 6) }, (_, i) =>
                  getLabel(i, labelMode),
                ).join(", ")}
                {numGroups > 6 && `, … ${getLabel(numGroups - 1, labelMode)}`}
              </p>
            )}


            {/* ── Pool sin asignar + buscador ── */}
            {unassigned.size > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 gap-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
                    Sin asignar ({unassigned.size})
                  </p>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar atleta/equipo..."
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

                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[56px] max-h-52 overflow-y-auto">
                  {filteredUnassigned.length === 0 ? (
                    <p className="text-xs text-slate-400 w-full text-center py-2">
                      {search ? `Sin resultados para "${search}"` : "Todos asignados"}
                    </p>
                  ) : (
                    filteredUnassigned.map((id) => {
                      // ── NUEVO: obtener kind y miembros ────────────────
                      const pr          = getPhaseReg(id);
                      const kind        = pr ? getRegKind(pr) : "individual";
                      const members     = pr ? getMemberNames(pr) : [];
                      const cfg         = KIND_CONFIG[kind];
                      const isComposite = kind !== "individual";
                      // ── FIN NUEVO ─────────────────────────────────────

                      return (
                        // ── NUEVO: chip expandido con badge + miembros ──
                        <div
                          key={id}
                          className="flex flex-col gap-1 bg-white border border-slate-200
                                     rounded-lg px-2 py-1.5 text-sm text-slate-700 min-w-0"
                        >
                          {/* Fila principal */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                            <span className="font-medium">{getName(id)}</span>
                            <div className="flex gap-1 ml-auto flex-wrap">
                              {groups.map((_, gi) => (
                                <button
                                  key={gi}
                                  type="button"
                                  onClick={() => assign(id, gi)}
                                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700
                                             rounded px-1.5 py-0.5 font-medium transition-colors"
                                  title={`Asignar al Grupo ${getLabel(gi, labelMode)}`}
                                >
                                  {getLabel(gi, labelMode)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Miembros (solo dobles/equipo) */}
                          {isComposite && members.length > 0 && (
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 pl-1 border-t border-slate-100 pt-1">
                              {members.map((m, i) => (
                                <span key={i} className="text-[11px] text-slate-400 flex items-center gap-0.5">
                                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        // ── FIN NUEVO ───────────────────────────────────
                      );
                    })
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
                      Grupo {getLabel(gi, labelMode)}
                    </span>
                    <span className="text-xs text-slate-400">{memberIds.length} participantes</span>
                  </div>

                  <div className="p-2 min-h-[80px] space-y-1">
                    {memberIds.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Usa los botones de arriba para asignar
                      </p>
                    )}
                    {memberIds.map((id) => {
                      // ── NUEVO: obtener kind y miembros ────────────────
                      const pr          = getPhaseReg(id);
                      const kind        = pr ? getRegKind(pr) : "individual";
                      const members     = pr ? getMemberNames(pr) : [];
                      const cfg         = KIND_CONFIG[kind];
                      const isComposite = kind !== "individual";
                      // ── FIN NUEVO ─────────────────────────────────────

                      return (
                        // ── NUEVO: fila expandida con badge + miembros ──
                        <div
                          key={id}
                          className="px-2 py-1.5 bg-white border border-slate-100
                                     rounded-lg text-sm text-slate-800"
                        >
                          {/* Fila principal */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${cfg.cls}`}>
                                {cfg.label}
                              </span>
                              <span className="truncate font-medium">{getName(id)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => unassign(id, gi)}
                              className="text-slate-300 hover:text-red-400 transition-colors shrink-0 text-base leading-none"
                              title="Quitar del grupo"
                            >
                              ×
                            </button>
                          </div>

                          {/* Miembros (solo dobles/equipo) */}
                          {isComposite && members.length > 0 && (
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 pl-1 border-t border-slate-100 pt-1">
                              {members.map((m, i) => (
                                <span key={i} className="text-[11px] text-slate-400 flex items-center gap-0.5">
                                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        // ── FIN NUEVO ───────────────────────────────────
                      );
                    })}
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