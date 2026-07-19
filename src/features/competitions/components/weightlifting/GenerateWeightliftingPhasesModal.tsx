// src/features/competitions/components/weightlifting/GenerateWeightliftingPhasesModal.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api/client';
import { AlertCircle, CheckSquare, Square, Plus, Trash2 } from 'lucide-react';
import { useGenerateWeightliftingPhases } from '../../api/weightlifting-phases.mutations';

interface NivCatCombo { idniv: string; idcat: string; total: number; }

interface WeightliftingAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
  weightClass: string;
}

interface WeightliftingGroup {
  key: string;
  phaseName: string;
  idniv: string;
  idcat: string;
  athletes: WeightliftingAthlete[];
}

function getCatLabel(idcat: string) {
  const c = idcat.toLowerCase();
  if (c === 'm' || c.includes('mascul') || c.includes('varon')) return 'Varones';
  if (c === 'f' || c.includes('femen') || c.includes('dam')) return 'Damas';
  return idcat.toUpperCase();
}

function buildPhaseName(idniv: string, idcat: string, categoryName: string) {
  return `${getCatLabel(idcat)} ${idniv} ${categoryName}`;
}

function extractWeightFromCategoryName(name: string): string {
  const match = name.match(/(\d+(?:[.,]\d+)?)\s*[Kk]g/);
  return match ? match[1] : name;
}

function buildHaymasterGroups(
  allRegistrations: any[],
  categoryName: string,
): WeightliftingGroup[] {
  const defaultWeight = extractWeightFromCategoryName(categoryName);

  // Detectar géneros presentes
  const genders = new Set<string>(
    allRegistrations.map((reg) => reg.athlete?.gender).filter(Boolean)
  );
  const hasBoth = genders.has('M') && genders.has('F');

  if (!hasBoth) {
    // Un solo género (o sin dato) → un grupo con el nombre de la categoría sin diferenciador
    const athletes: WeightliftingAthlete[] = allRegistrations.map((reg) => ({
      registrationId: reg.registrationId,
      name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
      institution: reg.athlete?.institution?.name ?? null,
      weightClass: defaultWeight,
    }));
    if (athletes.length === 0) return [];
    return [{
      key: 'haymaster-default',
      phaseName: categoryName,
      idniv: 'HAYMASTER',
      idcat: 'ALL',
      athletes,
    }];
  }

  const varones = allRegistrations.filter((reg) => reg.athlete?.gender === 'M');
  const damas   = allRegistrations.filter((reg) => reg.athlete?.gender === 'F');

  const toAthletes = (regs: any[]): WeightliftingAthlete[] =>
    regs.map((reg) => ({
      registrationId: reg.registrationId,
      name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
      institution: reg.athlete?.institution?.name ?? null,
      weightClass: defaultWeight,
    }));

  const groups: WeightliftingGroup[] = [];

  if (varones.length > 0) {
    groups.push({
      key: 'haymaster-varones',
      phaseName: `${categoryName} — Varones`,
      idniv: 'HAYMASTER',
      idcat: 'M',
      athletes: toAthletes(varones),
    });
  }

  if (damas.length > 0) {
    groups.push({
      key: 'haymaster-damas',
      phaseName: `${categoryName} — Damas`,
      idniv: 'HAYMASTER',
      idcat: 'F',
      athletes: toAthletes(damas),
    });
  }

  return groups;
}


export interface GenerateWeightliftingPhasesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  haymasterEventId?: number;
  allRegistrations: any[];
}

