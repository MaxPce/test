import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { useEvent } from "../api/events.queries";
import { useEventCategories } from "../api/eventCategories.queries";
import {
  useCreateEventCategory,
  useUpdateEventCategory,
  useDeleteEventCategory,
} from "../api/eventCategories.mutations";
import {
  useCreateRegistration,
  useDeleteRegistration,
} from "../api/registrations.mutations";
import { EventCategoryForm } from "../components/EventCategoryForm";
import { RegistrationForm } from "../components/RegistrationForm";
import { BulkRegistrationModal } from "../components/BulkRegistrationModal";
import { RegistrationsList } from "../components/RegistrationsList";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { EventCategory } from "../types";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = Number(id);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: eventCategories = [], isLoading: categoriesLoading } =
    useEventCategories({ eventId });

  const createCategoryMutation = useCreateEventCategory();
  const updateCategoryMutation = useUpdateEventCategory();
  const deleteCategoryMutation = useDeleteEventCategory();
  const createRegistrationMutation = useCreateRegistration();
  const deleteRegistrationMutation = useDeleteRegistration();

  const handleCreateCategory = async (data: any) => {
    await createCategoryMutation.mutateAsync(data);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      await deleteCategoryMutation.mutateAsync(
        selectedCategory.eventCategoryId
      );
      setIsDeleteCategoryModalOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleCreateRegistration = async (data: any) => {
    await createRegistrationMutation.mutateAsync(data);
    setIsRegistrationModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteRegistration = async (registrationId: number) => {
    await deleteRegistrationMutation.mutateAsync(registrationId);
  };

  const openRegistrationModal = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsRegistrationModalOpen(true);
  };

  const openBulkModal = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsBulkModalOpen(true);
  };

  const openDeleteCategoryModal = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  if (eventLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Evento no encontrado</p>
        <Button onClick={() => navigate("/admin/events")} className="mt-4">
          Volver a Eventos
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "primary" | "default"> = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
      pendiente: "warning",
    };
    return variants[status] || "default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/events")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Eventos
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {event.logoUrl ? (
              <img
                src={event.logoUrl}
                alt={event.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
            ) : (
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                {event.name.charAt(0)}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant={getStatusBadgeVariant(event.status)} size="lg">
                  {event.status === "programado" && "Programado"}
                  {event.status === "en_curso" && "En Curso"}
                  {event.status === "finalizado" && "Finalizado"}
                </Badge>
              </div>
            </div>
          </div>

          <Button onClick={() => setIsCategoryModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Categoría
          </Button>
        </div>
      </div>

      {/* Categorías */}
      {eventCategories.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay categorías asociadas a este evento
              </p>
              <Button
                variant="ghost"
                onClick={() => setIsCategoryModalOpen(true)}
                className="mt-4"
              >
                Agregar la primera
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {eventCategories.map((eventCategory) => (
            <Card key={eventCategory.eventCategoryId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {eventCategory.category?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {eventCategory.category?.sport?.name} -{" "}
                      {eventCategory.category?.type === "equipo"
                        ? "Equipo"
                        : "Individual"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getStatusBadgeVariant(eventCategory.status)}
                    >
                      {eventCategory.status === "pendiente" && "Pendiente"}
                      {eventCategory.status === "en_curso" && "En Curso"}
                      {eventCategory.status === "finalizado" && "Finalizado"}
                    </Badge>
                    <div className="flex gap-2">
                      {eventCategory.category?.type === "individual" && (
                        <Button
                          size="sm"
                          onClick={() => openBulkModal(eventCategory)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Inscripción Masiva
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openRegistrationModal(eventCategory)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Inscribir
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteCategoryModal(eventCategory)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <RegistrationsList
                  registrations={eventCategory.registrations || []}
                  onDelete={handleDeleteRegistration}
                  isDeleting={deleteRegistrationMutation.isPending}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Agregar Categoría al Evento"
      >
        <EventCategoryForm
          eventId={eventId}
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
          isLoading={createCategoryMutation.isPending}
        />
      </Modal>

      {/* Registration Modal */}
      {selectedCategory && (
        <Modal
          isOpen={isRegistrationModalOpen}
          onClose={() => {
            setIsRegistrationModalOpen(false);
            setSelectedCategory(null);
          }}
          title="Inscribir Participante"
        >
          <RegistrationForm
            eventCategory={selectedCategory}
            onSubmit={handleCreateRegistration}
            onCancel={() => {
              setIsRegistrationModalOpen(false);
              setSelectedCategory(null);
            }}
            isLoading={createRegistrationMutation.isPending}
          />
        </Modal>
      )}

      {/* Bulk Registration Modal */}
      {selectedCategory && (
        <BulkRegistrationModal
          isOpen={isBulkModalOpen}
          onClose={() => {
            setIsBulkModalOpen(false);
            setSelectedCategory(null);
          }}
          eventCategory={selectedCategory}
        />
      )}

      {/* Delete Category Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar "${selectedCategory?.category?.name}" del evento? Se eliminarán todas las inscripciones asociadas.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
