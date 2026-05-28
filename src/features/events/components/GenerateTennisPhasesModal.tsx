import React, { useState } from "react";
import { GitBranch, Users, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGenerateTennisPhases } from "@/features/competitions/api/tennis-phases.mutations";

interface GenerateTennisPhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCategoryId: number;
  categoryName: string;
  allRegistrations: any[];
  sismasterEventId?: string;
  sismasterSportId?: string;
}

type GenerationMode = "with_matches" | "phases_only";

export function GenerateTennisPhasesModal({
  isOpen,
  onClose,
  eventCategoryId,
  categoryName,
  allRegistrations,
}: GenerateTennisPhasesModalProps) {
  const [selectedMode, setSelectedMode] = useState<GenerationMode | null>(null);

  // ── Mutación ──────────────────────────────────────────────────────────────
  const mutation = useGenerateTennisPhases();

  if (!isOpen) return null;

  const assignedCount = allRegistrations.length;

  const registrationIds = allRegistrations.map((r) => r.registrationId);

  const handleConfirm = async () => {
    if (!selectedMode) return;
    try {
      await mutation.mutateAsync({
        eventCategoryId,
        mode: selectedMode,
        registrationIds,
      });
      setSelectedMode(null); // reset para la próxima vez
      onClose();
    } catch (err) {
      console.error("Error generando fases Tennis:", err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Generar Fases</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {categoryName} · {assignedCount} atleta{assignedCount !== 1 ? "s" : ""} asignado{assignedCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-slate-600 mb-4">
            ¿Cómo quieres generar las fases para esta categoría de Tennis?
          </p>

          {/* Opción 1 — Con matches */}
          <button
            onClick={() => setSelectedMode("with_matches")}
            className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
              selectedMode === "with_matches"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                selectedMode === "with_matches" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <GitBranch size={18} className={selectedMode === "with_matches" ? "text-blue-600" : "text-gray-500"} />
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${selectedMode === "with_matches" ? "text-blue-900" : "text-slate-800"}`}>
                  Generar fases con matches
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Genera las fases de eliminación y crea automáticamente todos los matches con los atletas asignados.
                </p>
              </div>
              <div className="flex-shrink-0 mt-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === "with_matches" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}>
                  {selectedMode === "with_matches" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </button>

          {/* Opción 2 — Solo fases */}
          <button
            onClick={() => setSelectedMode("phases_only")}
            className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
              selectedMode === "phases_only"
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                selectedMode === "phases_only" ? "bg-emerald-100" : "bg-gray-100"
              }`}>
                <Users size={18} className={selectedMode === "phases_only" ? "text-emerald-600" : "text-gray-500"} />
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${selectedMode === "phases_only" ? "text-emerald-900" : "text-slate-800"}`}>
                  Generar solo fases con atletas
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Crea las fases con los atletas ya asignados, sin generar matches. Luego puedes abrir cada fase y continuar el flujo.
                </p>
              </div>
              <div className="flex-shrink-0 mt-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === "phases_only" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                }`}>
                  {selectedMode === "phases_only" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </button>

          {/* Error feedback */}
          {mutation.isError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Ocurrió un error al generar las fases. Intenta nuevamente.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedMode || mutation.isPending}
            isLoading={mutation.isPending}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}