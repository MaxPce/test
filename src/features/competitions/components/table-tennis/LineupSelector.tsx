import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Users, CheckCircle } from "lucide-react";
import { useSetLineup } from "../../api/table-tennis.queries";

interface TeamMember {
  tmId: number;
  athleteId: number;
  athlete: {
    athleteId: number;
    name: string;
  };
}

interface LineupSelectorProps {
  participationId: number;
  teamName: string;
  members: TeamMember[];
  existingLineup?: Array<{
    athleteId: number;
    lineupOrder: number;
    isSubstitute: boolean;
  }>;
  onSuccess?: () => void;
}

export function LineupSelector({
  participationId,
  teamName,
  members,
  existingLineup,
  onSuccess,
}: LineupSelectorProps) {
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);
  const [selectedC, setSelectedC] = useState<number | null>(null);
  const [selectedSub, setSelectedSub] = useState<number | null>(null);

  const setLineupMutation = useSetLineup();

  // Cargar lineup existente si hay
  useEffect(() => {
    if (existingLineup && existingLineup.length > 0) {
      existingLineup.forEach((lineup) => {
        if (lineup.lineupOrder === 1) setSelectedA(lineup.athleteId);
        if (lineup.lineupOrder === 2) setSelectedB(lineup.athleteId);
        if (lineup.lineupOrder === 3) setSelectedC(lineup.athleteId);
        if (lineup.isSubstitute) setSelectedSub(lineup.athleteId);
      });
    }
  }, [existingLineup]);

  const handleSubmit = () => {
    if (!selectedA || !selectedB || !selectedC || !selectedSub) {
      alert("Debes seleccionar los 3 titulares y 1 suplente");
      return;
    }

    // Verificar que no haya duplicados
    const selected = [selectedA, selectedB, selectedC, selectedSub];
    const unique = new Set(selected);
    if (unique.size !== selected.length) {
      alert("No puedes seleccionar el mismo atleta en múltiples posiciones");
      return;
    }

    setLineupMutation.mutate(
      {
        participationId,
        data: {
          lineups: [
            { athleteId: selectedA, lineupOrder: 1, isSubstitute: false },
            { athleteId: selectedB, lineupOrder: 2, isSubstitute: false },
            { athleteId: selectedC, lineupOrder: 3, isSubstitute: false },
            { athleteId: selectedSub, lineupOrder: 4, isSubstitute: true },
          ],
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const getAvailableMembers = (currentPosition: number | null) => {
    const selected = [selectedA, selectedB, selectedC, selectedSub].filter(
      (id) => id !== currentPosition,
    );
    return members.filter((m) => !selected.includes(m.athleteId));
  };

  const renderSelect = (
    label: string,
    value: number | null,
    onChange: (value: number | null) => void,
    letter: string,
  ) => {
    const available = getAvailableMembers(value);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <select
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={setLineupMutation.isPending}
        >
          <option value="">Seleccionar jugador</option>
          {/* Mostrar el valor actual si existe + todos los disponibles */}
          {members.map((member) => {
            // Mostrar si es el valor actual O si está disponible
            const isSelected = value === member.athleteId;
            const isAvailable = available.some(
              (m) => m.athleteId === member.athleteId,
            );

            if (isSelected || isAvailable) {
              return (
                <option key={member.athleteId} value={member.athleteId}>
                  {member.athlete.name}
                </option>
              );
            }
            return null;
          })}
        </select>
        {value && (
          <div className="mt-1 flex items-center text-sm text-green-600">
            Posición {letter} asignada
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Configurar Lineup - {teamName}
          </h3>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Titulares */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">
              Jugadores Titulares
            </h4>
            {renderSelect(
              "Jugador A (1er Juego)",
              selectedA,
              setSelectedA,
              "A",
            )}
            {renderSelect(
              "Jugador B (2do Juego)",
              selectedB,
              setSelectedB,
              "B",
            )}
            {renderSelect(
              "Jugador C (3er Juego)",
              selectedC,
              setSelectedC,
              "C",
            )}
          </div>

          {/* Suplente */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">
              Jugador Suplente
            </h4>
            {renderSelect("Suplente", selectedSub, setSelectedSub, "Suplente")}
          </div>
        </div>

        {setLineupMutation.isError && (
          <Alert variant="error">
            Error:{" "}
            {setLineupMutation.error instanceof Error
              ? setLineupMutation.error.message
              : "Error desconocido"}
          </Alert>
        )}

        {setLineupMutation.isSuccess && (
          <Alert variant="success">
            <span className="ml-2">Participantes registrados</span>
          </Alert>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedA ||
              !selectedB ||
              !selectedC ||
              !selectedSub ||
              setLineupMutation.isPending
            }
            isLoading={setLineupMutation.isPending}
          >
            {setLineupMutation.isPending ? "Guardando..." : "Guardar Lineup"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
