import { useState } from "react";
import { useAthleticsResultsTable } from "../../api/athletics.queries";
import { useUpdateAthleticsTime } from "../../api/athletics.mutations";
import { AthleticsTimeInput } from "./AthleticsTimeInput";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { toast } from "sonner";

interface Props {
  phaseId: number;
}

export const AthleticsResultsTable = ({ phaseId }: Props) => {
  const { data: participants = [], isLoading } =
    useAthleticsResultsTable(phaseId);
  const updateTimeMutation = useUpdateAthleticsTime();
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = (
    participationId: number,
    time: string,
    mark: string,
    lane: number | null,
  ) => {
    updateTimeMutation.mutate(
      {
        participationId,
        data: {
          time: time || null,
          mark: mark || null,
          lane,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success("Resultado guardado");
        },
        onError: () => {
          toast.error("Error al guardar el resultado");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay participantes inscritos en esta fase</p>
        <p className="text-sm mt-2">
          Usa el botón "Agregar Participantes" para añadirlos
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
              #
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Participante
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Institución
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
              Calle
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Tiempo / Marca
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {participants.map((participant, index) => {
            const isEditing = editingId === participant.participationId;

            if (isEditing) {
              return (
                <tr
                  key={participant.participationId}
                  className="bg-orange-50 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.participantName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {participant.gender}
                    </div>
                  </td>
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
                  <td colSpan={3} className="px-4 py-3">
                    <AthleticsTimeInput
                      participationId={participant.participationId}
                      initialTime={participant.time || ""}
                      initialMark={participant.mark || ""}
                      initialLane={participant.lane}
                      onSave={handleSave}
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
                <td className="px-4 py-3 text-center">
                  {participant.rank != null ? (
                    <span
                      className={`text-sm font-bold ${
                        participant.rank === 1
                          ? "text-yellow-600"
                          : participant.rank === 2
                            ? "text-gray-500"
                            : participant.rank === 3
                              ? "text-amber-700"
                              : "text-gray-700"
                      }`}
                    >
                      {participant.rank}°
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
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
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-gray-700">
                    {participant.lane ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {participant.time ? (
                    <span className="text-lg font-bold text-orange-600 font-mono">
                      {participant.time}
                    </span>
                  ) : participant.mark ? (
                    <span className="text-lg font-bold text-orange-600">
                      {participant.mark}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setEditingId(participant.participationId)}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium"
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
