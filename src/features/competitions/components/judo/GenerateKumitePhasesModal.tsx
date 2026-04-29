// src/features/competitions/components/judo/GenerateKumitePhasesModal.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api/client';
import { AlertCircle, ArrowRightLeft, Users, Swords, Trophy, CheckSquare, Square } from 'lucide-react';
import { useGenerateKumitePhases } from '../../api/judo-phases.mutations';
import type { KumitePhaseFormat } from '../../api/judo-phases.api';

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}

interface KumiteAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
}

interface KumiteGroup {
  key: string;
  phaseName: string;
  idniv: string;
  idcat: string;
  format: KumitePhaseFormat;
  athletes: KumiteAthlete[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getNivLabel(idniv: string): string {
  const n = idniv.toLowerCase().trim();
  if (n.includes('novel')) return 'Nv';
  if (n.includes('avanzad')) return 'Az';
  return idniv.toUpperCase();
}

function getCatLabel(idcat: string): string {
  const c = idcat.toLowerCase().trim();
  if (c === 'm' || c.includes('mascul') || c.includes('varon')) return 'Varones';
  if (c === 'f' || c.includes('femen') || c.includes('dam')) return 'Damas';
  return idcat.toUpperCase();
}

function buildPhaseName(idniv: string, idcat: string, categoryName: string): string {
  return `${getCatLabel(idcat)} ${getNivLabel(idniv)} ${categoryName}`;
}

// ─── Opciones de formato ─────────────────────────────────────────────────────

const FORMAT_OPTIONS: {
  value: KumitePhaseFormat;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: 'single_elimination',
    label: 'Eliminación Directa',
    icon: <Swords size={13} />,
    activeClass: 'bg-red-600 text-white border-red-600',
  },
  {
    value: 'round_robin',
    label: 'Grupos',
    icon: <Users size={13} />,
    activeClass: 'bg-blue-600 text-white border-blue-600',
  },
  {
    value: 'best_of_3',
    label: 'Mejor de 3',
    icon: <Trophy size={13} />,
    activeClass: 'bg-amber-500 text-white border-amber-500',
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

export interface GenerateKumitePhasesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  allRegistrations: any[];
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function GenerateKumitePhasesModal({
  open,
  onClose,
  eventCategoryId,
  categoryName,
  sismasterEventId,
  sismasterSportId,
  allRegistrations,
}: GenerateKumitePhasesModalProps) {
  const mutation = useGenerateKumitePhases();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  const {
    data: combosData,
    isLoading: loadingCombos,
    error: combosError,
  } = useQuery<{ combos: NivCatCombo[] }>({
    queryKey: ['sismaster-niv-cat-options', sismasterEventId, sismasterSportId, eventCategoryId],
    queryFn: async () => {
      const { data } = await apiClient.get('/sismaster/athletes/niv-cat-options', {
        params: { sismasterEventId, sismasterSportId, eventCategoryId },
      });
      return data;
    },
    enabled: hasSismaster && open,
    staleTime: 1000 * 60 * 5,
  });

  const combos = combosData?.combos ?? [];

  const comboQueries = useQueries({
    queries: combos.map((combo) => ({
      queryKey: ['sismaster-registrations-niv-cat', sismasterEventId, sismasterSportId, eventCategoryId, combo.idniv, combo.idcat],
      queryFn: async (): Promise<{ registrationIds: number[] }> => {
        const { data } = await apiClient.get('/sismaster/athletes/registrations-by-niv-cat', {
          params: { sismasterEventId, sismasterSportId, idniv: combo.idniv, idcat: combo.idcat, eventCategoryId },
        });
        return data;
      },
      enabled: hasSismaster && open && combos.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const loadingCombosData = comboQueries.some((q) => q.isLoading);
  const allQueriesDone = combos.length > 0 && comboQueries.every((q) => q.isSuccess);

  const regMap = useMemo(() => {
    const map = new Map<number, KumiteAthlete>();
    for (const reg of allRegistrations) {
      map.set(reg.registrationId, {
        registrationId: reg.registrationId,
        name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
        institution: reg.athlete?.institution?.name ?? reg.team?.institution?.name ?? null,
      });
    }
    return map;
  }, [allRegistrations]);

  const initialGroups = useMemo((): KumiteGroup[] => {
    if (!allQueriesDone) return [];
    const seenIds = new Set<number>();
    return combos
      .map((combo, idx) => {
        const ids = comboQueries[idx].data?.registrationIds ?? [];
        const athletes = ids
          .map((id) => regMap.get(id))
          .filter((a): a is KumiteAthlete => {
            if (!a) return false;
            if (seenIds.has(a.registrationId)) return false;
            seenIds.add(a.registrationId);
            return true;
          });
        return {
          key: `${combo.idniv}-${combo.idcat}`,
          phaseName: buildPhaseName(combo.idniv, combo.idcat, categoryName),
          idniv: combo.idniv,
          idcat: combo.idcat,
          format: 'single_elimination' as KumitePhaseFormat,
          athletes,
        };
      })
      .filter((g) => g.athletes.length > 0)
      .sort((a, b) => {
        const catOrder = (c: string) => c.toLowerCase().includes('f') || c.toLowerCase().includes('dam') ? 1 : 0;
        const nivOrder = (n: string) => n.toLowerCase().includes('novel') ? 1 : 0;
        if (catOrder(a.idcat) !== catOrder(b.idcat)) return catOrder(a.idcat) - catOrder(b.idcat);
        return nivOrder(a.idniv) - nivOrder(b.idniv);
      });
  }, [allQueriesDone, combos, comboQueries, regMap, categoryName]);

  // ── State ────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<KumiteGroup[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set()); // ← NUEVO
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [sourceGroupKey, setSourceGroupKey] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const prevOpenRef = useRef(false);
  const initialGroupsRef = useRef<KumiteGroup[]>([]);
  initialGroupsRef.current = initialGroups;

  useEffect(() => {
    if (!open && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedGroupKeys(new Set()); // ← NUEVO reset
      setSelectedRegId(null);
      setSourceGroupKey(null);
    }
    prevOpenRef.current = open;
    if (!open || hasInitialized.current) return;

    if (hasSismaster && allQueriesDone) {
      const g = initialGroupsRef.current;
      if (g.length > 0) {
        hasInitialized.current = true;
        setGroups(g);
        setSelectedGroupKeys(new Set(g.map((grp) => grp.key))); // ← NUEVO: todos seleccionados por defecto
      }
    }
  }, [open, allQueriesDone, hasSismaster]);

  const setGroupFormat = (key: string, format: KumitePhaseFormat) => {
    setGroups((prev) => prev.map((g) => (g.key === key ? { ...g, format } : g)));
  };

  // ── NUEVO: toggle selección individual y total ────────────────────────────
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
  // ─────────────────────────────────────────────────────────────────────────

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

  const handleGenerate = async () => {
    const validGroups = groups.filter(
      (g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key), // ← NUEVO filtro
    );
    if (!validGroups.length) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        groups: validGroups.map((g) => ({
          name: g.phaseName,
          format: g.format,
          registrationIds: g.athletes.map((a) => a.registrationId),
        })),
      });
      onClose();
    } catch (err: any) {
      console.error('Error generando fases:', err?.response?.data);
    }
  };

  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter(
    (g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key), // ← NUEVO filtro
  );
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);
  const canMoveAthletes = groups.length > 1;

  return (
    <Modal isOpen={open} onClose={onClose} title={`Generar Fases — ${categoryName}`} size="xl">
      <div className="space-y-4">

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Spinner size="md" />
            <span className="text-sm">Cargando grupos desde Sismaster...</span>
          </div>
        )}

        {!hasSismaster && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Esta categoría no tiene Sismaster configurado. Verifica la integración con Sismaster.</span>
          </div>
        )}

        {combosError && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No se pudieron cargar los grupos. Verifica la conexión con Sismaster.</span>
          </div>
        )}

        {hasSismaster && !isLoading && !combosError && allQueriesDone && groups.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No se encontraron atletas inscritos con nivel/categoría en Sismaster para esta categoría.
          </p>
        )}

