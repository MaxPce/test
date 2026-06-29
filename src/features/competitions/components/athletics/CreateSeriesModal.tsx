// src/features/competitions/components/athletics/CreateSeriesModal.tsx
import { useState } from "react";
import { X, Plus, Trash2, Wand2, List } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (names: string[]) => Promise<void>;
}

type TabMode = "auto" | "manual";

export default function CreateSeriesModal({ isOpen, onClose, onConfirm }: Props) {
  const [mode, setMode] = useState<TabMode>("auto");

  // ── Tab Automático ────────────────────────────────────────────────────────
  const [seriesCount, setSeriesCount] = useState(4);
  const [prefix, setPrefix] = useState("Serie");
  const [includeFinal, setIncludeFinal] = useState(false);

  // ── Tab Personalizado ─────────────────────────────────────────────────────
  const [manualNames, setManualNames] = useState<string[]>(["Serie 1", "Serie 2", "Final"]);

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Preview modo auto
  const autoNames: string[] = Array.from(
    { length: seriesCount },
    (_, i) => `${prefix.trim() || "Serie"} ${i + 1}`
  );
  if (includeFinal) autoNames.push("Final");

  // Nombres a confirmar
  const names = mode === "auto" ? autoNames : manualNames;
  const validNames = names.filter((n) => n.trim() !== "");

  const handleConfirm = async () => {
    if (validNames.length === 0) return;
    setSaving(true);
    try {
      await onConfirm(validNames);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers manual ────────────────────────────────────────────────────────
  const addRow = () =>
    setManualNames((prev) => [...prev, `Serie ${prev.length + 1}`]);

  const removeRow = (i: number) =>
    setManualNames((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, val: string) =>
    setManualNames((prev) => prev.map((n, idx) => (idx === i ? val : n)));

  // ── Helpers drag & drop ───────────────────────────────────────────────────
  const handleDragStart = (i: number) => {
    setDragIndex(i);
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };

  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return;
    setManualNames((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">Generar Series</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 px-5 pt-3">
          {([
            { id: "auto" as const, label: "Automático", icon: Wand2 },
            { id: "manual" as const, label: "Personalizado", icon: List },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === id
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {mode === "auto" ? (
            <>
              {/* Número de series */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ¿Cuántas series?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSeriesCount((n) => Math.max(1, n - 1))}
                    className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-lg font-bold text-slate-900">
                    {seriesCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeriesCount((n) => n + 1)}
                    className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Prefijo nombre */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre base
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="Serie"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <p className="text-[11px] text-slate-400">
                  Se crearán:{" "}
                  <span className="font-medium text-slate-600">{prefix || "Serie"} 1</span>,{" "}
                  <span className="font-medium text-slate-600">{prefix || "Serie"} 2</span>...
                </p>
              </div>

              {/* Checkbox final */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFinal}
                  onChange={(e) => setIncludeFinal(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                <span className="text-sm text-slate-700">
                  Agregar sección <strong>"Final"</strong>
                </span>
              </label>

              {/* Preview */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Vista previa — {autoNames.length} sección{autoNames.length !== 1 ? "es" : ""}
                </p>
                {autoNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                      {i + 1}
                    </span>
                    {name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Define el nombre de cada sección. Arrastra{" "}
                <span className="font-medium text-slate-600">⠿</span> para reordenar.
              </p>

              <div className="space-y-2">
                {manualNames.map((name, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 rounded-lg border bg-white transition-all ${
                      dragOverIndex === i && dragIndex !== i
                        ? "border-orange-400 shadow-md scale-[1.01]"
                        : "border-slate-200"
                    } ${dragIndex === i ? "opacity-40" : "opacity-100"}`}
                  >
                    {/* Handle drag */}
                    <div className="flex cursor-grab items-center pl-2 text-slate-300 active:cursor-grabbing select-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5" cy="4" r="1.2" />
                        <circle cx="5" cy="8" r="1.2" />
                        <circle cx="5" cy="12" r="1.2" />
                        <circle cx="10" cy="4" r="1.2" />
                        <circle cx="10" cy="8" r="1.2" />
                        <circle cx="10" cy="12" r="1.2" />
                      </svg>
                    </div>

                    {/* Número */}
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                      {i + 1}
                    </span>

                    {/* Input */}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateRow(i, e.target.value)}
                      className="flex-1 border-0 bg-transparent py-2 text-sm focus:outline-none focus:ring-0"
                    />

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={manualNames.length <= 1}
                      className="rounded-lg p-1.5 mr-1 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 text-sm text-orange-600 hover:underline"
              >
                <Plus className="h-4 w-4" />
                Agregar sección
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || validNames.length === 0}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Creando..." : `Crear ${validNames.length} sección${validNames.length !== 1 ? "es" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}