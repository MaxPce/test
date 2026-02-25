import { useState } from "react";

interface Props {
  participationId: number;
  initialTime: string;
  initialMark: string;
  initialLane: number | null;
  onSave: (
    participationId: number,
    time: string,
    mark: string,
    lane: number | null,
  ) => void;
  onCancel: () => void;
}

export const AthleticsTimeInput = ({
  participationId,
  initialTime,
  initialMark,
  initialLane,
  onSave,
  onCancel,
}: Props) => {
  const [time, setTime] = useState(initialTime || "");
  const [mark, setMark] = useState(initialMark || "");
  const [lane, setLane] = useState<number | null>(initialLane);

  const handleSave = () => {
    if (!time && !mark) {
      alert("Ingresa un tiempo o una marca");
      return;
    }
    onSave(participationId, time, mark, lane);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Calle */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Calle</label>
        <input
          type="number"
          min={1}
          value={lane ?? ""}
          onChange={(e) =>
            setLane(e.target.value ? Number(e.target.value) : null)
          }
          className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="—"
        />
      </div>

      {/* Tiempo (pista) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">
          Tiempo (MM:SS.cc)
        </label>
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="10.45"
          className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
          autoFocus
        />
      </div>

      {/* Marca (campo) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">
          Marca (campo)
        </label>
        <input
          type="text"
          value={mark}
          onChange={(e) => setMark(e.target.value)}
          placeholder="8.95m"
          className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Botones */}
      <div className="flex items-end gap-2 pb-0.5">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 font-medium"
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