export function GenerateWeightliftingPhasesModal({
  open, onClose, eventCategoryId, categoryName,
  sismasterEventId, sismasterSportId, haymasterEventId,
  allRegistrations,
}: GenerateWeightliftingPhasesModalProps) {

  const mutation = useGenerateWeightliftingPhases();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);
  const isHaymaster  = Boolean(haymasterEventId && !hasSismaster);

  // ── Sismaster queries ──────────────────────────────────────────────────────
  const { data: combosData, isLoading: loadingCombos } =
    useQuery<{ combos: NivCatCombo[] }>({
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
      queryKey: ['sismaster-registrations-niv-cat', sismasterEventId, sismasterSportId,
                 eventCategoryId, combo.idniv, combo.idcat],
      queryFn: async (): Promise<{ registrationIds: number[] }> => {
        const { data } = await apiClient.get('/sismaster/athletes/registrations-by-niv-cat', {
          params: { sismasterEventId, sismasterSportId, idniv: combo.idniv,
                    idcat: combo.idcat, eventCategoryId },
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
    const map = new Map<number, Omit<WeightliftingAthlete, 'weightClass'>>();
    for (const reg of allRegistrations) {
      map.set(reg.registrationId, {
        registrationId: reg.registrationId,
        name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
        institution: reg.athlete?.institution?.name ?? null,
      });
    }
    return map;
  }, [allRegistrations]);

  const initialSismasterGroups = useMemo((): WeightliftingGroup[] => {
    if (!allQueriesDone) return [];
    const seenIds = new Set<number>();
    const defaultWeight = extractWeightFromCategoryName(categoryName);
    return combos
      .map((combo, idx) => {
        const ids = comboQueries[idx].data?.registrationIds ?? [];
        const athletes = ids
          .map((id) => {
            const base = regMap.get(id);
            if (!base) return undefined;
            return { ...base, weightClass: defaultWeight };
          })
          .filter((a): a is WeightliftingAthlete => {
            if (!a || seenIds.has(a.registrationId)) return false;
            seenIds.add(a.registrationId);
            return true;
          });
        return {
          key: `${combo.idniv}-${combo.idcat}`,
          phaseName: buildPhaseName(combo.idniv, combo.idcat, categoryName),
          idniv: combo.idniv,
          idcat: combo.idcat,
          athletes,
        };
      })
      .filter((g) => g.athletes.length > 0);
  }, [allQueriesDone, combos, comboQueries, regMap, categoryName]);

  const [groups, setGroups] = useState<WeightliftingGroup[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  const hasInitialized = useRef(false);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!open && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedGroupKeys(new Set());
    }
    prevOpenRef.current = open;
    if (!open || hasInitialized.current) return;

    // Flujo Sismaster
    if (hasSismaster && allQueriesDone && initialSismasterGroups.length > 0) {
      hasInitialized.current = true;
      setGroups(initialSismasterGroups);
      setSelectedGroupKeys(new Set(initialSismasterGroups.map((g) => g.key)));
      return;
    }

    // Flujo Haymaster: inicializar con datos locales
    if (isHaymaster && allRegistrations.length > 0) {
      hasInitialized.current = true;
      const haymasterGroups = buildHaymasterGroups(allRegistrations, categoryName);
      setGroups(haymasterGroups);
      setSelectedGroupKeys(new Set(haymasterGroups.map((g) => g.key)));
    }
  }, [open, allQueriesDone, hasSismaster, isHaymaster, initialSismasterGroups, allRegistrations, categoryName]);

  // ── Edición ────────────────────────────────────────────────────────────────
  const setAthleteWeightClass = (groupKey: string, registrationId: number, value: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.key !== groupKey ? g : {
          ...g,
          athletes: g.athletes.map((a) =>
            a.registrationId !== registrationId ? a : { ...a, weightClass: value }
          ),
        }
      )
    );
  };

  const setPhaseName = (groupKey: string, value: string) => {
    setGroups((prev) =>
      prev.map((g) => g.key !== groupKey ? g : { ...g, phaseName: value })
    );
  };

  const splitGroup = (groupKey: string) => {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.key === groupKey);
      if (idx === -1) return prev;
      const group = prev[idx];
      const half = Math.ceil(group.athletes.length / 2);
      const groupA: WeightliftingGroup = {
        ...group,
        key: `${groupKey}-A-${Date.now()}`,
        phaseName: `${group.phaseName} — Grupo A`,
        athletes: group.athletes.slice(0, half),
      };
      const groupB: WeightliftingGroup = {
        ...group,
        key: `${groupKey}-B-${Date.now()}`,
        phaseName: `${group.phaseName} — Grupo B`,
        athletes: group.athletes.slice(half),
      };
      const next = [...prev];
      next.splice(idx, 1, groupA, groupB);
      setSelectedGroupKeys((prevKeys) => {
        const s = new Set(prevKeys);
        s.delete(groupKey);
        s.add(groupA.key);
        s.add(groupB.key);
        return s;
      });
      return next;
    });
  };

  const removeGroup = (groupKey: string) => {
    setGroups((prev) => prev.filter((g) => g.key !== groupKey));
    setSelectedGroupKeys((prev) => {
      const next = new Set(prev);
      next.delete(groupKey);
      return next;
    });
  };

  const toggleGroupSelection = (key: string) => {
    setSelectedGroupKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const allSelected = groups.length > 0 && groups.every((g) => selectedGroupKeys.has(g.key));
  const toggleSelectAll = () =>
    allSelected
      ? setSelectedGroupKeys(new Set())
      : setSelectedGroupKeys(new Set(groups.map((g) => g.key)));

  const handleGenerate = async () => {
    const validGroups = groups.filter((g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key));
    if (!validGroups.length) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        groups: validGroups.map((g) => ({
          name: g.phaseName,
          registrationIds: g.athletes.map((a) => a.registrationId),
          entries: g.athletes.map((a) => ({
            registrationId: a.registrationId,
            weightClass: a.weightClass || null,
          })),
        })),
      });
      onClose();
    } catch (err: any) {
      console.error('Error generando fases pesas:', err?.response?.data);
    }
  };

  // isLoading solo aplica en flujo Sismaster
  const isLoading = hasSismaster && (loadingCombos || loadingCombosData);
  const validGroups = groups.filter((g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key));
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);
  const noAthletes = !isLoading && isHaymaster && allRegistrations.length === 0;

  return (
    <Modal isOpen={open} onClose={onClose} title={`Generar Fases — ${categoryName}`} size="xl">
      <div className="space-y-4">

        {/* Badge de modo */}
        {!isLoading && (hasSismaster || isHaymaster) && (
          <div className={[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            hasSismaster
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-violet-50 text-violet-700 border border-violet-200',
          ].join(' ')}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hasSismaster ? 'Modo Sismaster' : 'Modo Haymaster'}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Spinner size="md" />
            <span className="text-sm">Cargando grupos desde Sismaster...</span>
          </div>
        )}

        {/* Sin integración externa configurada */}
        {!hasSismaster && !isHaymaster && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Esta categoría no tiene integración externa configurada.</span>
          </div>
        )}

        {noAthletes && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No hay atletas inscritos en esta categoría para generar fases.</span>
          </div>
        )}

        {!isLoading && groups.length > 0 && (
          <>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-600">
                {selectedGroupKeys.size} de {groups.length} fase(s) seleccionada(s)
              </span>
              <button type="button" onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900">
                {allSelected ? <CheckSquare size={14} className="text-blue-600" /> : <Square size={14} />}
                {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>

            <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              {groups.map((group) => {
                const isGroupSelected = selectedGroupKeys.has(group.key);
                return (
                  <div key={group.key}
                    className={[
                      'rounded-xl border-2 p-4 transition-all',
                      isGroupSelected ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60',
                    ].join(' ')}
                  >
                    <div className="mb-3 flex items-start gap-2">
                      <button type="button"
                        onClick={() => toggleGroupSelection(group.key)}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                        {isGroupSelected
                          ? <CheckSquare size={16} className="text-blue-600" />
                          : <Square size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {isHaymaster ? (
                          <input
                            type="text"
                            value={group.phaseName}
                            onChange={(e) => setPhaseName(group.key, e.target.value)}
                            className="w-full text-sm font-semibold text-slate-800 bg-transparent
                                       border-b border-dashed border-slate-300
                                       focus:outline-none focus:border-blue-400 pb-0.5"
                          />
                        ) : (
                          <h3 className="text-sm font-semibold text-slate-800">{group.phaseName}</h3>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">{group.athletes.length} atleta(s)</p>
                      </div>

                      {/* Acciones Haymaster: dividir / eliminar */}
                      {isHaymaster && (
                        <div className="flex items-center gap-1 shrink-0">
                          {group.athletes.length >= 2 && (
                            <button type="button" title="Dividir en dos grupos"
                              onClick={() => splitGroup(group.key)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                              <Plus size={14} />
                            </button>
                          )}
                          {groups.length > 1 && (
                            <button type="button" title="Eliminar grupo"
                              onClick={() => removeGroup(group.key)}
                              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="grid grid-cols-[1fr_72px] gap-2 px-1 text-[10px] font-semibold uppercase text-slate-400">
                        <span>Atleta</span>
                        <span className="text-center">División</span>
                      </div>
                      {group.athletes.map((athlete) => (
                        <div key={athlete.registrationId}
                          className="grid grid-cols-[1fr_72px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{athlete.name}</p>
                            {athlete.institution && (
                              <p className="truncate text-xs text-slate-500">{athlete.institution}</p>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="ej: 89"
                            value={athlete.weightClass}
                            onChange={(e) =>
                              setAthleteWeightClass(group.key, athlete.registrationId, e.target.value)
                            }
                            disabled={!isGroupSelected}
                            maxLength={10}
                            className="w-full text-center text-sm border border-slate-300 rounded-lg px-2 py-1
                                       focus:outline-none focus:ring-2 focus:ring-blue-400
                                       disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {validGroups.length > 0
              ? <p>{validGroups.length} fase(s) · {totalAthletes} atleta(s)</p>
              : <p>Ninguna fase seleccionada</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleGenerate}
              disabled={validGroups.length === 0 || mutation.isPending || isLoading}>
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