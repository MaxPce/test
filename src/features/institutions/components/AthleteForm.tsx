import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { useInstitutions } from "../api/institutions.queries";
import type { Athlete, CreateAthleteData } from "../types";

interface AthleteFormProps {
  athlete?: Athlete;
  onSubmit: (data: CreateAthleteData, photoFile?: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AthleteForm({
  athlete,
  onSubmit,
  onCancel,
  isLoading,
}: AthleteFormProps) {
  const { data: institutions = [] } = useInstitutions();

  const [formData, setFormData] = useState<CreateAthleteData>({
    institutionId: 0,
    name: "",
    dateBirth: "",
    gender: "M",
    nationality: "PER",
    photoUrl: "",
    docNumber: "",
  });

  const [photoFile, setPhotoFile] = useState<File | undefined>();

  useEffect(() => {
    if (athlete) {
      setFormData({
        institutionId: athlete.institutionId,
        name: athlete.name,
        dateBirth: athlete.dateBirth.split("T")[0],
        gender: athlete.gender,
        nationality: athlete.nationality,
        photoUrl: athlete.photoUrl || "",
        docNumber: athlete.docNumber || "",
      });
    } else if (institutions.length > 0 && formData.institutionId === 0) {
      setFormData((prev) => ({
        ...prev,
        institutionId: institutions[0].institutionId,
      }));
    }
  }, [athlete, institutions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, photoFile);
  };

  const institutionOptions = [
    { value: 0, label: "Seleccione una institución" },
    ...institutions.map((inst) => ({
      value: inst.institutionId,
      label: inst.name,
    })),
  ];

  const genderOptions = [
    { value: "M", label: "Masculino" },
    { value: "F", label: "Femenino" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Institución *"
        value={formData.institutionId}
        onChange={(e) =>
          setFormData({ ...formData, institutionId: Number(e.target.value) })
        }
        options={institutionOptions}
        required
      />

      <Input
        label="Nombre Completo *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: Carlos Rodríguez"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de Nacimiento *"
          type="date"
          value={formData.dateBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateBirth: e.target.value })
          }
          required
        />

        <Select
          label="Género *"
          value={formData.gender}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value as CreateAthleteData["gender"],
            })
          }
          options={genderOptions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nacionalidad *"
          value={formData.nationality}
          onChange={(e) =>
            setFormData({ ...formData, nationality: e.target.value })
          }
          placeholder="PER"
          maxLength={3}
          required
          helperText="Código ISO de 3 letras"
        />

        <Input
          label="Número de Documento"
          value={formData.docNumber}
          onChange={(e) =>
            setFormData({ ...formData, docNumber: e.target.value })
          }
          placeholder="70123456"
        />
      </div>

      <ImageUpload
        currentImage={getImageUrl(formData.photoUrl)}
        onImageSelect={setPhotoFile}
        onImageRemove={() => setPhotoFile(undefined)}
        label="Foto del Atleta"
        shape="circle"
        size="md"
        disabled={isLoading}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={formData.institutionId === 0}
        >
          {athlete ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
