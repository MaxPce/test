import { useState } from "react";
import { Plus, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useEvents } from "../api/events.queries";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventLogo, // ✅ AGREGAR
} from "../api/events.mutations";
import { EventForm } from "../components/EventForm";
import { EventCard } from "../components/EventCard";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Event, CreateEventData } from "../types"; // ✅ MODIFICAR
import type { EventStatus } from "@/lib/types/common.types";

export function EventsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<EventStatus | undefined>(
    undefined,
  );

  const { data: events = [], isLoading } = useEvents(
    filterStatus ? { status: filterStatus } : undefined,
  );
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const uploadLogoMutation = useUploadEventLogo(); // ✅ AGREGAR

  // ✅ MODIFICAR: Agregar parámetro logoFile
  const handleCreate = async (data: CreateEventData, logoFile?: File) => {
    try {
      // 1. Crear el evento
      const event = await createMutation.mutateAsync(data);

      // 2. Si hay archivo de logo, subirlo
      if (logoFile && event.eventId) {
        await uploadLogoMutation.mutateAsync({
          id: event.eventId,
          file: logoFile,
        });
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error al crear evento:", error);
    }
  };

  // ✅ MODIFICAR: Agregar parámetro logoFile
  const handleUpdate = async (data: CreateEventData, logoFile?: File) => {
    if (selectedEvent) {
      try {
        // 1. Actualizar los datos del evento
        await updateMutation.mutateAsync({
          id: selectedEvent.eventId,
          data,
        });

        // 2. Si hay nuevo logo, subirlo
        if (logoFile) {
          await uploadLogoMutation.mutateAsync({
            id: selectedEvent.eventId,
            file: logoFile,
          });
        }

        setIsEditModalOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error al actualizar evento:", error);
      }
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
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando eventos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header mejorado con botón visible */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Eventos</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">
                Gestiona los eventos y competencias deportivas
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Filtros mejorados */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-semibold">Filtrar por:</span>
            </div>
            <div className="flex-1 max-w-xs w-full">
              <Select
                value={filterStatus || ""}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value
                      ? (e.target.value as EventStatus)
                      : undefined,
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
            <div className="text-sm text-slate-500 sm:ml-auto">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid de eventos - 3 columnas en pantallas grandes */}
      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            filterStatus
              ? "No hay eventos con este filtro"
              : "No hay eventos registrados"
          }
          description={
            filterStatus
              ? "Intenta cambiar los filtros para ver otros eventos"
              : "Comienza creando tu primer evento deportivo"
          }
          actionLabel="Crear Primer Evento"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        title="Crear Nuevo Evento"
        size="lg"
      >
        <EventForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending || uploadLogoMutation.isPending} // ✅ MODIFICAR
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
          isLoading={updateMutation.isPending || uploadLogoMutation.isPending} // ✅ MODIFICAR
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
