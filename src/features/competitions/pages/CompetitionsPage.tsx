import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { usePhases } from "../api/phases.queries";
import { useEventCategories } from "@/features/events/api/eventCategories.queries";
import {
  useCreatePhase,
  useUpdatePhase,
  useDeletePhase,
} from "../api/phases.mutations";
import { PhaseForm } from "../components/PhaseForm";
import { PhaseCard } from "../components/PhaseCard";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Phase } from "../types";

export function CompetitionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedEventCategoryId, setSelectedEventCategoryId] = useState<
    number | undefined
  >(undefined);

  const { data: eventCategories = [] } = useEventCategories();
  const { data: phases = [], isLoading } = usePhases(
    selectedEventCategoryId
      ? { eventCategoryId: selectedEventCategoryId }
      : undefined
  );
  const createMutation = useCreatePhase();
  const updateMutation = useUpdatePhase();
  const deleteMutation = useDeletePhase();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedPhase) {
      await updateMutation.mutateAsync({ id: selectedPhase.phaseId, data });
      setIsEditModalOpen(false);
      setSelectedPhase(null);
    }
  };

  const handleDelete = async () => {
    if (selectedPhase) {
      await deleteMutation.mutateAsync(selectedPhase.phaseId);
      setIsDeleteModalOpen(false);
      setSelectedPhase(null);
    }
  };

  const openEditModal = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsDeleteModalOpen(true);
  };

  const eventCategoryOptions = [
    { value: "", label: "Todas las categorías de eventos" },
    ...eventCategories.map((ec) => ({
      value: String(ec.eventCategoryId),
      label: `${ec.event?.name} - ${ec.category?.name}`,
    })),
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competencias</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las fases y partidos de las competencias
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={eventCategories.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Fase
        </Button>
      </div>

      {eventCategories.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay categorías de eventos disponibles. Primero crea un evento
                y asocia categorías.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Filtrar por:
                </label>
                <div className="flex-1 max-w-md">
                  <Select
                    value={selectedEventCategoryId || ""}
                    onChange={(e) =>
                      setSelectedEventCategoryId(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    options={eventCategoryOptions}
                  />
                </div>
                {selectedEventCategoryId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEventCategoryId(undefined)}
                  >
                    Limpiar filtro
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Grid de fases */}
          {phases.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {selectedEventCategoryId
                      ? "No hay fases con este filtro"
                      : "No hay fases registradas"}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4"
                  >
                    Crear la primera
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.map((phase) => (
                <PhaseCard
                  key={phase.phaseId}
                  phase={phase}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Fase"
        size="lg"
      >
        <div className="mb-4">
          <Select
            label="Categoría de Evento *"
            value={selectedEventCategoryId || ""}
            onChange={(e) =>
              setSelectedEventCategoryId(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            options={eventCategoryOptions.filter((opt) => opt.value !== "")}
          />
        </div>
        {selectedEventCategoryId && (
          <PhaseForm
            eventCategoryId={selectedEventCategoryId}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createMutation.isPending}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPhase(null);
        }}
        title="Editar Fase"
        size="lg"
      >
        {selectedPhase && (
          <PhaseForm
            eventCategoryId={selectedPhase.eventCategoryId}
            phase={selectedPhase}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedPhase(null);
            }}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPhase(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Fase"
        message={`¿Estás seguro de que deseas eliminar "${selectedPhase?.name}"? Se eliminarán todos los partidos y participaciones asociadas.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
