import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Phase } from "@/features/competitions/types";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PhaseCardVisual {
  /** Altura del banner superior de la card */
  headerHeight: "h-20" | "h-24";
  /** Clases de Tailwind para el gradiente, ej: "from-emerald-600 to-teal-700" */
  gradientClass: string;
  /** Color del ring al seleccionar, ej: "ring-emerald-500" */
  ringClass: string;
  /** Color del hover del nombre, ej: "group-hover:text-emerald-600" */
  hoverTextClass: string;
  /** Ícono o emoji a mostrar en el banner */
  icon: React.ReactNode;
  /** Texto del Badge inferior */
  badgeLabel: string;
  /** Estadísticas opcionales (solo vista genérica las usa) */
  stats?: Array<{
    label: string;
    value: number;
    bgClass: string;    // ej: "bg-blue-50"
    textClass: string;  // ej: "text-blue-900"
    labelClass: string; // ej: "text-blue-700"
  }>;
}

interface PhaseGridProps {
  phases: Phase[];
  selectedPhase: Phase | null;
  /**
   * Función que el padre inyecta para decidir la visual de cada card.
   * Así PhaseGrid no tiene conocimiento de ningún deporte específico.
   */
  getCardVisual: (phase: Phase) => PhaseCardVisual;
  onSelectPhase: (phase: Phase | null) => void;
  onDeletePhase: (phaseId: number) => void;
  /**
   * Si true, hacer clic en la fase seleccionada la deselecciona.
   * Escalada, Ajedrez, Combinados y Halterofilia usan toggle = true.
   * Atletismo y Natación usan toggle = false (siempre setean).
   */
  toggleSelection?: boolean;
  /** gap-4 para cards compactas (h-20), gap-6 para cards grandes (h-24) */
  gap?: "gap-4" | "gap-6";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PhaseGrid({
  phases,
  selectedPhase,
  getCardVisual,
  onSelectPhase,
  onDeletePhase,
  toggleSelection = false,
  gap = "gap-6",
}: PhaseGridProps) {
  const handleSelect = (phase: Phase) => {
    if (toggleSelection && selectedPhase?.phaseId === phase.phaseId) {
      onSelectPhase(null);
    } else {
      onSelectPhase(phase);
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap}`}>
      {phases.map((phase) => {
        const visual = getCardVisual(phase);
        const isSelected = selectedPhase?.phaseId === phase.phaseId;

        return (
          <Card
            key={phase.phaseId}
            hover
            variant="elevated"
            padding="none"
            onClick={() => handleSelect(phase)}
            className={`group cursor-pointer overflow-hidden transition-all ${
              isSelected ? `ring-2 ${visual.ringClass} shadow-strong` : ""
            }`}
          >
            {/* Banner superior con gradiente */}
            <div
              className={`relative ${visual.headerHeight} bg-gradient-to-br ${visual.gradientClass} overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Ícono */}
              <div className="absolute top-4 left-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  {visual.icon}
                </div>
              </div>

              {/* Botón eliminar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePhase(phase.phaseId);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors text-sm"
              >
                ×
              </button>
            </div>

            {/* Cuerpo */}
            <CardBody>
              <h4
                className={`text-base font-bold text-slate-900 mb-2 ${visual.hoverTextClass} transition-colors`}
              >
                {phase.name}
              </h4>

              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary" size="sm">
                  {visual.badgeLabel}
                </Badge>
                <span className="text-xs text-slate-500">
                  ID {phase.phaseId}
                </span>
              </div>

              {/* Estadísticas opcionales */}
              {visual.stats && visual.stats.length > 0 && (
                <div className={`grid grid-cols-${visual.stats.length} gap-2`}>
                  {visual.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.bgClass} rounded-lg p-2 text-center`}
                    >
                      <p className={`text-xl font-bold ${stat.textClass}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs font-medium ${stat.labelClass}`}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>

            {/* Barra de color inferior al hacer hover */}
            <div
              className={`h-1 bg-gradient-to-r ${visual.gradientClass} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          </Card>
        );
      })}
    </div>
  );
}