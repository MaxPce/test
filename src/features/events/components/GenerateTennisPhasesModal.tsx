// src/features/competitions/components/tennis/GenerateTennisPhasesModal.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api/client';
import {
  AlertCircle,
  ArrowRightLeft,
  Users,
  Swords,
  Trophy,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useGenerateTennisPhases } from '@/features/competitions/api/tennis-phases.mutations';
import type { TennisPhaseFormat } from '@/features/competitions/api/tennis-phases.api';


// ─── Tipos internos ───────────────────────────────────────────────────────────


interface NivCatCombo {
  idniv: string;
  idcat: string;
  total: number;
}


type ParticipantKind = 'individual' | 'doubles' | 'team';

// ── NUEVO ──
type GroupGender = 'M' | 'F' | 'mixed';
type GroupMode   = 'single' | 'by_gender';


interface TennisAthlete {
  registrationId: number;
  name: string;
  institution?: string | null;
  kind: ParticipantKind;
  memberCount?: number;
  members?: any[];       // ── NUEVO: integrantes del equipo/pareja
  gender?: GroupGender;  // ── NUEVO: género predominante del equipo
}


interface TennisPhaseGroup {
  key: string;
  phaseName: string;
  idniv: string;
  idcat: string;
  format: TennisPhaseFormat;
  athletes: TennisAthlete[];
}


// ─── Helpers ──────────────────────────────────────────────────────────────────


function getCatLabel(idcat: string): string {
  const c = idcat.toLowerCase().trim();
  if (c === 'm' || c.includes('mascul') || c.includes('varon')) return 'Varones';
  if (c === 'f' || c.includes('femen') || c.includes('dam')) return 'Damas';
  return idcat.toUpperCase();
}


function getNivLabel(idniv: string): string {
  const n = idniv.toLowerCase().trim();
  if (n.includes('novel')) return 'Nv';
  if (n.includes('avanzad')) return 'Az';
  return idniv.toUpperCase();
}


function buildPhaseName(idniv: string, idcat: string, categoryName: string): string {
  const catPart = getCatLabel(idcat);
  const nivPart = idniv ? ` ${getNivLabel(idniv)}` : '';
  return `${catPart}${nivPart} ${categoryName}`.trim();
}


function getParticipantKind(reg: any): ParticipantKind {
  if (!reg?.team) return 'individual';
  return (reg.team.members?.length ?? 0) === 2 ? 'doubles' : 'team';
}


function getParticipantName(reg: any): string {
  const kind = getParticipantKind(reg);
  if (kind === 'individual') return reg.athlete?.name ?? `Registro ${reg.registrationId}`;
  if (kind === 'doubles') {
    const m = reg.team?.members ?? [];
    const n1 = m[0]?.athlete?.name ?? '?';
    const n2 = m[1]?.athlete?.name ?? '?';
    return `${n1} / ${n2}`;
  }
  return reg.team?.name ?? `Equipo ${reg.registrationId}`;
}


function getParticipantInstitution(reg: any): string | null {
  return (
    reg.athlete?.institution?.name ??
    reg.team?.institution?.name ??
    null
  );
}


// ── NUEVO: género predominante del registro (equipo/pareja) ──
function getTeamGender(reg: any): GroupGender {
  const members: any[] = reg.team?.members ?? [];
  if (members.length === 0) {
    // individuo
    const g = reg.athlete?.gender ?? '';
    if (g === 'M') return 'M';
    if (g === 'F') return 'F';
    return 'mixed';
  }
  const genders = members.map((m) => m.athlete?.gender ?? '');
  const hasM = genders.some((g) => g === 'M');
  const hasF = genders.some((g) => g === 'F');
  if (hasM && hasF) return 'mixed';
  if (hasM) return 'M';
  if (hasF) return 'F';
  return 'mixed';
}


// ── NUEVO: dobles mixtos (2 miembros, un M y una F) — no se divide por género ──
function isMixedDoubles(reg: any): boolean {
  if ((reg.team?.members?.length ?? 0) !== 2) return false;
  return getTeamGender(reg) === 'mixed';
}


