// src/features/competitions/components/weightlifting/GenerateWeightliftingPhasesModal.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api/client';
import { AlertCircle, CheckSquare, Square } from 'lucide-react';
// 👇 Reutiliza la misma mutation de generación de fases de Kumite
import { useGenerateKumitePhases } from '../../api/judo-phases.mutations';

// ─── Tipos (iguales a GenerateKumitePhasesModal) ─────────────────────────────

interface NivCatCombo { idniv: string; idcat: string; total: number; }

interface WeightliftingAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
  weightClass: string; // 👈 extra vs KumiteAthlete
}

interface WeightliftingGroup {
  key: string;
  phaseName: string;
  idniv: string;
  idcat: string;
  athletes: WeightliftingAthlete[];
}

// ─── Helpers (idénticos a GenerateKumitePhasesModal) ─────────────────────────

function getNivLabel(idniv: string) {
  const n = idniv.toLowerCase();
  if (n.includes('novel')) return 'Nv';
  if (n.includes('avanzad')) return 'Az';
  return idniv.toUpperCase();
}

function getCatLabel(idcat: string) {
  const c = idcat.toLowerCase();
  if (c === 'm' || c.includes('mascul') || c.includes('varon')) return 'Varones';
  if (c === 'f' || c.includes('femen') || c.includes('dam')) return 'Damas';
  return idcat.toUpperCase();
}

function buildPhaseName(idniv: string, idcat: string, categoryName: string) {
  return `${getCatLabel(idcat)} ${getNivLabel(idniv)} ${categoryName}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GenerateWeightliftingPhasesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  allRegistrations: any[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GenerateWeightliftingPhasesModal({
  open, onClose, eventCategoryId, categoryName,
  sismasterEventId, sismasterSportId, allRegistrations,
}: GenerateWeightliftingPhasesModalProps) {

  // Reutiliza la misma mutation — el backend ya sabe crear fases por grupo
  const mutation = useGenerateKumitePhases();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  // ── Queries Sismaster (idénticas a GenerateKumitePhasesModal) ─────────────

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

  // ── Mapa de registrations con weightClass ─────────────────────────────────

  const regMap = useMemo(() => {
    const map = new Map<number, WeightliftingAthlete>();
    for (const reg of allRegistrations) {
      map.set(reg.registrationId, {
        registrationId: reg.registrationId,
        name: reg.athlete?.name ?? reg.team?.name ?? `Registro ${reg.registrationId}`,
        institution: reg.athlete?.institution?.name ?? null,
        weightClass: reg.weightClass ?? '', // 👈 viene del registration
      });
    }
    return map;
  }, [allRegistrations]);

  // ── Construir grupos iniciales ────────────────────────────────────────────

  const initialGroups = useMemo((): WeightliftingGroup[] => {
    if (!allQueriesDone) return [];
    const seenIds = new Set<number>();
    return combos
      .map((combo, idx) => {
        const ids = comboQueries[idx].data?.registrationIds ?? [];
        const athletes = ids
          .map((id) => regMap.get(id))
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

  // ── State ─────────────────────────────────────────────────────────────────

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
    if (hasSismaster && allQueriesDone && initialGroups.length > 0) {
      hasInitialized.current = true;
      setGroups(initialGroups);
      setSelectedGroupKeys(new Set(initialGroups.map((g) => g.key)));
    }
  }, [open, allQueriesDone, hasSismaster, initialGroups]);

  // ── Editar weightClass inline ─────────────────────────────────────────────

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

  // ── Selección de grupos ───────────────────────────────────────────────────

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

  // ── Generar ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    const validGroups = groups.filter((g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key));
    if (!validGroups.length) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        groups: validGroups.map((g) => ({
          name: g.phaseName,
          format: 'round_robin' as const, // pesas siempre es ranking, no bracket
          registrationIds: g.athletes.map((a) => a.registrationId),
          // Si tu backend soporta weightClasses por entrada, pasarlas aquí
          // entries: g.athletes.map((a) => ({ registrationId: a.registrationId, weightClass: a.weightClass || null }))
        })),
      });
      onClose();
    } catch (err: any) {
      console.error('Error generando fases pesas:', err?.response?.data);
    }
  };

  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter((g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key));
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);

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
            <span>Esta categoría no tiene Sismaster configurado.</span>
          </div>
        )}

        {!isLoading && groups.length > 0 && (
          <>
            {/* Barra seleccionar todas */}
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
                    {/* Header grupo */}
                    <div className="mb-3 flex items-start gap-2">
                      <button type="button"
                        onClick={() => toggleGroupSelection(group.key)}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                        {isGroupSelected
                          ? <CheckSquare size={16} className="text-blue-600" />
                          : <Square size={16} />}
                      </button>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">{group.phaseName}</h3>
                        <p className="text-xs text-slate-500">{group.athletes.length} atleta(s)</p>
                      </div>
                    </div>

                    {/* Tabla atletas + división */}
                    <div className="space-y-1.5">
                      {/* Sub-header columnas */}
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
                          {/* 👈 Input división editable inline */}
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

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {validGroups.length > 0
              ? <><p>{validGroups.length} fase(s) · {totalAthletes} atleta(s)</p></>
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