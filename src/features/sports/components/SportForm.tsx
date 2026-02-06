import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useSportTypes } from "../api/sportTypes.queries";
import { useUploadSportIcon } from "../api/sports.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Sport, CreateSportData } from "../types";

interface SportFormProps {
  sport?: Sport;
  onSubmit: (data: CreateSportData) => Promise<Sport>;
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
  const uploadIconMutation = useUploadSportIcon();

  const [formData, setFormData] = useState<CreateSportData>({
    sportTypeId: 0,
    name: "",
    iconUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleImageSelect = (file: File) => {
    setImageFile(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Primero crear o actualizar el deporte
      const savedSport = await onSubmit(formData);

      // Si hay un archivo, subir la imagen
      if (imageFile) {
        const sportId = sport?.sportId || savedSport.sportId;
        await uploadIconMutation.mutateAsync({
          id: sportId,
          file: imageFile,
        });
      }
    } catch (error) {
      console.error("Error al guardar deporte:", error);
    }
  };

  const sportTypeOptions = [
    { value: 0, label: "Seleccione un tipo" },
    ...sportTypes.map((type) => ({
      value: type.sportTypeId,
      label: type.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload de imagen */}
      <ImageUpload
        currentImage={sport?.iconUrl ? getImageUrl(sport.iconUrl) : undefined}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        label="Imagen del Deporte"
        shape="square"
        size="lg"
      />

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

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading || uploadIconMutation.isPending}
          disabled={formData.sportTypeId === 0}
          variant="gradient"
        >
          {sport ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
