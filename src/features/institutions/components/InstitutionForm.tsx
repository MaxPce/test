import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { Input } from "@/components/ui/Input";
import type { Institution, CreateInstitutionData } from "../types";

interface InstitutionFormProps {
  institution?: Institution;
  onSubmit: (data: CreateInstitutionData, logoFile?: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InstitutionForm({
  institution,
  onSubmit,
  onCancel,
  isLoading,
}: InstitutionFormProps) {
  const [formData, setFormData] = useState<CreateInstitutionData>({
    name: "",
    abrev: "",
    logoUrl: "",
  });

  const [logoFile, setLogoFile] = useState<File | undefined>();

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name,
        abrev: institution.abrev,
        logoUrl: institution.logoUrl || "",
      });
    }
  }, [institution]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, logoFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre de la Institución *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Club Deportivo Nacional"
        required
      />

      <Input
        label="Abreviatura *"
        value={formData.abrev}
        onChange={(e) => setFormData({ ...formData, abrev: e.target.value })}
        placeholder="Ej: CDN"
        maxLength={10}
        required
        helperText="Máximo 10 caracteres"
      />

      <ImageUpload
        currentImage={getImageUrl(formData.logoUrl)}
        onImageSelect={setLogoFile}
        onImageRemove={() => setLogoFile(undefined)}
        label="Logo de la Institución"
        shape="square"
        size="md"
        disabled={isLoading}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {institution ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
