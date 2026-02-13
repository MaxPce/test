import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Autocomplete } from "@/components/ui/Autocomplete";
import type { AutocompleteOption } from "@/components/ui/Autocomplete";
import { useSearchAthletes } from "@/features/institutions/api/sismaster.queries";
import { useTeams } from "@/features/institutions/api/teams.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<number>(0);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(0);
  const [seedNumber, setSeedNumber] = useState<number | undefined>(undefined);

  // Buscar atletas desde sismaster (solo para categorías individuales)
  const { data: athletesFromSismaster = [], isLoading: isSearching } =
    useSearchAthletes(searchQuery, !isTeamCategory && searchQuery.length >= 2);

  // Teams (se mantiene igual, viene de tu DB local)
  const { data: teams = [] } = useTeams(
    isTeamCategory ? { categoryId: eventCategory.categoryId } : undefined,
  );

  // Filtrar atletas por género de la categoría
  const filteredAthletes = useMemo(() => {
    if (isTeamCategory) return [];

    return athletesFromSismaster.filter(
      (athlete) =>
        athlete.gender === eventCategory.category?.gender ||
        eventCategory.category?.gender === "MIXTO",
    );
  }, [athletesFromSismaster, eventCategory.category?.gender, isTeamCategory]);

  // Convertir atletas a opciones de autocomplete
  const athleteOptions: AutocompleteOption[] = useMemo(() => {
    return filteredAthletes.map((athlete) => ({
      value: athlete.idperson, // ID de sismaster
      label: `${athlete.firstname} ${athlete.lastname}`,
      sublabel: athlete.institution_name || "Sin institución",
      imageUrl: athlete.photo ? getImageUrl(athlete.photo) : undefined,
    }));
  }, [filteredAthletes]);

  // Opciones de equipos (se mantiene igual)
  const teamOptions = useMemo(() => {
    return teams.map((team) => ({
      value: team.teamId,
      label: team.name,
      sublabel: team.institution?.name,
    }));
  }, [teams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit: CreateRegistrationData = {
      eventCategoryId: eventCategory.eventCategoryId,
      seedNumber,
    };

    if (isTeamCategory) {
      dataToSubmit.teamId = selectedTeamId;
    } else {
      // ⚠️ IMPORTANTE: Guardar el ID de sismaster como external_athlete_id
      dataToSubmit.external_athlete_id = selectedAthleteId;
    }

    onSubmit(dataToSubmit);
  };

  const isFormValid = isTeamCategory
    ? selectedTeamId > 0
    : selectedAthleteId > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Información de la categoría */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <h4 className="font-bold text-blue-900 text-lg">
          {eventCategory.category?.name}
        </h4>
        <p className="text-sm text-blue-700 mt-1">
          {eventCategory.category?.sport?.name} •{" "}
          {isTeamCategory ? "Equipo" : "Individual"} •{" "}
          {eventCategory.category?.gender}
        </p>
      </div>

      {/* Selector de atleta o equipo */}
      {isTeamCategory ? (
        <Autocomplete
          label="Equipo *"
          placeholder="Buscar equipo..."
          options={teamOptions}
          value={selectedTeamId}
          onChange={(value) => setSelectedTeamId(value)}
          onInputChange={() => {}} // Teams no tienen búsqueda dinámica
          required
          helperText="Selecciona el equipo que participará"
        />
      ) : (
        <Autocomplete
          label="Atleta *"
          placeholder="Buscar por nombre del atleta..."
          options={athleteOptions}
          value={selectedAthleteId}
          onChange={(value) => setSelectedAthleteId(value)}
          onInputChange={setSearchQuery}
          isLoading={isSearching}
          required
          helperText={`Búsqueda en tiempo real - Género: ${eventCategory.category?.gender}`}
          minSearchLength={2}
        />
      )}

      {/* Número de seed */}
      <Input
        label="Número de Seed (Opcional)"
        type="number"
        min="1"
        value={seedNumber || ""}
        onChange={(e) =>
          setSeedNumber(e.target.value ? Number(e.target.value) : undefined)
        }
        placeholder="1"
        helperText="Número de preclasificación del participante"
      />

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!isFormValid}
          variant="gradient"
        >
          Inscribir
        </Button>
      </div>
    </form>
  );
}
