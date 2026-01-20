import { useState } from "react";
import { Plus, Edit2, Trash2, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
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
import { useTeams } from "../api/teams.queries";
import { useInstitutions } from "../api/institutions.queries";
import {
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "../api/teams.mutations";
import { TeamForm } from "../components/TeamForm";
import { TeamMembersModal } from "../components/TeamMembersModal";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import type { Team } from "../types";

export function TeamsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [filterInstitutionId, setFilterInstitutionId] = useState<
    number | undefined
  >(undefined);

  const { data: teams = [], isLoading } = useTeams(
    filterInstitutionId ? { institutionId: filterInstitutionId } : undefined,
  );
  const { data: institutions = [] } = useInstitutions();
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (selectedTeam) {
      await updateMutation.mutateAsync({ id: selectedTeam.teamId, data });
      setIsEditModalOpen(false);
      setSelectedTeam(null);
    }
  };

  const handleDelete = async () => {
    if (selectedTeam) {
      await deleteMutation.mutateAsync(selectedTeam.teamId);
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  const openMembersModal = (team: Team) => {
    setSelectedTeam(team);
    setIsMembersModalOpen(true);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1 max-w-xs text-center">
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
            {filterInstitutionId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterInstitutionId(undefined)}
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filterInstitutionId
                  ? "No hay equipos con este filtro"
                  : "No hay equipos registrados"}
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
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Nombre</TableHead>
                  <TableHead className="text-center">Institución</TableHead>
                  <TableHead className="text-center">Categoría</TableHead>
                  <TableHead className="text-center">Miembros</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.teamId}>
                    <TableCell className="font-medium">{team.teamId}</TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <Badge variant="primary">
                        {team.institution?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {team.category?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openMembersModal(team)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {team.members?.length || 0}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(team)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(team)}
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
        title="Crear Equipo"
      >
        <TeamForm
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
          setSelectedTeam(null);
        }}
        title="Editar Equipo"
      >
        <TeamForm
          team={selectedTeam || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedTeam(null);
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Members Modal */}
      {selectedTeam && (
        <TeamMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => {
            setIsMembersModalOpen(false);
            setSelectedTeam(null);
          }}
          teamId={selectedTeam.teamId}
          institutionId={selectedTeam.institutionId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTeam(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Equipo"
        message={`¿Estás seguro de que deseas eliminar "${selectedTeam?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
