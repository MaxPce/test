// src/features/results/components/SwimmingResultsTable.tsx
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Timer, Edit2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TimeInputForm } from "./TimeInputForm";
import {
  useSwimmingResults,
  useDeleteTimeResult,
} from "../api/results.queries";
import { Spinner } from "@/components/ui/Spinner";

interface Registration {
  registrationId: number;
  athlete?: {
    athleteId: number;
    name: string;
    institution: {
      code: string;
      name: string;
    };
  };
  team?: {
    teamId: number;
    name: string;
    institution: {
      code: string;
      name: string;
    };
    members: Array<{
      tmId: number;
      athlete: {
        athleteId: number;
        name: string;
      };
    }>;
  };
}

interface SwimmingResult {
  resultId: number;
  timeValue: string;
  rankPosition?: number;
  notes?: string;
  participation?: {
    registration?: {
      registrationId: number;
    };
  };
}

interface SwimmingResultsTableProps {
  eventCategoryId: number;
  registrations: Registration[];
  categoryName?: string;
}

export function SwimmingResultsTable({
  eventCategoryId,
  registrations,
  categoryName,
}: SwimmingResultsTableProps) {
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [selectedResult, setSelectedResult] = useState<SwimmingResult | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: results = [], isLoading } = useSwimmingResults(eventCategoryId);
  const deleteResultMutation = useDeleteTimeResult();

  // Función para encontrar el resultado de una inscripción
  const getResultForRegistration = (registrationId: number) => {
    return results.find(
      (r) => r.participation?.registration?.registrationId === registrationId
    );
  };

  const handleRegisterTime = (
    registration: Registration,
    result?: SwimmingResult
  ) => {
    setSelectedRegistration(registration);
    setSelectedResult(result || null);
    setIsModalOpen(true);
  };

  const handleDeleteResult = async (resultId: number) => {
    if (window.confirm("¿Estás seguro de eliminar este resultado?")) {
      await deleteResultMutation.mutateAsync(resultId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
    setSelectedResult(null);
  };

  if (registrations.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-gray-500">
            No hay participantes inscritos en esta categoría
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Ve a la pestaña "Inscripciones" para agregar participantes
          </p>
        </CardBody>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration, index) => {
                  const result = getResultForRegistration(
                    registration.registrationId
                  );
                  const isTeam = !!registration.team;
                  const isDQ = result?.notes?.includes("DQ");

                  return (
                    <tr
                      key={registration.registrationId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isTeam ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {registration.team?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {registration.team?.members
                                ?.map((m) => m.athlete.name)
                                .join(", ")}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {registration.athlete?.name}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isTeam
                          ? registration.team?.institution?.code
                          : registration.athlete?.institution?.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-mono font-medium ${
                                isDQ
                                  ? "text-red-600 line-through"
                                  : "text-gray-900"
                              }`}
                            >
                              {isDQ && "x"}
                              {result.timeValue}
                            </span>
                            {isDQ && (
                              <span className="text-xs text-red-600 font-medium">
                                DQ
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Sin tiempo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result?.rankPosition ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            {result.rankPosition}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {result ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRegisterTime(registration, result)
                              }
                              title="Editar tiempo"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteResult(result.resultId)
                              }
                              disabled={deleteResultMutation.isPending}
                              title="Eliminar resultado"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegisterTime(registration)}
                          >
                            <Timer className="h-4 w-4 mr-2" />
                            Registrar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal para registrar/editar tiempo */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedResult ? "Editar Tiempo" : "Registrar Tiempo"}
      >
        {selectedRegistration && (
          <TimeInputForm
            registration={selectedRegistration}
            existingResult={selectedResult}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
}
