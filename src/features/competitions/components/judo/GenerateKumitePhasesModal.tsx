// src/features/competitions/components/judo/GenerateKumitePhasesModal.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api/client';
import { AlertCircle, ArrowRightLeft, Users, Swords, Trophy } from 'lucide-react';
import { useGenerateKumitePhases } from '../../api/judo-phases.mutations';
import type { KumitePhaseFormat } from '../../api/judo-phases.api';

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface NivCatCombo {
  idniv: string; // "NOVELES" | "AVANZADOS" (viene de Sismaster)
  idcat: string; // "M" | "F"
  total: number;
}

interface KumiteAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
}

interface KumiteGroup {
  key: string;             // "NOVELES-M"
  phaseName: string;       // "Varones Nv -60kg"
  idniv: string;
  idcat: string;
  format: KumitePhaseFormat;
  athletes: KumiteAthlete[];
}

// ─── Helpers de labels ────────────────────────────────────────────────────────

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
  // Resultado: "Varones Az -60kg" | "Damas Nv -72kg"
  return `${getCatLabel(idcat)} ${getNivLabel(idniv)} ${categoryName}`;
}

// ─── Opciones de formato ──────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GenerateKumitePhasesModalProps {
  open: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;       // Ej: "-60kg" — se usa en el nombre de la fase
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

  // ── Step 1: Cargar combos niv/cat desde Sismaster ─────────────────────────
  const {
    data: combosData,
    isLoading: loadingCombos,
    error: combosError,
  } = useQuery<{ combos: NivCatCombo[] }>({
    queryKey: [
      'sismaster-niv-cat-options',
      sismasterEventId,
      sismasterSportId,
      eventCategoryId,
    ],
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

  // ── Step 2: Cargar registrationIds por combo en paralelo ──────────────────
  const comboQueries = useQueries({
    queries: combos.map((combo) => ({
      queryKey: [
        'sismaster-registrations-niv-cat',
        sismasterEventId,
        sismasterSportId,
        eventCategoryId,
        combo.idniv,
        combo.idcat,
      ],
      queryFn: async (): Promise<{ registrationIds: number[] }> => {
        const { data } = await apiClient.get(
          '/sismaster/athletes/registrations-by-niv-cat',
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

  // ── Mapa local registrationId → KumiteAthlete ─────────────────────────────
  const regMap = useMemo(() => {
    const map = new Map<number, KumiteAthlete>();
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

  // ── Step 3: Construir grupos iniciales ────────────────────────────────────
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
          format: 'single_elimination' as KumitePhaseFormat, // default
          athletes,
        };
      })
      .filter((g) => g.athletes.length > 0)
      // Orden: Varones primero, luego Damas; Avanzados antes que Noveles
      .sort((a, b) => {
        const catOrder = (c: string) =>
          c.toLowerCase().includes('f') || c.toLowerCase().includes('dam') ? 1 : 0;
        const nivOrder = (n: string) =>
          n.toLowerCase().includes('novel') ? 1 : 0;
        if (catOrder(a.idcat) !== catOrder(b.idcat))
          return catOrder(a.idcat) - catOrder(b.idcat);
        return nivOrder(a.idniv) - nivOrder(b.idniv);
      });
  }, [allQueriesDone, combos, comboQueries, regMap, categoryName]);

  // ── Estado editable ───────────────────────────────────────────────────────
  const [groups, setGroups] = useState<KumiteGroup[]>([]);
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
      }
    }
  }, [open, allQueriesDone, hasSismaster]);

  // ── Cambiar formato de un grupo ───────────────────────────────────────────
  const setGroupFormat = (key: string, format: KumitePhaseFormat) => {
    setGroups((prev) =>
      prev.map((g) => (g.key === key ? { ...g, format } : g)),
    );
  };

  // ── Mover atleta entre grupos ─────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter((g) => g.athletes.length > 0);
  const totalAthletes = validGroups.reduce(
    (acc, g) => acc + g.athletes.length,
    0,
  );
  const canMoveAthletes = groups.length > 1;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Generar Fases — ${categoryName}`}
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

        {/* Sin Sismaster configurado */}
        {!hasSismaster && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Esta categoría no tiene Sismaster configurado. Verifica la
              integración con Sismaster.
            </span>
          </div>
        )}

        {/* Error Sismaster */}
        {combosError && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              No se pudieron cargar los grupos. Verifica la conexión con
              Sismaster.
            </span>
          </div>
        )}

        {/* Sin atletas encontrados */}
        {hasSismaster &&
          !isLoading &&
          !combosError &&
          allQueriesDone &&
          groups.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No se encontraron atletas inscritos con nivel/categoría en
              Sismaster para esta categoría.
            </p>
          )}

        {/* Grid de grupos */}
        {!isLoading && groups.length > 0 && (
          <>
            

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
                      'rounded-xl border-2 p-4 transition-all',
                      isTarget
                        ? 'cursor-pointer border-blue-400 bg-blue-50 hover:shadow-md'
                        : 'border-slate-200 bg-white',
                    ].join(' ')}
                  >
                    {/* Cabecera del grupo */}
                    <div className="mb-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold leading-tight text-slate-800">
                            {group.phaseName}
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

                      {/* Selector de formato */}
                      <div className="flex flex-wrap gap-1.5">
                        {FORMAT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGroupFormat(group.key, opt.value);
                            }}
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
                                if (canMoveAthletes) {
                                  handleSelectAthlete(
                                    group.key,
                                    athlete.registrationId,
                                  );
                                }
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
            {validGroups.length > 0 && (
              <>
                <p>{validGroups.length} fase(s) a crear</p>
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
                ? 'Generando...'
                : `Generar ${validGroups.length} fase(s)`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}