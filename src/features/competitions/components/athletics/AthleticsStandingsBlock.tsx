// src/features/competitions/components/athletics/AthleticsStandingsBlock.tsx

import { Fragment, useMemo, useState } from "react";
import { Wind, Timer, Ruler, TrendingUp } from "lucide-react";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Phase } from "@/features/competitions/types";
import type {
  AthleticsRow,
  AthlSection,
  FieldRow,
  AttemptResult,
  FieldEventType,
} from "../../types/athletics.types";
import { FIELD_EVENT_CONFIG } from "../../types/athletics.types";
import {
  useAthleticsTrackTable,
  useAthleticsSections,
  useAthleticsFieldTable,
  useAthleticsClassification, 
  useOverrideRank,           
  useClassificationStatus,    
} from "../../api/athletics.queries";

// ── Constantes estables ───────────────────────────────────────────────────────

const EMPTY_TRACK_ROWS: AthleticsRow[] = [];
const EMPTY_SECTIONS: AthlSection[] = [];
const EMPTY_FIELD_ROWS: FieldRow[] = [];

// ── Race status ───────────────────────────────────────────────────────────────

type RaceStatus = "DNF" | "DNS" | "DQ" | null;

const STATUS_CONFIG: Record<
  NonNullable<RaceStatus>,
  { label: string; bg: string; text: string }
> = {
  DNF: { label: "DNF", bg: "bg-red-100", text: "text-red-700" },
  DNS: { label: "DNS", bg: "bg-slate-100", text: "text-slate-600" },
  DQ: { label: "DQ", bg: "bg-amber-100", text: "text-amber-700" },
};

const parseStatus = (notes: string | null | undefined): RaceStatus => {
  if (notes === "DNF" || notes === "DNS" || notes === "DQ") return notes;
  return null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseTimeMs = (time: string | null): number | null => {
  if (!time) return null;
  const parts = time.split(":").reverse();
  let ms = 0;
  const [secStr, minStr, hrStr] = parts;
  if (secStr) {
    const [sec, cs] = secStr.split(".");
    ms += parseInt(sec || "0") * 1000;
    ms += parseInt(((cs ?? "0") + "0").slice(0, 2)) * 10;
  }
  if (minStr) ms += parseInt(minStr) * 60_000;
  if (hrStr) ms += parseInt(hrStr) * 3_600_000;
  return ms;
};

const fmtDistance = (v: number | null) => (v != null ? `${v.toFixed(2)}m` : "—");

const getFieldEventTypeFromName = (phaseName: string): FieldEventType => {
  const n = phaseName.toLowerCase();
  if (n.includes("garrocha") || n.includes("pértiga")) return "pole_vault";
  if (n.includes("salto alto")) return "high_jump";
  if (n.includes("triple")) return "triple_jump";
  if (n.includes("salto largo")) return "long_jump";
  if (n.includes("bala")) return "shot_put";
  if (n.includes("disco")) return "discus";
  if (n.includes("jabalina")) return "javelin";
  if (n.includes("martillo")) return "hammer";
  return "long_jump";
};






// ── Badge de posición con colores de medalla ──────────────────────────────────

function PosBadge({ pos }: { pos: number }) {
  const cls =
    pos === 1
      ? "bg-yellow-400 text-yellow-900"
      : pos === 2
        ? "bg-slate-300 text-slate-700"
        : pos === 3
          ? "bg-orange-400 text-orange-900"
          : "bg-slate-100 text-slate-500";

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${cls}`}
    >
      {pos}
    </span>
  );
}

function EditablePosBadge({
  pos,
  phaseRegistrationId,
  phaseId,
}: {
  pos: number | null;
  phaseRegistrationId: number;
  phaseId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(pos ?? ""));
  const { mutate, isPending } = useOverrideRank(phaseId);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 1 && n !== pos) {
      mutate({ phaseRegistrationId, rankPosition: n });
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={1}
        className="w-12 rounded border border-orange-400 px-1 py-0.5 text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-300"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  return (
    <button
      title="Click para editar posición"
      disabled={isPending}
      onClick={() => {
        setDraft(String(pos ?? ""));
        setEditing(true);
      }}
      className="group relative"
    >
      {isPending ? (
        <span className="inline-flex h-6 w-6 items-center justify-center">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
        </span>
      ) : pos !== null ? (
        <PosBadge pos={pos} />
      ) : (
        <span className="text-slate-300 text-xs">—</span>
      )}
      <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
        Editar pos.
      </span>
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-24 items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>
  );
}

function InstitutionDisplay({
  institutionName,
  institutionLogo,
  compact = false,
  muted = false,
}: {
  institutionName?: string | null;
  institutionLogo?: string;
  compact?: boolean;
  muted?: boolean;
}) {
  const textClass = muted
    ? "text-slate-400"
    : compact
      ? "text-xs text-slate-500"
      : "text-sm text-slate-500";

  const imgClass = compact ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-2">
      {institutionLogo && (
        <img
          src={institutionLogo}
          alt={institutionName || "Institución"}
          className={`${imgClass} object-contain`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <span className={textClass}>{institutionName || "—"}</span>
    </div>
  );
}

// ── Sub-fila de miembro de equipo (Posta 4x) ──────────────────────────────────

function TeamMemberRow({ name, rol }: { name: string; rol: string }) {
  const rolColor =
    rol === "capitan"
      ? "bg-yellow-100 text-yellow-700"
      : rol === "suplente"
        ? "bg-slate-100 text-slate-500"
        : "bg-indigo-50 text-indigo-600";

  return (
    <tr className="bg-slate-50/60">
      <td />
      <td />
      <td className="px-4 py-1.5 pl-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">↳</span>
          <span className="text-xs font-medium text-slate-700">
            {name.toUpperCase()}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${rolColor}`}
          >
            {rol}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell" />
      <td />
    </tr>
  );
}

