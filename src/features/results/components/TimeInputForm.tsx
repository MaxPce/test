import { useState, useEffect } from "react";
import { useCreateTimeResult } from "../api/results.queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

interface Registration {
  registrationId: number;
  athlete?: {
    athleteId: number;
    name: string;
  };
  team?: {
    teamId: number;
    name: string;
    members: Array<{
      athlete: {
        name: string;
      };
    }>;
  };
}

interface TimeInputFormProps {
  registration: Registration;
  existingResult?: {
    resultId: number;
    timeValue: string;
    rankPosition?: number;
    notes?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TimeInputForm({
  registration,
  existingResult,
  onSuccess,
  onCancel,
}: TimeInputFormProps) {
  const [timeValue, setTimeValue] = useState("");
  const [rankPosition, setRankPosition] = useState("");
  const [notes, setNotes] = useState("");
  const [isDQ, setIsDQ] = useState(false);

  const mutation = useCreateTimeResult();

  // Si hay un resultado existente, cargar los datos
  useEffect(() => {
    if (existingResult) {
      setTimeValue(existingResult.timeValue);
      setRankPosition(existingResult.rankPosition?.toString() || "");
      setNotes(existingResult.notes || "");
      setIsDQ(existingResult.notes?.includes("DQ") || false);
    }
  }, [existingResult]);

  const participantName = registration.team
    ? registration.team.name
    : registration.athlete?.name || "Desconocido";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTime = isDQ ? `x${timeValue}` : timeValue;

    // Aquí necesitamos obtener el participationId
    // Por ahora, vamos a enviar el registrationId y lo manejaremos en el backend
    mutation.mutate(
      {
        registrationId: registration.registrationId, // ← Cambio aquí
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Participante</p>
        <p className="text-base font-semibold text-gray-900">
          {participantName}
        </p>
        {registration.team && (
          <p className="text-xs text-gray-500 mt-1">
            {registration.team.members.map((m) => m.athlete.name).join(", ")}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiempo *
        </label>
        <Input
          type="text"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          placeholder="1:15.60"
          pattern="(\d{1,2}:)?\d{1,2}:\d{2}\.\d{2}"
          required
          disabled={mutation.isPending}
        />
        <p className="text-xs text-gray-500 mt-1">
          Formato: MM:SS.MS (ejemplo: 1:15.60)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="dq"
          checked={isDQ}
          onChange={(e) => setIsDQ(e.target.checked)}
          disabled={mutation.isPending}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="dq" className="text-sm text-gray-700">
          Descalificado (DQ)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posición
          </label>
          <Input
            type="number"
            value={rankPosition}
            onChange={(e) => setRankPosition(e.target.value)}
            placeholder="1"
            min="1"
            disabled={mutation.isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
            disabled={mutation.isPending}
          />
        </div>
      </div>

      {mutation.isError && (
        <Alert variant="error">
          Error:{" "}
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Error desconocido"}
        </Alert>
      )}

      {mutation.isSuccess && (
        <Alert variant="success">¡Tiempo registrado exitosamente!</Alert>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending || !timeValue}>
          {mutation.isPending ? "Guardando..." : "Registrar Tiempo"}
        </Button>
      </div>
    </form>
  );
}
