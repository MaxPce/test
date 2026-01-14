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
    { value: "repechaje", label: "Repechaje" },
  ];

  const getTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      grupo:
        "Sistema de todos contra todos dentro de un grupo. Ideal para fase inicial con múltiples equipos.",
      eliminacion:
        "Sistema de eliminación directa. El perdedor queda eliminado del torneo.",
      repechaje:
        "Fase especial para perdedores de semifinales que compiten por el tercer lugar.",
    };
    return descriptions[type] || "";
  };

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

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-900">
          {getTypeDescription(formData.type)}
        </p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Orden de ejecución:</strong> {existingPhases + 1}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Las fases se ejecutan en orden secuencial
        </p>
      </div>

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