        {!isLoading && groups.length > 0 && (
          <>
            {/* ── NUEVO: Barra "Seleccionar todas" ── */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-600">
                {selectedGroupKeys.size} de {groups.length} fase(s) seleccionada(s)
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
                {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>

            <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              {groups.map((group) => {
                const isGroupSelected = selectedGroupKeys.has(group.key); // ← NUEVO
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
                      'rounded-xl border-2 p-4 transition-all',
                      isTarget
                        ? 'cursor-pointer border-blue-400 bg-blue-50 hover:shadow-md'
                        : isGroupSelected
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-200 bg-slate-50 opacity-60', // ← NUEVO: dimming cuando no seleccionado
                    ].join(' ')}
                  >
                    <div className="mb-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        {/* ── NUEVO: Checkbox + título ── */}
                        <div className="flex items-start gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleGroupSelection(group.key); }}
                            className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                            aria-label={isGroupSelected ? `Deseleccionar ${group.phaseName}` : `Seleccionar ${group.phaseName}`}
                          >
                            {isGroupSelected ? (
                              <CheckSquare size={16} className="text-blue-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold leading-tight text-slate-800">
                              {group.phaseName}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {group.athletes.length} atleta(s)
                            </p>
                          </div>
                        </div>
                        {isTarget && (
                          <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Mover aquí
                          </span>
                        )}
                      </div>

                      {/* ── NUEVO: formato solo si la fase está seleccionada ── */}
                      {isGroupSelected && (
                        <div className="flex flex-wrap gap-1.5">
                          {FORMAT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setGroupFormat(group.key, opt.value); }}
                              className={[
                                'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                                group.format === opt.value
                                  ? opt.activeClass
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                              ].join(' ')}
                            >
                              {opt.icon}
                              {opt.label}
                            </button>
                          ))}
                        </div>
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
                                if (canMoveAthletes) handleSelectAthlete(group.key, athlete.registrationId);
                              }}
                              className={[
                                'w-full rounded-lg border p-2.5 text-left transition-all',
                                !canMoveAthletes
                                  ? 'cursor-default border-slate-200 bg-slate-50'
                                  : isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
                              ].join(' ')}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">{athlete.name}</p>
                                  {athlete.institution && (
                                    <p className="truncate text-xs text-slate-500">{athlete.institution}</p>
                                  )}
                                </div>
                                {isSelected && <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-blue-500" />}
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
                    ? `${validGroups.length} de ${groups.length} fase(s) seleccionada(s)`
                    : 'Ninguna fase seleccionada'}
                </p>
                {validGroups.length > 0 && (
                  <p className="text-slate-500">{totalAthletes} atleta(s) en las fases seleccionadas</p>
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
                ? 'Generando...'
                : validGroups.length > 0
                  ? `Generar ${validGroups.length} fase(s)`
                  : 'Selecciona al menos una fase'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}