// ── NUEVO: construye grupos desde registros locales según el modo de agrupación ──
function buildGroupsFromRegistrations(
  regs: any[],
  mode: GroupMode,
  categoryName: string,
): TennisPhaseGroup[] {
  const toAthlete = (reg: any): TennisAthlete => ({
    registrationId: reg.registrationId,
    name: getParticipantName(reg),
    institution: getParticipantInstitution(reg),
    kind: getParticipantKind(reg),
    memberCount: reg.team?.members?.length,
    members: reg.team?.members ?? [],
    gender: getTeamGender(reg),
  });

  if (mode === 'single') {
    return [{
      key: 'tennis-phase-group',
      phaseName: categoryName,
      idniv: '', idcat: '',
      format: 'single_elimination' as TennisPhaseFormat,
      athletes: regs.map(toAthlete),
    }];
  }

  // by_gender
  const masc = regs.filter((r) => getTeamGender(r) === 'M');
  const fem  = regs.filter((r) => getTeamGender(r) === 'F');
  const mix  = regs.filter((r) => getTeamGender(r) === 'mixed');
  const result: TennisPhaseGroup[] = [];

  if (masc.length) result.push({
    key: 'group-M',
    phaseName: `${categoryName} — Masculino`,
    idniv: '', idcat: 'M',
    format: 'single_elimination' as TennisPhaseFormat,
    athletes: masc.map(toAthlete),
  });
  if (fem.length) result.push({
    key: 'group-F',
    phaseName: `${categoryName} — Femenino`,
    idniv: '', idcat: 'F',
    format: 'single_elimination' as TennisPhaseFormat,
    athletes: fem.map(toAthlete),
  });
  if (mix.length) result.push({
    key: 'group-mix',
    phaseName: `${categoryName} — Mixtos`,
    idniv: '', idcat: '',
    format: 'single_elimination' as TennisPhaseFormat,
    athletes: mix.map(toAthlete),
  });
  return result;
}


// ─── Opciones de formato ──────────────────────────────────────────────────────


const FORMAT_OPTIONS: {
  value: TennisPhaseFormat;
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
    label: 'Round Robin',
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


export interface GenerateTennisPhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  sismasterEventId?: number;
  sismasterSportId?: number;
  allRegistrations: any[];
}


// ─── Componente ───────────────────────────────────────────────────────────────


