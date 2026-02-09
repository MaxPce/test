import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface PhaseFormProps {
  eventCategoryId: number;
  existingPhases: number;
  onSubmit: (data: {
    eventCategoryId: number;
    name: string;
    type: string;
    displayOrder?: number;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PhaseForm({
  eventCategoryId,
  existingPhases,
  onSubmit,
  onCancel,
  isLoading,
}: PhaseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "eliminacion",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      eventCategoryId,
      name: formData.name,
      type: formData.type,
      displayOrder: existingPhases + 1,
    });
  };

  const typeOptions = [
    { value: "grupo", label: "Fase de Grupos" },
    { value: "eliminacion", label: "Eliminación Directa" },
    { value: "mejor_de_3", label: "Mejor de 3" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre de la Fase *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Grupo A, Semifinales, Final"
        required
      />

      <Select
        label="Tipo de Fase *"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        options={typeOptions}
        required
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Crear Fase
        </Button>
      </div>
    </form>
  );
}
