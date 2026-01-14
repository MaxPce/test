import { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, UserPlus, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { useEventCategories } from "../api/eventCategories.queries";
import {
  useCreateEventCategory,
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

export function EventCategoriesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const eventIdNum = Number(eventId);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);

  const { data: eventCategories = [], isLoading: categoriesLoading } =
    useEventCategories({ eventId: eventIdNum });

  const createCategoryMutation = useCreateEventCategory();
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

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "success" | "primary" | "default" | "warning"
    > = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
      pendiente: "warning",
    };
    return variants[status] || "default";
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Categorías del Evento
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona los deportes y categorías asociados a este evento
          </p>
        </div>
        <Button onClick={() => setIsCategoryModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      {/* Lista de Categorías */}
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
                Agregar la primera categoría
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

      {/* Modales */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Agregar Categoría al Evento"
      >
        <EventCategoryForm
          eventId={eventIdNum}
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
          isLoading={createCategoryMutation.isPending}
        />
      </Modal>

      {selectedCategory && (
        <>
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

          <BulkRegistrationModal
            isOpen={isBulkModalOpen}
            onClose={() => {
              setIsBulkModalOpen(false);
              setSelectedCategory(null);
            }}
            eventCategory={selectedCategory}
          />
        </>
      )}

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
