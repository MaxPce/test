import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Timer, Edit2, Trash2, Users, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { TimeInputForm } from "./TimeInputForm";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { usePhaseResults, useDeleteTimeResult } from "../api/results.queries";
import {
  usePhaseRegistrations,
  useRemovePhaseRegistration,
} from "@/features/competitions/api/phaseRegistrations.queries";

interface Registration {
  registrationId: number;
  athlete?: {
    athleteId: number;
    name: string;
    institution: {
      code: string;
      name: string;
      logoUrl?: string;
    };
  };
  team?: {
    teamId: number;
    name: string;
    institution: {
      code: string;
      name: string;
      logoUrl?: string;
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
  rankPosition?: number | null;
  notes?: string | null;
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
  forcedPhaseId?: number;
}

export function SwimmingResultsTable({
  eventCategoryId,
  registrations,
  categoryName,
  forcedPhaseId,
}: SwimmingResultsTableProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [selectedResult, setSelectedResult] =
    useState<SwimmingResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: phases = [], isLoading: phasesLoading } =
    usePhases(eventCategoryId);
  const groupPhases = phases.filter((p: any) => p.type === "grupo");
  const effectivePhaseId =
    forcedPhaseId ||
    selectedPhaseId ||
    groupPhases[0]?.phaseId ||
    phases[0]?.phaseId ||
    0;

  const { data: results = [], isLoading: resultsLoading } =
    usePhaseResults(effectivePhaseId);

  const { data: phaseRegistrations = [], isLoading: phaseRegsLoading } =
    usePhaseRegistrations(forcedPhaseId ?? null);

  const removePhaseRegMutation = useRemovePhaseRegistration();
  const deleteResultMutation = useDeleteTimeResult();

  const activeRegistrations: Registration[] = forcedPhaseId
    ? phaseRegistrations.map((pr: any) => pr.registration as Registration)
    : registrations;

  const getResultForRegistration = (
    registrationId: number,
  ): SwimmingResult | undefined =>
    (results as SwimmingResult[]).find(
      (r) => r.participation?.registration?.registrationId === registrationId,
    );

  const handleRegisterTime = (
    registration: Registration,
    result?: SwimmingResult,
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

  const handleRemoveFromPhase = async (registrationId: number) => {
    if (!forcedPhaseId) return;
    if (window.confirm("¿Quitar este participante de la serie?")) {
      await removePhaseRegMutation.mutateAsync({
        phaseId: forcedPhaseId,
        registrationId,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
    setSelectedResult(null);
  };

  if (phasesLoading || (forcedPhaseId && phaseRegsLoading)) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (!forcedPhaseId && registrations.length === 0) {
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

  const selectedPhase = phases.find(
    (p: any) => p.phaseId === effectivePhaseId,
  );
  const phaseOptions = [
    { value: "0", label: "Seleccione una fase" },
    ...groupPhases.map((phase: any) => ({
      value: String(phase.phaseId),
      label: phase.name,
    })),
  ];

  return (
    <div className="space-y-4">
      {!forcedPhaseId && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Timer className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Resultados de Tiempos</h3>
              <p className="text-blue-100 mt-1">
                {categoryName || "Registro de tiempos por fase"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!forcedPhaseId && groupPhases.length > 1 && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <Select
                  label="Seleccionar Fase"
                  value={String(effectivePhaseId)}
                  onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
                  options={phaseOptions}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {effectivePhaseId > 0 ? (
        <Card>
          {selectedPhase && (
            <CardHeader>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-lg">
                  {(selectedPhase as any).name}
                </h4>
                <Badge variant="primary">
                  {activeRegistrations.length} participantes
                </Badge>
              </div>
            </CardHeader>
          )}

          <CardBody className="p-0">
            {resultsLoading ? (
              <div className="text-center py-12">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-4">Cargando tiempos...</p>
              </div>
            ) : activeRegistrations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-600">
                  No hay participantes en esta serie
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Usa el botón{" "}
                  <strong>"Asignar Participante"</strong> para agregar atletas a
                  esta serie
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Participante
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Institución
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Tiempo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeRegistrations.map((registration) => {
                      const result = getResultForRegistration(
                        registration.registrationId,
                      );
                      const isTeam = !!registration.team;
                      const isDQ = result?.notes?.includes("DQ");
                      const institution = isTeam
                        ? registration.team?.institution
                        : registration.athlete?.institution;

                      return (
                        <tr
                          key={registration.registrationId}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            {isDQ ? (
                              <Badge
                                variant="default"
                                className="bg-red-100 text-red-700 text-xs"
                              >
                                DQ
                              </Badge>
                            ) : result ? (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-700 text-xs"
                              >
                                ✓
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-4 py-4">
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
                              <p className="text-sm font-medium text-gray-900">
                                {registration.athlete?.name}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {institution?.logoUrl && (
                                <img
                                  src={getImageUrl(institution.logoUrl)}
                                  alt={institution.name}
                                  className="h-6 w-6 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                              <span className="text-sm text-gray-700">
                                {institution?.name || "Sin institución"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {result ? (
                              <span
                                className={`text-sm font-mono font-bold ${
                                  isDQ
                                    ? "text-red-500 line-through"
                                    : "text-blue-700"
                                }`}
                              >
                                {result.timeValue}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Sin tiempo
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                              {result ? (
                                <>
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
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleRegisterTime(registration)}
                                >
                                  <Timer className="h-4 w-4 mr-1" />
                                  Registrar
                                </Button>
                              )}

                              {forcedPhaseId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveFromPhase(
                                      registration.registrationId,
                                    )
                                  }
                                  disabled={removePhaseRegMutation.isPending}
                                  title="Quitar de esta serie"
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 ml-1"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <Timer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">
                {groupPhases.length === 0
                  ? "No hay fases creadas para esta categoría"
                  : "Selecciona una fase para ver los tiempos"}
              </p>
              {groupPhases.length === 0 && (
                <p className="text-sm mt-1">
                  Crea las fases desde la pestaña de configuración
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedResult
            ? `Editar Tiempo${selectedRegistration?.team ? " - Equipo" : " - Atleta"}`
            : `Registrar Tiempo${selectedRegistration?.team ? " - Equipo" : " - Atleta"}`
        }
      >
        {selectedRegistration && (
          <TimeInputForm
            registration={selectedRegistration}
            existingResult={selectedResult || undefined}
            phaseId={effectivePhaseId}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
}
