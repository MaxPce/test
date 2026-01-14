import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { RegistrationForm } from "../../components/RegistrationForm";
import { TeamCreationForm } from "../../components/TeamCreationForm";
import { BulkRegistrationModal } from "../../components/BulkRegistrationModal";
import { RegistrationsList } from "../../components/RegistrationsList";
import {
  useCreateRegistration,
  useDeleteRegistration,
} from "../../api/registrations.mutations";
import {
  useCreateTeam,
  useAddTeamMember,
} from "@/features/institutions/api/teams.mutations";
import type { EventCategory } from "../../types";

export function CategoryInscriptionsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const createRegistrationMutation = useCreateRegistration();
  const deleteRegistrationMutation = useDeleteRegistration();
  const createTeamMutation = useCreateTeam();
  const addTeamMemberMutation = useAddTeamMember();

  const isTeamCategory = eventCategory.category?.type === "equipo";

  const handleIndividualRegistration = async (data: any) => {
    await createRegistrationMutation.mutateAsync(data);
    setIsIndividualModalOpen(false);
  };

  const handleTeamCreation = async (data: {
    teamName: string;
    institutionId: number;
    categoryId: number;
    members: { athleteId: number; rol: string }[];
  }) => {
    try {
      // 1. Crear el equipo
      const team = await createTeamMutation.mutateAsync({
        name: data.teamName,
        institutionId: data.institutionId,
        categoryId: data.categoryId,
      });

      // 2. Agregar los miembros al equipo
      await Promise.all(
        data.members.map((member) =>
          addTeamMemberMutation.mutateAsync({
            teamId: team.teamId,
            data: {
              athleteId: member.athleteId,
              rol: member.rol,
            },
          })
        )
      );

      // 3. Inscribir el equipo en la categoría
      await createRegistrationMutation.mutateAsync({
        eventCategoryId: eventCategory.eventCategoryId,
        teamId: team.teamId,
      });

      setIsTeamModalOpen(false);
    } catch (error) {
      console.error("Error al crear equipo:", error);
    }
  };

  const handleDeleteRegistration = async (registrationId: number) => {
    await deleteRegistrationMutation.mutateAsync(registrationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Participantes Inscritos
          </h3>
          <p className="text-gray-600 mt-1">
            {eventCategory.registrations?.length || 0} participante
            {eventCategory.registrations?.length !== 1 ? "s" : ""} inscrito
            {eventCategory.registrations?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {isTeamCategory ? (
            <Button onClick={() => setIsTeamModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear e Inscribir Equipo
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsBulkModalOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Inscripción Masiva
              </Button>
              <Button onClick={() => setIsIndividualModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Inscribir Atleta
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lista de Inscripciones */}
      <Card>
        <CardBody className="p-0">
          <RegistrationsList
            registrations={eventCategory.registrations || []}
            onDelete={handleDeleteRegistration}
            isDeleting={deleteRegistrationMutation.isPending}
          />
        </CardBody>
      </Card>

      {/* Modal para Inscripción Individual */}
      <Modal
        isOpen={isIndividualModalOpen}
        onClose={() => setIsIndividualModalOpen(false)}
        title="Inscribir Atleta"
      >
        <RegistrationForm
          eventCategory={eventCategory}
          onSubmit={handleIndividualRegistration}
          onCancel={() => setIsIndividualModalOpen(false)}
          isLoading={createRegistrationMutation.isPending}
        />
      </Modal>

      {/* Modal para Crear Equipo */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Crear e Inscribir Equipo"
        size="lg"
      >
        <TeamCreationForm
          categoryId={eventCategory.categoryId}
          onSubmit={handleTeamCreation}
          onCancel={() => setIsTeamModalOpen(false)}
          isLoading={
            createTeamMutation.isPending ||
            addTeamMemberMutation.isPending ||
            createRegistrationMutation.isPending
          }
        />
      </Modal>

      {/* Modal para Inscripción Masiva */}
      {!isTeamCategory && (
        <BulkRegistrationModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          eventCategory={eventCategory}
        />
      )}
    </div>
  );
}
