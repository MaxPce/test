import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Users, User, Trophy } from "lucide-react";
import { useCreatePhase } from "@/features/competitions/api/phases.mutations";
import type { EventCategory } from "@/features/events/types";
import type { PhaseType } from "@/lib/types/common.types";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface SubcategoryConfig {
  id: string;
  label: string;
  groupCount: number;
  includeElimination: boolean;
}

interface GenerateTableTennisPhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCategory: EventCategory;
  onSuccess?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F"];

type TennisType = "individual" | "doubles" | "team" | "doubles_mx";

function detectTennisType(categoryName: string): TennisType {
  const name = categoryName.toLowerCase();
  if (name.includes("mixto") || name.includes("mixed")) return "doubles_mx";
  if (name.includes("doble") || name.includes("double")) return "doubles";
  if (name.includes("equipo") || name.includes("team")) return "team";
  return "individual";
}

const TENNIS_TYPE_LABEL: Record<TennisType, string> = {
  individual: "Individual",
  doubles: "Dobles",
  team: "Equipos",
  doubles_mx: "Dobles",
};

const TENNIS_TYPE_ICON: Record<TennisType, typeof User> = {
  individual: User,
  doubles: Users,
  team: Users,
  doubles_mx: Users,
};

function buildSubcategories(
  type: TennisType,
): Omit<SubcategoryConfig, "groupCount" | "includeElimination">[] {
  const base = TENNIS_TYPE_LABEL[type];

  if (type === "doubles_mx") {
    return [{ id: "doubles_MX", label: "Dobles Mixtos" }];
  }

  return [
    { id: `${type}_M`, label: `${base} Masculino` },
    { id: `${type}_F`, label: `${base} Femenino` },
  ];
}

const SUBCATEGORY_COLORS: Record<
  string,
  { pill: string; border: string; bg: string }
> = {
  individual_M: {
    pill: "bg-violet-100 text-violet-700",
    border: "border-violet-200",
    bg: "bg-violet-50/40",
  },
  individual_F: {
    pill: "bg-pink-100 text-pink-700",
    border: "border-pink-200",
    bg: "bg-pink-50/40",
  },
  doubles_M: {
    pill: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    bg: "bg-emerald-50/40",
  },
  doubles_F: {
    pill: "bg-teal-100 text-teal-700",
    border: "border-teal-200",
    bg: "bg-teal-50/40",
  },
  doubles_MX: {
    pill: "bg-indigo-100 text-indigo-700",
    border: "border-indigo-200",
    bg: "bg-indigo-50/40",
  },
  team_M: {
    pill: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    bg: "bg-amber-50/40",
  },
  team_F: {
    pill: "bg-orange-100 text-orange-700",
    border: "border-orange-200",
    bg: "bg-orange-50/40",
  },
};

const groupCountOptions = [1, 2, 3, 4, 5, 6].map((n) => ({
  value: n,
  label: `${n} grupo${n > 1 ? "s" : ""}`,
}));

// ── Componente ────────────────────────────────────────────────────────────────

export function GenerateTableTennisPhasesModal({
  isOpen,
  onClose,
  eventCategory,
  onSuccess,
}: GenerateTableTennisPhasesModalProps) {
  const categoryName = eventCategory.category?.name ?? "";
  const tennisType = detectTennisType(categoryName);
  const baseSubcats = buildSubcategories(tennisType);

  const [configs, setConfigs] = useState<SubcategoryConfig[]>(() =>
    baseSubcats.map((s) => ({
      ...s,
      groupCount: 1,
      includeElimination: true,
    })),
  );

  const createPhaseMutation = useCreatePhase();
  const [isGenerating, setIsGenerating] = useState(false);

  const updateConfig = (id: string, patch: Partial<SubcategoryConfig>) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const preview = configs.flatMap((config) => {
    const phases: { name: string; type: PhaseType }[] = [];

    GROUP_LETTERS.slice(0, config.groupCount).forEach((letter) => {
      phases.push({
        name: `${config.label} Grupo ${letter}`,
        type: "grupo",
      });
    });

    if (config.includeElimination) {
      phases.push({
        name: `${config.label} Eliminación`,
        type: "eliminacion",
      });
    }

    return phases;
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      for (const phase of preview) {
        await createPhaseMutation.mutateAsync({
          eventCategoryId: eventCategory.eventCategoryId,
          name: phase.name,
          type: phase.type,
          displayOrder: 0,
        } as any);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error al crear fases:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const Icon = TENNIS_TYPE_ICON[tennisType];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Fases de Tenis de Mesa"
      size="lg"
    >
      <div className="space-y-6">

        {/* Header categoría */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-blue-900">{categoryName}</p>
            <p className="text-sm text-blue-700">
              {eventCategory.category?.sport?.name}
            </p>
          </div>
        </div>

        {/* Configuración por subcategoría */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            Configura las fases por subcategoría
          </p>

          {configs.map((config) => {
            const colors = SUBCATEGORY_COLORS[config.id] ?? {
              pill: "bg-slate-100 text-slate-600",
              border: "border-slate-200",
              bg: "bg-slate-50",
            };

            return (
              <div
                key={config.id}
                className={`rounded-xl border p-4 ${colors.border} ${colors.bg}`}
              >
                {/* Label subcategoría */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-sm font-bold px-2.5 py-1 rounded-lg ${colors.pill}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {config.groupCount + (config.includeElimination ? 1 : 0)}{" "}
                    fase(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Grupos */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Fases de Grupos
                    </label>
                    <Select
                      value={config.groupCount}
                      onChange={(e) =>
                        updateConfig(config.id, {
                          groupCount: Number(e.target.value),
                        })
                      }
                      options={groupCountOptions}
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {GROUP_LETTERS.slice(0, config.groupCount).map((l) => (
                        <span
                          key={l}
                          className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500"
                        >
                          Grupo {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Eliminación */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Eliminación Directa
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(config.id, {
                          includeElimination: !config.includeElimination,
                        })
                      }
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                        config.includeElimination
                          ? "bg-white border-emerald-300 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-400"
                      }`}
                    >
                      <Trophy
                        className={`h-4 w-4 ${config.includeElimination ? "text-emerald-500" : "text-slate-300"}`}
                      />
                      {config.includeElimination ? "Incluida" : "No incluir"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview de fases a crear */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            Se crearán {preview.length} fases
          </p>
          <div className="flex flex-wrap gap-2">
            {preview.map((phase, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border inline-flex items-center gap-1 ${
                  phase.type === "grupo"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {phase.type === "eliminacion" && (
                  <Trophy className="h-3 w-3" />
                )}
                {phase.name}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={preview.length === 0}
          >
            Crear {preview.length} fase{preview.length !== 1 ? "s" : ""}
          </Button>
        </div>

      </div>
    </Modal>
  );
}
