import { useState, useCallback } from "react";
import { Trophy, Pencil, Check, X } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useWeightliftingPhaseResults } from "../../api/weightlifting.queries";
import { useSetManualRanks } from "../../api/manual-ranks.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { WeightliftingAthleteResult } from "../../api/weightlifting.api";
import type { UpdatePositionEntry } from "../../api/weightlifting.api";
import { useUpdateWeightliftingPositions } from "../../api/weightlifting.mutations";

interface Props {
  phaseId: number;
  phaseName: string;
}

// ── Tipos locales para edición ────────────────────────────────────────────────
type EditablePositions = Map<
  number, // participationId
  { snatchPosition: string; cnjPosition: string; totalPosition: string }
>;

// ── calcLugares ───────────────────────────────────────────────────────────────
function calcLugares(
  athletes: WeightliftingAthleteResult[],
  editMode: boolean,
  editPositions: EditablePositions,
): Map<number, { snatchLugar: number | null; cnjLugar: number | null; totalLugar: number | null }> {
  const map = new Map<number, { snatchLugar: number | null; cnjLugar: number | null; totalLugar: number | null }>();

  if (editMode) {
    for (const r of athletes) {
      const id = r.participation.participationId;
      const ep = editPositions.get(id);
      map.set(id, {
        snatchLugar: ep?.snatchPosition ? Number(ep.snatchPosition) : null,
        cnjLugar: ep?.cnjPosition ? Number(ep.cnjPosition) : null,
        totalLugar: ep?.totalPosition ? Number(ep.totalPosition) : null,
      });
    }
    return map;
  }

  const bySnatch = [...athletes]
    .filter((r) => r.bestSnatch !== null)
    .sort((a, b) => (b.bestSnatch ?? 0) - (a.bestSnatch ?? 0));
  const byCnj = [...athletes]
    .filter((r) => r.bestCleanAndJerk !== null)
    .sort((a, b) => (b.bestCleanAndJerk ?? 0) - (a.bestCleanAndJerk ?? 0));
  const byTotal = [...athletes]
    .filter((r) => r.total !== null)
    .sort((a, b) => {
      if (b.total !== a.total) return (b.total ?? 0) - (a.total ?? 0);
      return (a.totalAchievedAtAttempt ?? 99) - (b.totalAchievedAtAttempt ?? 99);
    });

  for (const r of athletes) {
    const id = r.participation.participationId;
    const snatchLugar = bySnatch.findIndex((x) => x.participation.participationId === id);
    const cnjLugar = byCnj.findIndex((x) => x.participation.participationId === id);
    const totalLugar = byTotal.findIndex((x) => x.participation.participationId === id);
    map.set(id, {
      snatchLugar: snatchLugar >= 0 ? snatchLugar + 1 : null,
      cnjLugar: cnjLugar >= 0 ? cnjLugar + 1 : null,
      totalLugar: totalLugar >= 0 ? totalLugar + 1 : null,
    });
  }
  return map;
}

// ── Helpers de estilo ─────────────────────────────────────────────────────────
const lugarStyle = (lugar: number | null) => {
  if (lugar === 1) return "bg-yellow-400 text-white font-bold";
  if (lugar === 2) return "bg-slate-300 text-slate-700 font-bold";
  if (lugar === 3) return "bg-orange-300 text-white font-bold";
  if (lugar !== null) return "bg-slate-100 text-slate-600";
  return "text-slate-300";
};

function groupByDivision(
  results: WeightliftingAthleteResult[],
): Map<string, WeightliftingAthleteResult[]> {
  const groups = new Map<string, WeightliftingAthleteResult[]>();
  for (const r of results) {
    const div = r.participation?.registration?.weightClass ?? "";
    if (!groups.has(div)) groups.set(div, []);
    groups.get(div)!.push(r);
  }
  return groups;
}

