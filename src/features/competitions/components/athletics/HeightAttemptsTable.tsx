import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, UserMinus, X } from "lucide-react";
import type { FieldRow, AttemptResult } from "../../types/athletics.types";
import {
  useAthleticsFieldTable,
  FIELD_TABLE_KEY,
} from "../../api/athletics.queries";
import {
  createAttempt,
  updateAttempt,
  deleteAttempt,
} from "../../api/athletics.api";
import { apiClient } from "@/lib/api/client";

interface Props {
  phaseId: number;
}

type HeightResult = "O" | "X" | "-";
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

/**
 * Un atleta tiene status si TODOS sus intentos tienen el mismo status en notes
 * y ninguno tiene una altura válida (heightResult === "O").
 * Si no tiene intentos, no tiene status.
 */
const parseRowStatus = (attempts: AttemptResult[]): RaceStatus => {
  if (attempts.length === 0) return null;
  const hasValidHeight = attempts.some((a) => a.heightResult === "O");
  if (hasValidHeight) return null;
  const statuses = attempts.map((a) => parseStatus(a.notes));
  const first = statuses[0];
  if (!first) return null;
  return statuses.every((s) => s === first) ? first : null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getBestHeight = (attempts: AttemptResult[]): number | null => {
  const passed = attempts
    .filter((a) => a.heightResult === "O" && a.height != null)
    .map((a) => Number(a.height));
  return passed.length > 0 ? Math.max(...passed) : null;
};

const resultLabel: Record<HeightResult, string> = {
  O: "Pasó",
  X: "Falló",
  "-": "Pasó por alto",
};

// ── Fila de atleta ─────────────────────────────────────────────────────────

interface AthleteRowProps {
  row: FieldRow;
  onAddAttempt: (
    phaseRegistrationId: number,
    height: number,
    result: HeightResult,
  ) => Promise<void>;
  onDeleteAttempt: (athleticsResultId: number) => Promise<void>;
  onRemoveParticipant: (
    phaseRegistrationId: number,
    athleteName: string,
  ) => Promise<void>;
  onSetStatus: (
    phaseRegistrationId: number,
    status: NonNullable<RaceStatus>,
  ) => Promise<void>;
  onClearStatus: (phaseRegistrationId: number) => Promise<void>;
}

function AthleteRow({
  row,
  onAddAttempt,
  onDeleteAttempt,
  onRemoveParticipant,
  onSetStatus,
  onClearStatus,
}: AthleteRowProps) {
  const [adding, setAdding] = useState(false);
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<HeightResult>("O");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const best = getBestHeight(row.attempts);
  const status = parseRowStatus(row.attempts);

  const sortedAttempts = [...row.attempts].sort(
    (a, b) =>
      Number(a.height ?? 0) - Number(b.height ?? 0) ||
      (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0),
  );

  const handleSave = async () => {
    const h = parseFloat(height);
    if (!h || h <= 0) {
      toast.error("Ingresa una altura válida");
      return;
    }
    setSaving(true);
    try {
      await onAddAttempt(row.phaseRegistrationId, h, result);
      setHeight("");
      setResult("O");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemoveParticipant(row.phaseRegistrationId, row.athleteName);
    } finally {
      setRemoving(false);
    }
  };

  const handleSetStatus = async (s: NonNullable<RaceStatus>) => {
    setStatusOpen(false);
    setStatusSaving(true);
    try {
      await onSetStatus(row.phaseRegistrationId, s);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleClearStatus = async () => {
    setStatusSaving(true);
    try {
      await onClearStatus(row.phaseRegistrationId);
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm space-y-3 ${
        status ? "border-slate-300 opacity-80" : "border-slate-200"
      }`}
    >
      {/* Cabecera atleta */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-900">{row.athleteName}</p>
          <p className="text-xs text-slate-400">{row.institutionName || "—"}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge status activo */}
          {status && (
            <button
              type="button"
              onClick={handleClearStatus}
              disabled={statusSaving}
              title="Click para quitar el status"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-opacity hover:opacity-75 disabled:opacity-40 ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`}
            >
              {STATUS_CONFIG[status].label}
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Mejor marca */}
          {!status && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Mejor</p>
              <p className="text-lg font-bold text-orange-600">
                {best != null ? `${best.toFixed(2)}m` : "—"}
              </p>
            </div>
          )}

          {/* Dropdown DNF / DNS / DQ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusOpen((v) => !v)}
              disabled={statusSaving}
              title="Asignar DNF / DNS / DQ"
              className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-colors disabled:opacity-40 ${
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
                <div className="absolute right-0 top-8 z-20 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {(
                    Object.keys(STATUS_CONFIG) as NonNullable<RaceStatus>[]
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSetStatus(s)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all hover:scale-105 ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text}`}
                    >
                      {s}
                    </button>
                  ))}
                  {status && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusOpen(false);
                        handleClearStatus();
                      }}
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

          {/* Quitar participante */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            title="Quitar participante de la fase"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            <UserMinus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Si tiene status activo, no mostrar intentos ni formulario */}
      {status ? (
        <p className="text-xs text-slate-400 italic">
          Sin intentos — atleta marcado como {status}
        </p>
      ) : (
        <>
          {/* Lista de intentos agrupados por altura */}
          {sortedAttempts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(
                sortedAttempts.reduce((map, a) => {
                  const key = Number(a.height ?? 0).toFixed(2);
                  if (!map.has(key)) map.set(key, []);
                  map.get(key)!.push(a);
                  return map;
                }, new Map<string, AttemptResult[]>()),
              )
                .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                .map(([heightKey, attempts]) => {
                  const summary = attempts
                    .sort(
                      (a, b) => (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0),
                    )
                    .map((a) => a.heightResult ?? "?")
                    .join("");

                  const passed = attempts.some((a) => a.heightResult === "O");
                  const allSkip = attempts.every((a) => a.heightResult === "-");
                  const allFail = attempts.every((a) => a.heightResult === "X");

                  const chipClass = passed
                    ? "bg-green-50 text-green-700 ring-1 ring-green-300"
                    : allFail
                      ? "bg-red-100 text-red-700"
                      : allSkip
                        ? "bg-slate-100 text-slate-400"
                        : "bg-amber-50 text-amber-700";

                  return (
                    <div
                      key={heightKey}
                      className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${chipClass}`}
                    >
                      <span className="font-mono text-[11px] opacity-60">
                        {heightKey}m
                      </span>
                      <span className="font-bold font-mono tracking-wider">
                        {summary}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const last = [...attempts].sort(
                            (a, b) =>
                              (b.attemptNumber ?? 0) - (a.attemptNumber ?? 0),
                          )[0];
                          if (last?.athleticsResultId)
                            onDeleteAttempt(last.athleticsResultId);
                        }}
                        className="ml-0.5 hidden rounded p-0.5 text-current opacity-60 hover:opacity-100 group-hover:block"
                        title="Eliminar último intento de esta altura"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Sin saltos registrados
            </p>
          )}

          {/* Formulario agregar salto */}
          {adding ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2.5">
              <div className="flex items-center gap-1">
                <label className="text-xs text-slate-500">Altura (m)</label>
                <input
                  autoFocus
                  type="number"
                  step="0.01"
                  min="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="1.75"
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm font-mono focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                {(["O", "X", "-"] as HeightResult[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResult(r)}
                    title={resultLabel[r]}
                    className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${
                      result === r
                        ? r === "O"
                          ? "bg-green-500 text-white shadow"
                          : r === "X"
                            ? "bg-red-500 text-white shadow"
                            : "bg-slate-500 text-white shadow"
                        : "bg-white text-slate-400 border border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setHeight("");
                  setResult("O");
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 rounded-lg border border-dashed border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar salto
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function HeightAttemptsTable({ phaseId }: Props) {
  const queryClient = useQueryClient();
  const { data: rawRows = EMPTY_ROWS, isLoading } =
    useAthleticsFieldTable(phaseId);

  const [rows, setRows] = useState<FieldRow[]>([]);

  useEffect(() => {
    setRows(rawRows);
  }, [rawRows]);

  const handleAddAttempt = async (
    phaseRegistrationId: number,
    height: number,
    result: HeightResult,
  ) => {
    const row = rows.find(
      (r) => r.phaseRegistrationId === phaseRegistrationId,
    )!;
    const attemptsAtHeight = row.attempts.filter(
      (a) => Number(a.height) === height,
    ).length;
    await createAttempt({
      phaseRegistrationId,
      attemptNumber: attemptsAtHeight + 1,
      height,
      heightResult: result,
      isValid: result === "O",
    });
    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });
    toast.success(`Salto registrado: ${height.toFixed(2)}m ${result}`);
  };

  const handleDeleteAttempt = async (athleticsResultId: number) => {
    if (!confirm("¿Eliminar este intento?")) return;
    await deleteAttempt(athleticsResultId);
    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });

    toast.success("Intento eliminado");
  };

  /**
   * Aplica el status a todos los intentos existentes del atleta.
   * Si no tiene intentos, crea uno marcador (height: null) para persistir el status.
   */
  const handleSetStatus = async (
    phaseRegistrationId: number,
    status: NonNullable<RaceStatus>,
  ) => {
    const row = rows.find(
      (r) => r.phaseRegistrationId === phaseRegistrationId,
    )!;

    if (row.attempts.length > 0) {
      await Promise.all(
        row.attempts.map((a) =>
          a.athleticsResultId
            ? updateAttempt(a.athleticsResultId, {
                isValid: false,
                notes: status,
              })
            : Promise.resolve(),
        ),
      );
    } else {
      // Sin intentos: crea un marcador para que el status quede guardado
      await createAttempt({
        phaseRegistrationId,
        attemptNumber: 1,
        height: null,
        heightResult: null,
        isValid: false,
        notes: status,
      });
    }

    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });

    toast.success(`${status} aplicado`);
  };

  /**
   * Quita el status: si solo había un intento marcador (sin altura real),
   * lo elimina; si había intentos reales, les quita el notes.
   */
  const handleClearStatus = async (phaseRegistrationId: number) => {
    const row = rows.find(
      (r) => r.phaseRegistrationId === phaseRegistrationId,
    )!;
    const markerOnly =
      row.attempts.length === 1 && row.attempts[0].height == null;

    if (markerOnly) {
      const id = row.attempts[0].athleticsResultId;
      if (id) await deleteAttempt(id);
    } else {
      await Promise.all(
        row.attempts.map((a) =>
          a.athleticsResultId
            ? updateAttempt(a.athleticsResultId, { notes: null })
            : Promise.resolve(),
        ),
      );
    }

    await queryClient.invalidateQueries({ queryKey: FIELD_TABLE_KEY(phaseId) });

    toast.success("Status eliminado");
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

  return (
    <div className="space-y-3">
      {/* Leyenda */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-green-100 text-green-700 font-bold">
            O
          </span>
          Pasó
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-red-100 text-red-600 font-bold">
            X
          </span>
          Falló
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-slate-100 text-slate-500 font-bold">
            -
          </span>
          Pasó por alto
        </span>
      </div>

      {rows.map((row) => (
        <AthleteRow
          key={row.phaseRegistrationId}
          row={row}
          onAddAttempt={handleAddAttempt}
          onDeleteAttempt={handleDeleteAttempt}
          onRemoveParticipant={handleRemoveParticipant}
          onSetStatus={handleSetStatus}
          onClearStatus={handleClearStatus}
        />
      ))}
    </div>
  );
}
