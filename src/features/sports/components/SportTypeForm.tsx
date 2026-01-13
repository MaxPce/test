import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SportType, CreateSportTypeData } from "../types";

interface SportTypeFormProps {
  sportType?: SportType;
  onSubmit: (data: CreateSportTypeData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SportTypeForm({
  sportType,
  onSubmit,
  onCancel,
  isLoading,
}: SportTypeFormProps) {
  const [formData, setFormData] = useState<CreateSportTypeData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (sportType) {
      setFormData({
        name: sportType.name,
        description: sportType.description || "",
      });
    }
  }, [sportType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Artes Marciales"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Descripción opcional del tipo de deporte"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {sportType ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
