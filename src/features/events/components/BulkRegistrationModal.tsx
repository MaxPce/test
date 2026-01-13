import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAthletes } from "@/features/institutions/api/athletes.queries";
import { useBulkRegistration } from "../api/registrations.mutations";
import type { EventCategory } from "../types";

interface BulkRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCategory: EventCategory;
}

export function BulkRegistrationModal({
  isOpen,
  onClose,
  eventCategory,
}: BulkRegistrationModalProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<number[]>([]);
  const { data: athletes = [], isLoading } = useAthletes();
  const bulkMutation = useBulkRegistration();

  // Filtrar atletas por género
  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.gender === eventCategory.category?.gender ||
      eventCategory.category?.gender === "MIXTO"
  );

  // Atletas ya inscritos
  const registeredAthleteIds =
    eventCategory.registrations?.map((r) => r.athleteId).filter(Boolean) || [];

  // Atletas disponibles
  const availableAthletes = filteredAthletes.filter(
    (athlete) => !registeredAthleteIds.includes(athlete.athleteId)
  );

  const handleToggleAthlete = (athleteId: number) => {
    setSelectedAthletes((prev) =>
      prev.includes(athleteId)
        ? prev.filter((id) => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAthletes.length === availableAthletes.length) {
      setSelectedAthletes([]);
    } else {
      setSelectedAthletes(availableAthletes.map((a) => a.athleteId));
    }
  };

  const handleSubmit = async () => {
    if (selectedAthletes.length === 0) return;

    await bulkMutation.mutateAsync({
      eventCategoryId: eventCategory.eventCategoryId,
      athleteIds: selectedAthletes,
    });

    setSelectedAthletes([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inscripción Masiva"
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900">
            {eventCategory.category?.name}
          </h4>
          <p className="text-sm text-blue-700">
            {eventCategory.category?.sport?.name}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : availableAthletes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay atletas disponibles para inscribir
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedAthletes.length} de {availableAthletes.length}{" "}
                seleccionados
              </p>
              <Button size="sm" variant="ghost" onClick={handleSelectAll}>
                {selectedAthletes.length === availableAthletes.length
                  ? "Deseleccionar todos"
                  : "Seleccionar todos"}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {availableAthletes.map((athlete) => (
                <label
                  key={athlete.athleteId}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedAthletes.includes(athlete.athleteId)}
                    onChange={() => handleToggleAthlete(athlete.athleteId)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {athlete.photoUrl ? (
                      <img
                        src={athlete.photoUrl}
                        alt={athlete.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {athlete.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {athlete.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {athlete.institution?.name}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={bulkMutation.isPending}
            disabled={selectedAthletes.length === 0}
          >
            Inscribir {selectedAthletes.length} atleta(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
