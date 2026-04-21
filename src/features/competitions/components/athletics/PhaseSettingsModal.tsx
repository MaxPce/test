// src/features/competitions/components/athletics/PhaseSettingsModal.tsx

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Phase, PhaseGender, PhaseLevel } from "@/features/competitions/types";

// ─── Tipos ──────────────────────────────────────────────────────────────────────

export interface PhaseSettings {
  gender:  PhaseGender | null;
  level:   PhaseLevel  | null;
  isRelay: boolean;
}

interface PhaseSettingsModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  phase:      Phase;
  onSave:     (phaseId: number, settings: PhaseSettings) => Promise<void>;
  isLoading?: boolean;
}

// ─── Opciones — valores exactos del enum del backend ───────────────────────────

const GENDER_OPTIONS: { value: PhaseGender; label: string; emoji: string }[] = [
  { value: "varones", label: "Varones", emoji: "♂️" },
  { value: "damas",   label: "Damas",   emoji: "♀️" },
  { value: "mixto",   label: "Mixto",   emoji: "⚥"  },
];

const LEVEL_OPTIONS: { value: PhaseLevel | null; label: string; description: string }[] = [
  { value: "noveles",   label: "Noveles",    description: "Solo nivel noveles"  },
  { value: "avanzados", label: "Avanzados",  description: "Solo nivel avanzado" },
  { value: null,        label: "Sin filtro", description: "Todos los niveles"   },
];

// ─── Componente ─────────────────────────────────────────────────────────────────

export function PhaseSettingsModal({
  isOpen,
  onClose,
  phase,
  onSave,
  isLoading = false,
}: PhaseSettingsModalProps) {
  const [gender,  setGender]  = useState<PhaseGender | null>(phase.gender  ?? null);
  const [level,   setLevel]   = useState<PhaseLevel  | null>(phase.level   ?? null);
  const [isRelay, setIsRelay] = useState<boolean>(phase.isRelay ?? false);

  // Sincronizar cuando cambia la fase seleccionada
  useEffect(() => {
    setGender(phase.gender  ?? null);
    setLevel(phase.level    ?? null);
    setIsRelay(phase.isRelay ?? false);
  }, [phase.phaseId]);

  const hasChanges =
    gender  !== (phase.gender  ?? null)  ||
    level   !== (phase.level   ?? null)  ||
    isRelay !== (phase.isRelay ?? false);

  const handleSave = async () => {
    await onSave(phase.phaseId, { gender, level, isRelay });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configurar "${phase.name}"`}
      size="sm"
    >
      <div className="space-y-6 py-1">

        {/* ── Género ─────────────────────────────────────────────────────────── */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-700">
            Género de la serie
          </legend>

          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(opt.value)}
                className={[
                  "flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2",
                  "text-sm font-semibold transition-all duration-150",
                  gender === opt.value
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-orange-300 hover:bg-orange-50/50",
                ].join(" ")}
              >
                <span className="text-xl leading-none">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setGender(null)}
            className={[
              "w-full rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              gender === null
                ? "border-orange-300 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500",
            ].join(" ")}
          >
            Sin filtro de género
          </button>
        </fieldset>

        {/* ── Nivel ──────────────────────────────────────────────────────────── */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-700">
            Nivel de la serie
          </legend>

          <div className="space-y-2">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setLevel(opt.value)}
                className={[
                  "w-full flex items-center justify-between rounded-xl border-2 px-4 py-3",
                  "text-left transition-all duration-150",
                  level === opt.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50",
                ].join(" ")}
              >
                <div>
                  <p className={[
                    "text-sm font-semibold",
                    level === opt.value ? "text-orange-700" : "text-slate-700",
                  ].join(" ")}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                </div>

                {/* Radio visual */}
                <div className={[
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  level === opt.value
                    ? "border-orange-500 bg-orange-500"
                    : "border-slate-300",
                ].join(" ")}>
                  {level === opt.value && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* ── Posta / Relay ───────────────────────────────────────────────────── */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-700">
            Tipo de prueba
          </legend>

          <button
            type="button"
            onClick={() => setIsRelay((prev) => !prev)}
            className={[
              "w-full flex items-center justify-between rounded-xl border-2 px-4 py-3",
              "transition-all duration-150",
              isRelay
                ? "border-orange-500 bg-orange-50"
                : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50",
            ].join(" ")}
          >
            <div>
              <p className={[
                "text-sm font-semibold",
                isRelay ? "text-orange-700" : "text-slate-700",
              ].join(" ")}>
                Posta / Relay
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRelay
                  ? "Doble puntaje FEDUP activo"
                  : "Prueba individual estándar"}
              </p>
            </div>

            {/* Toggle switch */}
            <div className={[
              "relative h-6 w-11 rounded-full transition-colors duration-200 flex-shrink-0",
              isRelay ? "bg-orange-500" : "bg-slate-300",
            ].join(" ")}>
              <div className={[
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                isRelay ? "translate-x-5" : "translate-x-0.5",
              ].join(" ")} />
            </div>
          </button>

          {isRelay && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚡ Posta activa: el puntaje de esta serie se contabilizará con valor doble en la tabla general FEDUP.
            </p>
          )}
        </fieldset>

        {/* ── Acciones ────────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            icon={<X className="h-4 w-4" />}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            icon={
              isLoading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Save className="h-4 w-4" />
            }
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

      </div>
    </Modal>
  );
}