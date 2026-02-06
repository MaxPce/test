import { useState } from "react";
import { Plus, Calendar, Search, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/PageHeader";
import { useEvents } from "../api/events.queries";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventLogo,
} from "../api/events.mutations";
import { EventForm } from "../components/EventForm";
import { EventCard } from "../components/EventCard";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Event, CreateEventData } from "../types";
import type { EventStatus } from "@/lib/types/common.types";

export function EventsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<EventStatus | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: events = [], isLoading } = useEvents(
    filterStatus ? { status: filterStatus } : undefined,
  );
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const uploadLogoMutation = useUploadEventLogo();

  const handleCreate = async (data: CreateEventData, logoFile?: File) => {
    try {
      const event = await createMutation.mutateAsync(data);

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

  const handleUpdate = async (data: CreateEventData, logoFile?: File) => {
    if (selectedEvent) {
      try {
        await updateMutation.mutateAsync({
          id: selectedEvent.eventId,
          data,
        });

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

  // Filtrar eventos por búsqueda
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando eventos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title="Gestión de Eventos"
        description="Administre eventos deportivos, competencias y torneos"
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Nuevo Evento
          </Button>
        }
      />

      

      {/* Barra de búsqueda y filtros mejorada */}
      <Card variant="glass">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <Input
                placeholder="Buscar eventos por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5" />}
                variant="modern"
              />
            </div>

            {/* Filtro de estado */}
            <div className="w-full lg:w-64">
              <Select
                value={filterStatus || ""}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value ? (e.target.value as EventStatus) : undefined,
                  )
                }
                options={filterOptions}
              />
            </div>

            {/* Vista Grid/List */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="md"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="md"
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Filtros activos */}
          {(filterStatus || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Filtros activos:
              </span>
              {filterStatus && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {filterOptions.find((o) => o.value === filterStatus)?.label}
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  "{searchQuery}"
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus(undefined);
                  setSearchQuery("");
                }}
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Grid/List de eventos */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            searchQuery || filterStatus
              ? "No se encontraron eventos"
              : "No hay eventos registrados"
          }
          description={
            searchQuery || filterStatus
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza creando tu primer evento deportivo"
          }
          action={
            !searchQuery && !filterStatus
              ? {
                  label: "Crear Primer Evento",
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredEvents.map((event) => (
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
          isLoading={createMutation.isPending || uploadLogoMutation.isPending}
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
          isLoading={updateMutation.isPending || uploadLogoMutation.isPending}
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
