import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wind, UserMinus, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils/imageUrl"; // ← NUEVO
import type {
  FieldRow,
  AttemptResult,
  FieldEventType,
} from "../../types/athletics.types";
import { FIELD_EVENT_CONFIG } from "../../types/athletics.types";
import {
  useAthleticsFieldTable,
  useClassificationStatus,
  FIELD_TABLE_KEY,
} from "../../api/athletics.queries";

import FinalizePhaseBar from "./FinalizePhaseBar";

import {
  createAttempt,
  updateAttempt,
  deleteAttempt,
} from "../../api/athletics.api";
import { apiClient } from "@/lib/api/client";

interface Props {
  phaseId: number;
  eventType: FieldEventType;
}

const EMPTY_ROWS: FieldRow[] = [];

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

const getBest = (attempts: AttemptResult[]): number | null => {
  const valid = attempts.filter((a) => a.isValid && a.distanceValue != null);
  if (valid.length === 0) return null;
  return Math.max(...valid.map((a) => a.distanceValue!));
};

const fmtDistance = (v: number | null) =>
  v != null ? `${v.toFixed(2)}m` : "—";

// ── Celda editable ────────────────────────────────────────────────────────────

interface AttemptCellProps {
  attempt: AttemptResult | null;
  hasWind: boolean;
  isBest: boolean;
  onSave: (
    value: number | null,
    isValid: boolean,
    wind: number | null,
    notes: string | null,
  ) => Promise<void>;
  onSetStatusAll: (status: NonNullable<RaceStatus>) => Promise<void>;
}

