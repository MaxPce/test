// src/features/competitions/components/athletics/GenerateAthleticsSeriesModal.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/api/client";
import { AlertCircle, ArrowRightLeft, GripVertical, X } from "lucide-react";
import { useGenerateAthleticsSeries } from "../../api/athletics-phases.mutations";
import {
  getAthleticsSeriesType,
  FIELD_EVENT_CONFIG,
  FIELD_EVENT_CATEGORY_ID,
  type FieldEventType,
} from "../../types/athletics.types";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}

interface TeamMemberInfo {
  name: string;
  rol: string | null;
}

interface SeriesAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
  members?: TeamMemberInfo[];
  nivel?: string | null;   
  genero?: string | null;  
}


interface SeriesGroup {
  key: string;
  seriesName: string;
  idniv: string;
  idcat: string;
  athletes: SeriesAthlete[];
}

const SERIES_TYPE_TO_PHASE_TYPE = {
  metros:    "combined_pista",
  distancia: "combined_distancia",
  altura:    "combined_altura",
} as const;

// ─── Series fijas para modo equipos ──────────────────────────────────────────

const TEAM_FIXED_SERIES: Pick<SeriesGroup, "key" | "seriesName" | "idniv" | "idcat">[] = [
  { key: "avanzado-damas",     seriesName: "Avanzado Damas",     idniv: "AVANZADO", idcat: "F" },
  { key: "noveles-damas",      seriesName: "Noveles Damas",      idniv: "NOVELES",  idcat: "F" },
  { key: "avanzado-masculino", seriesName: "Avanzado Masculino", idniv: "AVANZADO", idcat: "M" },
  { key: "noveles-masculino",  seriesName: "Noveles Masculino",  idniv: "NOVELES",  idcat: "M" },
];

const UNASSIGNED_KEY = "__unassigned__";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GenerateAthleticsSeriesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryId?: number;
  eventName?: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  allRegistrations: any[];
  /** Nuevo: pasar true cuando la categoría es de equipos */
  isTeamMode?: boolean;
}

// ─── Helpers de labels ────────────────────────────────────────────────────────

function getNivLabel(idniv: string): string {
  const n = idniv.toLowerCase().trim();
  if (n.includes("novel")) return "Noveles";
  if (n.includes("avanzad")) return "Avanzado";
  return idniv.charAt(0).toUpperCase() + idniv.slice(1).toLowerCase();
}

function getCatLabel(idcat: string): string {
  const c = idcat.toLowerCase().trim();
  if (c === "m" || c.includes("varon") || c.includes("masculin")) return "Varones";
  if (c === "f" || c.includes("dam") || c.includes("femen")) return "Damas";
  return idcat.charAt(0).toUpperCase() + idcat.slice(1).toLowerCase();
}

function buildSeriesName(idniv: string, idcat: string, eventName: string): string {
  return `${getCatLabel(idcat)} ${getNivLabel(idniv)} ${eventName}`;
}

