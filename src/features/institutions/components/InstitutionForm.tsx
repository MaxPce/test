import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Institution, CreateInstitutionData } from "../types";

interface InstitutionFormProps {
  institution?: Institution;
  onSubmit: (data: CreateInstitutionData) => void;
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
    onSubmit(formData);
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

      <Input
        label="URL del Logo"
        type="url"
        value={formData.logoUrl}
        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
        placeholder="https://ejemplo.com/logo.png"
        helperText="URL opcional de la imagen del logo"
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
