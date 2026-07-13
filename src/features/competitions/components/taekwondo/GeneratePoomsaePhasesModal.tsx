// src/features/competitions/components/taekwondo/GeneratePoomsaePhasesModal.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api/client';
import { AlertCircle, ArrowRightLeft, CheckSquare, Square, Users, Trophy } from 'lucide-react';
import { useGeneratePoomsaePhases } from '../../api/taekwondo-poomsae-phases.mutations';


// ─── Tipos internos ───────────────────────────────────────────────────────────


type PhaseType = 'grupo' | 'eliminacion';


interface PoomsaeAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
}


interface PoomsaeGroup {
  key: string;
  phaseName: string;
  idniv: string;
  idcat: string;
  athletes: PoomsaeAthlete[];
}


interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────


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


// ─── Props ────────────────────────────────────────────────────────────────────


export interface GeneratePoomsaePhasesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  allRegistrations: any[];
}


// ─── Componente ───────────────────────────────────────────────────────────────


export function GeneratePoomsaePhasesModal({
  open,
  onClose,
  eventCategoryId,
  categoryName,
  sismasterEventId,
  sismasterSportId,
  allRegistrations,
}: GeneratePoomsaePhasesModalProps) {
  const mutation = useGeneratePoomsaePhases();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);


  // ── Carga combos niv/cat ──────────────────────────────────────────────────


  const { data: combosData, isLoading: loadingCombos, error: combosError } =
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


  // ── Carga registrationIds por combo ──────────────────────────────────────


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


  // ── Mapa registrationId → atleta ─────────────────────────────────────────


  const regMap = useMemo(() => {
    const map = new Map<number, PoomsaeAthlete>();
    for (const reg of allRegistrations) {
      map.set(reg.registrationId, {
        registrationId: reg.registrationId,
        name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
        institution: reg.athlete?.institution?.name ?? reg.team?.institution?.name ?? null,
      });
    }
    return map;
  }, [allRegistrations]);


  // ── Grupos iniciales ──────────────────────────────────────────────────────


  const initialGroups = useMemo((): PoomsaeGroup[] => {
    if (!allQueriesDone) return [];
    const seenIds = new Set<number>();
    return combos
      .map((combo, idx) => {
        const ids = comboQueries[idx].data?.registrationIds ?? [];
        const athletes = ids
          .map((id) => regMap.get(id))
          .filter((a): a is PoomsaeAthlete => {
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
          athletes,
        };
      })
      .filter((g) => g.athletes.length > 0);
  }, [allQueriesDone, combos, comboQueries, regMap, categoryName]);


  // ── State ─────────────────────────────────────────────────────────────────


  const [groups, setGroups] = useState<PoomsaeGroup[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  // Tipo de fase por grupo: key → 'grupo' | 'eliminacion'
  const [phaseTypes, setPhaseTypes] = useState<Record<string, PhaseType>>({});
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [sourceGroupKey, setSourceGroupKey] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const prevOpenRef = useRef(false);
  const initialGroupsRef = useRef<PoomsaeGroup[]>([]);
  initialGroupsRef.current = initialGroups;

  useEffect(() => {
    if (!open && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedGroupKeys(new Set());
      setPhaseTypes({});
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
        setSelectedGroupKeys(new Set(g.map((grp) => grp.key)));
        // Por defecto todas las fases son de tipo "grupo"
        const defaultTypes: Record<string, PhaseType> = {};
        g.forEach((grp) => { defaultTypes[grp.key] = 'grupo'; });
        setPhaseTypes(defaultTypes);
      }
    }
  }, [open, allQueriesDone, hasSismaster]);


  // ── Selección de grupos ───────────────────────────────────────────────────


  const toggleGroupSelection = (key: string) => {
    setSelectedGroupKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const allSelected = groups.length > 0 && groups.every((g) => selectedGroupKeys.has(g.key));
  const toggleSelectAll = () => {
    allSelected
      ? setSelectedGroupKeys(new Set())
      : setSelectedGroupKeys(new Set(groups.map((g) => g.key)));
  };


  // ── Cambio de tipo de fase ────────────────────────────────────────────────


  const setPhaseType = (key: string, type: PhaseType) => {
    setPhaseTypes((prev) => ({ ...prev, [key]: type }));
  };


  // ── Mover atletas entre grupos ────────────────────────────────────────────


  const handleSelectAthlete = (groupKey: string, registrationId: number) => {
    if (selectedRegId === registrationId && sourceGroupKey === groupKey) {
      setSelectedRegId(null); setSourceGroupKey(null); return;
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
    setSelectedRegId(null); setSourceGroupKey(null);
  };


  // ── Generar fases ─────────────────────────────────────────────────────────


  const handleGenerate = async () => {
    const validGroups = groups.filter((g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key));
    if (!validGroups.length) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        groups: validGroups.map((g) => ({
          name: g.phaseName,
          type: phaseTypes[g.key] ?? 'grupo',
          registrationIds: g.athletes.map((a) => a.registrationId),
        })),
      });
      onClose();
    } catch (_err) { /* toast manejado en mutation */ }
  };


  // ── Derivados ─────────────────────────────────────────────────────────────


  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter((g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key));
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);
  const canMoveAthletes = groups.length > 1;
  const grupoCount = validGroups.filter((g) => (phaseTypes[g.key] ?? 'grupo') === 'grupo').length;
  const eliminacionCount = validGroups.filter((g) => phaseTypes[g.key] === 'eliminacion').length;


  // ─────────────────────────────────────────────────────────────────────────


  return (
    <Modal isOpen={open} onClose={onClose} title={`Generar Fases Poomsae — ${categoryName}`} size="xl">
      <div className="space-y-4">

        {/* Banner informativo */}
        {!isLoading && groups.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <span className="mt-0.5 shrink-0">🥋</span>
            <span>
              Selecciona el <strong>tipo de fase</strong> para cada grupo:{' '}
              <strong>Grupos</strong> genera una tabla de puntajes individual,{' '}
              <strong>Eliminación</strong> genera un bracket de llaves.
            </span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Spinner size="md" />
            <span className="text-sm">Cargando grupos desde Sismaster...</span>
          </div>
        )}

        {!hasSismaster && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Esta categoría no tiene Sismaster configurado.</span>
          </div>
        )}

        {combosError && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No se pudieron cargar los grupos desde Sismaster.</span>
          </div>
        )}

        {hasSismaster && !isLoading && !combosError && allQueriesDone && groups.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No se encontraron atletas en Sismaster para esta categoría.
          </p>
        )}

        {!isLoading && groups.length > 0 && (
          <>
            {/* Barra seleccionar todas */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-600">
                {selectedGroupKeys.size} de {groups.length} fase(s) seleccionada(s)
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                {allSelected
                  ? <CheckSquare size={14} className="text-blue-600" />
                  : <Square size={14} className="text-slate-400" />}
                {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>

            <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              {groups.map((group) => {
                const isGroupSelected = selectedGroupKeys.has(group.key);
                const currentType = phaseTypes[group.key] ?? 'grupo';
                const isTarget = canMoveAthletes && selectedRegId !== null && sourceGroupKey !== null && sourceGroupKey !== group.key;

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
                          : 'border-slate-200 bg-slate-50 opacity-60',
                    ].join(' ')}
                  >
                    {/* Header: checkbox + nombre */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleGroupSelection(group.key); }}
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {isGroupSelected
                            ? <CheckSquare size={16} className="text-blue-600" />
                            : <Square size={16} />}
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

                    {/* ── Selector de tipo de fase ── */}
                    <div
                      className="mb-3 grid grid-cols-2 gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setPhaseType(group.key, 'grupo')}
                        className={[
                          'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                          currentType === 'grupo'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200',
                        ].join(' ')}
                      >
                        <Users className="h-3.5 w-3.5" />
                        Grupos
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhaseType(group.key, 'eliminacion')}
                        className={[
                          'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                          currentType === 'eliminacion'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200',
                        ].join(' ')}
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        Eliminación
                      </button>
                    </div>

                    {/* Badge descriptivo del tipo seleccionado */}
                    <div className="mb-3">
                      {currentType === 'grupo' ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          Tabla de puntajes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                          Bracket de llaves
                        </span>
                      )}
                    </div>

                    {/* Lista de atletas */}
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
            {validGroups.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                <p>{validGroups.length} de {groups.length} fase(s) seleccionada(s)</p>
                <p className="text-slate-500">
                  {totalAthletes} atleta(s)
                  {grupoCount > 0 && ` · ${grupoCount} grupo(s)`}
                  {eliminacionCount > 0 && ` · ${eliminacionCount} eliminación`}
                </p>
              </div>
            ) : (
              <p>Ninguna fase seleccionada</p>
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