function getFieldEventMeta(categoryId?: number) {
  if (!categoryId) return null;
  const entry = Object.entries(FIELD_EVENT_CATEGORY_ID).find(
    ([, id]) => id === categoryId,
  );
  if (!entry) return null;
  return FIELD_EVENT_CONFIG[entry[0] as FieldEventType];
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function GenerateAthleticsSeriesModal({
  open,
  onClose,
  eventCategoryId,
  categoryId,
  eventName = "Atletismo",
  sismasterEventId,
  sismasterSportId,
  allRegistrations,
  isTeamMode = false,
}: GenerateAthleticsSeriesModalProps) {
  const mutation = useGenerateAthleticsSeries();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  const seriesType = categoryId ? getAthleticsSeriesType(categoryId) : "metros";
  const isFieldEvent = seriesType === "altura" || seriesType === "distancia";
  const fieldEventMeta = getFieldEventMeta(categoryId);

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE A — Lógica Sismaster (solo activa cuando isTeamMode === false)
  // ═══════════════════════════════════════════════════════════════════════════

  const {
    data: combosData,
    isLoading: loadingCombos,
    error: combosError,
  } = useQuery<{ combos: NivCatCombo[] }>({
    queryKey: [
      "sismaster-niv-cat-options",
      sismasterEventId,
      sismasterSportId,
      eventCategoryId,
    ],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/sismaster/athletes/niv-cat-options",
        { params: { sismasterEventId, sismasterSportId, eventCategoryId } },
      );
      return data;
    },
    // Deshabilitado completamente en modo equipos
    enabled: !isTeamMode && hasSismaster && open,
    staleTime: 1000 * 60 * 5,
  });

  const combos = combosData?.combos ?? [];

  const comboQueries = useQueries({
    queries: combos.map((combo) => ({
      queryKey: [
        "sismaster-registrations-niv-cat",
        sismasterEventId,
        sismasterSportId,
        eventCategoryId,
        combo.idniv,
        combo.idcat,
      ],
      queryFn: async (): Promise<{ registrationIds: number[] }> => {
        const { data } = await apiClient.get(
          "/sismaster/athletes/registrations-by-niv-cat",
          {
            params: {
              sismasterEventId,
              sismasterSportId,
              idniv: combo.idniv,
              idcat: combo.idcat,
              eventCategoryId,
            },
          },
        );
        return data;
      },
      // Deshabilitado completamente en modo equipos
      enabled: !isTeamMode && hasSismaster && open && combos.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const loadingCombosData = comboQueries.some((q) => q.isLoading);
  const allQueriesDone =
    !isTeamMode && combos.length > 0 && comboQueries.every((q) => q.isSuccess);

  const regMap = useMemo(() => {
    const map = new Map<number, SeriesAthlete>();
    for (const reg of allRegistrations) {
      map.set(reg.registrationId, {
        registrationId: reg.registrationId,
        name:
          reg.athlete?.name ??
          reg.team?.name ??
          `Registro ${reg.registrationId}`,
        institution:
          reg.athlete?.institution?.name ??
          reg.team?.institution?.name ??
          null,
      });
    }
    return map;
  }, [allRegistrations]);

  const initialGroups = useMemo((): SeriesGroup[] => {
    if (isTeamMode || !allQueriesDone) return [];

    const seenIds = new Set<number>();
    return combos
      .map((combo, idx) => {
        const ids = comboQueries[idx].data?.registrationIds ?? [];
        const athletes = ids
          .map((id) => regMap.get(id))
          .filter((a): a is SeriesAthlete => {
            if (!a) return false;
            if (seenIds.has(a.registrationId)) return false;
            seenIds.add(a.registrationId);
            return true;
          });
        return {
          key: `${combo.idniv}-${combo.idcat}`,
          seriesName: buildSeriesName(combo.idniv, combo.idcat, eventName),
          idniv: combo.idniv,
          idcat: combo.idcat,
          athletes,
        };
      })
      .filter((g) => g.athletes.length > 0);
  }, [isTeamMode, allQueriesDone, combos, comboQueries, regMap, eventName]);

  const fieldGroup = useMemo((): SeriesGroup[] => {
    if (isTeamMode || !isFieldEvent || hasSismaster || !open) return [];
    const athletes: SeriesAthlete[] = allRegistrations.map((reg) => ({
      registrationId: reg.registrationId,
      name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
      institution: reg.athlete?.institution?.name ?? reg.team?.institution?.name ?? null,
    }));
    if (athletes.length === 0) return [];
    return [{ key: "field-group", seriesName: eventName, idniv: "", idcat: "", athletes }];
  }, [isTeamMode, isFieldEvent, hasSismaster, open, allRegistrations, eventName]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOQUE B — Estado compartido (individuales + equipos)
  // ═══════════════════════════════════════════════════════════════════════════

  const [groups, setGroups] = useState<SeriesGroup[]>([]);

  // Individuales: click-to-move entre grupos
  const [selectedRegId, setSelectedRegId]     = useState<number | null>(null);
  const [sourceGroupKey, setSourceGroupKey]   = useState<string | null>(null);

  // Equipos: drag & drop + click-to-move con pool "sin asignar"
  const [draggingId, setDraggingId]           = useState<number | null>(null);
  const [draggingFrom, setDraggingFrom]       = useState<string | null>(null);
  const [dragOverKey, setDragOverKey]         = useState<string | null>(null);
  const [teamSelectedId, setTeamSelectedId]   = useState<number | null>(null);
  const [teamSelectedFrom, setTeamSelectedFrom] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const prevOpenRef    = useRef(false);
  const initialGroupsRef = useRef<SeriesGroup[]>([]);
  initialGroupsRef.current = initialGroups;

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedRegId(null);   setSourceGroupKey(null);
      setDraggingId(null);      setDraggingFrom(null);    setDragOverKey(null);
      setTeamSelectedId(null);  setTeamSelectedFrom(null);
    }

    prevOpenRef.current = open;
    if (!open || hasInitialized.current) return;

    // ── Modo equipos: series fijas + pool sin asignar ──────────────────────
    if (isTeamMode) {
      const teams: SeriesAthlete[] = allRegistrations.map((reg) => {
        const rawMembers: Array<{ rol: string; athlete?: { name: string } }> =
          reg.team?.members ?? [];

        const members: TeamMemberInfo[] = rawMembers
          .map((m) => ({
            name: m.athlete?.name ?? "",
            rol: m.rol ?? null,
          }))
          .filter((m) => m.name.length > 0)
          // orden: capitan > titular > suplente
          .sort((a, b) => {
            const order: Record<string, number> = { capitan: 0, titular: 1, suplente: 2 };
            return (order[a.rol ?? ""] ?? 3) - (order[b.rol ?? ""] ?? 3);
          });

        return {
          registrationId: reg.registrationId,
          name: reg.team?.name ?? reg.athlete?.name ?? `Equipo ${reg.registrationId}`,
          institution: reg.team?.institution?.name ?? reg.athlete?.institution?.name ?? null,
          members,
          nivel:  reg.team?.category?.name ?? null,   
          genero: reg.team?.category?.gender ?? null,
        };
      });
      hasInitialized.current = true;
      setGroups([
        { key: UNASSIGNED_KEY, seriesName: "Sin asignar", idniv: "", idcat: "", athletes: teams },
        ...TEAM_FIXED_SERIES.map((s) => ({ ...s, athletes: [] })),
      ]);
      return;
    }

    // ── Modo individuales: flujo Sismaster existente ───────────────────────
    if (hasSismaster && allQueriesDone) {
      const g = initialGroupsRef.current;
      if (g.length > 0) {
        hasInitialized.current = true;
        setGroups(g);
      }
      return;
    }

    if (!hasSismaster && isFieldEvent && fieldGroup.length > 0) {
      hasInitialized.current = true;
      setGroups(fieldGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allQueriesDone, isFieldEvent, hasSismaster, fieldGroup, isTeamMode, allRegistrations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Handlers modo individuales (sin cambios respecto al original)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelectAthlete = (groupKey: string, registrationId: number) => {
    if (selectedRegId === registrationId && sourceGroupKey === groupKey) {
      setSelectedRegId(null); setSourceGroupKey(null); return;
    }
    setSelectedRegId(registrationId); setSourceGroupKey(groupKey);
  };

  const handleMoveToGroup = (targetKey: string) => {
    if (!selectedRegId || !sourceGroupKey || targetKey === sourceGroupKey) return;
    setGroups((prev) => {
      const cloned = prev.map((g) => ({ ...g, athletes: [...g.athletes] }));
      const from = cloned.find((g) => g.key === sourceGroupKey);
      const to   = cloned.find((g) => g.key === targetKey);
      if (!from || !to) return prev;
      const idx = from.athletes.findIndex((a) => a.registrationId === selectedRegId);
      if (idx === -1) return prev;
      const [athlete] = from.athletes.splice(idx, 1);
      to.athletes.push(athlete);
      return cloned;
    });
    setSelectedRegId(null); setSourceGroupKey(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Handlers modo equipos — drag & drop + click-to-move
  // ═══════════════════════════════════════════════════════════════════════════

  const moveTeam = (teamId: number, fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    setGroups((prev) => {
      const cloned = prev.map((g) => ({ ...g, athletes: [...g.athletes] }));
      const from = cloned.find((g) => g.key === fromKey);
      const to   = cloned.find((g) => g.key === toKey);
      if (!from || !to) return prev;
      const idx = from.athletes.findIndex((a) => a.registrationId === teamId);
      if (idx === -1) return prev;
      const [team] = from.athletes.splice(idx, 1);
      to.athletes.push(team);
      return cloned;
    });
  };

  const onDragStart = (teamId: number, fromKey: string) => {
    setDraggingId(teamId); setDraggingFrom(fromKey);
    setTeamSelectedId(null); setTeamSelectedFrom(null);
  };
  const onDragOver = (e: React.DragEvent, toKey: string) => {
    e.preventDefault(); setDragOverKey(toKey);
  };
  const onDrop = (e: React.DragEvent, toKey: string) => {
    e.preventDefault();
    if (draggingId !== null && draggingFrom !== null)
      moveTeam(draggingId, draggingFrom, toKey);
    setDraggingId(null); setDraggingFrom(null); setDragOverKey(null);
  };
  const onDragEnd = () => {
    setDraggingId(null); setDraggingFrom(null); setDragOverKey(null);
  };

  const handleClickTeam = (teamId: number, fromKey: string) => {
    if (teamSelectedId === teamId && teamSelectedFrom === fromKey) {
      setTeamSelectedId(null); setTeamSelectedFrom(null); return;
    }
    setTeamSelectedId(teamId); setTeamSelectedFrom(fromKey);
  };
  const handleClickGroupTeam = (toKey: string) => {
    if (teamSelectedId !== null && teamSelectedFrom !== null && teamSelectedFrom !== toKey) {
      moveTeam(teamSelectedId, teamSelectedFrom, toKey);
      setTeamSelectedId(null); setTeamSelectedFrom(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Confirmar generación (compartido)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleGenerate = async () => {
    // En modo equipos excluir el pool sin asignar
    const validGroups = groups.filter(
      (g) => g.athletes.length > 0 && g.key !== UNASSIGNED_KEY,
    );
    if (validGroups.length === 0) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        data: {
          phaseType: SERIES_TYPE_TO_PHASE_TYPE[seriesType],
          groups: validGroups.map((g) => ({
            name: g.seriesName,
            registrationIds: g.athletes.map((a) => a.registrationId),
          })),
        },
      });
      onClose();
    } catch (err: any) {
      console.error("400 detail:", err?.response?.data);
    }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const isLoading = !isTeamMode && (loadingCombos || loadingCombosData);

  // Individuales: todos los grupos con atletas
  const validGroupsIndividual = groups.filter((g) => g.athletes.length > 0);
  const totalAthletes = validGroupsIndividual.reduce((acc, g) => acc + g.athletes.length, 0);
  const canMoveAthletes = !isTeamMode && hasSismaster && groups.length > 1;

  // Equipos
  const unassignedGroup  = groups.find((g) => g.key === UNASSIGNED_KEY);
  const teamSeriesGroups = groups.filter((g) => g.key !== UNASSIGNED_KEY);
  const validGroupsTeam  = teamSeriesGroups.filter((g) => g.athletes.length > 0);
  const assignedCount    = teamSeriesGroups.reduce((acc, g) => acc + g.athletes.length, 0);

  // Footer usa uno u otro según modo
  const validGroupsForFooter = isTeamMode ? validGroupsTeam : validGroupsIndividual;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Generar Series — ${eventName}`}
      size="xl"
    >
      <div className="space-y-4">

        {/* ── Modo individuales: render original sin cambios ── */}
        {!isTeamMode && (
          <>
            {/* Cargando */}
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                <Spinner size="md" />
                <span className="text-sm">Cargando grupos desde Sismaster...</span>
              </div>
            )}

            {/* Sin Sismaster + carrera */}
            {!hasSismaster && !isFieldEvent && !isLoading && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Esta categoría no tiene Sismaster configurado. Usa el flujo manual
                  de creación de series.
                </span>
              </div>
            )}

            {/* Error Sismaster */}
            {combosError && !isLoading && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No se pudieron cargar los grupos. Verifica la conexión con Sismaster.
                </span>
              </div>
            )}

            {/* Sin combos Sismaster */}
            {hasSismaster && !isLoading && !combosError && allQueriesDone && groups.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">
                No se encontraron atletas inscritos con nivel/categoría en Sismaster.
              </p>
            )}

            {/* Sin atletas (campo sin Sismaster) */}
            {!hasSismaster && isFieldEvent && !isLoading && groups.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">
                No hay atletas registrados en esta categoría.
              </p>
            )}

            {/* Grid de series — idéntico al original */}
            {!isLoading && groups.length > 0 && (
              <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
                {groups.map((group) => {
                  const isTarget =
                    canMoveAthletes &&
                    selectedRegId !== null &&
                    sourceGroupKey !== null &&
                    sourceGroupKey !== group.key;

                  return (
                    <div
                      key={group.key}
                      onClick={() => isTarget && handleMoveToGroup(group.key)}
                      className={[
                        "rounded-xl border-2 p-4 transition-all",
                        isTarget
                          ? "cursor-pointer border-blue-400 bg-blue-50 hover:shadow-md"
                          : sourceGroupKey === group.key
                            ? "border-slate-300 bg-white"
                            : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold leading-tight text-slate-800">
                            {group.seriesName}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {group.athletes.length} atleta(s)
                          </p>
                        </div>
                        {isTarget && (
                          <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Mover aquí
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {group.athletes.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-200 py-3 text-center text-xs text-slate-400">
                            Sin atletas
                          </p>
                        ) : (
                          group.athletes.map((athlete) => {
                            const isSelected =
                              canMoveAthletes &&
                              selectedRegId === athlete.registrationId &&
                              sourceGroupKey === group.key;
                            return (
                              <button
                                key={athlete.registrationId}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canMoveAthletes)
                                    handleSelectAthlete(group.key, athlete.registrationId);
                                }}
                                className={[
                                  "w-full rounded-lg border p-2.5 text-left transition-all",
                                  !canMoveAthletes
                                    ? "cursor-default border-slate-200 bg-slate-50"
                                    : isSelected
                                      ? "border-blue-500 bg-blue-50 shadow-sm"
                                      : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                                ].join(" ")}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800">
                                      {athlete.name}
                                    </p>
                                    {athlete.institution && (
                                      <p className="truncate text-xs text-slate-500">
                                        {athlete.institution}
                                      </p>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Modo equipos: pool + 4 series fijas con drag & drop ── */}
        {isTeamMode && (
          <>
            {allRegistrations.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>No hay equipos registrados en esta categoría.</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Arrastra los equipos hacia la serie correspondiente, o haz clic
                  en un equipo y luego en la serie destino.
                </p>

                <div className="flex max-h-[60vh] gap-4 overflow-hidden">

                  {/* Pool sin asignar */}
                  <div
                    className={[
                      "flex w-52 shrink-0 flex-col rounded-xl border-2 transition-all",
                      dragOverKey === UNASSIGNED_KEY
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                    onDragOver={(e) => onDragOver(e, UNASSIGNED_KEY)}
                    onDrop={(e) => onDrop(e, UNASSIGNED_KEY)}
                    onClick={() => handleClickGroupTeam(UNASSIGNED_KEY)}
                  >
                    <div className="border-b border-slate-200 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Sin asignar
                      </p>
                      <p className="text-xs text-slate-400">
                        {unassignedGroup?.athletes.length ?? 0} equipo(s)
                      </p>
                    </div>
                    <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                      {unassignedGroup?.athletes.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400">
                          ✓ Todos asignados
                        </p>
                      ) : (
                        unassignedGroup?.athletes.map((team) => (
                          <TeamCard
                            key={team.registrationId}
                            team={team}
                            groupKey={UNASSIGNED_KEY}
                            isSelected={
                              teamSelectedId === team.registrationId &&
                              teamSelectedFrom === UNASSIGNED_KEY
                            }
                            isDragging={draggingId === team.registrationId}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onClick={handleClickTeam}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* 4 Series fijas */}
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                    {teamSeriesGroups.map((group) => {
                      const isDropTarget =
                        dragOverKey === group.key ||
                        (teamSelectedId !== null &&
                          teamSelectedFrom !== null &&
                          teamSelectedFrom !== group.key);

                      return (
                        <div
                          key={group.key}
                          className={[
                            "rounded-xl border-2 p-3 transition-all",
                            dragOverKey === group.key
                              ? "border-blue-400 bg-blue-50 shadow-md"
                              : isDropTarget && teamSelectedId !== null
                                ? "cursor-pointer border-blue-300 bg-blue-50/50 hover:border-blue-400"
                                : "border-slate-200 bg-white",
                          ].join(" ")}
                          onDragOver={(e) => onDragOver(e, group.key)}
                          onDrop={(e) => onDrop(e, group.key)}
                          onClick={() => handleClickGroupTeam(group.key)}
                        >
                          {/* Cabecera serie */}
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-800">
                                {group.seriesName}
                              </h3>
                              <p className="text-xs text-slate-400">
                                {group.athletes.length} equipo(s)
                              </p>
                            </div>
                            {dragOverKey === group.key && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                Soltar aquí
                              </span>
                            )}
                            {teamSelectedId !== null &&
                              teamSelectedFrom !== group.key &&
                              dragOverKey !== group.key && (
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  Clic para mover
                                </span>
                              )}
                          </div>

                          {/* Equipos en la serie */}
                          <div className="flex min-h-[44px] flex-wrap gap-1.5">
                            {group.athletes.length === 0 ? (
                              <p className="w-full rounded-lg border border-dashed border-slate-200 py-2.5 text-center text-xs text-slate-400">
                                Arrastra equipos aquí
                              </p>
                            ) : (
                              group.athletes.map((team) => (
                                <TeamChip
                                  key={team.registrationId}
                                  team={team}
                                  groupKey={group.key}
                                  isSelected={
                                    teamSelectedId === team.registrationId &&
                                    teamSelectedFrom === group.key
                                  }
                                  isDragging={draggingId === team.registrationId}
                                  onDragStart={onDragStart}
                                  onDragEnd={onDragEnd}
                                  onClick={handleClickTeam}
                                  onRemove={(id) =>
                                    moveTeam(id, group.key, UNASSIGNED_KEY)
                                  }
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Footer compartido ── */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {isTeamMode ? (
              validGroupsTeam.length > 0 && (
                <>
                  <p>{validGroupsTeam.length} serie(s) con equipos</p>
                  <p className="text-slate-500">
                    {assignedCount} equipo(s) asignados
                    {(unassignedGroup?.athletes.length ?? 0) > 0 && (
                      <span className="ml-1 text-amber-600">
                        · {unassignedGroup?.athletes.length} sin asignar
                      </span>
                    )}
                  </p>
                </>
              )
            ) : (
              validGroupsIndividual.length > 0 && (
                <>
                  <p>{validGroupsIndividual.length} serie(s) a crear</p>
                  <p className="text-slate-500">
                    {totalAthletes} atleta(s) asignados en total
                  </p>
                </>
              )
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={
                validGroupsForFooter.length === 0 ||
                mutation.isPending ||
                isLoading
              }
            >
              {mutation.isPending
                ? "Generando..."
                : `Generar ${validGroupsForFooter.length} serie(s)`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Sub-componentes (solo usados en modo equipos) ────────────────────────────

interface TeamCardProps {
  team: SeriesAthlete;
  groupKey: string;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (id: number, fromKey: string) => void;
  onDragEnd: () => void;
  onClick: (id: number, fromKey: string) => void;
}

/** Tarjeta vertical — pool "Sin asignar" */
function TeamCard({ team, groupKey, isSelected, isDragging, onDragStart, onDragEnd, onClick }: TeamCardProps) {
  const ROL_STYLES: Record<string, string> = {
    capitan:  "bg-yellow-100 text-yellow-700",
    titular:  "bg-indigo-50 text-indigo-600",
    suplente: "bg-slate-100 text-slate-500",
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(team.registrationId, groupKey)}
      onDragEnd={onDragEnd}
      onClick={(e) => { e.stopPropagation(); onClick(team.registrationId, groupKey); }}
      className={[
        "flex cursor-grab items-start gap-2 rounded-lg border p-2 transition-all active:cursor-grabbing",
        isDragging
          ? "opacity-40"
          : isSelected
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
      ].join(" ")}
    >
      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800">{team.name}</p>
        {team.institution && (
          <p className="truncate text-[10px] text-slate-400">{team.institution}</p>
        )}

        {/* ── NUEVO: lista de atletas ── */}
        {team.members && team.members.length > 0 && (
          <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1">
            {team.members.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="truncate text-[10px] text-slate-600 leading-tight">
                  {m.name}
                </span>
                {m.rol && (
                  <span className={[
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
                    ROL_STYLES[m.rol] ?? "bg-slate-100 text-slate-500",
                  ].join(" ")}>
                    {m.rol === "capitan" ? "CAP" : m.rol === "titular" ? "TIT" : "SUP"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TeamChipProps {
  team: SeriesAthlete;
  groupKey: string;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (id: number, fromKey: string) => void;
  onDragEnd: () => void;
  onClick: (id: number, fromKey: string) => void;
  onRemove: (id: number) => void;
}

/** Chip compacto — dentro de cada serie */
function TeamChip({ team, groupKey, isSelected, isDragging, onDragStart, onDragEnd, onClick, onRemove }: TeamChipProps) {
  const membersTooltip = team.members?.map((m) =>
    `${m.name}${m.rol ? ` (${m.rol})` : ""}`
  ).join("\n") ?? "";

  return (
    <div
      draggable
      title={membersTooltip || undefined}
      onDragStart={() => onDragStart(team.registrationId, groupKey)}
      onDragEnd={onDragEnd}
      onClick={(e) => { e.stopPropagation(); onClick(team.registrationId, groupKey); }}
      className={[
        "flex cursor-grab items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all active:cursor-grabbing",
        isDragging
          ? "opacity-40"
          : isSelected
            ? "border-blue-400 bg-blue-100 text-blue-800"
            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white",
      ].join(" ")}
    >
      <GripVertical className="h-3 w-3 shrink-0 text-slate-400" />
      <div className="flex min-w-0 flex-col">
        <span className="max-w-[120px] truncate font-semibold leading-tight">{team.name}</span>
        {team.members && team.members.length > 0 && (
          <span className="text-[9px] text-slate-400 leading-tight">
            {team.members.length} atleta{team.members.length !== 1 ? "s" : ""}
            {" · "}
            {/* Muestra el primer nombre como preview */}
            <span className="text-slate-500">{team.members[0].name.split(" ")[0]}</span>
            {team.members.length > 1 && <span className="text-slate-400"> +{team.members.length - 1}</span>}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(team.registrationId); }}
        className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200"
        title="Devolver a Sin asignar"
      >
        <X className="h-2.5 w-2.5 text-slate-500" />
      </button>
    </div>
  );
}