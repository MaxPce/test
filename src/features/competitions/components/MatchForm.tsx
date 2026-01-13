import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Match, UpdateMatchData, Participation } from "../types";

interface MatchFormProps {
  match: Match;
  participations: Participation[];
  onSubmit: (data: UpdateMatchData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MatchForm({
  match,
  participations,
  onSubmit,
  onCancel,
  isLoading,
}: MatchFormProps) {
  const [formData, setFormData] = useState<UpdateMatchData>({
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    winnerParticipantId: match.winnerParticipantId,
    status: match.status,
    scheduledTime: match.scheduledTime?.split("T")[0] || "",
    location: match.location || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const statusOptions = [
    { value: "programado", label: "Programado" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  const getParticipantName = (participantId?: number) => {
    if (!participantId) return "TBD";
    const participation = participations.find(
      (p) => p.participationId === participantId
    );
    return participation?.athlete?.name || participation?.team?.name || "N/A";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Participantes</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {getParticipantName(match.participantA)}
            </span>
            <Input
              type="number"
              min="0"
              value={formData.scoreA ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scoreA: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="0"
              className="w-20 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {getParticipantName(match.participantB)}
            </span>
            <Input
              type="number"
              min="0"
              value={formData.scoreB ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scoreB: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="0"
              className="w-20 text-center"
            />
          </div>
        </div>
      </div>

      <Select
        label="Estado *"
        value={formData.status || match.status}
        onChange={(e) =>
          setFormData({
            ...formData,
            status: e.target.value as UpdateMatchData["status"],
          })
        }
        options={statusOptions}
        required
      />

      <Input
        label="Fecha y Hora Programada"
        type="datetime-local"
        value={formData.scheduledTime}
        onChange={(e) =>
          setFormData({ ...formData, scheduledTime: e.target.value })
        }
      />

      <Input
        label="Ubicación"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="Ej: Cancha 1"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Actualizar Partido
        </Button>
      </div>
    </form>
  );
}
