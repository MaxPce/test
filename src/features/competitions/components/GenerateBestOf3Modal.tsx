import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Phase } from "../types";
import type { Registration } from "@/features/events/types";

interface GenerateBestOf3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  registrations: Registration[];
  onGenerate: (data: {
    phaseId: number;
    registrationIds: number[];
  }) => Promise<void>;
  isLoading: boolean;
}

export function GenerateBestOf3Modal({
  isOpen,
  onClose,
  phase,
  registrations,
  onGenerate,
  isLoading,
}: GenerateBestOf3ModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleToggle = (registrationId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(registrationId)) {
        return prev.filter((id) => id !== registrationId);
      }
      if (prev.length < 2) {
        return [...prev, registrationId];
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length !== 2) {
      alert("Debes seleccionar exactamente 2 participantes");
      return;
    }

    await onGenerate({
      phaseId: phase.phaseId,
      registrationIds: selectedIds,
    });

    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Serie Mejor de 3">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Participantes ({selectedIds.length}/2)
          </label>
          <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {registrations.map((reg) => {
              const name = reg.athlete
                ? reg.athlete.name
                : reg.team?.name || "Sin nombre";
              const institution =
                reg.athlete?.institution?.name ||
                reg.team?.institution?.name ||
                "";
              const isSelected = selectedIds.includes(reg.registrationId);

              return (
                <label
                  key={reg.registrationId}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                    ${
                      isSelected
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    }
                    ${
                      selectedIds.length >= 2 && !isSelected
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(reg.registrationId)}
                    disabled={selectedIds.length >= 2 && !isSelected}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{name}</p>
                    {institution && (
                      <p className="text-sm text-gray-600">{institution}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedIds.length !== 2 || isLoading}
          >
            {isLoading ? "Generando..." : "Generar Serie"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
