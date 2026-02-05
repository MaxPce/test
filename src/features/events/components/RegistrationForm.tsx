import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useAthletes } from "@/features/institutions/api/athletes.queries";
import { useTeams } from "@/features/institutions/api/teams.queries";
import type { CreateRegistrationData, EventCategory } from "../types";

interface RegistrationFormProps {
  eventCategory: EventCategory;
  onSubmit: (data: CreateRegistrationData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RegistrationForm({
  eventCategory,
  onSubmit,
  onCancel,
  isLoading,
}: RegistrationFormProps) {
  const isTeamCategory = eventCategory.category?.type === "equipo";

  const { data: athletes = [] } = useAthletes();
  const { data: teams = [] } = useTeams(
    isTeamCategory ? { categoryId: eventCategory.categoryId } : undefined
  );

  const [formData, setFormData] = useState<CreateRegistrationData>({
    eventCategoryId: eventCategory.eventCategoryId,
    athleteId: isTeamCategory ? undefined : 0,
    teamId: isTeamCategory ? 0 : undefined,
    seedNumber: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit: CreateRegistrationData = {
      eventCategoryId: formData.eventCategoryId,
      seedNumber: formData.seedNumber,
    };

    if (isTeamCategory) {
      dataToSubmit.teamId = formData.teamId;
    } else {
      dataToSubmit.athleteId = formData.athleteId;
    }

    onSubmit(dataToSubmit);
  };

  const athleteOptions = [
    { value: 0, label: "Seleccione un atleta" },
    ...athletes
      .filter(
        (a) =>
          a.gender === eventCategory.category?.gender ||
          eventCategory.category?.gender === "MIXTO"
      )
      .map((athlete) => ({
        value: athlete.athleteId,
        label: `${athlete.name} - ${athlete.institution?.name}`,
      })),
  ];

  const teamOptions = [
    { value: 0, label: "Seleccione un equipo" },
    ...teams.map((team) => ({
      value: team.teamId,
      label: `${team.name} - ${team.institution?.name}`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900">
          {eventCategory.category?.name}
        </h4>
        <p className="text-sm text-blue-700">
          {eventCategory.category?.sport?.name} -{" "}
          {isTeamCategory ? "Equipo" : "Individual"}
        </p>
      </div>

      {isTeamCategory ? (
        <Select
          label="Equipo *"
          value={formData.teamId || 0}
          onChange={(e) =>
            setFormData({ ...formData, teamId: Number(e.target.value) })
          }
          options={teamOptions}
          required
        />
      ) : (
        <Select
          label="Atleta *"
          value={formData.athleteId || 0}
          onChange={(e) =>
            setFormData({ ...formData, athleteId: Number(e.target.value) })
          }
          options={athleteOptions}
          required
        />
      )}

      <Input
        label="Número de Seed (Opcional)"
        type="number"
        min="1"
        value={formData.seedNumber || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            seedNumber: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        placeholder="1"
        helperText="Número de preclasificación del participante"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={
            isTeamCategory
              ? !formData.teamId || formData.teamId === 0
              : !formData.athleteId || formData.athleteId === 0
          }
        >
          Inscribir
        </Button>
      </div>
    </form>
  );
}
