import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSportTypes } from "../api/sportTypes.queries";
import type { Sport, CreateSportData } from "../types";

interface SportFormProps {
  sport?: Sport;
  onSubmit: (data: CreateSportData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SportForm({
  sport,
  onSubmit,
  onCancel,
  isLoading,
}: SportFormProps) {
  const { data: sportTypes = [] } = useSportTypes();

  const [formData, setFormData] = useState<CreateSportData>({
    sportTypeId: 0,
    name: "",
    iconUrl: "",
  });

  useEffect(() => {
    if (sport) {
      setFormData({
        sportTypeId: sport.sportTypeId,
        name: sport.name,
        iconUrl: sport.iconUrl || "",
      });
    } else if (sportTypes.length > 0 && formData.sportTypeId === 0) {
      setFormData((prev) => ({
        ...prev,
        sportTypeId: sportTypes[0].sportTypeId,
      }));
    }
  }, [sport, sportTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const sportTypeOptions = [
    { value: 0, label: "Seleccione un tipo" },
    ...sportTypes.map((type) => ({
      value: type.sportTypeId,
      label: type.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Tipo de Deporte *"
        value={formData.sportTypeId}
        onChange={(e) =>
          setFormData({ ...formData, sportTypeId: Number(e.target.value) })
        }
        options={sportTypeOptions}
        required
      />

      <Input
        label="Nombre del Deporte *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Karate"
        required
      />

      <Input
        label="URL del Icono"
        type="url"
        value={formData.iconUrl}
        onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
        placeholder="https://ejemplo.com/icono.png"
        helperText="URL opcional de la imagen del deporte"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={formData.sportTypeId === 0}
        >
          {sport ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
