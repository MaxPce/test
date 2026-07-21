import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CreateLocalAthleteRegistrationData } from "../types";

interface LocalAthleteFormProps {
  eventCategoryId: number;
  onSubmit: (data: CreateLocalAthleteRegistrationData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function LocalAthleteForm({
  eventCategoryId,
  onSubmit,
  onCancel,
  isLoading,
}: LocalAthleteFormProps) {
  const [firstName, setFirstName]           = useState("");
  const [lastName, setLastName]             = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = "El nombre es obligatorio";
    if (!lastName.trim())  newErrors.lastName  = "El apellido es obligatorio";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    await onSubmit({
      eventCategoryId,
      firstName:       firstName.trim(),
      lastName:        lastName.trim(),
      documentNumber:  documentNumber.trim()   || undefined,
      institutionName: institutionName.trim()  || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <Input
        label="Nombre *"
        type="text"
        placeholder="Ej: Juan"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={errors.firstName}
      />

      {/* Apellido */}
      <Input
        label="Apellido *"
        type="text"
        placeholder="Ej: Pérez"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={errors.lastName}
      />

      {/* DNI (opcional) */}
      <Input
        label="N° Documento (opcional)"
        type="text"
        placeholder="Ej: 12345678"
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
      />

      {/* Institución (opcional) */}
      <Input
        label="Institución / Club (opcional)"
        type="text"
        placeholder="Ej: Club Deportivo Lima"
        value={institutionName}
        onChange={(e) => setInstitutionName(e.target.value)}
      />

      

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="gradient" isLoading={isLoading}>
          Registrar Atleta
        </Button>
      </div>
    </form>
  );
}