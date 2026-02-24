import { useState } from "react";

interface Props {
  participationId: number;
  initialAccuracy: number;
  initialPresentation: number;
  onSave: (
    participationId: number,
    accuracy: number,
    presentation: number,
  ) => void;
  onCancel: () => void;
}

export const PoomsaeScoreInput = ({
  participationId,
  initialAccuracy,
  initialPresentation,
  onSave,
  onCancel,
}: Props) => {
  const [accuracy, setAccuracy]         = useState(initialAccuracy);
  const [presentation, setPresentation] = useState(initialPresentation);

  const handleSave = () => {
    if (accuracy < 0 || presentation < 0) {
      alert("Los puntajes no pueden ser negativos");
      return;
    }
    onSave(participationId, accuracy, presentation);
  };

  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">Accuracy</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={accuracy}
          onChange={(e) => setAccuracy(parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">Presentation</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={presentation}
          onChange={(e) => setPresentation(parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
