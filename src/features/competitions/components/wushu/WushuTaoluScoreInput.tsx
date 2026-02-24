import { useState } from "react";

interface Props {
  participationId: number;
  initialAccuracy: number;
  initialPresentation: number;
  onSave: (participationId: number, accuracy: number, presentation: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WushuTaoluScoreInput = ({
  participationId,
  initialAccuracy,
  initialPresentation,
  onSave,
  onCancel,
  isLoading = false,
}: Props) => {
  const [total, setTotal] = useState(
    parseFloat(((initialAccuracy + initialPresentation) || 0).toFixed(2))
  );

  const handleSave = () => {
    onSave(participationId, total, 0);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Puntaje Total
        </label>
        <input
          type="number"
          min="0"
          max="20"
          step="0.01"
          value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
          className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />
      </div>

      <div className="flex gap-2 ml-auto self-end">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || total <= 0}
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
};
