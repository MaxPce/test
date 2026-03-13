import { useState, useMemo, useEffect } from "react";
import { Plus, X, UserCircle2, AlertCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  useSportCategoriesByEvent,
  useAthletesByCategory,
  type SportCategoryParam,
} from "@/features/institutions/api/sismaster.queries";
import type { EventCategory } from "../types";

interface TeamMember {
  athleteId: number;
  athleteName: string;
  rol: string;
}

interface TeamCreationFormProps {
  eventId: number; // sismaster event ID
  eventCategory: EventCategory;
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

// Mismo helper que BulkRegistrationModal para fallback por nombre
function findMatchingParam(
  params: SportCategoryParam[],
  localName: string,
): SportCategoryParam | undefined {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const target = normalize(localName);
  return (
    params.find((p) => normalize(p.name) === target) ??
    params.find((p) => normalize(p.name).includes(target)) ??
    params.find((p) => target.includes(normalize(p.name)))
  );
}

export function TeamCreationForm({
  eventId,
  eventCategory,
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
  const [manualIdparam, setManualIdparam] = useState<number | null>(null);

  const localSportId = eventCategory.category?.sport?.sportId;
  const categoryName = eventCategory.category?.name ?? "";

  // ── 1. Intentar resolver idparam directamente desde sismasterIdParam ────
  // (ya mapeado en la entity — más confiable que name matching)
  const directIdparam = (eventCategory.category as any)?.sismasterIdParam as
    | number
    | null
    | undefined;

  // ── 2. Si no hay idparam directo, cargar params del sport para selector ─
  const { data: sismasterCategories = [], isLoading: isLoadingCategories } =
    useSportCategoriesByEvent(
      localSportId!,
      eventId,
      !!localSportId && !directIdparam, // skip si ya tenemos idparam
    );

  // ── 3. Resolver el idparam efectivo ──────────────────────────────────────
  const effectiveIdparam = useMemo(() => {
    if (directIdparam) return directIdparam; // fuente de verdad primaria
    if (manualIdparam) return manualIdparam;
    return findMatchingParam(sismasterCategories, categoryName)?.idparam ?? null;
  }, [directIdparam, manualIdparam, sismasterCategories, categoryName]);

  const showCategorySelector = !directIdparam && sismasterCategories.length > 0;

  // ── 4. Cargar atletas filtrados por categoría ────────────────────────────
  const { data: athletesFromSismaster = [], isLoading: isLoadingAthletes } =
    useAthletesByCategory(
      eventId,
      localSportId!,
      effectiveIdparam ?? 0,
      !!localSportId && !!effectiveIdparam,
    );

  const isLoadingData = isLoadingCategories || isLoadingAthletes;

  // Reset miembros al cambiar institución
  const institutions = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    athletesFromSismaster.forEach((a) => {
      if (a.idinstitution && a.institutionName) {
        map.set(a.idinstitution, { id: a.idinstitution, name: a.institutionName });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [athletesFromSismaster]);

  const availableAthletes = useMemo(() => {
    return athletesFromSismaster.filter(
      (a) =>
        a.idinstitution === selectedInstitution &&
        !members.some((m) => m.athleteId === a.idperson),
    );
  }, [athletesFromSismaster, selectedInstitution, members]);

  const institutionOptions = [
    { value: 0, label: "Seleccione una institución" },
    ...institutions.map((inst) => ({ value: inst.id, label: inst.name })),
  ];

  const athleteOptions = [
    { value: 0, label: "Seleccione un atleta" },
    ...availableAthletes.map((a) => ({
      value: a.idperson,
      label: `${a.firstname} ${a.lastname}`,
    })),
  ];

  const roleOptions = [
    { value: "titular", label: "Titular" },
    { value: "suplente", label: "Suplente" },
    { value: "capitan", label: "Capitán" },
  ];

  const categoryOptions = [
    { value: "", label: "— Seleccionar categoría —" },
    ...sismasterCategories.map((p) => ({
      value: String(p.idparam),
      label: `${p.name} (${p.athleteCount} atletas)`,
    })),
  ];

  const addMember = () => {
    const athlete = availableAthletes.find((a) => a.idperson === selectedAthlete);
    if (athlete) {
      setMembers([
        ...members,
        {
          athleteId: athlete.idperson,
          athleteName: `${athlete.firstname} ${athlete.lastname}`,
          rol: selectedRole,
        },
      ]);
      setSelectedAthlete(0);
      setSelectedRole("titular");
    }
  };

  const removeMember = (athleteId: number) =>
    setMembers(members.filter((m) => m.athleteId !== athleteId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      teamName,
      institutionId: selectedInstitution,
      categoryId,
      members: members.map((m) => ({ athleteId: m.athleteId, rol: m.rol })),
    });
  };

  const getRoleBadgeVariant = (rol: string) => {
    if (rol === "capitan") return "primary" as const;
    if (rol === "titular") return "success" as const;
    return "default" as const;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info categoría */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-blue-900 text-lg">{categoryName}</h4>
            <p className="text-sm text-blue-700 mt-1">
              {eventCategory.category?.sport?.name} • Equipo
            </p>
          </div>
          <Badge variant="primary" size="lg">
            {eventCategory.category?.gender}
          </Badge>
        </div>
      </div>

      {/* ── Selector de categoría Sismaster (solo si no hay idparam directo) ── */}
      {showCategorySelector && (
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            Categoría Sismaster
          </label>
          <Select
            value={String(effectiveIdparam ?? "")}
            onChange={(e) =>
              setManualIdparam(e.target.value ? Number(e.target.value) : null)
            }
            options={categoryOptions}
          />
          {!effectiveIdparam && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>
                No se encontró coincidencia automática para{" "}
                <strong>"{categoryName}"</strong>. Selecciona manualmente.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoadingData && (
        <div className="flex justify-center py-6">
          <Spinner size="lg" label="Cargando atletas de la categoría..." />
        </div>
      )}

      {/* Formulario solo cuando hay atletas cargados */}
      {!isLoadingData && effectiveIdparam && (
        <>
          {/* Paso 1: Info del equipo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información del Equipo
            </h3>
            <Input
              label="Nombre del Equipo *"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <Select
              label={`Institución * (${institutions.length} disponibles)`}
              value={selectedInstitution}
              onChange={(e) => {
                setSelectedInstitution(Number(e.target.value));
                setMembers([]);
              }}
              options={institutionOptions}
              required
            />
          </div>

          {/* Paso 2: Agregar atletas */}
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
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {availableAthletes.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Todos los atletas de esta institución ya fueron agregados
                  </p>
                )}
              </div>

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
                          <Badge variant={getRoleBadgeVariant(member.rol)} size="sm">
                            {member.rol.charAt(0).toUpperCase() + member.rol.slice(1)}
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
                  <p>No hay integrantes en el equipo</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Mensaje si no hay idparam y no hay categorías cargadas */}
      {!isLoadingData && !effectiveIdparam && !showCategorySelector && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Esta categoría no tiene configurado un mapeo con Sismaster (
            <code className="text-xs">sismasterIdParam</code>). Verifica la
            configuración de la categoría.
          </span>
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
            !teamName ||
            selectedInstitution === 0 ||
            members.length === 0 ||
            !effectiveIdparam
          }
        >
          Crear e Inscribir Equipo
        </Button>
      </div>
    </form>
  );
}
