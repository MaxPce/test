import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
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
import { useInstitutions } from "../api/institutions.queries";
import {
  useCreateInstitution,
  useUpdateInstitution,
  useDeleteInstitution,
} from "../api/institutions.mutations";
import { InstitutionForm } from "../components/InstitutionForm";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Institution } from "../types";

export function InstitutionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  const { data: institutions = [], isLoading } = useInstitutions();
  const createMutation = useCreateInstitution();
  const updateMutation = useUpdateInstitution();
  const deleteMutation = useDeleteInstitution();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedInstitution) {
      await updateMutation.mutateAsync({
        id: selectedInstitution.institutionId,
        data,
      });
      setIsEditModalOpen(false);
      setSelectedInstitution(null);
    }
  };

  const handleDelete = async () => {
    if (selectedInstitution) {
      await deleteMutation.mutateAsync(selectedInstitution.institutionId);
      setIsDeleteModalOpen(false);
      setSelectedInstitution(null);
    }
  };

  const openEditModal = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (institution: Institution) => {
    setSelectedInstitution(institution);
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
          <h1 className="text-2xl font-bold text-gray-900">Instituciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las instituciones y clubes deportivos
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Institución
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          {institutions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay instituciones registradas</p>
              <Button
                variant="ghost"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                Crear la primera
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Abreviatura</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions.map((institution) => (
                  <TableRow key={institution.institutionId}>
                    <TableCell className="font-medium">
                      {institution.institutionId}
                    </TableCell>
                    <TableCell>
                      {institution.logoUrl ? (
                        <img
                          src={institution.logoUrl}
                          alt={institution.name}
                          className="h-10 w-10 object-contain rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          Sin logo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {institution.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                        {institution.abrev}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(institution)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(institution)}
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
        title="Crear Institución"
      >
        <InstitutionForm
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
          setSelectedInstitution(null);
        }}
        title="Editar Institución"
      >
        <InstitutionForm
          institution={selectedInstitution || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedInstitution(null);
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInstitution(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Institución"
        message={`¿Estás seguro de que deseas eliminar "${selectedInstitution?.name}"? Esta acción no se puede deshacer y eliminará todos los atletas y equipos asociados.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
