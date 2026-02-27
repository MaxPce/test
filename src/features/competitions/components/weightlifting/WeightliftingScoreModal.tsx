import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Minus, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useWeightliftingAttempts } from "../../api/weightlifting.queries";
import { useUpsertWeightliftingAttempt } from "../../api/weightlifting.mutations";
import type { WeightliftingAttempt } from "../../api/weightlifting.api";

type AttemptResult = "valid" | "invalid" | "not_attempted";

interface Props {
  participationId: number;
  athleteName: string;
  phaseId: number;
  onClose: () => void;
}

const ATTEMPT_NUMBERS = [1, 2, 3] as const;
const LIFT_TYPES = [
  { key: "snatch" as const, label: "Arranque (Snatch)" },
  { key: "clean_and_jerk" as const, label: "Envión (C&J)" },
];

const resultConfig: Record<
  AttemptResult,
  { icon: React.ReactNode; label: string; color: string }
> = {
  valid: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Válido",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  invalid: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Nulo",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  not_attempted: {
    icon: <Minus className="h-4 w-4" />,
    label: "Sin intentar",
    color: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

type AttemptKey = `${(typeof LIFT_TYPES)[number]["key"]}_${1 | 2 | 3}`;

interface AttemptDraft {
  weightKg: string;
  result: AttemptResult;
}

export function WeightliftingScoreModal({
  participationId,
  athleteName,
  phaseId,
  onClose,
}: Props) {
  const { data: attempts = [], isLoading } =
    useWeightliftingAttempts(participationId);
  const upsertMutation = useUpsertWeightliftingAttempt(phaseId);

  const [drafts, setDrafts] = useState<Record<AttemptKey, AttemptDraft>>(
    {} as any,
  );
  const [saving, setSaving] = useState<AttemptKey | null>(null);

  useEffect(() => {
    const initial: Record<string, AttemptDraft> = {};
    LIFT_TYPES.forEach(({ key }) => {
      ATTEMPT_NUMBERS.forEach((num) => {
        const existing = attempts.find(
          (a) => a.liftType === key && a.attemptNumber === num,
        );
        initial[`${key}_${num}`] = {
          weightKg: existing?.weightKg != null ? String(existing.weightKg) : "",
          result: existing?.result ?? "not_attempted",
        };
      });
    });
    setDrafts(initial as any);
  }, [attempts]);

  const handleSaveAttempt = async (
    liftType: "snatch" | "clean_and_jerk",
    attemptNumber: 1 | 2 | 3,
  ) => {
    const key: AttemptKey = `${liftType}_${attemptNumber}`;
    const draft = drafts[key];
    if (!draft) return;

    setSaving(key);
    try {
      await upsertMutation.mutateAsync({
        participationId,
        attemptData: {
          liftType,
          attemptNumber,
          weightKg: draft.weightKg ? parseFloat(draft.weightKg) : null,
          result: draft.result,
        },
      });
    } finally {
      setSaving(null);
    }
  };

  const getBestLift = (liftType: "snatch" | "clean_and_jerk") => {
    return (
      ATTEMPT_NUMBERS.reduce((best, num) => {
        const key: AttemptKey = `${liftType}_${num}`;
        const d = drafts[key];
        if (d?.result === "valid" && d.weightKg) {
          const w = parseFloat(d.weightKg);
          return w > best ? w : best;
        }
        return best;
      }, 0) || null
    );
  };

  const bestSnatch = getBestLift("snatch");
  const bestCnj = getBestLift("clean_and_jerk");
  const total = bestSnatch && bestCnj ? bestSnatch + bestCnj : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando intentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header atleta */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{athleteName}</h3>
          <p className="text-sm text-gray-500">Registro de intentos IWF</p>
        </div>
        {total !== null && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-blue-600">{total} kg</p>
          </div>
        )}
      </div>

      {/* Tabla de intentos por movimiento */}
      {LIFT_TYPES.map(({ key, label }) => {
        const best = getBestLift(key);
        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">{label}</h4>
              {best !== null && (
                <Badge variant="success" size="sm">
                  Mejor: {best} kg
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {ATTEMPT_NUMBERS.map((num) => {
                const draftKey: AttemptKey = `${key}_${num}`;
                const draft = drafts[draftKey] ?? {
                  weightKg: "",
                  result: "not_attempted" as AttemptResult,
                };
                const isSaving = saving === draftKey;

                return (
                  <div
                    key={num}
                    className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
                  >
                    <p className="text-xs font-medium text-gray-500 text-center">
                      Intento {num}
                    </p>

                    {/* Peso */}
                    <div>
                      <label className="text-xs text-gray-500">Peso (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draft.weightKg}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [draftKey]: {
                              ...prev[draftKey],
                              weightKg: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>

                    {/* Resultado */}
                    <div>
                      <label className="text-xs text-gray-500">Resultado</label>
                      <div className="mt-1 flex flex-col gap-1">
                        {(Object.keys(resultConfig) as AttemptResult[]).map(
                          (res) => {
                            const cfg = resultConfig[res];
                            return (
                              <button
                                key={res}
                                onClick={() =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [draftKey]: {
                                      ...prev[draftKey],
                                      result: res,
                                    },
                                  }))
                                }
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all
                                ${
                                  draft.result === res
                                    ? cfg.color + " font-semibold"
                                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Guardar intento */}
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSaveAttempt(key, num)}
                      isLoading={isSaving}
                      disabled={isSaving}
                      className="w-full"
                    >
                      
                      Guardar
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
