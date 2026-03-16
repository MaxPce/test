import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import {
  DECATHLON_DEFAULTS,
  HEPTATHLON_DEFAULTS,
  type CombinedEventDraft,
  type CombinedEventTableType,
} from "@/features/competitions/types/combined-events.config";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  combinedType: "decatlon" | "heptatlon";
  onGenerate: (drafts: CombinedEventDraft[]) => Promise<void>;
  isLoading?: boolean;
}

const TABLE_TYPE_LABELS: Record<CombinedEventTableType, string> = {
  pista: "🏃 Pista (tiempo)",
  distancia: "📏 Distancia (m)",
  altura: "📐 Altura (m)",
};

export function GenerateCombinedModal({
  isOpen,
  onClose,
  combinedType,
  onGenerate,
  isLoading,
}: Props) {
  const defaults =
    combinedType === "decatlon" ? DECATHLON_DEFAULTS : HEPTATHLON_DEFAULTS;

  const [drafts, setDrafts] = useState<CombinedEventDraft[]>(() =>
    defaults.map((d) => ({ ...d })),
  );

  const handleToggle = (id: string) =>
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)),
    );

  const handleNameChange = (id: string, name: string) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));

  const handleTypeChange = (id: string, tableType: CombinedEventTableType) =>
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, tableType } : d)),
    );

  const handleRemove = (id: string) =>
    setDrafts((prev) => prev.filter((d) => d.id !== id));

  const handleAdd = () =>
    setDrafts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "Nueva prueba",
        tableType: "pista" as CombinedEventTableType,
        enabled: true,
      },
    ]);

  const handleSubmit = async () => {
    const enabled = drafts.filter((d) => d.enabled);
    if (enabled.length === 0) return;
    await onGenerate(enabled);
  };

  const title =
    combinedType === "decatlon"
      ? "Generar Fases — Decatlón"
      : "Generar Fases — Heptatlón";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
              draft.enabled
                ? "bg-white border-slate-200"
                : "bg-slate-50 border-slate-100 opacity-50"
            }`}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={() => handleToggle(draft.id)}
              className="w-4 h-4 accent-orange-500 shrink-0"
            />

            {/* Nombre editable */}
            <input
              type="text"
              value={draft.name}
              onChange={(e) => handleNameChange(draft.id, e.target.value)}
              disabled={!draft.enabled}
              className="flex-1 text-sm font-medium bg-transparent border-b border-transparent
                         hover:border-slate-300 focus:border-orange-400 focus:outline-none
                         transition-colors px-1 py-0.5"
            />

            {/* Tipo de tabla */}
            <select
              value={draft.tableType}
              onChange={(e) =>
                handleTypeChange(
                  draft.id,
                  e.target.value as CombinedEventTableType,
                )
              }
              disabled={!draft.enabled}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white
                         focus:outline-none focus:ring-2 focus:ring-orange-400 shrink-0"
            >
              {Object.entries(TABLE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>

            {/* Eliminar */}
            <button
              onClick={() => handleRemove(draft.id)}
              className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Agregar prueba extra */}
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2
                     border-dashed border-slate-200 rounded-xl text-slate-400
                     hover:border-orange-300 hover:text-orange-500 transition-all text-sm mt-2"
        >
          <Plus className="h-4 w-4" />
          Agregar prueba
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
        <span className="text-xs text-slate-400">
          {drafts.filter((d) => d.enabled).length} pruebas seleccionadas
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || drafts.filter((d) => d.enabled).length === 0}
          >
            {isLoading ? "Generando..." : "Generar todas"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
