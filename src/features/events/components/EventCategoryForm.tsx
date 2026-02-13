import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useCategories } from "@/features/sports/api/categories.queries";
import {
  useSismasterEvents,
  useSismasterSports,
} from "@/features/institutions/api/sismaster.queries";
import type { EventCategory, CreateEventCategoryData } from "../types";

interface EventCategoryFormProps {
  eventId?: number; // ✅ Ahora es opcional
  externalEventId?: number; // ✅ Agregar para eventos de Sismaster
  eventCategory?: EventCategory;
  onSubmit: (data: CreateEventCategoryData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EventCategoryForm({
  eventId,
  externalEventId, // ✅ Agregar
  eventCategory,
  onSubmit,
  onCancel,
  isLoading,
}: EventCategoryFormProps) {
  const { data: categories = [] } = useCategories();
  const { data: sismasterEvents = [] } = useSismasterEvents();
  const { data: sismasterSports = [] } = useSismasterSports();

  const isExternalEvent = !!externalEventId; // ✅ Detectar tipo de evento

  const [formData, setFormData] = useState<CreateEventCategoryData>({
    eventId: isExternalEvent ? undefined : eventId, // ✅ Condicional
    externalEventId: isExternalEvent ? externalEventId : undefined, // ✅ Condicional
    categoryId: 0,
    status: "pendiente",
    externalSportId: undefined,
  });

  useEffect(() => {
    if (eventCategory) {
      setFormData({
        eventId: eventCategory.eventId,
        externalEventId: eventCategory.externalEventId,
        categoryId: eventCategory.categoryId,
        status: eventCategory.status,
        externalSportId: eventCategory.externalSportId,
      });
    } else if (categories.length > 0 && formData.categoryId === 0) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].categoryId,
      }));
    }
  }, [eventCategory, categories, eventId, externalEventId]);

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

  const sismasterEventOptions = [
    { value: 0, label: "Ninguno (opcional)" },
    ...sismasterEvents.map((evt) => ({
      value: evt.idevent,
      label: `${evt.nameevent} (${evt.yearevent})`,
    })),
  ];

  const sismasterSportOptions = [
    { value: 0, label: "Ninguno (opcional)" },
    ...sismasterSports.map((sport) => ({
      value: sport.idsport,
      label: sport.namesport,
    })),
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

      {/* Selector de Estado */}
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

      {!isExternalEvent && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            🔗 Integración con Sismaster (Opcional)
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Vincula esta categoría con un evento y deporte de Sismaster para
            habilitar la inscripción de atletas acreditados.
          </p>

          {/* Evento de Sismaster */}
          <Select
            label="Evento en Sismaster"
            value={formData.externalEventId || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              setFormData({
                ...formData,
                externalEventId: value === 0 ? undefined : value,
              });
            }}
            options={sismasterEventOptions}
            helperText="Selecciona el evento correspondiente en Sismaster"
          />

          {/* Deporte de Sismaster */}
          <Select
            label="Deporte en Sismaster"
            value={formData.externalSportId || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              setFormData({
                ...formData,
                externalSportId: value === 0 ? undefined : value,
              });
            }}
            options={sismasterSportOptions}
            helperText="Selecciona el deporte correspondiente en Sismaster"
          />

          {/* Alerta si ambos están configurados */}
          {formData.externalEventId && formData.externalSportId && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800">
                ✅ Integración configurada. Podrás inscribir atletas acreditados
                desde Sismaster.
              </p>
            </div>
          )}

          {/* Advertencia si solo uno está configurado */}
          {((formData.externalEventId && !formData.externalSportId) ||
            (!formData.externalEventId && formData.externalSportId)) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Configura ambos campos (evento y deporte) para habilitar la
                integración completa.
              </p>
            </div>
          )}
        </div>
      )}

      

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={
            formData.categoryId === 0 ||
            (isExternalEvent && !formData.externalSportId)
          }
        >
          {eventCategory ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
