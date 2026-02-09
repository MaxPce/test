import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Users, UserPlus, Upload, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
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
  const registrations = eventCategory.registrations || [];

  // Calcular estadísticas
  const stats = {
    total: registrations.length,
    male: registrations.filter((r) => r.athlete?.gender === "M" || r.team?.members?.some((m) => m.athlete?.gender === "M")).length,
    female: registrations.filter((r) => r.athlete?.gender === "F" || r.team?.members?.some((m) => m.athlete?.gender === "F")).length,
    institutions: new Set(
      registrations.map((r) => r.athlete?.institutionId || r.team?.institutionId)
    ).size,
  };

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

  const isLoading =
    createTeamMutation.isPending ||
    addTeamMemberMutation.isPending ||
    createRegistrationMutation.isPending;

  return (
    <div className="space-y-6 animate-in">
      {/* Header mejorado */}
      <div className="bg-gradient-to-br from-blue-600  rounded-2xl p-6 shadow-strong text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {isTeamCategory ? (
                  <Users className="h-6 w-6" />
                ) : (
                  <UserPlus className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">Participantes Inscritos</h3>
                
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isTeamCategory ? (
              <Button
                onClick={() => setIsTeamModalOpen(true)}
                variant="default"
                size="lg"
                icon={<Plus className="h-5 w-5" />}
                className="bg-white text-blue-600 hover:bg-white/90"
              >
                Crear e Inscribir Equipo
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsBulkModalOpen(true)}
                  variant="outline"
                  size="lg"
                  icon={<Upload className="h-5 w-5" />}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Inscripción de Atletas
                </Button>
                
              </>
            )}
          </div>
        </div>
      </div>

      

      {/* Lista de Inscripciones */}
      {registrations.length === 0 ? (
        <EmptyState
          icon={isTeamCategory ? Users : UserPlus}
          title={`No hay ${isTeamCategory ? "equipos" : "atletas"} inscritos`}
          description={`Comienza agregando ${
            isTeamCategory
              ? "el primer equipo a"
              : "atletas a"
          } esta categoría`}
          action={{
            label: isTeamCategory
              ? "Crear Primer Equipo"
              : "Inscribir Primer Atleta",
            onClick: () =>
              isTeamCategory
                ? setIsTeamModalOpen(true)
                : setIsIndividualModalOpen(true),
          }}
        />
      ) : (
        <Card variant="elevated">
          <CardBody padding="none">
            <RegistrationsList
              registrations={registrations}
              onDelete={handleDeleteRegistration}
              isDeleting={deleteRegistrationMutation.isPending}
            />
          </CardBody>
        </Card>
      )}

      {/* Modal para Inscripción Individual */}
      <Modal
        isOpen={isIndividualModalOpen}
        onClose={() => setIsIndividualModalOpen(false)}
        title="Inscribir Atleta"
        size="md"
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
          isLoading={isLoading}
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
