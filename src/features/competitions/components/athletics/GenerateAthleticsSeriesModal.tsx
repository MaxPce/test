// src/features/competitions/components/athletics/GenerateAthleticsSeriesModal.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/api/client";
import { AlertCircle, ArrowRightLeft } from "lucide-react";
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

const SERIES_TYPE_TO_PHASE_TYPE = {
  metros:    'combined_pista',
  distancia: 'combined_distancia',
  altura:    'combined_altura',
} as const;

export interface GenerateAthleticsSeriesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryId?: number; // ← category_id de la tabla categories (208-234)
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

// ─── Helper: meta de evento de campo para el banner ──────────────────────────

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
}: GenerateAthleticsSeriesModalProps) {
  const mutation = useGenerateAthleticsSeries();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  // ── Tipo de evento (informativo, para banner y fallback sin Sismaster) ────
  const seriesType = categoryId ? getAthleticsSeriesType(categoryId) : "metros";
  const isFieldEvent = seriesType === "altura" || seriesType === "distancia";
  const fieldEventMeta = getFieldEventMeta(categoryId);

  // ── Step 1: Cargar combos niv/cat ─────────────────────────────────────────
  // Igual que el original — Sismaster aplica tanto para carreras como campo
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
      enabled: hasSismaster && open && combos.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const loadingCombosData = comboQueries.some((q) => q.isLoading);
  const allQueriesDone =
    combos.length > 0 && comboQueries.every((q) => q.isSuccess);

  // ── Step 3: Construir grupos desde Sismaster ──────────────────────────────
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

  // ── Grupo único de fallback (campo SIN Sismaster) ─────────────────────────
  const fieldGroup = useMemo((): SeriesGroup[] => {
    if (!isFieldEvent || hasSismaster || !open) return [];
    const athletes: SeriesAthlete[] = allRegistrations.map((reg) => ({
      registrationId: reg.registrationId,
      name:
        reg.athlete?.name ??
        reg.team?.name ??
        `Registro ${reg.registrationId}`,
      institution:
        reg.athlete?.institution?.name ??
        reg.team?.institution?.name ??
        null,
    }));
    if (athletes.length === 0) return [];
    return [
      {
        key: "field-group",
        seriesName: eventName,
        idniv: "",
        idcat: "",
        athletes,
      },
    ];
  }, [isFieldEvent, hasSismaster, open, allRegistrations, eventName]);

  // ── Estado editable de grupos ─────────────────────────────────────────────
  const [groups, setGroups] = useState<SeriesGroup[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [sourceGroupKey, setSourceGroupKey] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const prevOpenRef = useRef(false);
  const initialGroupsRef = useRef<SeriesGroup[]>([]);
  initialGroupsRef.current = initialGroups;

  useEffect(() => {
    // Modal cerrado → resetear
    if (!open && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedRegId(null);
      setSourceGroupKey(null);
    }

    prevOpenRef.current = open;

    if (!open || hasInitialized.current) return;

    // Con Sismaster (carreras Y campo): esperar sus grupos
    if (hasSismaster && allQueriesDone) {
      const g = initialGroupsRef.current;
      if (g.length > 0) {
        hasInitialized.current = true;
        setGroups(g);
      }
      return;
    }

    // Sin Sismaster + campo: grupo único inmediato
    if (!hasSismaster && isFieldEvent && fieldGroup.length > 0) {
      hasInitialized.current = true;
      setGroups(fieldGroup);
    }

    // Sin Sismaster + carrera: no hay grupos (el render muestra el aviso)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allQueriesDone, isFieldEvent, hasSismaster, fieldGroup]);

  // ── Mover atleta ──────────────────────────────────────────────────────────
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

      const idx = from.athletes.findIndex(
        (a) => a.registrationId === selectedRegId,
      );
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
    const validGroups = groups.filter((g) => g.athletes.length > 0);
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

  // ── Render helpers ────────────────────────────────────────────────────────
  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter((g) => g.athletes.length > 0);
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);

  // Para campo sin Sismaster no hay interacción de mover atletas
  const canMoveAthletes = hasSismaster && groups.length > 1;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Generar Series — ${eventName}`}
      size="xl"
    >
      <div className="space-y-4">
        
        

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
        {hasSismaster &&
          !isLoading &&
          !combosError &&
          allQueriesDone &&
          groups.length === 0 && (
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

        {/* Grid de series */}
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
                  {/* Cabecera */}
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

                  {/* Atletas */}
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
                              if (canMoveAthletes) {
                                handleSelectAthlete(
                                  group.key,
                                  athlete.registrationId,
                                );
                              }
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

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {validGroups.length > 0 && (
              <>
                <p>{validGroups.length} serie(s) a crear</p>
                <p className="text-slate-500">
                  {totalAthletes} atleta(s) asignados en total
                </p>
              </>
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
                validGroups.length === 0 || mutation.isPending || isLoading
              }
            >
              {mutation.isPending
                ? "Generando..."
                : `Generar ${validGroups.length} serie(s)`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}