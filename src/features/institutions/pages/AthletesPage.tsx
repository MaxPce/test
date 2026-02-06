import { useState } from "react";
import { Plus, Users, Search, Filter, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useAthletes } from "../api/athletes.queries";
import { useInstitutions } from "../api/institutions.queries";
import {
  useCreateAthlete,
  useUpdateAthlete,
  useDeleteAthlete,
  useUploadAthletePhoto,
} from "../api/athletes.mutations";
import { AthleteForm } from "../components/AthleteForm";
import { AthleteCard } from "../components/AthleteCard";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Athlete, CreateAthleteData } from "../types";

export function AthletesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [filterInstitutionId, setFilterInstitutionId] = useState<
    number | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: athletes = [], isLoading } = useAthletes(
    filterInstitutionId ? { institutionId: filterInstitutionId } : undefined,
  );
  const { data: institutions = [] } = useInstitutions();
  const createMutation = useCreateAthlete();
  const updateMutation = useUpdateAthlete();
  const deleteMutation = useDeleteAthlete();
  const uploadPhotoMutation = useUploadAthletePhoto();

  const handleCreate = async (data: CreateAthleteData, photoFile?: File) => {
    try {
      const athlete = await createMutation.mutateAsync(data);

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

  const handleUpdate = async (data: CreateAthleteData, photoFile?: File) => {
    if (selectedAthlete) {
      try {
        await updateMutation.mutateAsync({
          id: selectedAthlete.athleteId,
          data,
        });

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

  // Calcular estadísticas por género
  const maleCount = athletes.filter((a) => a.gender === "M").length;
  const femaleCount = athletes.filter((a) => a.gender === "F").length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando atletas..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title="Gestión de Atletas"
        description="Administre el registro de deportistas y participantes"
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Nuevo Atleta
          </Button>
        }
      />

      

      {/* Barra de búsqueda y filtros */}
      <Card variant="glass">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <Input
                placeholder="Buscar atletas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-5 w-5" />}
                variant="modern"
              />
            </div>

            {/* Filtro de institución */}
            <div className="w-full lg:w-64">
              <Select
                value={filterInstitutionId || ""}
                onChange={(e) =>
                  setFilterInstitutionId(
                    e.target.value ? Number(e.target.value) : undefined,
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
          {(filterInstitutionId || searchTerm) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Filtros activos:
              </span>
              {filterInstitutionId && (
                <Badge variant="primary">
                  {institutions.find((i) => i.institutionId === filterInstitutionId)?.name}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="primary">"{searchTerm}"</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterInstitutionId(undefined);
                  setSearchTerm("");
                }}
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Grid de atletas */}
      {filteredAthletes.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            searchTerm || filterInstitutionId
              ? "No se encontraron atletas"
              : "No hay atletas registrados"
          }
          description={
            searchTerm || filterInstitutionId
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer atleta"
          }
          action={
            !searchTerm && !filterInstitutionId
              ? {
                  label: "Crear Primer Atleta",
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Atleta"
        size="lg"
      >
        <AthleteForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending || uploadPhotoMutation.isPending}
        />
      </Modal>

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
          isLoading={updateMutation.isPending || uploadPhotoMutation.isPending}
        />
      </Modal>

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