// ── Vista: PISTA (con soporte para Postas 4x) ─────────────────────────────────

function TrackView({ phaseId, isFinalized }: { phaseId: number; isFinalized: boolean }) {
  const { data: rows = EMPTY_TRACK_ROWS, isLoading: rowsLoading } =
    useAthleticsTrackTable(phaseId);
  const { data: sections = EMPTY_SECTIONS, isLoading: sectionsLoading } =
    useAthleticsSections(phaseId);

  const { data: classif = [] } = useAthleticsClassification(phaseId);
  const classifMap = useMemo(
    () => new Map(classif.map((c) => [c.phaseRegistrationId, c.rankPosition])),
    [classif],
  );


  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (rowsLoading || sectionsLoading) return <LoadingSpinner />;

  if (sections.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400 italic">
        Sin series registradas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const sectionRows = rows
          .filter((r) =>
            r.sections.some(
              (e) => e.athleticsSectionId === section.athleticsSectionId,
            ),
          )
          .map((r) => ({
            ...r,
            entry: r.sections.find(
              (e) => e.athleticsSectionId === section.athleticsSectionId,
            )!,
          }));

        const sorted = [...sectionRows].sort((a, b) => {
          const stA = parseStatus(a.entry.notes);
          const stB = parseStatus(b.entry.notes);
          const tA = parseTimeMs(a.entry.time);
          const tB = parseTimeMs(b.entry.time);
          if (!stA && tA !== null && !stB && tB !== null) return tA - tB;
          if (!stA && tA !== null) return -1;
          if (!stB && tB !== null) return 1;
          return 0;
        });

        let posCounter = 0;

        return (
          <div
            key={section.athleticsSectionId}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
              <span className="font-bold text-slate-900">{section.name}</span>
              <span className="text-xs text-slate-500">
                {sorted.length} participante{sorted.length !== 1 ? "s" : ""}
              </span>
              {section.wind !== null && (
                <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                  <Wind className="h-3.5 w-3.5" />
                  <span>
                    {section.wind > 0 ? "+" : ""}
                    {section.wind} m/s
                  </span>
                </div>
              )}
            </div>

            {sorted.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400 italic">
                Sin participantes asignados
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-10 px-3 py-2 text-center">Pos</th>
                    <th className="w-14 px-3 py-2 text-center">Carril</th>
                    <th className="px-4 py-2 text-center">Participante</th>
                    <th className="hidden px-4 py-2 text-center md:table-cell">
                      Institución
                    </th>
                    <th className="px-4 py-2 text-right">Tiempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((row) => {
                    const status = parseStatus(row.entry.notes);
                    const hasTime = !status && !!row.entry.time;
                    if (hasTime) posCounter += 1;
                    const pos = isFinalized
                        ? (classifMap.get(row.phaseRegistrationId) ?? null)
                        : hasTime
                        ? posCounter
                        : null;


                    const isOpen = expanded.has(row.phaseRegistrationId);
                    const hasMembers =
                      row.isTeam &&
                      Array.isArray(row.teamMembers) &&
                      (
                        row.teamMembers as Array<{
                          athleteId: number;
                          name: string;
                          rol: string;
                        }>
                      ).length > 0;

                    const institutionLogo = getImageUrl(row.institutionLogo);

                    return (
                      <Fragment key={row.phaseRegistrationId}>
                        <tr
                          className={
                            status
                              ? "bg-slate-50 opacity-60"
                              : hasMembers
                                ? "cursor-pointer transition-colors hover:bg-orange-50/40"
                                : "transition-colors hover:bg-slate-50"
                          }
                          onClick={
                            hasMembers
                              ? () => toggleExpanded(row.phaseRegistrationId)
                              : undefined
                          }
                        >
                          <td className="px-3 py-2.5 text-center">
                            {isFinalized ? (
                              <EditablePosBadge
                                pos={pos}
                                phaseRegistrationId={row.phaseRegistrationId}
                                phaseId={phaseId}
                              />
                            ) : pos !== null ? (
                              <PosBadge pos={pos} />
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>

                          <td className="px-3 py-2.5 text-center text-slate-500">
                            {row.entry.lane ?? (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {hasMembers && (
                                <span className="select-none text-xs text-slate-400">
                                  {isOpen ? "▼" : "▶"}
                                </span>
                              )}

                              <span className="font-semibold text-slate-900">
                                {row.athleteName.toUpperCase()}
                              </span>

                              {row.isTeam && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                                  4×
                                </span>
                              )}
                            </div>

                            <div className="mt-1 md:hidden">
                              <InstitutionDisplay
                                institutionName={row.institutionName}
                                institutionLogo={institutionLogo}
                                compact
                                muted={!!status}
                              />
                            </div>
                          </td>

                          <td className="hidden px-4 py-2.5 md:table-cell">
                            <InstitutionDisplay
                              institutionName={row.institutionName}
                              institutionLogo={institutionLogo}
                              muted={!!status}
                            />
                          </td>

                          <td className="px-4 py-2.5 text-right">
                            {status ? (
                              <span
                                className={`inline-flex rounded px-2 py-0.5 text-xs font-bold ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`}
                              >
                                {STATUS_CONFIG[status].label}
                              </span>
                            ) : row.entry.time ? (
                              <span className="font-mono font-semibold text-slate-800">
                                {row.entry.time}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>

                        {isOpen &&
                          hasMembers &&
                          (
                            row.teamMembers as Array<{
                              athleteId: number;
                              name: string;
                              rol: string;
                            }>
                          ).map((member) => (
                            <TeamMemberRow
                              key={member.athleteId}
                              name={member.name}
                              rol={member.rol}
                            />
                          ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Celda read-only de intento de distancia ───────────────────────────────────

function AttemptCellReadOnly({
  attempt,
  isBest,
  hasWind,
}: {
  attempt: AttemptResult | null;
  isBest: boolean;
  hasWind: boolean;
}) {
  if (!attempt) return <span className="text-slate-200 text-xs">—</span>;

  const status = parseStatus(attempt.notes);
  if (status) {
    return (
      <span
        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`}
      >
        {status}
      </span>
    );
  }

  if (!attempt.isValid) {
    return <span className="text-xs font-semibold text-red-500">FOUL</span>;
  }

  if (attempt.distanceValue === null) {
    return <span className="text-slate-200 text-xs">—</span>;
  }

  return (
    <div
      className={`inline-flex flex-col items-center rounded px-1.5 py-0.5 ${
        isBest ? "bg-green-50 ring-1 ring-green-300" : ""
      }`}
    >
      <span
        className={`font-mono text-xs ${
          isBest ? "font-bold text-green-700" : "text-slate-700"
        }`}
      >
        {fmtDistance(attempt.distanceValue)}
      </span>
      {hasWind && attempt.wind !== null && (
        <span className="text-[9px] text-slate-400">
          {attempt.wind > 0 ? "+" : ""}
          {attempt.wind}
        </span>
      )}
    </div>
  );
}

// ── Vista: DISTANCIA ──────────────────────────────────────────────────────────

function DistanceView({
  phaseId,
  eventType,
  isFinalized,
}: {
  phaseId: number;
  eventType: FieldEventType;
  isFinalized: boolean;
}) {
  const { data: rows = EMPTY_FIELD_ROWS, isLoading } =
    useAthleticsFieldTable(phaseId);

  const { data: classif = [] } = useAthleticsClassification(phaseId);
  const classifMap = useMemo(
    () => new Map(classif.map((c) => [c.phaseRegistrationId, c.rankPosition])),
    [classif],
  );


  const config = FIELD_EVENT_CONFIG[eventType];
  const { maxAttempts, hasWind } = config;

  const getBest = (attempts: AttemptResult[]): number | null => {
    const valid = attempts.filter(
      (a) => a.isValid && a.distanceValue != null && !parseStatus(a.notes),
    );
    return valid.length > 0
      ? Math.max(...valid.map((a) => a.distanceValue!))
      : null;
  };

  const getRowStatus = (row: FieldRow): RaceStatus => {
    if (row.attempts.length === 0) return null;
    const statuses = row.attempts.map((a) => parseStatus(a.notes));
    const first = statuses[0];
    if (!first) return null;
    return statuses.every((s) => s === first) ? first : null;
  };

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const bA = getBest(a.attempts);
      const bB = getBest(b.attempts);
      if (bA === null && bB === null) return 0;
      if (bA === null) return 1;
      if (bB === null) return -1;
      return bB - bA;
    });
  }, [rows]);

  if (isLoading) return <LoadingSpinner />;

  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400 italic">
        Sin atletas.
      </p>
    );
  }

  const attemptCols = Array.from({ length: maxAttempts }, (_, i) => i + 1);
  let posCounter = 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-10 px-3 py-2 text-center">Pos</th>
            <th className="px-4 py-2 text-center">Atleta</th>
            <th className="hidden px-4 py-2 text-center md:table-cell">
              Institución
            </th>
            {attemptCols.map((n) => (
              <th key={n} className="w-20 px-2 py-2 text-center">
                Int. {n}
              </th>
            ))}
            <th className="w-24 px-3 py-2 text-center font-bold text-orange-600">
              Mejor
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {sorted.map((row) => {
            const best = getBest(row.attempts);
            const rowStatus = getRowStatus(row);
            if (!isFinalized && best !== null) posCounter += 1;
            const pos = isFinalized
              ? (classifMap.get(row.phaseRegistrationId) ?? null)
              : best !== null
              ? posCounter
              : null;
            const institutionLogo = getImageUrl(row.institutionLogo);

            return (
              <tr
                key={row.phaseRegistrationId}
                className={
                  rowStatus
                    ? "opacity-60 bg-slate-50"
                    : "transition-colors hover:bg-slate-50"
                }
              >
                <td className="px-3 py-2.5 text-center">
                {isFinalized ? (
                  <EditablePosBadge
                    pos={pos}
                    phaseRegistrationId={row.phaseRegistrationId}
                    phaseId={phaseId}
                  />
                ) : pos !== null ? (
                  <PosBadge pos={pos} />
                ) : rowStatus ? (
                  <span
                    className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[rowStatus].bg} ${STATUS_CONFIG[rowStatus].text}`}
                  >
                    {rowStatus}
                  </span>
                ) : (
                  <span className="text-slate-300 text-xs">—</span>
                )}
              </td>

                <td className="px-4 py-2.5">
                  <div className="font-semibold text-slate-900">
                    {row.athleteName.toUpperCase()}
                  </div>
                  <div className="mt-1 md:hidden">
                    <InstitutionDisplay
                      institutionName={row.institutionName}
                      institutionLogo={institutionLogo}
                      compact
                      muted={!!rowStatus}
                    />
                  </div>
                </td>

                <td className="hidden px-4 py-2.5 md:table-cell">
                  <InstitutionDisplay
                    institutionName={row.institutionName}
                    institutionLogo={institutionLogo}
                    muted={!!rowStatus}
                  />
                </td>

                {attemptCols.map((n) => {
                  const attempt =
                    row.attempts.find((a) => a.attemptNumber === n) ?? null;
                  const isBest =
                    best !== null &&
                    attempt?.distanceValue === best &&
                    attempt?.isValid;

                  return (
                    <td key={n} className="px-2 py-2 text-center">
                      <AttemptCellReadOnly
                        attempt={attempt}
                        isBest={!!isBest}
                        hasWind={hasWind}
                      />
                    </td>
                  );
                })}

                <td className="px-3 py-2 text-center font-bold text-orange-600">
                  {fmtDistance(best)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Vista: ALTURA ─────────────────────────────────────────────────────────────

function HeightView({ phaseId, isFinalized }: { phaseId: number; isFinalized: boolean }) {

  const { data: rows = EMPTY_FIELD_ROWS, isLoading } =
    useAthleticsFieldTable(phaseId);

  
  
  const { data: classif = [] } = useAthleticsClassification(phaseId);
  const classifMap = useMemo(
    () => new Map(classif.map((c) => [c.phaseRegistrationId, c.rankPosition])),
    [classif],
  );


  const allHeights = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((row) =>
      row.attempts.forEach((a) => {
        if (a.height !== null) set.add(Number(a.height));
      }),
    );
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  const getBestHeight = (row: FieldRow): number | null => {
    const passed = row.attempts
      .filter((a) => a.heightResult === "O" && a.height !== null)
      .map((a) => Number(a.height));
    return passed.length > 0 ? Math.max(...passed) : null;
  };

  const getRowStatus = (row: FieldRow): RaceStatus => {
    if (row.attempts.length === 0) return null;
    const statuses = row.attempts.map((a) => parseStatus(a.notes));
    const first = statuses[0];
    if (!first) return null;
    return statuses.every((s) => s === first) ? first : null;
  };

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const bA = getBestHeight(a);
      const bB = getBestHeight(b);
      if (bA === null && bB === null) return 0;
      if (bA === null) return 1;
      if (bB === null) return -1;
      return bB - bA;
    });
  }, [rows]);

  const getSeq = (row: FieldRow, height: number): string => {
    return row.attempts
      .filter((a) => Number(a.height) === height)
      .sort((a, b) => (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0))
      .map((a) => a.heightResult ?? "?")
      .join("");
  };

  if (isLoading) return <LoadingSpinner />;

  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400 italic">
        Sin atletas.
      </p>
    );
  }

  let posCounter = 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-10 px-3 py-2 text-center">Pos</th>
            <th className="px-4 py-2 text-left">Atleta</th>
            <th className="hidden px-4 py-2 text-left md:table-cell">
              Institución
            </th>
            {allHeights.map((h) => (
              <th key={h} className="w-16 px-2 py-2 text-center font-mono">
                {h.toFixed(2)}m
              </th>
            ))}
            <th className="w-20 px-3 py-2 text-center font-bold text-orange-600">
              Mejor
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {sorted.map((row) => {
            const best = getBestHeight(row);
            const rowStatus = getRowStatus(row);
            if (best !== null) posCounter += 1;
            const pos = isFinalized
              ? (classifMap.get(row.phaseRegistrationId) ?? null)
              : best !== null
              ? posCounter
              : null;
            const institutionLogo = getImageUrl(row.institutionLogo);

            return (
              <tr
                key={row.phaseRegistrationId}
                className={
                  rowStatus
                    ? "opacity-60 bg-slate-50"
                    : "transition-colors hover:bg-slate-50"
                }
              >
                <td className="px-3 py-2.5 text-center">
                  {isFinalized ? (
                    <EditablePosBadge
                      pos={pos}
                      phaseRegistrationId={row.phaseRegistrationId}
                      phaseId={phaseId}
                    />
                  ) : pos !== null ? (
                    <PosBadge pos={pos} />
                  ) : rowStatus ? (
                    <span
                      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[rowStatus].bg} ${STATUS_CONFIG[rowStatus].text}`}
                    >
                      {rowStatus}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>

                <td className="px-4 py-2.5">
                  <div className="font-semibold text-slate-900">
                    {row.athleteName.toUpperCase()}
                  </div>
                  <div className="mt-1 md:hidden">
                    <InstitutionDisplay
                      institutionName={row.institutionName}
                      institutionLogo={institutionLogo}
                      compact
                      muted={!!rowStatus}
                    />
                  </div>
                </td>

                <td className="hidden px-4 py-2.5 md:table-cell">
                  <InstitutionDisplay
                    institutionName={row.institutionName}
                    institutionLogo={institutionLogo}
                    muted={!!rowStatus}
                  />
                </td>

                {allHeights.map((h) => {
                  const seq = getSeq(row, h);
                  const passed = seq.includes("O");
                  const allFail = seq.length > 0 && !passed && !seq.includes("-");
                  const skipped =
                    seq.length > 0 && seq.split("").every((c) => c === "-");
                  const isBestH = best !== null && h === best;

                  return (
                    <td key={h} className="px-2 py-2 text-center">
                      {seq ? (
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold tracking-wider ${
                            passed
                              ? isBestH
                                ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                                : "text-green-600"
                              : allFail
                                ? "text-red-500"
                                : skipped
                                  ? "text-slate-400"
                                  : "text-amber-600"
                          }`}
                        >
                          {seq}
                        </span>
                      ) : (
                        <span className="text-slate-200 text-xs">—</span>
                      )}
                    </td>
                  );
                })}

                <td className="px-3 py-2 text-center font-bold text-orange-600">
                  {best !== null ? `${best.toFixed(2)}m` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  phase: Phase;
}

export function AthleticsStandingsBlock({ phase }: Props) {
  const { data: statusData } = useClassificationStatus(phase.phaseId);
  const isFinalized = statusData?.isFinalized ?? false;
  const isTrack = phase.type === "combined_pista";
  const isDistance = phase.type === "combined_distancia";
  const isHeight = phase.type === "combined_altura";

  const eventType = isDistance ? getFieldEventTypeFromName(phase.name) : null;
  const config = eventType ? FIELD_EVENT_CONFIG[eventType] : null;

  const Icon = isTrack ? Timer : isDistance ? Ruler : TrendingUp;
  const typeLabel = isTrack
    ? "Pista"
    : isDistance
      ? (config?.label ?? "Distancia")
      : "Altura";
  const typeEmoji = isTrack ? "🏃" : isDistance ? "📏" : "📐";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
          <Icon className="h-5 w-5 text-orange-600" />
        </div>

        <div className="min-w-0">
          <h4 className="truncate font-bold text-slate-900">{phase.name}</h4>
          <span className="text-xs text-slate-500">
            {typeEmoji} {typeLabel}
          </span>
        </div>
      </div>

      {isTrack && <TrackView phaseId={phase.phaseId} isFinalized={isFinalized} />}
      {isDistance && eventType && (
        <DistanceView phaseId={phase.phaseId} eventType={eventType} isFinalized={isFinalized} />
      )}
      {isHeight && <HeightView phaseId={phase.phaseId} isFinalized={isFinalized} />}
    </div>
  );
}