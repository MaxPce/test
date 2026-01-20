import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { UserCircle2, Zap, CheckCircle2 } from "lucide-react";
import type { Phase } from "../types";

interface GenerateRoundRobinModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase;
  registrations: any[];
  onGenerate: (data: { phaseId: number; registrationIds: number[] }) => void;
  isLoading?: boolean;
}

export function GenerateRoundRobinModal({
  isOpen,
  onClose,
  phase,
  registrations,
  onGenerate,
  isLoading,
}: GenerateRoundRobinModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleGenerate = () => {
    onGenerate({
      phaseId: phase.phaseId,
      registrationIds: Array.from(selectedIds),
    });
    setSelectedIds(new Set());
    onClose();
  };

  const calculateMatches = (n: number) => {
    return (n * (n - 1)) / 2;
  };

  const selectedCount = selectedIds.size;
  const totalMatches = calculateMatches(selectedCount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Partidos Automáticamente"
      size="lg"
    >
      <div className="space-y-6">
        {/* Estadísticas */}
        {selectedCount > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-1">Participantes</p>
              <p className="text-2xl font-bold text-green-900">
                {selectedCount}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 mb-1">Partidos a crear</p>
              <p className="text-2xl font-bold text-purple-900">
                {totalMatches}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Participantes */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Selecciona los Participantes ({selectedCount}/{registrations.length}
            )
          </h4>

          <div className="flex gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const allIds = new Set(
                  registrations.map((r) => r.registrationId),
                );
                setSelectedIds(allIds);
              }}
            >
              Seleccionar Todos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Limpiar Selección
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {registrations.map((registration) => {
              const isSelected = selectedIds.has(registration.registrationId);
              const name = registration.athlete
                ? registration.athlete.name
                : registration.team?.name || "Sin nombre";
              const institution =
                registration.athlete?.institution?.name ||
                registration.team?.institution?.name ||
                "";

              return (
                <button
                  key={registration.registrationId}
                  onClick={() => toggleSelection(registration.registrationId)}
                  className={`
                    w-full p-3 rounded-lg border-2 transition-all text-left
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          h-5 w-5 rounded border-2 flex items-center justify-center transition-colors
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }
                        `}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <UserCircle2 className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        {institution && (
                          <p className="text-sm text-gray-600">{institution}</p>
                        )}
                      </div>
                    </div>
                    {registration.seedNumber && (
                      <Badge variant="default" size="sm">
                        Seed #{registration.seedNumber}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={selectedCount < 2}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generar {totalMatches} Partidos
          </Button>
        </div>
      </div>
    </Modal>
  );
}
