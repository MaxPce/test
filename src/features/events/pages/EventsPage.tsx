import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { useEvents } from "../api/events.queries";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../api/events.mutations";
import { EventForm } from "../components/EventForm";
import { EventCard } from "../components/EventCard";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Event } from "../types";
import type { EventStatus } from "@/lib/types/common.types";

export function EventsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<EventStatus | undefined>(
    undefined
  );

  const { data: events = [], isLoading } = useEvents(
    filterStatus ? { status: filterStatus } : undefined
  );
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedEvent) {
      await updateMutation.mutateAsync({ id: selectedEvent.eventId, data });
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteMutation.mutateAsync(selectedEvent.eventId);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const filterOptions = [
    { value: "", label: "Todos los estados" },
    { value: "programado", label: "Programados" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizados" },
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
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los eventos y competencias
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1 max-w-xs">
              <Select
                value={filterStatus || ""}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value ? (e.target.value as EventStatus) : undefined
                  )
                }
                options={filterOptions}
              />
            </div>
            {filterStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus(undefined)}
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Grid de eventos */}
      {events.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filterStatus
                  ? "No hay eventos con este filtro"
                  : "No hay eventos registrados"}
              </p>
              <Button
                variant="ghost"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                Crear el primero
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Evento"
        size="lg"
      >
        <EventForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        title="Editar Evento"
        size="lg"
      >
        <EventForm
          event={selectedEvent || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Evento"
        message={`¿Estás seguro de que deseas eliminar "${selectedEvent?.name}"? Se eliminarán todas las categorías e inscripciones asociadas.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
