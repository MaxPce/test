import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Timer, Edit2, Trash2, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TimeInputForm } from "./TimeInputForm";
import {
  useSwimmingResults,
  useDeleteTimeResult,
} from "../api/results.queries";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

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
  rankPosition?: number | null; // ✅ Permitir null
  notes?: string | null; // ✅ Permitir null
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
          <Timer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 font-medium">
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      {/* Número de fila */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* Participante (Equipo o Atleta) */}
                      <td className="px-6 py-4">
                        {isTeam ? (
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
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
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {registration.athlete?.name}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Institución */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default" size="sm">
                          {isTeam
                            ? registration.team?.institution?.code
                            : registration.athlete?.institution?.code}
                        </Badge>
                      </td>

                      {/* Tiempo */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-mono font-bold ${
                                isDQ
                                  ? "text-red-600 line-through"
                                  : "text-gray-900"
                              }`}
                            >
                              {isDQ && "x"}
                              {result.timeValue}
                            </span>
                            {isDQ && (
                              <Badge
                                variant="default"
                                className="bg-red-100 text-red-700"
                              >
                                DQ
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Sin tiempo
                          </span>
                        )}
                      </td>

                      {/* Posición */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {result?.rankPosition ? (
                          <Badge
                            variant={
                              result.rankPosition === 1
                                ? "success"
                                : result.rankPosition <= 3
                                ? "primary"
                                : "default"
                            }
                            className="font-bold"
                          >
                            {result.rankPosition}°
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
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
        title={
          selectedResult
            ? `Editar Tiempo${
                selectedRegistration?.team ? " - Equipo" : " - Atleta"
              }`
            : `Registrar Tiempo${
                selectedRegistration?.team ? " - Equipo" : " - Atleta"
              }`
        }
      >
        {selectedRegistration && (
          <TimeInputForm
            registration={selectedRegistration}
            existingResult={selectedResult || undefined}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
}
