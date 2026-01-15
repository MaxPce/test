import { useState } from "react";
import { useCreateTimeResult } from "../api/results.queries";

interface TimeInputFormProps {
  participationId: number;
  participantName: string;
  onSuccess?: () => void;
}

export function TimeInputForm({
  participationId,
  participantName,
  onSuccess,
}: TimeInputFormProps) {
  const [timeValue, setTimeValue] = useState("");
  const [rankPosition, setRankPosition] = useState("");
  const [notes, setNotes] = useState("");
  const [isDQ, setIsDQ] = useState(false);

  const mutation = useCreateTimeResult();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTime = isDQ ? `x${timeValue}` : timeValue;

    mutation.mutate(
      {
        participationId,
        timeValue: finalTime,
        rankPosition: rankPosition ? parseInt(rankPosition) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setTimeValue("");
          setRankPosition("");
          setNotes("");
          setIsDQ(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4"
    >
      <div>
        <p className="text-sm font-medium text-slate-300">{participantName}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Tiempo *
          <span className="text-xs text-slate-400 ml-2">
            (Formato: MM:SS.MS ej: 1:15.60)
          </span>
        </label>
        <input
          type="text"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          placeholder="1:15.60"
          pattern="(\d{1,2}:)?\d{1,2}:\d{2}\.\d{2}"
          required
          disabled={mutation.isPending}
          className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`dq-${participationId}`}
          checked={isDQ}
          onChange={(e) => setIsDQ(e.target.checked)}
          disabled={mutation.isPending}
          className="h-4 w-4 rounded border-white/10 bg-slate-950/40 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <label
          htmlFor={`dq-${participationId}`}
          className="text-sm text-slate-300 cursor-pointer"
        >
          Descalificado (DQ)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Posición</label>
          <input
            type="number"
            value={rankPosition}
            onChange={(e) => setRankPosition(e.target.value)}
            placeholder="1"
            min="1"
            disabled={mutation.isPending}
            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notas</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
            disabled={mutation.isPending}
            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {mutation.isError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          Error:{" "}
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Error desconocido"}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !timeValue}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "Guardando..." : "Registrar Tiempo"}
      </button>

      {mutation.isSuccess && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
          ✓ Tiempo registrado exitosamente
        </div>
      )}
    </form>
  );
}
