import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSports } from "../api/sports.queries";
import type { Category, CreateCategoryData } from "../types";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const { data: sports = [] } = useSports();

  const [formData, setFormData] = useState<CreateCategoryData>({
    sportId: 0,
    name: "",
    formatType: "eliminacion_directa",
    resultType: "combat",
    gender: "M",
    type: "individual",
    weightMin: undefined,
    weightMax: undefined,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        sportId: category.sportId,
        name: category.name,
        formatType: category.formatType,
        resultType: category.resultType,
        gender: category.gender,
        type: category.type,
        weightMin: category.weightMin,
        weightMax: category.weightMax,
      });
    } else if (sports.length > 0 && formData.sportId === 0) {
      setFormData((prev) => ({ ...prev, sportId: sports[0].sportId }));
    }
  }, [category, sports]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const sportOptions = [
    { value: 0, label: "Seleccione un deporte" },
    ...sports.map((sport) => ({
      value: sport.sportId,
      label: sport.name,
    })),
  ];

  const formatTypeOptions = [
    { value: "eliminacion_directa", label: "Eliminación Directa" },
    { value: "round_robin", label: "Round Robin" },
    { value: "suizo", label: "Sistema Suizo" },
  ];

  const resultTypeOptions = [
    { value: "combat", label: "Combate" },
    { value: "time", label: "Tiempo" },
    { value: "score", label: "Puntaje" },
    { value: "weight", label: "Peso" },
    { value: "distance", label: "Distancia" },
    { value: "height", label: "Altura" },
  ];

  const genderOptions = [
    { value: "M", label: "Masculino" },
    { value: "F", label: "Femenino" },
    { value: "MIXTO", label: "Mixto" },
  ];

  const typeOptions = [
    { value: "individual", label: "Individual" },
    { value: "equipo", label: "Equipo" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Deporte *"
        value={formData.sportId}
        onChange={(e) =>
          setFormData({ ...formData, sportId: Number(e.target.value) })
        }
        options={sportOptions}
        required
      />

      <Input
        label="Nombre de la Categoría *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Kumite Masculino -67kg"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo de Formato *"
          value={formData.formatType}
          onChange={(e) =>
            setFormData({
              ...formData,
              formatType: e.target.value as CreateCategoryData["formatType"],
            })
          }
          options={formatTypeOptions}
          required
        />

        <Select
          label="Tipo de Resultado *"
          value={formData.resultType}
          onChange={(e) =>
            setFormData({
              ...formData,
              resultType: e.target.value as CreateCategoryData["resultType"],
            })
          }
          options={resultTypeOptions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Género *"
          value={formData.gender}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value as CreateCategoryData["gender"],
            })
          }
          options={genderOptions}
          required
        />

        <Select
          label="Tipo *"
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as CreateCategoryData["type"],
            })
          }
          options={typeOptions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Peso Mínimo (kg)"
          type="number"
          step="0.1"
          value={formData.weightMin || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              weightMin: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="60"
        />

        <Input
          label="Peso Máximo (kg)"
          type="number"
          step="0.1"
          value={formData.weightMax || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              weightMax: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="67"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={formData.sportId === 0}
        >
          {category ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
