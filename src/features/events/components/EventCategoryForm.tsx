import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useCategories } from "@/features/sports/api/categories.queries";
import type { EventCategory, CreateEventCategoryData } from "../types";

interface EventCategoryFormProps {
  eventId: number;
  eventCategory?: EventCategory;
  onSubmit: (data: CreateEventCategoryData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EventCategoryForm({
  eventId,
  eventCategory,
  onSubmit,
  onCancel,
  isLoading,
}: EventCategoryFormProps) {
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState<CreateEventCategoryData>({
    eventId,
    categoryId: 0,
    status: "pendiente",
  });

  useEffect(() => {
    if (eventCategory) {
      setFormData({
        eventId: eventCategory.eventId,
        categoryId: eventCategory.categoryId,
        status: eventCategory.status,
      });
    } else if (categories.length > 0 && formData.categoryId === 0) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].categoryId,
      }));
    }
  }, [eventCategory, categories, eventId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categoryOptions = [
    { value: 0, label: "Seleccione una categoría" },
    ...categories.map((cat) => ({
      value: cat.categoryId,
      label: `${cat.name} - ${cat.sport?.name || "N/A"}`,
    })),
  ];

  const statusOptions = [
    { value: "pendiente", label: "Pendiente" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizado" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Categoría *"
        value={formData.categoryId}
        onChange={(e) =>
          setFormData({ ...formData, categoryId: Number(e.target.value) })
        }
        options={categoryOptions}
        required
      />

      <Select
        label="Estado *"
        value={formData.status}
        onChange={(e) =>
          setFormData({
            ...formData,
            status: e.target.value as CreateEventCategoryData["status"],
          })
        }
        options={statusOptions}
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={formData.categoryId === 0}
        >
          {eventCategory ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
