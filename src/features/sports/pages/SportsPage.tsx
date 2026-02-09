import { useState } from "react";
import { Plus, Edit2, Trash2, Filter, Trophy, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
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
import { getImageUrl } from "@/lib/utils/imageUrl";
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
    const result = await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
    return result;
  };

  const handleUpdate = async (data: any) => {
    if (selectedSport) {
      const result = await updateMutation.mutateAsync({
        id: selectedSport.sportId,
        data,
      });
      setIsEditModalOpen(false);
      setSelectedSport(null);
      return result;
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
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando deportes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title="Deportes"
        
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Nuevo Deporte
          </Button>
        }
      />

      {/* Filtros */}
      <Card variant="elevated">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
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

      <Card variant="elevated">
        <CardBody padding="none">
          {sports.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title={
                filterSportTypeId
                  ? "No hay deportes con este filtro"
                  : "No hay deportes registrados"
              }
              description="Crea el primer deporte para comenzar"
              action={{
                label: "Crear Primer Deporte",
                onClick: () => setIsCreateModalOpen(true),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo de Deporte</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.map((sport) => (
                  <TableRow key={sport.sportId}>
                    <TableCell className="font-semibold text-slate-900">
                      #{sport.sportId}
                    </TableCell>
                    <TableCell>
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                        {sport.iconUrl ? (
                          <img
                            src={getImageUrl(sport.iconUrl)}
                            alt={sport.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="flex items-center justify-center w-full h-full">
                                  <svg class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {sport.name}
                    </TableCell>
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
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(sport)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
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
        size="md"
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
        size="md"
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
