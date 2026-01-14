import { useState } from "react";
import { Plus, X, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useInstitutions } from "@/features/institutions/api/institutions.queries";
import { useAthletes } from "@/features/institutions/api/athletes.queries";

interface TeamMember {
  athleteId: number;
  athleteName: string;
  rol: string;
}

interface TeamCreationFormProps {
  categoryId: number;
  onSubmit: (data: {
    teamName: string;
    institutionId: number;
    categoryId: number;
    members: { athleteId: number; rol: string }[];
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TeamCreationForm({
  categoryId,
  onSubmit,
  onCancel,
  isLoading,
}: TeamCreationFormProps) {
  const [teamName, setTeamName] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<number>(0);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<string>("titular");

  const { data: institutions = [] } = useInstitutions();
  const { data: allAthletes = [] } = useAthletes();

  // Filtrar atletas de la institución seleccionada que no estén ya en el equipo
  const availableAthletes = allAthletes.filter(
    (athlete) =>
      athlete.institution?.institutionId === selectedInstitution &&
      !members.some((m) => m.athleteId === athlete.athleteId)
  );

  const institutionOptions = [
    { value: 0, label: "Seleccione una institución" },
    ...institutions.map((inst) => ({
      value: inst.institutionId,
      label: inst.name,
    })),
  ];

  const athleteOptions = [
    { value: 0, label: "Seleccione un atleta" },
    ...availableAthletes.map((athlete) => ({
      value: athlete.athleteId,
      label: athlete.name,
    })),
  ];

  const roleOptions = [
    { value: "titular", label: "Titular" },
    { value: "suplente", label: "Suplente" },
    { value: "capitan", label: "Capitán" },
  ];

  const addMember = () => {
    if (selectedAthlete > 0) {
      const athlete = availableAthletes.find(
        (a) => a.athleteId === selectedAthlete
      );
      if (athlete) {
        setMembers([
          ...members,
          {
            athleteId: athlete.athleteId,
            athleteName: athlete.name,
            rol: selectedRole,
          },
        ]);
        setSelectedAthlete(0);
        setSelectedRole("titular");
      }
    }
  };

  const removeMember = (athleteId: number) => {
    setMembers(members.filter((m) => m.athleteId !== athleteId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      teamName,
      institutionId: selectedInstitution,
      categoryId,
      members: members.map((m) => ({
        athleteId: m.athleteId,
        rol: m.rol,
      })),
    });
  };

  const getRoleBadgeVariant = (rol: string) => {
    if (rol === "capitan") return "primary";
    if (rol === "titular") return "success";
    return "default";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paso 1: Información del Equipo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Información del Equipo
        </h3>

        <Input
          label="Nombre del Equipo *"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Ej: Las Águilas"
          required
        />

        <Select
          label="Institución *"
          value={selectedInstitution}
          onChange={(e) => {
            setSelectedInstitution(Number(e.target.value));
            setMembers([]); // Limpiar miembros al cambiar institución
          }}
          options={institutionOptions}
          required
        />
      </div>

      {/* Paso 2: Agregar Atletas */}
      {selectedInstitution > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Integrantes del Equipo
            </h3>
            <Badge variant="primary">
              {members.length} integrante{members.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Formulario para agregar atleta */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                label="Atleta"
                value={selectedAthlete}
                onChange={(e) => setSelectedAthlete(Number(e.target.value))}
                options={athleteOptions}
              />

              <Select
                label="Rol"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={roleOptions}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addMember}
                  disabled={selectedAthlete === 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de miembros */}
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.athleteId}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.athleteName}
                      </p>
                      <Badge
                        variant={getRoleBadgeVariant(member.rol)}
                        size="sm"
                      >
                        {member.rol.charAt(0).toUpperCase() +
                          member.rol.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.athleteId)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No hay integrantes en el equipo</p>
              <p className="text-sm">
                Agrega al menos un atleta para continuar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={
            !teamName || selectedInstitution === 0 || members.length === 0
          }
        >
          Crear e Inscribir Equipo
        </Button>
      </div>
    </form>
  );
}
