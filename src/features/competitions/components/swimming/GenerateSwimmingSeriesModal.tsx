// src/features/competitions/components/swimming/GenerateSwimmingSeriesModal.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/api/client";
import { AlertCircle, ArrowRightLeft, CheckSquare, Square } from "lucide-react";
import { useGenerateSwimmingSeries } from "../../api/swimming-phases.mutations";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}

interface SeriesAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
}

interface SeriesGroup {
  key: string;
  seriesName: string;
  idniv: string;
  idcat: string;
  athletes: SeriesAthlete[];
}

export interface GenerateSwimmingSeriesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  eventName?: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  allRegistrations: any[];
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

// ─── Helper: construir SeriesAthlete desde una registration ──────────────────

function toSeriesAthlete(reg: any): SeriesAthlete {
  return {
    registrationId: reg.registrationId,
    name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
    institution: reg.athlete?.institution?.name ?? reg.team?.institution?.name ?? null,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GenerateSwimmingSeriesModal({
  open,
  onClose,
  eventCategoryId,
  eventName = "Natación",
  sismasterEventId,
  sismasterSportId,
  allRegistrations,
}: GenerateSwimmingSeriesModalProps) {
  const mutation = useGenerateSwimmingSeries();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  // ── Step 1: Cargar combos niv/cat desde Sismaster ─────────────────────────
  const {
    data: combosData,
    isLoading: loadingCombos,
    error: combosError,
  } = useQuery<{ combos: NivCatCombo[] }>({
    queryKey: ["sismaster-niv-cat-options", sismasterEventId, sismasterSportId, eventCategoryId],
    queryFn: async () => {
      const { data } = await apiClient.get("/sismaster/athletes/niv-cat-options", {
        params: { sismasterEventId, sismasterSportId, eventCategoryId },
      });
      return data;
    },
    enabled: hasSismaster && open,
    staleTime: 1000 * 60 * 5,
  });

  const combos = combosData?.combos ?? [];

  // ── Step 2: Cargar registrationIds por combo en paralelo ──────────────────
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
        const { data } = await apiClient.get("/sismaster/athletes/registrations-by-niv-cat", {
          params: {
            sismasterEventId,
            sismasterSportId,
            idniv: combo.idniv,
            idcat: combo.idcat,
            eventCategoryId,
          },
        });
        return data;
      },
      enabled: hasSismaster && open && combos.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const loadingCombosData = comboQueries.some((q) => q.isLoading);
  const allQueriesDone = combos.length > 0 && comboQueries.every((q) => q.isSuccess);

  // ── Step 3: Mapa de registrations (Haymaster) ─────────────────────────────
  const regMap = useMemo(() => {
    const map = new Map<number, SeriesAthlete>();
    for (const reg of allRegistrations) {
      map.set(reg.registrationId, toSeriesAthlete(reg));
    }
    return map;
  }, [allRegistrations]);

  // ── Step 4: Grupos desde Sismaster (cruzados con Haymaster via regMap) ────
  const sismasterGroups = useMemo((): SeriesGroup[] => {
    if (!allQueriesDone) return [];
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
  }, [allQueriesDone, combos, comboQueries, regMap, eventName]);

  // ── Step 4b: Atletas de Haymaster no cubiertos por Sismaster ─────────────
  const sismasterGroupsWithFallback = useMemo((): SeriesGroup[] => {
    if (!hasSismaster || !allQueriesDone) return sismasterGroups;

    const coveredIds = new Set<number>(
      sismasterGroups.flatMap((g) => g.athletes.map((a) => a.registrationId))
    );

    const uncovered = allRegistrations
      .filter((reg) => !coveredIds.has(reg.registrationId))
      .map(toSeriesAthlete);

    if (uncovered.length === 0) return sismasterGroups;

    return [
      ...sismasterGroups,
      {
        key: "haymaster-only",
        seriesName: `${eventName}`,
        idniv: "",
        idcat: "",
        athletes: uncovered,
      },
    ];
  }, [sismasterGroups, allRegistrations, hasSismaster, allQueriesDone, eventName]);

  // ── Step 5: Grupos desde Haymaster separados por género (sin Sismaster) ───
  const haymasterGroups = useMemo((): SeriesGroup[] => {
    if (hasSismaster || !open || allRegistrations.length === 0) return [];

    const damas = allRegistrations.filter(
      (reg) => (reg.athlete?.gender ?? "").toUpperCase() === "F"
    );
    const varones = allRegistrations.filter(
      (reg) => (reg.athlete?.gender ?? "").toUpperCase() === "M"
    );
    const sinGenero = allRegistrations.filter((reg) => {
      const g = (reg.athlete?.gender ?? "").toUpperCase();
      return g !== "F" && g !== "M";
    });

    const result: SeriesGroup[] = [];
    if (damas.length > 0)
      result.push({
        key: "damas",
        seriesName: `Damas — ${eventName}`,
        idniv: "",
        idcat: "F",
        athletes: damas.map(toSeriesAthlete),
      });
    if (varones.length > 0)
      result.push({
        key: "varones",
        seriesName: `Varones — ${eventName}`,
        idniv: "",
        idcat: "M",
        athletes: varones.map(toSeriesAthlete),
      });
    if (sinGenero.length > 0)
      result.push({
        key: "sin-genero",
        seriesName: `${eventName}`,
        idniv: "",
        idcat: "",
        athletes: sinGenero.map(toSeriesAthlete),
      });

    return result;
  }, [hasSismaster, open, allRegistrations, eventName]);

  // ── Estado editable de grupos ─────────────────────────────────────────────
  const [groups, setGroups] = useState<SeriesGroup[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [sourceGroupKey, setSourceGroupKey] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const prevOpenRef = useRef(false);
  const sismasterGroupsRef = useRef<SeriesGroup[]>([]);
  sismasterGroupsRef.current = sismasterGroupsWithFallback;

  useEffect(() => {
    if (!open && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedGroupKeys(new Set());
      setSelectedRegId(null);
      setSourceGroupKey(null);
    }
    prevOpenRef.current = open;
    if (!open || hasInitialized.current) return;

    // Modo Sismaster: esperar a que todas las queries terminen
    if (hasSismaster && allQueriesDone) {
      const g = sismasterGroupsRef.current;
      if (g.length > 0) {
        hasInitialized.current = true;
        setGroups(g);
        setSelectedGroupKeys(new Set(g.map((grp) => grp.key)));
      }
      return;
    }

    // Modo Haymaster: separar por género inmediatamente
    if (!hasSismaster && haymasterGroups.length > 0) {
      hasInitialized.current = true;
      setGroups(haymasterGroups);
      setSelectedGroupKeys(new Set(haymasterGroups.map((g) => g.key)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allQueriesDone, hasSismaster, haymasterGroups]);

  // ── Selección de series ───────────────────────────────────────────────────
  const toggleGroupSelection = (key: string) => {
    setSelectedGroupKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const allSelected = groups.length > 0 && groups.every((g) => selectedGroupKeys.has(g.key));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedGroupKeys(new Set());
    } else {
      setSelectedGroupKeys(new Set(groups.map((g) => g.key)));
    }
  };

  // ── Mover atleta entre series ─────────────────────────────────────────────
  const handleSelectAthlete = (groupKey: string, registrationId: number) => {
    if (selectedRegId === registrationId && sourceGroupKey === groupKey) {
      setSelectedRegId(null);
      setSourceGroupKey(null);
      return;
    }
    setSelectedRegId(registrationId);
    setSourceGroupKey(groupKey);
  };

  const handleMoveToGroup = (targetKey: string) => {
    if (!selectedRegId || !sourceGroupKey || targetKey === sourceGroupKey) return;
    setGroups((prev) => {
      const cloned = prev.map((g) => ({ ...g, athletes: [...g.athletes] }));
      const from = cloned.find((g) => g.key === sourceGroupKey);
      const to = cloned.find((g) => g.key === targetKey);
      if (!from || !to) return prev;
      const idx = from.athletes.findIndex((a) => a.registrationId === selectedRegId);
      if (idx === -1) return prev;
      const [athlete] = from.athletes.splice(idx, 1);
      to.athletes.push(athlete);
      return cloned;
    });
    setSelectedRegId(null);
    setSourceGroupKey(null);
  };

  // ── Confirmar generación ──────────────────────────────────────────────────
  const handleGenerate = async () => {
    const validGroups = groups.filter(
      (g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key),
    );
    if (validGroups.length === 0) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        data: {
          groups: validGroups.map((g) => ({
            name: g.seriesName,
            registrationIds: g.athletes.map((a) => a.registrationId),
          })),
        },
      });
      onClose();
    } catch (err: any) {
      console.error("Error al generar series:", err?.response?.data);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter(
    (g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key),
  );
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);
  // Mover atletas entre grupos está disponible cuando hay más de 1 grupo
  const canMoveAthletes = groups.length > 1;

  return (
    <Modal isOpen={open} onClose={onClose} title={`Generar Series — ${eventName}`} size="xl">
      <div className="space-y-4">

        {/* Cargando Sismaster */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Spinner size="md" />
            <span className="text-sm">Cargando grupos desde Sismaster...</span>
          </div>
        )}

        {/* Error Sismaster */}
        {combosError && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No se pudieron cargar los grupos desde Sismaster. Se muestran grupos por género desde Haymaster.</span>
          </div>
        )}

        {/* Sin combos Sismaster */}
        {hasSismaster && !isLoading && !combosError && allQueriesDone && groups.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No se encontraron nadadores inscritos con nivel/categoría en Sismaster.
          </p>
        )}

        {/* Sin nadadores (Haymaster) */}
        {!hasSismaster && !isLoading && groups.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No hay nadadores registrados en esta categoría.
          </p>
        )}

        {/* Grid de series */}
        {!isLoading && groups.length > 0 && (
          <>
            {/* Indicador de modo */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-600">
                {selectedGroupKeys.size} de {groups.length} serie(s) seleccionada(s)
                {!hasSismaster && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    Haymaster · separado por género
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                {allSelected ? (
                  <CheckSquare size={14} className="text-blue-600" />
                ) : (
                  <Square size={14} className="text-slate-400" />
                )}
                {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>

            <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              {groups.map((group) => {
                const isGroupSelected = selectedGroupKeys.has(group.key);
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
                        : isGroupSelected
                          ? "border-slate-200 bg-white"
                          : "border-slate-200 bg-slate-50 opacity-60",
                    ].join(" ")}
                  >
                    {/* Cabecera con checkbox */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleGroupSelection(group.key); }}
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                          aria-label={isGroupSelected ? `Deseleccionar ${group.seriesName}` : `Seleccionar ${group.seriesName}`}
                        >
                          {isGroupSelected ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold leading-tight text-slate-800">
                            {group.seriesName}
                          </h3>
                          {group.key === "haymaster-only" && (
                            <span className="inline-block mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Solo Haymaster
                            </span>
                          )}
                          <p className="mt-0.5 text-xs text-slate-500">
                            {group.athletes.length} nadador(es)
                          </p>
                        </div>
                      </div>
                      {isTarget && (
                        <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Mover aquí
                        </span>
                      )}
                    </div>

                    {/* Nadadores */}
                    <div className="space-y-1.5">
                      {group.athletes.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-200 py-3 text-center text-xs text-slate-400">
                          Sin nadadores
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
                                if (canMoveAthletes) handleSelectAthlete(group.key, athlete.registrationId);
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
          </>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {groups.length > 0 && (
              <>
                <p>
                  {validGroups.length > 0
                    ? `${validGroups.length} de ${groups.length} serie(s) seleccionada(s)`
                    : "Ninguna serie seleccionada"}
                </p>
                {validGroups.length > 0 && (
                  <p className="text-slate-500">{totalAthletes} nadador(es) en las series seleccionadas</p>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={validGroups.length === 0 || mutation.isPending || isLoading}
            >
              {mutation.isPending
                ? "Generando..."
                : validGroups.length > 0
                  ? `Generar ${validGroups.length} serie(s)`
                  : "Selecciona al menos una serie"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}