// ── Celda de lugar: normal o editable ────���───────────────────────────────────
function LugarCell({
  lugar,
  editMode,
  value,
  onChange,
  borderClass,
}: {
  lugar: number | null;
  editMode: boolean;
  value: string;
  onChange: (v: string) => void;
  borderClass: string;
}) {
  if (editMode) {
    return (
      <td className={`px-2 py-2 text-center ${borderClass}`}>
        <input
          type="number"
          min={1}
          max={99}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 text-center text-xs border border-slate-300 rounded-md px-1 py-1
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="—"
        />
      </td>
    );
  }

  return (
    <td className={`px-2 py-3 text-center ${borderClass}`}>
      {lugar !== null ? (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${lugarStyle(lugar)}`}
        >
          {lugar}
        </span>
      ) : (
        <span className="text-slate-200 text-xs">—</span>
      )}
    </td>
  );
}

// ── TableHead ─────────────────────────────────────────────────────────────────
function TableHead() {
  return (
    <thead>
      <tr className="bg-slate-50 border-b-2 border-slate-200">
        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 w-10">Seed</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 min-w-[180px]">Atleta</th>
        <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-x border-blue-200">ARRANQUE</th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-r border-blue-100">Mejor</th>
        <th className="px-2 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-r border-blue-200">Lugar</th>
        <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-x border-purple-200">ENVIÓN</th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-r border-purple-100">Mejor</th>
        <th className="px-2 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-r border-purple-200">Lugar</th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-slate-900 bg-yellow-50 w-16">TOTAL</th>
        <th className="px-2 py-3 text-center text-xs font-semibold text-slate-900 bg-yellow-50 w-14">Lugar</th>
      </tr>
      <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400">
        <th /><th />
        <th className="py-1 text-center font-normal border-r border-slate-100">1°</th>
        <th className="py-1 text-center font-normal border-r border-slate-100">2°</th>
        <th className="py-1 text-center font-normal border-r border-blue-200">3°</th>
        <th className="border-r border-blue-100" />
        <th className="border-r border-blue-200" />
        <th className="py-1 text-center font-normal border-r border-slate-100">1°</th>
        <th className="py-1 text-center font-normal border-r border-slate-100">2°</th>
        <th className="py-1 text-center font-normal border-r border-purple-200">3°</th>
        <th className="border-r border-purple-100" />
        <th className="border-r border-purple-200" />
        <th /><th />
      </tr>
    </thead>
  );
}

// ── Fila de atleta ────────────────────────────────────────────────────────────
function AthleteRow({
  result,
  lugares,
  editMode,
  editValues,
  onEditChange,
}: {
  result: WeightliftingAthleteResult;
  lugares: { snatchLugar: number | null; cnjLugar: number | null; totalLugar: number | null };
  editMode: boolean;
  editValues: { snatchPosition: string; cnjPosition: string; totalPosition: string };
  onEditChange: (field: "snatchPosition" | "cnjPosition" | "totalPosition", value: string) => void;
}) {
  const name = result.participation?.registration?.athlete?.name ?? "Sin nombre";
  const institution = result.participation?.registration?.athlete?.institution ?? null;
  const logoUrl = institution?.logoUrl;
  const seedNumber = result.participation?.registration?.seedNumber ?? null;

  return (
    <tr className={`border-b border-slate-100 transition-colors ${editMode ? "bg-blue-50/30" : "hover:bg-slate-50"}`}>
      <td className="px-3 py-3 text-center">
        <span className="text-sm font-semibold text-slate-500">{seedNumber ?? "—"}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img
              src={getImageUrl(logoUrl)}
              alt={institution?.name ?? ""}
              className="h-7 w-7 rounded-md object-contain bg-white border border-slate-100 p-0.5 flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div>
            <p className="font-semibold text-slate-900 text-sm">{name}</p>
            {institution && <p className="text-xs text-slate-400">{institution.name}</p>}
          </div>
        </div>
      </td>
      {[1, 2, 3].map((num) => (
        <AttemptCell
          key={`s${num}`}
          attempt={result.snatchAttempts?.find((a) => a.attemptNumber === num)}
        />
      ))}
      <td className="px-3 py-3 text-center border-r border-blue-100">
        <span className={`font-bold text-sm ${result.bestSnatch ? "text-blue-700" : "text-slate-300"}`}>
          {result.bestSnatch ?? "—"}
        </span>
      </td>
      <LugarCell
        lugar={lugares.snatchLugar}
        editMode={editMode}
        value={editValues.snatchPosition}
        onChange={(v) => onEditChange("snatchPosition", v)}
        borderClass="border-r border-blue-200"
      />
      {[1, 2, 3].map((num) => (
        <AttemptCell
          key={`c${num}`}
          attempt={result.cleanAndJerkAttempts?.find((a) => a.attemptNumber === num)}
        />
      ))}
      <td className="px-3 py-3 text-center border-r border-purple-100">
        <span className={`font-bold text-sm ${result.bestCleanAndJerk ? "text-purple-700" : "text-slate-300"}`}>
          {result.bestCleanAndJerk ?? "—"}
        </span>
      </td>
      <LugarCell
        lugar={lugares.cnjLugar}
        editMode={editMode}
        value={editValues.cnjPosition}
        onChange={(v) => onEditChange("cnjPosition", v)}
        borderClass="border-r border-purple-200"
      />
      <td className="px-3 py-3 text-center bg-yellow-50/50">
        <span className={`font-bold text-base ${result.total ? "text-slate-900" : "text-slate-300"}`}>
          {result.total ?? "—"}
        </span>
      </td>
      <LugarCell
        lugar={lugares.totalLugar}
        editMode={editMode}
        value={editValues.totalPosition}
        onChange={(v) => onEditChange("totalPosition", v)}
        borderClass=""
      />
    </tr>
  );
}

// ── DivisionTable ─────────────────────────────────────────────────────────────
function DivisionTable({
  athletes,
  editMode,
  editPositions,
  onEditChange,
}: {
  athletes: WeightliftingAthleteResult[];
  editMode: boolean;
  editPositions: EditablePositions;
  onEditChange: (
    participationId: number,
    field: "snatchPosition" | "cnjPosition" | "totalPosition",
    value: string,
  ) => void;
}) {
  const lugares = calcLugares(athletes, editMode, editPositions);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <TableHead />
        <tbody>
          {athletes.map((result) => {
            const id = result.participation.participationId;
            const ep = editPositions.get(id) ?? {
              snatchPosition: "",
              cnjPosition: "",
              totalPosition: "",
            };
            const lug = lugares.get(id) ?? {
              snatchLugar: null,
              cnjLugar: null,
              totalLugar: null,
            };
            return (
              <AthleteRow
                key={id}
                result={result}
                lugares={lug}
                editMode={editMode}
                editValues={ep}
                onEditChange={(field, value) => onEditChange(id, field, value)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function WeightliftingResultsTable({ phaseId, phaseName }: Props) {
  const { data: results = [], isLoading } = useWeightliftingPhaseResults(phaseId);
  const updatePositions = useUpdateWeightliftingPositions(phaseId);

  const [editMode, setEditMode] = useState(false);
  const [editPositions, setEditPositions] = useState<EditablePositions>(new Map());

  const hasDivisions = results.some((r) => r.participation?.registration?.weightClass);
  const groups = groupByDivision(results);

  // ✅ Bug 1 corregido: usar manualSnatchRank / manualCleanAndJerkRank / manualTotalRank
  const enterEditMode = useCallback(() => {
    const initial: EditablePositions = new Map();
    for (const r of results) {
      const id = r.participation.participationId;
      initial.set(id, {
        snatchPosition: String(r.manualSnatchRank ?? ""),
        cnjPosition: String(r.manualCleanAndJerkRank ?? ""),
        totalPosition: String(r.manualTotalRank ?? ""),
      });
    }
    setEditPositions(initial);
    setEditMode(true);
  }, [results]);

  const cancelEdit = () => {
    setEditMode(false);
    setEditPositions(new Map());
  };

  // ✅ Bug 2 y 3 corregidos: usar results + editPositions (por participationId),
  //    y mapear registrationId para el payload del backend
  const savePositions = async () => {
    const payload: UpdatePositionEntry[] = results
      .map((r) => {
        const regId = r.participation.registration?.registrationId;
        if (regId == null) return null;
        const ep = editPositions.get(r.participation.participationId);
        return {
          registrationId: regId,
          snatchRank: ep?.snatchPosition !== "" && ep?.snatchPosition != null
            ? Number(ep.snatchPosition)
            : null,
          cleanAndJerkRank: ep?.cnjPosition !== "" && ep?.cnjPosition != null
            ? Number(ep.cnjPosition)
            : null,
          totalRank: ep?.totalPosition !== "" && ep?.totalPosition != null
            ? Number(ep.totalPosition)
            : null,
        };
      })
      .filter((e): e is UpdatePositionEntry => e !== null);

    await updatePositions.mutateAsync(payload);
    setEditMode(false);
  };

  const handleEditChange = useCallback(
    (
      participationId: number,
      field: "snatchPosition" | "cnjPosition" | "totalPosition",
      value: string,
    ) => {
      setEditPositions((prev) => {
        const next = new Map(prev);
        const current = next.get(participationId) ?? {
          snatchPosition: "",
          cnjPosition: "",
          totalPosition: "",
        };
        next.set(participationId, { ...current, [field]: value });
        return next;
      });
    },
    [],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">{phaseName}</h4>
              {hasDivisions && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {groups.size} divisiones · lugar calculado por división
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary">{results.length} atletas</Badge>
            {!editMode ? (
              <button
                onClick={enterEditMode}
                disabled={isLoading || results.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                           bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar posiciones
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
                <button
                  onClick={savePositions}
                  disabled={updatePositions.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-blue-600 text-white hover:bg-blue-700 transition-colors
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updatePositions.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Guardar
                </button>
              </div>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Pencil className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              Modo edición activo — modifica los lugares de cada atleta y presiona{" "}
              <span className="font-bold">Guardar</span>
            </p>
          </div>
        )}
      </CardHeader>

      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12 gap-3">
            <Spinner size="md" />
            <span className="text-slate-500 text-sm">Cargando resultados...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay resultados aún</p>
          </div>
        ) : hasDivisions ? (
          <div className="divide-y divide-slate-200">
            {Array.from(groups.entries()).map(([div, athletes]) => (
              <div key={div}>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-700">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    {div ? `División ${div} kg` : "Sin división"}
                  </span>
                  <span className="text-xs text-slate-300">
                    — {athletes.length} atleta{athletes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <DivisionTable
                  athletes={athletes}
                  editMode={editMode}
                  editPositions={editPositions}
                  onEditChange={handleEditChange}
                />
              </div>
            ))}
          </div>
        ) : (
          <DivisionTable
            athletes={results}
            editMode={editMode}
            editPositions={editPositions}
            onEditChange={handleEditChange}
          />
        )}
      </CardBody>
    </Card>
  );
}

// ── AttemptCell ───────────────────────────────────────────────────────────────
function AttemptCell({
  attempt,
}: {
  attempt?: { weightKg?: number | null; result: string };
}) {
  if (!attempt || attempt.result === "not_attempted") {
    return (
      <td className="px-2 py-2 text-center border-r border-slate-100">
        <span className="text-slate-200 text-xs">—</span>
      </td>
    );
  }
  if (attempt.result === "retired") {
    return (
      <td className="px-2 py-2 text-center border-r border-slate-100 bg-amber-50">
        <span className="text-xs text-amber-400 line-through block">{attempt.weightKg ?? "—"}</span>
        <span className="text-xs font-bold text-amber-600">RT</span>
      </td>
    );
  }
  const valid = attempt.result === "valid";
  return (
    <td className={`px-2 py-2 text-center border-r border-slate-100 ${valid ? "bg-green-50" : "bg-red-50"}`}>
      <span className={`text-xs font-semibold block ${valid ? "text-green-700" : "text-red-500 line-through"}`}>
        {attempt.weightKg ?? "—"}
      </span>
      <span className="text-xs">{valid ? "✓" : "✗"}</span>
    </td>
  );
}