export function GenerateTennisPhasesModal({
  isOpen,
  onClose,
  eventCategoryId,
  categoryName,
  sismasterEventId,
  sismasterSportId,
  allRegistrations,
}: GenerateTennisPhasesModalProps) {

  const mutation = useGenerateTennisPhases();
  const hasSismaster = Boolean(sismasterEventId && sismasterSportId);

  // ── NUEVO: estado de modo de agrupación ──
  const [groupMode, setGroupMode] = useState<GroupMode>('single');


  // ── Consulta combos niv/cat desde Sismaster ─────────────────────────────────
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
    enabled: hasSismaster && isOpen,
    staleTime: 1000 * 60 * 5,
  });


  const combos = combosData?.combos ?? [];


  // ── Consulta registrationIds por combo ─────────────────────────────────────
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
        const { data } = await apiClient.get('/sismaster/athletes/registrations-by-niv-cat', {
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
      enabled: hasSismaster && isOpen && combos.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });


  const loadingCombosData = comboQueries.some((q) => q.isLoading);
  const allQueriesDone =
    !loadingCombos &&
    combosData !== undefined &&
    (combos.length === 0 || comboQueries.every((q) => q.isSuccess));


  // ── Mapa de atletas registrados ─────────────────────────────────────────────
  const regMap = useMemo(() => {
    const map = new Map<number, TennisAthlete>();
    for (const reg of allRegistrations) {
      const kind = getParticipantKind(reg);
      map.set(reg.registrationId, {
        registrationId: reg.registrationId,
        name: getParticipantName(reg),
        institution: getParticipantInstitution(reg),
        kind,
        memberCount: reg.team?.members?.length,
        members: reg.team?.members ?? [],   // ── NUEVO
        gender: getTeamGender(reg),         // ── NUEVO
      });
    }
    return map;
  }, [allRegistrations]);


  // ── Grupos desde Sismaster ──────────────────────────────────────────────────
  const initialGroups = useMemo((): TennisPhaseGroup[] => {
    if (!allQueriesDone) return [];
    const seenIds = new Set<number>();
    return combos
      .map((combo, idx) => {
        const ids = comboQueries[idx].data?.registrationIds ?? [];
        const athletes = ids
          .map((id) => regMap.get(id))
          .filter((a): a is TennisAthlete => {
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
          format: 'single_elimination' as TennisPhaseFormat,
          athletes,
        };
      })
      .filter((g) => g.athletes.length > 0)
      .sort((a, b) => {
        const catOrder = (c: string) =>
          c.toLowerCase().includes('f') || c.toLowerCase().includes('dam') ? 1 : 0;
        const nivOrder = (n: string) => (n.toLowerCase().includes('novel') ? 1 : 0);
        if (catOrder(a.idcat) !== catOrder(b.idcat)) return catOrder(a.idcat) - catOrder(b.idcat);
        return nivOrder(a.idniv) - nivOrder(b.idniv);
      });
  }, [allQueriesDone, combos, comboQueries, regMap, categoryName]);


  // ── Grupo fallback sin Sismaster ────────────────────────────────────────────
  const fallbackGroup = useMemo((): TennisPhaseGroup[] => {
    if (hasSismaster || !isOpen) return [];
    // ── NUEVO: usa buildGroupsFromRegistrations respetando el groupMode ──
    const groups = buildGroupsFromRegistrations(allRegistrations, groupMode, categoryName);
    return groups;
  }, [hasSismaster, isOpen, allRegistrations, categoryName, groupMode]);


  const canSplitByGender = useMemo(() => {
    if (allRegistrations.length === 0) return false;
    const eligible = allRegistrations.filter((reg) => !isMixedDoubles(reg));
    console.log('[canSplitByGender] eligible:', eligible.length,
      '| genders:', eligible.map(r => `${r.team?.name ?? r.registrationId}:${getTeamGender(r)}`));
    const hasM = eligible.some((reg) => getTeamGender(reg) === 'M');
    const hasF = eligible.some((reg) => getTeamGender(reg) === 'F');
    return hasM && hasF;
  }, [allRegistrations]);


  // ── Estado local ────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<TennisPhaseGroup[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [sourceGroupKey, setSourceGroupKey] = useState<string | null>(null);


  const hasInitialized = useRef(false);
  const prevOpenRef = useRef(false);
  const initialGroupsRef = useRef<TennisPhaseGroup[]>([]);
  initialGroupsRef.current = initialGroups;


  useEffect(() => {
    // Reset al cerrar
    if (!isOpen && prevOpenRef.current) {
      hasInitialized.current = false;
      setGroups([]);
      setSelectedGroupKeys(new Set());
      setSelectedRegId(null);
      setSourceGroupKey(null);
      setGroupMode('single'); // ── NUEVO: reset del modo
    }
    prevOpenRef.current = isOpen;
    if (!isOpen || hasInitialized.current) return;

    // ── Path Sismaster: esperar que terminen TODAS las queries ──
    if (hasSismaster) {
      if (!allQueriesDone) return;

      const g = initialGroupsRef.current;
      if (g.length > 0) {
        hasInitialized.current = true;
        setGroups(g);
        setSelectedGroupKeys(new Set(g.map((grp) => grp.key)));
      } else {
        // Sismaster sin resultados → fallback local con registros
        // ── NUEVO: usa buildGroupsFromRegistrations ──
        const built = buildGroupsFromRegistrations(allRegistrations, 'single', categoryName);
        if (built.length > 0 && built[0].athletes.length > 0) {
          hasInitialized.current = true;
          setGroups(built);
          setSelectedGroupKeys(new Set(built.map((g) => g.key)));
        }
      }
      return;
    }

    // ── Path sin Sismaster ──
    if (fallbackGroup.length > 0) {
      hasInitialized.current = true;
      setGroups(fallbackGroup);
      setSelectedGroupKeys(new Set(fallbackGroup.map((g) => g.key)));
    }
  }, [isOpen, allQueriesDone, hasSismaster, fallbackGroup, allRegistrations, categoryName]);


  // ── NUEVO: cuando cambia groupMode en path no-sismaster, reconstruir grupos ──
  useEffect(() => {
    if (!isOpen || hasSismaster || !hasInitialized.current) return;
    const built = buildGroupsFromRegistrations(allRegistrations, groupMode, categoryName);
    setGroups(built);
    setSelectedGroupKeys(new Set(built.map((g) => g.key)));
    setSelectedRegId(null);
    setSourceGroupKey(null);
  }, [groupMode]); // eslint-disable-line react-hooks/exhaustive-deps


  // ── Handlers ────────────────────────────────────────────────────────────────
  const setGroupFormat = (key: string, format: TennisPhaseFormat) => {
    setGroups((prev) => prev.map((g) => (g.key === key ? { ...g, format } : g)));
  };


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
      (g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key),
    );
    if (!validGroups.length) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        payload: {
          groups: validGroups.map((g) => ({
            name: g.phaseName,
            format: g.format,
            registrationIds: g.athletes.map((a) => a.registrationId),
          })),
        },
      });
      onClose();
    } catch (err: any) {
      console.error('Error generando fases de tennis:', err?.response?.data);
    }
  };


  // ── Derivados ───────────────────────────────────────────────────────────────
  const isLoading = loadingCombos || loadingCombosData;
  const validGroups = groups.filter(
    (g) => g.athletes.length > 0 && selectedGroupKeys.has(g.key),
  );
  const totalAthletes = validGroups.reduce((acc, g) => acc + g.athletes.length, 0);
  const canMoveAthletes = groups.length > 1;

  // ── NUEVO: etiqueta del toggle de agrupación ──
  const kindLabel = allRegistrations.every((r) => getParticipantKind(r) === 'team')
    ? 'Equipos'
    : allRegistrations.every((r) => getParticipantKind(r) === 'doubles')
      ? 'Dobles'
      : 'Participantes';


  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generar Fases — ${categoryName}`} size="xl">
      <div className="space-y-4">


        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Spinner size="md" />
            <span className="text-sm">Cargando grupos desde Sismaster...</span>
          </div>
        )}


        {!hasSismaster && !isLoading && groups.length === 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Esta categoría no tiene Sismaster configurado. Se usarán todos los atletas
              registrados como un único grupo.
            </span>
          </div>
        )}


        {combosError && !isLoading && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No se pudieron cargar los grupos. Verifica la conexión con Sismaster.</span>
          </div>
        )}


        {hasSismaster && !isLoading && !combosError && allQueriesDone &&
          groups.length === 0 && allRegistrations.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No se encontraron atletas inscritos con nivel/categoría en Sismaster.
            </p>
          )}


        {!isLoading && groups.length > 0 && (
          <>
            {/* ── Toggle de agrupación — aparece tanto en path sismaster como local ── */}
            {canSplitByGender && groups.length > 0 && !isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-500 mr-1">Agrupar por:</span>
                <button
                  type="button"
                  onClick={() => {
                    setGroupMode('single');
                    const built = buildGroupsFromRegistrations(allRegistrations, 'single', categoryName);
                    setGroups(built);
                    setSelectedGroupKeys(new Set(built.map((g) => g.key)));
                  }}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    groupMode === 'single'
                      ? 'border-slate-700 bg-slate-700 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  ].join(' ')}
                >
                  {kindLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroupMode('by_gender');
                    const built = buildGroupsFromRegistrations(allRegistrations, 'by_gender', categoryName);
                    setGroups(built);
                    setSelectedGroupKeys(new Set(built.map((g) => g.key)));
                  }}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    groupMode === 'by_gender'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  ].join(' ')}
                >
                  ♂ Masculino / ♀ Femenino
                </button>
              </div>
            )}

            {/* Barra de selección global */}
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


            {/* Grid de grupos */}
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
                      'rounded-xl border-2 p-4 transition-all',
                      isTarget
                        ? 'cursor-pointer border-blue-400 bg-blue-50 hover:shadow-md'
                        : isGroupSelected
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-200 bg-slate-50 opacity-60',
                    ].join(' ')}
                  >
                    <div className="mb-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
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
                              {group.athletes.length} participante(s)
                            </p>
                          </div>
                        </div>
                        {isTarget && (
                          <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Mover aquí
                          </span>
                        )}
                      </div>


                      {/* Selector de formato por grupo */}
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
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    {/* Badge de tipo */}
                                    {athlete.kind === 'doubles' && (
                                      <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                        Dobles
                                      </span>
                                    )}
                                    {athlete.kind === 'team' && (
                                      <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                        Equipo {athlete.memberCount ? `(${athlete.memberCount})` : ''}
                                      </span>
                                    )}
                                    <p className="truncate text-sm font-medium text-slate-800">
                                      {athlete.name}
                                    </p>
                                  </div>
                                  {athlete.institution && (
                                    <p className="truncate text-xs text-slate-500">
                                      {athlete.institution}
                                    </p>
                                  )}

                                  {/* ── NUEVO: lista de integrantes del equipo/pareja ── */}
                                  {(athlete.kind === 'team' || athlete.kind === 'doubles') &&
                                    athlete.members && athlete.members.length > 0 && (
                                    <div className="mt-1.5 space-y-0.5 pl-1 border-l-2 border-slate-200">
                                      {athlete.members.map((m: any) => (
                                        <div key={m.tmId} className="flex items-center gap-1.5">
                                          {/* Badge de género del atleta */}
                                          <span className={[
                                            'shrink-0 rounded-sm px-1 text-[9px] font-bold leading-4',
                                            m.athlete?.gender === 'M'
                                              ? 'bg-blue-100 text-blue-700'
                                              : m.athlete?.gender === 'F'
                                                ? 'bg-pink-100 text-pink-700'
                                                : 'bg-slate-100 text-slate-500',
                                          ].join(' ')}>
                                            {m.athlete?.gender === 'M' ? '♂' : m.athlete?.gender === 'F' ? '♀' : '?'}
                                          </span>
                                          <span className="truncate text-[11px] text-slate-600">
                                            {m.athlete?.name ?? '—'}
                                          </span>
                                          {m.rol && m.rol !== 'titular' && (
                                            <span className="shrink-0 text-[9px] text-slate-400 italic">
                                              {m.rol}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
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
                    ? `${validGroups.length} de ${groups.length} fase(s) seleccionada(s)`
                    : 'Ninguna fase seleccionada'}
                </p>
                {validGroups.length > 0 && (
                  <p className="text-slate-500">
                    {totalAthletes} participante(s) en las fases seleccionadas
                  </p>
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