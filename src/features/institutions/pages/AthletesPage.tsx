import { useState } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useAthletes } from "../api/athletes.queries";
import { useInstitutions } from "../api/institutions.queries";
import {
  useCreateAthlete,
  useUpdateAthlete,
  useDeleteAthlete,
  useUploadAthletePhoto, // ✅ AGREGAR
} from "../api/athletes.mutations";
import { AthleteForm } from "../components/AthleteForm";
import { AthleteCard } from "../components/AthleteCard";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Athlete, CreateAthleteData } from "../types"; // ✅ MODIFICAR

export function AthletesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [filterInstitutionId, setFilterInstitutionId] = useState<
    number | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: athletes = [], isLoading } = useAthletes(
    filterInstitutionId ? { institutionId: filterInstitutionId } : undefined,
  );
  const { data: institutions = [] } = useInstitutions();
  const createMutation = useCreateAthlete();
  const updateMutation = useUpdateAthlete();
  const deleteMutation = useDeleteAthlete();
  const uploadPhotoMutation = useUploadAthletePhoto(); // ✅ AGREGAR

  // ✅ MODIFICAR: Agregar parámetro photoFile
  const handleCreate = async (data: CreateAthleteData, photoFile?: File) => {
    try {
      // 1. Crear el atleta
      const athlete = await createMutation.mutateAsync(data);

      // 2. Si hay archivo de foto, subirlo
      if (photoFile && athlete.athleteId) {
        await uploadPhotoMutation.mutateAsync({
          id: athlete.athleteId,
          file: photoFile,
        });
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error al crear atleta:", error);
    }
  };

  // ✅ MODIFICAR: Agregar parámetro photoFile
  const handleUpdate = async (data: CreateAthleteData, photoFile?: File) => {
    if (selectedAthlete) {
      try {
        // 1. Actualizar los datos del atleta
        await updateMutation.mutateAsync({
          id: selectedAthlete.athleteId,
          data,
        });

        // 2. Si hay nueva foto, subirla
        if (photoFile) {
          await uploadPhotoMutation.mutateAsync({
            id: selectedAthlete.athleteId,
            file: photoFile,
          });
        }

        setIsEditModalOpen(false);
        setSelectedAthlete(null);
      } catch (error) {
        console.error("Error al actualizar atleta:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedAthlete) {
      await deleteMutation.mutateAsync(selectedAthlete.athleteId);
      setIsDeleteModalOpen(false);
      setSelectedAthlete(null);
    }
  };

  const openEditModal = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsDeleteModalOpen(true);
  };

  // Filtrar atletas por búsqueda
  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filterOptions = [
    { value: "", label: "Todas las instituciones" },
    ...institutions.map((inst) => ({
      value: String(inst.institutionId),
      label: inst.name,
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
          <h1 className="text-2xl font-bold text-gray-900">Atletas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los atletas registrados en el sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Atleta
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar atleta por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-64">
              <Filter className="h-5 w-5 text-gray-400" />
              <Select
                value={filterInstitutionId || ""}
                onChange={(e) =>
                  setFilterInstitutionId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                options={filterOptions}
                className="flex-1"
              />
            </div>
            {(filterInstitutionId || searchTerm) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterInstitutionId(undefined);
                  setSearchTerm("");
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Grid de atletas */}
      {filteredAthletes.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || filterInstitutionId
                  ? "No se encontraron atletas con los filtros aplicados"
                  : "No hay atletas registrados"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAthletes.map((athlete) => (
            <AthleteCard
              key={athlete.athleteId}
              athlete={athlete}
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
        title="Crear Atleta"
        size="lg"
      >
        <AthleteForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending || uploadPhotoMutation.isPending} // ✅ MODIFICAR
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAthlete(null);
        }}
        title="Editar Atleta"
        size="lg"
      >
        <AthleteForm
          athlete={selectedAthlete || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedAthlete(null);
          }}
          isLoading={updateMutation.isPending || uploadPhotoMutation.isPending} // ✅ MODIFICAR
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAthlete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Atleta"
        message={`¿Estás seguro de que deseas eliminar a "${selectedAthlete?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
