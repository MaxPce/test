import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { UserPlus, Trash2 } from "lucide-react";
import { useTeam } from "../api/teams.queries";
import { useAthletes } from "../api/athletes.queries";
import {
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
} from "../api/teams.mutations";
import type { TeamRole } from "@/lib/types/common.types";

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  institutionId: number;
}

export function TeamMembersModal({
  isOpen,
  onClose,
  teamId,
  institutionId,
}: TeamMembersModalProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<TeamRole>("titular");

  const { data: team, isLoading: teamLoading } = useTeam(teamId);
  const { data: athletes = [] } = useAthletes({ institutionId });
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();

  // Atletas que no están en el equipo
  const availableAthletes = athletes.filter(
    (athlete) =>
      !team?.members?.some((member) => member.athleteId === athlete.athleteId)
  );

  const handleAddMember = async () => {
    if (selectedAthleteId === 0) return;

    await addMemberMutation.mutateAsync({
      teamId,
      data: { athleteId: selectedAthleteId, rol: selectedRole },
    });

    setSelectedAthleteId(0);
    setSelectedRole("titular");
  };

  const handleRemoveMember = async (athleteId: number) => {
    await removeMemberMutation.mutateAsync({ teamId, athleteId });
  };

  const handleChangeRole = async (athleteId: number, newRole: TeamRole) => {
    await updateRoleMutation.mutateAsync({
      teamId,
      athleteId,
      data: { rol: newRole },
    });
  };

  const roleOptions = [
    { value: "capitan", label: "Capitán" },
    { value: "titular", label: "Titular" },
    { value: "suplente", label: "Suplente" },
  ];

  const getRoleBadgeVariant = (role: TeamRole) => {
    const variants: Record<TeamRole, "success" | "primary" | "warning"> = {
      capitan: "success",
      titular: "primary",
      suplente: "warning",
    };
    return variants[role];
  };

  const getRoleLabel = (role: TeamRole) => {
    const labels: Record<TeamRole, string> = {
      capitan: "Capitán",
      titular: "Titular",
      suplente: "Suplente",
    };
    return labels[role];
  };

  if (teamLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gestionar Miembros"
        size="lg"
      >
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Miembros"
      size="lg"
    >
      <div className="space-y-6">
        {/* Agregar nuevo miembro */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Agregar Miembro
          </h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(Number(e.target.value))}
                options={[
                  { value: 0, label: "Seleccione un atleta" },
                  ...availableAthletes.map((athlete) => ({
                    value: athlete.athleteId,
                    label: athlete.name,
                  })),
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                options={roleOptions}
              />
            </div>
            <Button
              onClick={handleAddMember}
              disabled={selectedAthleteId === 0 || addMemberMutation.isPending}
              isLoading={addMemberMutation.isPending}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          {availableAthletes.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No hay atletas disponibles de esta institución
            </p>
          )}
        </div>

        {/* Lista de miembros */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Miembros del Equipo ({team?.members?.length || 0})
          </h4>
          {!team?.members || team.members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay miembros en este equipo
            </div>
          ) : (
            <div className="space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.athleteId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {member.athlete?.photoUrl ? (
                      <img
                        src={member.athlete.photoUrl}
                        alt={member.athlete.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {member.athlete?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.athlete?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.athlete?.docNumber || "Sin documento"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={member.rol}
                      onChange={(e) =>
                        handleChangeRole(
                          member.athleteId,
                          e.target.value as TeamRole
                        )
                      }
                      options={roleOptions}
                      className="w-32"
                      disabled={updateRoleMutation.isPending}
                    />
                    <Badge variant={getRoleBadgeVariant(member.rol)}>
                      {getRoleLabel(member.rol)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member.athleteId)}
                      disabled={removeMemberMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
