import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useGenerateBracket } from "../api/bracket.mutations";
import type { Phase } from "../types";

interface GenerateBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  availableRegistrations: number[];
}

export function GenerateBracketModal({
  isOpen,
  onClose,
  phase,
  availableRegistrations,
}: GenerateBracketModalProps) {
  const [includeThirdPlace, setIncludeThirdPlace] = useState(true);
  const generateBracket = useGenerateBracket();

  const handleGenerate = () => {
    generateBracket.mutate(
      {
        phaseId: phase.phaseId,
        registrationIds: availableRegistrations,
        includeThirdPlace,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const numParticipants = availableRegistrations.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
  const totalRounds = Math.log2(nextPowerOf2);
  const byeCount = nextPowerOf2 - numParticipants;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Bracket de Eliminación"
      size="md"
    >
      <div className="space-y-6">
        {/* Opciones */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={includeThirdPlace}
              onChange={(e) => setIncludeThirdPlace(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <div>
                <p className="font-medium text-gray-900">
                  Incluir partido de tercer lugar
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Se generarán:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            {getRoundNames(totalRounds).map((round, index) => (
              <li key={index}>
                • {round.name}: {round.matches} partido(s)
              </li>
            ))}
            {includeThirdPlace && (
              <li className="text-amber-700">• Tercer lugar: 1 partido</li>
            )}
          </ul>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            isLoading={generateBracket.isPending}
          >
            Generar Bracket
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Helper function
function getRoundNames(totalRounds: number) {
  const rounds = [];
  let matchesInRound = Math.pow(2, totalRounds - 1);

  const names: Record<number, string> = {
    1: "Final",
    2: "Semifinales",
    4: "Cuartos de Final",
    8: "Octavos de Final",
    16: "Dieciseisavos de Final",
  };

  for (let i = 0; i < totalRounds; i++) {
    rounds.push({
      name: names[matchesInRound] || `Ronda de ${matchesInRound * 2}`,
      matches: matchesInRound,
    });
    matchesInRound /= 2;
  }

  return rounds;
}