function AttemptCell({
  attempt,
  hasWind,
  isBest,
  onSave,
  onSetStatusAll,
}: AttemptCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [wind, setWind] = useState("");
  const [isFoul, setIsFoul] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const status = parseStatus(attempt?.notes);

  useEffect(() => {
    if (editing) {
      setValue(attempt?.distanceValue?.toString() ?? "");
      setWind(attempt?.wind?.toString() ?? "");
      setIsFoul(attempt != null && !attempt.isValid && !status);
    }
  }, [editing, attempt, status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dist = isFoul ? null : value ? Number(value) : null;
      const w = wind ? Number(wind) : null;
      await onSave(dist, !isFoul, w, null);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSetStatus = async (s: RaceStatus) => {
    setStatusOpen(false);
    if (!s) return;
    setSaving(true);
    try {
      await onSetStatusAll(s);
    } finally {
      setSaving(false);
    }
  };

  const handleClearStatus = async () => {
    setSaving(true);
    try {
      await onSave(null, true, null, null);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1 p-1">
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            step="0.01"
            value={isFoul ? "" : value}
            disabled={isFoul}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="w-20 rounded border border-slate-300 px-1.5 py-0.5 font-mono text-xs disabled:bg-slate-100 focus:border-orange-400 focus:outline-none"
          />
          <label className="flex cursor-pointer items-center gap-1 text-xs text-red-500">
            <input
              type="checkbox"
              checked={isFoul}
              onChange={(e) => setIsFoul(e.target.checked)}
              className="accent-red-500"
            />
            FOUL
          </label>
        </div>
        {hasWind && (
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3 text-slate-400" />
            <input
              type="number"
              step="0.1"
              value={wind}
              onChange={(e) => setWind(e.target.value)}
              placeholder="0.0"
              className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-xs focus:border-orange-400 focus:outline-none"
            />
            <span className="text-xs text-slate-400">m/s</span>
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "..." : "✓"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-300"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = attempt == null;
  const isFoulAttempt = attempt != null && !attempt.isValid && !status;

  return (
    <div className="flex items-center justify-center gap-0.5">
      {status ? (
        <button
          type="button"
          onClick={handleClearStatus}
          disabled={saving}
          title="Click para quitar el status"
          className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-bold transition-opacity hover:opacity-75 disabled:opacity-40 ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`}
        >
          {STATUS_CONFIG[status].label}
          <X className="h-3 w-3" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`group relative w-full min-w-[72px] rounded px-2 py-1.5 text-center text-xs transition-all hover:ring-2 hover:ring-orange-300 ${
            isBest
              ? "bg-green-50 font-bold text-green-700 ring-1 ring-green-300"
              : isFoulAttempt
                ? "bg-red-50 font-semibold text-red-600"
                : isEmpty
                  ? "bg-slate-50 text-slate-300"
                  : "bg-white font-mono text-slate-800"
          }`}
        >
          {isEmpty ? (
            <span className="opacity-0 group-hover:opacity-100 text-orange-400">
              +
            </span>
          ) : isFoulAttempt ? (
            "FOUL"
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span>{fmtDistance(attempt.distanceValue)}</span>
              {hasWind && attempt.wind != null && (
                <span className="text-[10px] font-normal text-slate-400">
                  {attempt.wind > 0 ? "+" : ""}
                  {attempt.wind}
                </span>
              )}
            </div>
          )}
        </button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusOpen((v) => !v)}
          disabled={saving}
          title="Asignar DNF / DNS / DQ"
          className={`rounded px-1 py-1 text-[10px] font-bold transition-colors disabled:opacity-40 ${
            status
              ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`
              : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
          }`}
        >
          {status ?? "···"}
        </button>

        {statusOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setStatusOpen(false)}
            />
            <div className="absolute right-0 top-7 z-20 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {(Object.keys(STATUS_CONFIG) as NonNullable<RaceStatus>[]).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSetStatus(s)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all hover:scale-105 ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text}`}
                  >
                    {s}
                  </button>
                ),
              )}
              {status && (
                <button
                  type="button"
                  onClick={() => handleSetStatus(null)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
                  title="Quitar status"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DistanceAttemptsTable({ phaseId, eventType }: Props) {
  const queryClient = useQueryClient();
  const config = FIELD_EVENT_CONFIG[eventType];
  const { maxAttempts, hasWind } = config;

  const { data: rawRows = EMPTY_ROWS, isLoading } =
    useAthleticsFieldTable(phaseId);

  const { data: classificationStatus } = useClassificationStatus(phaseId);
  const phaseFinalized = classificationStatus?.isFinalized ?? false;


  const [rows, setRows] = useState<FieldRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setRows(rawRows);
  }, [rawRows]);

  const handleSaveAttempt = async (
    row: FieldRow,
    attemptNumber: number,
    distanceValue: number | null,
    isValid: boolean,
    wind: number | null,
    notes: string | null,
  ) => {
    const existing = row.attempts.find(
      (a) => a.attemptNumber === attemptNumber,
    );
    if (existing?.athleticsResultId) {
      await updateAttempt(existing.athleticsResultId, {
        distanceValue,
        isValid,
        wind,
        notes,
      });
    } else {
      await createAttempt({
        phaseRegistrationId: row.phaseRegistrationId,
        attemptNumber,
        distanceValue,
        isValid,
        wind,
        notes,
      });
    }
    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });
    toast.success("Intento guardado");
  };

  const handleSetStatusAll = async (
    row: FieldRow,
    status: NonNullable<RaceStatus>,
  ) => {
    await Promise.all(
      Array.from({ length: maxAttempts }, (_, i) => i + 1).map((n) => {
        const existing = row.attempts.find((a) => a.attemptNumber === n);
        if (existing?.athleticsResultId) {
          return updateAttempt(existing.athleticsResultId, {
            distanceValue: null,
            isValid: false,
            wind: null,
            notes: status,
          });
        }
        return createAttempt({
          phaseRegistrationId: row.phaseRegistrationId,
          attemptNumber: n,
          distanceValue: null,
          isValid: false,
          wind: null,
          notes: status,
        });
      }),
    );
    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });
    toast.success(`${status} aplicado a todos los intentos`);
  };

  const handleRemoveParticipant = async (
    phaseRegistrationId: number,
    athleteName: string,
  ) => {
    if (
      !confirm(
        `¿Quitar a "${athleteName}" de esta fase? Se eliminarán todos sus intentos.`,
      )
    )
      return;

    const row = rows.find((r) => r.phaseRegistrationId === phaseRegistrationId);
    if (row && row.attempts.length > 0) {
      await Promise.all(
        row.attempts
          .filter((a) => a.athleticsResultId != null)
          .map((a) => deleteAttempt(a.athleticsResultId!)),
      );
    }

    await apiClient.delete(
      `/competitions/phase-registrations/${phaseRegistrationId}`,
    );
    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });
    toast.success(`"${athleteName}" quitado de la fase`);
  };

  const filteredRows = rows.filter((row) =>
    row.athleteName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(
        searchQuery
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      )
  );

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No hay atletas en esta fase.
      </div>
    );
  }

  const attemptCols = Array.from({ length: maxAttempts }, (_, i) => i + 1);

  return (
    <div className="space-y-3">

      {/* Barra de finalizar */}
      <div className="flex justify-end">
        <FinalizePhaseBar phaseId={phaseId} />
      </div>

      {/* Buscador por atleta */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar atleta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg
                      bg-white placeholder-slate-400 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                      transition"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Limpiar
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {filteredRows.length} atleta{filteredRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${phaseFinalized ? "pointer-events-none opacity-60" : ""}`}>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Atleta</th>
              <th className="hidden px-4 py-2 text-left md:table-cell">
                Institución
              </th>
              {attemptCols.map((n) => (
                <th key={n} className="w-24 px-2 py-2 text-center">
                  Int. {n}
                </th>
              ))}
              <th className="w-24 px-3 py-2 text-center font-bold text-orange-600">
                Mejor
              </th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + maxAttempts}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  No se encontró ningún atleta con &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const best = getBest(row.attempts);
                return (
                  <tr
                    key={row.phaseRegistrationId}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-2 font-semibold text-slate-900">
                      {row.athleteName.toUpperCase()}
                    </td>
                    <td className="hidden px-4 py-2 md:table-cell">
                      <div className="flex items-center gap-2">
                        {row.institutionLogo && (
                          <img
                            src={getImageUrl(row.institutionLogo)}
                            alt={row.institutionName || ""}
                            className="h-5 w-5 flex-shrink-0 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <span className="text-slate-500">
                          {row.institutionName || "—"}
                        </span>
                      </div>
                    </td>
                    {attemptCols.map((n) => {
                      const attempt =
                        row.attempts.find((a) => a.attemptNumber === n) ?? null;
                      const isBest =
                        best != null &&
                        attempt?.distanceValue === best &&
                        attempt?.isValid;
                      return (
                        <td key={n} className="px-1 py-1.5 text-center">
                          <AttemptCell
                            attempt={attempt}
                            hasWind={hasWind}
                            isBest={!!isBest}
                            onSave={(dist, valid, wind, notes) =>
                              handleSaveAttempt(row, n, dist, valid, wind, notes)
                            }
                            onSetStatusAll={(status) =>
                              handleSetStatusAll(row, status)
                            }
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-bold text-orange-600">
                      {fmtDistance(best)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {!phaseFinalized && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveParticipant(
                              row.phaseRegistrationId,
                              row.athleteName,
                            )
                          }
                          title="Quitar de la fase"
                          className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
