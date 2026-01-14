import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";
import type { Match } from "../types";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onSubmit: (matchId: number, winnerId: number) => void;
  isLoading?: boolean;
}

export function ResultModal({
  isOpen,
  onClose,
  match,
  onSubmit,
  isLoading,
}: ResultModalProps) {
  const [selectedWinner, setSelectedWinner] = useState<number>(0);

  const handleSubmit = () => {
    if (selectedWinner > 0) {
      onSubmit(match.matchId, selectedWinner);
      setSelectedWinner(0);
      onClose();
    }
  };

  const participants = match.participations || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Resultado"
      size="md"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Partido:</strong> {match.phase?.name}
            {match.round && ` - ${match.round}`}
          </p>
          {match.matchNumber && (
            <p className="text-sm text-blue-700">
              Partido #{match.matchNumber}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Seleccione el Ganador
          </h4>
          <div className="space-y-3">
            {participants.map((participation) => {
              const reg = participation.registration;
              const name = reg?.athlete
                ? reg.athlete.name
                : reg?.team?.name || "Sin nombre";
              const institution =
                reg?.athlete?.institution?.name ||
                reg?.team?.institution?.name ||
                "";
              const isSelected =
                selectedWinner === participation.registrationId;

              return (
                <button
                  key={participation.participationId}
                  onClick={() =>
                    setSelectedWinner(participation.registrationId)
                  }
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all text-left
                    ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <Trophy className="h-6 w-6 text-green-600" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{name}</p>
                        {institution && (
                          <p className="text-sm text-gray-600">{institution}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        participation.corner === "blue" ||
                        participation.corner === "A"
                          ? "primary"
                          : "default"
                      }
                    >
                      {participation.corner === "blue" && "Azul"}
                      {participation.corner === "white" && "Blanco"}
                      {participation.corner === "A" && "A"}
                      {participation.corner === "B" && "B"}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={selectedWinner === 0}
          >
            Registrar Ganador
          </Button>
        </div>
      </div>
    </Modal>
  );
}
