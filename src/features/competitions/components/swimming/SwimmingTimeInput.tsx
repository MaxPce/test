import { useState } from "react";

interface Props {
  participationId: number;
  initialTime: string;
  initialLane: number | null;
  onSave: (participationId: number, time: string, lane: number | null) => void;
  onCancel: () => void;
}

export const SwimmingTimeInput = ({
  participationId,
  initialTime,
  initialLane,
  onSave,
  onCancel,
}: Props) => {
  const [time, setTime] = useState(initialTime || "");
  const [lane, setLane] = useState<number | null>(initialLane);

  // Validar formato MM:SS.cc o SS.cc
  const isValidTime = (t: string) => {
    return /^\d{1,2}:\d{2}\.\d{2}$/.test(t) || /^\d{1,2}\.\d{2}$/.test(t);
  };

  const handleSave = () => {
    if (!isValidTime(time)) {
      alert(
        'Formato inválido. Usa "MM:SS.cc" (ej: 1:23.45) o "SS.cc" (ej: 58.32)',
      );
      return;
    }
    onSave(participationId, time, lane);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Calle */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Calle</label>
        <input
          type="number"
          min={1}
          max={10}
          value={lane ?? ""}
          onChange={(e) =>
            setLane(e.target.value ? Number(e.target.value) : null)
          }
          className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="—"
        />
      </div>

      {/* Tiempo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">
          Tiempo (MM:SS.cc)
        </label>
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="1:23.45"
          className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {/* Botones */}
      <div className="flex items-end gap-2 pb-0.5">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200 font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
