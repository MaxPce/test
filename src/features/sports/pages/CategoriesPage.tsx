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
import { useCategories } from "../api/categories.queries";
import { useSports } from "../api/sports.queries";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../api/categories.mutations";
import { CategoryForm } from "../components/CategoryForm";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import type { Category } from "../types";

export function CategoriesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [filterSportId, setFilterSportId] = useState<number | undefined>(
    undefined
  );

  const { data: categories = [], isLoading } = useCategories(
    filterSportId ? { sportId: filterSportId } : undefined
  );
  const { data: sports = [] } = useSports();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({
        id: selectedCategory.categoryId,
        data,
      });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      await deleteMutation.mutateAsync(selectedCategory.categoryId);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const filterOptions = [
    { value: "", label: "Todos los deportes" },
    ...sports.map((sport) => ({
      value: String(sport.sportId),
      label: sport.name,
    })),
  ];

  const getFormatTypeLabel = (formatType: string) => {
    const labels: Record<string, string> = {
      eliminacion_directa: "Eliminación Directa",
      round_robin: "Round Robin",
      suizo: "Sistema Suizo",
    };
    return labels[formatType] || formatType;
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      M: "Masculino",
      F: "Femenino",
      MIXTO: "Mixto",
    };
    return labels[gender] || gender;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Individual",
      equipo: "Equipo",
    };
    return labels[type] || type;
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
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las categorías de competencia
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1 max-w-xs">
              <Select
                value={filterSportId || ""}
                onChange={(e) =>
                  setFilterSportId(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                options={filterOptions}
              />
            </div>
            {filterSportId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterSportId(undefined)}
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filterSportId
                  ? "No hay categorías con este filtro"
                  : "No hay categorías registradas"}
              </p>
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Deporte</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.categoryId}>
                    <TableCell className="font-medium">
                      {category.categoryId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary">
                        {category.sport?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {getGenderLabel(category.gender)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {getTypeLabel(category.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {getFormatTypeLabel(category.formatType)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {category.weightMin && category.weightMax
                        ? `${category.weightMin}-${category.weightMax} kg`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(category)}
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
        title="Crear Categoría"
        size="lg"
      >
        <CategoryForm
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
          setSelectedCategory(null);
        }}
        title="Editar Categoría"
        size="lg"
      >
        <CategoryForm
          category={selectedCategory || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar "${selectedCategory?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
