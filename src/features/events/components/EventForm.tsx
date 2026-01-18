import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Event, CreateEventData } from "../types";

interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventData, logoFile?: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
  isLoading,
}: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    status: "programado",
    logoUrl: "",
  });

  const [logoFile, setLogoFile] = useState<File | undefined>();

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        startDate: event.startDate.split("T")[0],
        endDate: event.endDate.split("T")[0],
        location: event.location,
        status: event.status,
        logoUrl: event.logoUrl || "",
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, logoFile);
  };

  const statusOptions = [
    { value: "programado", label: "Programado" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizado" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del Evento *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Campeonato Nacional 2026"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de Inicio *"
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
        />

        <Input
          label="Fecha de Fin *"
          type="date"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          required
          min={formData.startDate}
        />
      </div>

      <Input
        label="Ubicación *"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="Ej: Lima, Perú"
        required
      />

      <Select
        label="Estado *"
        value={formData.status}
        onChange={(e) =>
          setFormData({
            ...formData,
            status: e.target.value as CreateEventData["status"],
          })
        }
        options={statusOptions}
        required
      />

      <ImageUpload
        currentImage={getImageUrl(formData.logoUrl)}
        onImageSelect={setLogoFile}
        onImageRemove={() => setLogoFile(undefined)}
        label="Logo del Evento"
        shape="square"
        size="md"
        disabled={isLoading}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {event ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
