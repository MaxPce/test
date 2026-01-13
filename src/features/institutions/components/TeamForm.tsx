import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useInstitutions } from "../api/institutions.queries";
import { useCategories } from "@/features/sports/api/categories.queries";
import type { Team, CreateTeamData } from "../types";

interface TeamFormProps {
  team?: Team;
  onSubmit: (data: CreateTeamData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TeamForm({
  team,
  onSubmit,
  onCancel,
  isLoading,
}: TeamFormProps) {
  const { data: institutions = [] } = useInstitutions();
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState<CreateTeamData>({
    name: "",
    institutionId: 0,
    categoryId: 0,
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        institutionId: team.institutionId,
        categoryId: team.categoryId,
      });
    } else {
      if (institutions.length > 0 && formData.institutionId === 0) {
        setFormData((prev) => ({
          ...prev,
          institutionId: institutions[0].institutionId,
        }));
      }
      if (categories.length > 0 && formData.categoryId === 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: categories[0].categoryId,
        }));
      }
    }
  }, [team, institutions, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const institutionOptions = [
    { value: 0, label: "Seleccione una institución" },
    ...institutions.map((inst) => ({
      value: inst.institutionId,
      label: inst.name,
    })),
  ];

  const categoryOptions = [
    { value: 0, label: "Seleccione una categoría" },
    ...categories.map((cat) => ({
      value: cat.categoryId,
      label: `${cat.name} - ${cat.sport?.name || "N/A"}`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del Equipo *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: CDN Karate A"
        required
      />

      <Select
        label="Institución *"
        value={formData.institutionId}
        onChange={(e) =>
          setFormData({ ...formData, institutionId: Number(e.target.value) })
        }
        options={institutionOptions}
        required
      />

      <Select
        label="Categoría *"
        value={formData.categoryId}
        onChange={(e) =>
          setFormData({ ...formData, categoryId: Number(e.target.value) })
        }
        options={categoryOptions}
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={formData.institutionId === 0 || formData.categoryId === 0}
        >
          {team ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
