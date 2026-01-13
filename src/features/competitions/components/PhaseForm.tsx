import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Phase, CreatePhaseData } from "../types";

interface PhaseFormProps {
  eventCategoryId: number;
  phase?: Phase;
  onSubmit: (data: CreatePhaseData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PhaseForm({
  eventCategoryId,
  phase,
  onSubmit,
  onCancel,
  isLoading,
}: PhaseFormProps) {
  const [formData, setFormData] = useState<CreatePhaseData>({
    eventCategoryId,
    name: "",
    format: "eliminacion_directa",
    status: "pendiente",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (phase) {
      setFormData({
        eventCategoryId: phase.eventCategoryId,
        name: phase.name,
        format: phase.format,
        status: phase.status,
        startDate: phase.startDate?.split("T")[0] || "",
        endDate: phase.endDate?.split("T")[0] || "",
      });
    }
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatOptions = [
    { value: "eliminacion_directa", label: "Eliminación Directa" },
    { value: "round_robin", label: "Round Robin (Todos contra Todos)" },
    { value: "grupos", label: "Fase de Grupos" },
  ];

  const statusOptions = [
    { value: "pendiente", label: "Pendiente" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizado" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre de la Fase *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Octavos de Final"
        required
      />

      <Select
        label="Formato *"
        value={formData.format}
        onChange={(e) =>
          setFormData({
            ...formData,
            format: e.target.value as CreatePhaseData["format"],
          })
        }
        options={formatOptions}
        required
      />

      <Select
        label="Estado *"
        value={formData.status}
        onChange={(e) =>
          setFormData({
            ...formData,
            status: e.target.value as CreatePhaseData["status"],
          })
        }
        options={statusOptions}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de Inicio"
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
        />

        <Input
          label="Fecha de Fin"
          type="date"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          min={formData.startDate}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {phase ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
