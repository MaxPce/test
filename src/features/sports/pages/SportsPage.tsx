import { useState } from "react";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { useSports } from "../api/sports.queries";
import { useSportTypes } from "../api/sportTypes.queries";
import {
  useCreateSport,
  useUpdateSport,
  useDeleteSport,
} from "../api/sports.mutations";
import { SportForm } from "../components/SportForm";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import type { Sport } from "../types";

export function SportsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [filterSportTypeId, setFilterSportTypeId] = useState<
    number | undefined
  >(undefined);

  const { data: sports = [], isLoading } = useSports(
    filterSportTypeId ? { sportTypeId: filterSportTypeId } : undefined,
  );
  const { data: sportTypes = [] } = useSportTypes();
  const createMutation = useCreateSport();
  const updateMutation = useUpdateSport();
  const deleteMutation = useDeleteSport();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedSport) {
      await updateMutation.mutateAsync({ id: selectedSport.sportId, data });
      setIsEditModalOpen(false);
      setSelectedSport(null);
    }
  };

  const handleDelete = async () => {
    if (selectedSport) {
      await deleteMutation.mutateAsync(selectedSport.sportId);
      setIsDeleteModalOpen(false);
      setSelectedSport(null);
    }
  };

  const openEditModal = (sport: Sport) => {
    setSelectedSport(sport);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (sport: Sport) => {
    setSelectedSport(sport);
    setIsDeleteModalOpen(true);
  };

  const filterOptions = [
    { value: "", label: "Todos los tipos" },
    ...sportTypes.map((type) => ({
      value: String(type.sportTypeId),
      label: type.name,
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
          <h1 className="text-2xl font-bold text-gray-900">Deportes</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Deporte
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1 max-w-xs">
              <Select
                value={filterSportTypeId || ""}
                onChange={(e) =>
                  setFilterSportTypeId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                options={filterOptions}
              />
            </div>
            {filterSportTypeId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterSportTypeId(undefined)}
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {sports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filterSportTypeId
                  ? "No hay deportes con este filtro"
                  : "No hay deportes registrados"}
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
                  <TableHead>Icono</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo de Deporte</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.map((sport) => (
                  <TableRow key={sport.sportId}>
                    <TableCell className="font-medium">
                      {sport.sportId}
                    </TableCell>
                    <TableCell>
                      {sport.iconUrl ? (
                        <img
                          src={sport.iconUrl}
                          alt={sport.name}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          Sin icono
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{sport.name}</TableCell>
                    <TableCell>
                      <Badge variant="primary">
                        {sport.sportType?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(sport)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(sport)}
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
        title="Crear Deporte"
      >
        <SportForm
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
          setSelectedSport(null);
        }}
        title="Editar Deporte"
      >
        <SportForm
          sport={selectedSport || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedSport(null);
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSport(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Deporte"
        message={`¿Estás seguro de que deseas eliminar "${selectedSport?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
