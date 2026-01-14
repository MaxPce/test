import { useState } from "react";
import { X, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Match } from "../types";
import type { Registration } from "@/features/events/types";
import {
  useCreateParticipation,
  useDeleteParticipation,
} from "../api/participations.mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface EditMatchParticipantsModalProps {
  match: Match;
  phaseId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function EditMatchParticipantsModal({
  match,
  phaseId,
  isOpen,
  onClose,
}: EditMatchParticipantsModalProps) {
  const queryClient = useQueryClient();
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    number | null
  >(null);
  const [selectedCorner, setSelectedCorner] = useState<
    "blue" | "white" | "A" | "B"
  >("blue");

  const createParticipation = useCreateParticipation();
  const deleteParticipation = useDeleteParticipation();

  // Obtener todos los registros de la fase
  const { data: registrations = [] } = useQuery<Registration[]>({
    queryKey: ["event-category-registrations", match.phase?.eventCategoryId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/events/categories/${match.phase?.eventCategoryId}/registrations`
      );
      return response.data;
    },
    enabled: isOpen && !!match.phase?.eventCategoryId,
  });

  // Participantes actuales del match
  const currentParticipants = match.participations || [];

  // Registros disponibles (no asignados aún a este match)
  const availableRegistrations = registrations.filter(
    (reg) =>
      !currentParticipants.some(
        (p) => p.registration?.registrationId === reg.registrationId
      )
  );

  const handleAddParticipant = async () => {
    if (!selectedRegistrationId) return;

    try {
      await createParticipation.mutateAsync({
        matchId: match.matchId,
        registrationId: selectedRegistrationId,
        corner: selectedCorner,
      });

      // Invalidar las queries para refrescar
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      setSelectedRegistrationId(null);
    } catch (error) {
      console.error("Error al agregar participante:", error);
    }
  };

  const handleRemoveParticipant = async (participationId: number) => {
    if (!confirm("¿Estás seguro de eliminar este participante del match?"))
      return;

    try {
      await deleteParticipation.mutateAsync(participationId);

      // Invalidar las queries para refrescar
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    } catch (error) {
      console.error("Error al eliminar participante:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/30 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Participantes del Match
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Match #{match.matchNumber} - {match.round}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Participantes actuales */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Participantes Actuales ({currentParticipants.length})
              </h3>
              {currentParticipants.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No hay participantes asignados
                </p>
              ) : (
                <div className="space-y-2">
                  {currentParticipants.map((participation) => {
                    const reg = participation.registration;
                    const name = reg?.athlete
                      ? reg.athlete.name
                      : reg?.team?.name || "Sin nombre";
                    const institution =
                      reg?.athlete?.institution?.name ||
                      reg?.team?.institution?.name ||
                      "N/A";

                    return (
                      <div
                        key={participation.participationId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">
                              {institution}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              participation.corner === "blue" ||
                              participation.corner === "A"
                                ? "primary"
                                : "default"
                            }
                            size="sm"
                          >
                            {participation.corner === "blue" && "Azul"}
                            {participation.corner === "white" && "Blanco"}
                            {participation.corner === "A" && "A"}
                            {participation.corner === "B" && "B"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveParticipant(
                                participation.participationId
                              )
                            }
                            disabled={deleteParticipation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Agregar nuevo participante */}
            {availableRegistrations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Agregar Participante
                </h3>
                <div className="space-y-3">
                  {/* Seleccionar participante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar
                    </label>
                    <select
                      value={selectedRegistrationId || ""}
                      onChange={(e) =>
                        setSelectedRegistrationId(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Seleccionar participante --</option>
                      {availableRegistrations.map((reg) => {
                        const name = reg.athlete
                          ? reg.athlete.name
                          : reg.team?.name || "Sin nombre";
                        const institution =
                          reg.athlete?.institution?.name ||
                          reg.team?.institution?.name ||
                          "N/A";
                        return (
                          <option
                            key={reg.registrationId}
                            value={reg.registrationId}
                          >
                            {name} - {institution}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Seleccionar corner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Esquina/Posición
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCorner("blue")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedCorner === "blue"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Azul
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCorner("white")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedCorner === "white"
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Blanco
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCorner("A")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedCorner === "A"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCorner("B")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedCorner === "B"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        B
                      </button>
                    </div>
                  </div>

                  {/* Botón agregar */}
                  <Button
                    onClick={handleAddParticipant}
                    disabled={
                      !selectedRegistrationId || createParticipation.isPending
                    }
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {createParticipation.isPending
                      ? "Agregando..."
                      : "Agregar Participante"}
                  </Button>
                </div>
              </div>
            )}

            {availableRegistrations.length === 0 &&
              currentParticipants.length > 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Todos los participantes disponibles ya están asignados a este
                  match
                </p>
              )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
