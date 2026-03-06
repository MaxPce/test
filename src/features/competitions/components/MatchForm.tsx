import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Phase } from "../types";

interface MatchFormProps {
  phase: Phase;
  existingMatches?: { matchNumber?: number }[];
  onSubmit: (data: {
    phaseId: number;
    matchNumber?: number;
    round?: string;
    scheduledTime?: string;
    platformNumber?: number;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MatchForm({
  phase,
  existingMatches = [],
  onSubmit,
  onCancel,
  isLoading,
}: MatchFormProps) {
  const nextMatchNumber =
    existingMatches.length > 0
      ? Math.max(...existingMatches.map((m) => m.matchNumber || 0)) + 1
      : 1;

  const [formData, setFormData] = useState({
    matchNumber: String(nextMatchNumber),
    round: "",
    scheduledTime: "",
    platformNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      phaseId: phase.phaseId,
      matchNumber: formData.matchNumber
        ? Number(formData.matchNumber)
        : undefined,
      round: formData.round || undefined,
      scheduledTime: formData.scheduledTime || undefined,
      platformNumber: formData.platformNumber
        ? Number(formData.platformNumber)
        : undefined,
    });
  };

  const roundOptions =
    phase.type === "eliminacion"
      ? [
          { value: "", label: "Seleccione una ronda" },
          { value: "final", label: "Final" },
          { value: "tercer_lugar", label: "Tercer Lugar" },
          { value: "semifinal", label: "Semifinal" },
          { value: "cuartos", label: "Cuartos de Final" },
          { value: "octavos", label: "Octavos de Final" },
          { value: "dieciseisavos", label: "Dieciseisavos de Final" },
          { value: "repechaje", label: "Repechaje" },
          { value: "repechaje_semifinal", label: "Repechaje Semifinal" },
          { value: "repechaje_cuartos", label: "Repechaje Cuartos" },
          { value: "repechaje_octavos", label: "Repechaje Octavos" },
        ]
      : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <h4 className="font-semibold text-blue-900">{phase.name}</h4>
        <p className="text-sm text-blue-700">
          {phase.type === "grupo" && "Fase de Grupos"}
          {phase.type === "eliminacion" && "Eliminación Directa"}
          {phase.type === "repechaje" && "Repechaje"}
        </p>
      </div>

      <Input
        label="Número de Partido"
        type="number"
        value={formData.matchNumber}
        readOnly
        className="bg-gray-50 text-gray-500"
        helperText={`Auto-asignado (siguiente: #${nextMatchNumber})`}
      />

      {phase.type === "eliminacion" && (
        <Select
          label="Ronda"
          value={formData.round}
          onChange={(e) => setFormData({ ...formData, round: e.target.value })}
          options={roundOptions}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Crear Partido
        </Button>
      </div>
    </form>
  );
}