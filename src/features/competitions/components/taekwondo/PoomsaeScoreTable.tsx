import { useState } from "react";
import { usePoomsaeScoreTable } from "../../api/taekwondo.queries";
import { useUpdatePoomsaeScore } from "../../api/taekwondo.mutations";
import { PoomsaeScoreInput } from "./PoomsaeScoreInput";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { PoomsaeParticipant } from "../../types/taekwondo.types";
import { toast } from "sonner";

interface Props {
  phaseId: number;
}

export const PoomsaeScoreTable = ({ phaseId }: Props) => {
  const { data: participants = [], isLoading } = usePoomsaeScoreTable(phaseId);

  const updateScoreMutation = useUpdatePoomsaeScore();

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSaveScore = (
    participationId: number,
    accuracy: number,
    presentation: number,
  ) => {
    updateScoreMutation.mutate(
      {
        participationId,
        data: { accuracy, presentation },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success("Puntaje guardado");
        },
        onError: () => {
          toast.error("Error al guardar puntaje");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay participantes inscritos en esta categoría</p>
        <p className="text-sm mt-2">
          Dirígete a la pestaña "Inscripciones" para agregar participantes
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Participante
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Institución
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Accuracy
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Presentation
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {participants.map((participant) => {
            const isEditing = editingId === participant.participationId;

            if (isEditing) {
              return (
                <tr
                  key={participant.participationId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Participante */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.participantName}
                      {participant.isTeam && (
                        <span className="ml-1 text-xs text-blue-600">
                          (Equipo)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {participant.gender}
                    </div>
                  </td>
                  {/* Institución */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {participant.institutionLogo && (
                        <img
                          src={getImageUrl(participant.institutionLogo)}
                          alt={participant.institution}
                          className="h-6 w-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="text-sm text-gray-700">
                        {participant.institution}
                      </div>
                    </div>
                  </td>

                  {/* ✅ INPUTS DE EDICIÓN: colSpan para ocupar las últimas 4 columnas */}
                  <td colSpan={4} className="px-4 py-3">
                    <PoomsaeScoreInput
                      participationId={participant.participationId}
                      initialAccuracy={participant.accuracy || 0}
                      initialPresentation={participant.presentation || 0}
                      onSave={handleSaveScore}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              );
            }

            return (
              <tr
                key={participant.participationId}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Participante */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {participant.participantName}
                    {participant.isTeam && (
                      <span className="ml-1 text-xs text-blue-600">
                        (Equipo)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {participant.gender}
                  </div>
                </td>
                {/* Institución */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {participant.institutionLogo && (
                      <img
                        src={getImageUrl(participant.institutionLogo)}
                        alt={participant.institution}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="text-sm text-gray-700">
                      {participant.institution}
                    </div>
                  </div>
                </td>

                {/* Accuracy */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {participant.accuracy != null
                      ? Number(participant.accuracy).toFixed(1)
                      : "-"}
                  </span>
                </td>

                {/* Presentation */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {participant.presentation != null
                      ? Number(participant.presentation).toFixed(1)
                      : "-"}
                  </span>
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-center">
                  <span className="text-lg font-bold text-blue-600">
                    {participant.total != null
                      ? Number(participant.total).toFixed(1)
                      : "-"}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setEditingId(participant.participationId)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
