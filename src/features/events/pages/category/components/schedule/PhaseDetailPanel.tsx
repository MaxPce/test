import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import type { Phase } from "@/features/competitions/types";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PhaseDetailPanelProps {
  phase: Phase;
  onClose: () => void;
  /** Botones de acción del header (ej: "Asignar atletas") */
  actions?: React.ReactNode;
  /** La tabla / vista específica del deporte */
  children: React.ReactNode;
  /**
   * "card"  → envuelve en <Card> con header (escalada, chess, halterofilia)
   * "plain" → div simple con título inline (atletismo, natación, combinados)
   */
  variant?: "card" | "plain";
  /** Ícono del header en variante "card" */
  headerIcon?: React.ReactNode;
  /** Color del ícono del header en variante "plain", ej: "text-orange-500" */
  iconColorClass?: string;
  /** Ícono del header en variante "plain" */
  plainIcon?: React.ReactNode;
  /** Si true, el CardBody no tiene padding (para tablas full-width) */
  bodyNoPadding?: boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PhaseDetailPanel({
  phase,
  onClose,
  actions,
  children,
  variant = "card",
  headerIcon,
  iconColorClass = "text-slate-600",
  plainIcon,
  bodyNoPadding = false,
}: PhaseDetailPanelProps) {

  // ── Variante "plain" — título inline sin Card wrapper ─────────────────────
  if (variant === "plain") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {plainIcon && (
              <span className={iconColorClass}>{plainIcon}</span>
            )}
            <h4 className="text-lg font-bold text-slate-800">{phase.name}</h4>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>

        {children}
      </div>
    );
  }

  // ── Variante "card" — con Card wrapper y CardHeader ───────────────────────
  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {headerIcon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                {headerIcon}
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-900">{phase.name}</h3>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              × Cerrar
            </button>
          </div>
        </div>
      </CardHeader>

      <CardBody className={bodyNoPadding ? "p-0" : undefined}>
        {children}
      </CardBody>
    </Card>
  );
}