import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { useSportTypes } from "../api/sportTypes.queries";
import {
  useCreateSportType,
  useUpdateSportType,
  useDeleteSportType,
} from "../api/sportTypes.mutations";
import { SportTypeForm } from "../components/SportTypeForm";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import type { SportType } from "../types";

export function SportTypesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSportType, setSelectedSportType] = useState<SportType | null>(
    null
  );

  const { data: sportTypes = [], isLoading } = useSportTypes();
  const createMutation = useCreateSportType();
  const updateMutation = useUpdateSportType();
  const deleteMutation = useDeleteSportType();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedSportType) {
      await updateMutation.mutateAsync({
        id: selectedSportType.sportTypeId,
        data,
      });
      setIsEditModalOpen(false);
      setSelectedSportType(null);
    }
  };

  const handleDelete = async () => {
    if (selectedSportType) {
      await deleteMutation.mutateAsync(selectedSportType.sportTypeId);
      setIsDeleteModalOpen(false);
      setSelectedSportType(null);
    }
  };

  const openEditModal = (sportType: SportType) => {
    setSelectedSportType(sportType);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (sportType: SportType) => {
    setSelectedSportType(sportType);
    setIsDeleteModalOpen(true);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            Tipos de Deportes
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los tipos de deportes del sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          {sportTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay tipos de deportes registrados
              </p>
              <Button
                variant="ghost"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                Crear el primero
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sportTypes.map((sportType) => (
                  <TableRow key={sportType.sportTypeId}>
                    <TableCell className="font-medium">
                      {sportType.sportTypeId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sportType.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {sportType.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(sportType)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(sportType)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Tipo de Deporte"
      >
        <SportTypeForm
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
          setSelectedSportType(null);
        }}
        title="Editar Tipo de Deporte"
      >
        <SportTypeForm
          sportType={selectedSportType || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedSportType(null);
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSportType(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Tipo de Deporte"
        message={`¿Estás seguro de que deseas eliminar "${selectedSportType?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
