// src/features/events/components/TeamCreationForm.tsx
import { useState, useMemo } from "react";
import { Plus, X, UserCircle2, AlertCircle, Tag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useInstitutions } from "@/features/institutions/api/institutions.queries";
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
  eventId: number;
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

function normalizeInstitutionName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function findLocalInstitution(
  localByName: Map<string, { institutionId: number; name: string }>,
  sismasterName: string,
) {
  const normalized = normalizeInstitutionName(sismasterName);

  // 1. Coincidencia exacta (caso actual)
  const exact = localByName.get(normalized);
  if (exact) return exact;

  // 2. Extraer palabras significativas (ignora abreviaciones y sufijos geográficos)
  const STOP_WORDS = new Set([
    "de", "del", "la", "las", "los", "el", "y", "e",
    "unv", "univ", "universidad", "privada", "nacional",
    "pontificia", "filial",
  ]);

  const getKeywords = (s: string) =>
    s
      .split(/[\s\-–,.]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const sismasterKeywords = getKeywords(normalized);
  if (sismasterKeywords.length === 0) return undefined;

  // 3. Buscar la institución local cuyo nombre contenga más palabras clave
  let bestMatch: { institutionId: number; name: string } | undefined;
  let bestScore = 0;

  for (const [localNormName, localInst] of localByName.entries()) {
    const localKeywords = new Set(getKeywords(localNormName));
    const matches = sismasterKeywords.filter((kw) => localKeywords.has(kw)).length;
    const score = matches / Math.max(sismasterKeywords.length, localKeywords.size);

    if (score > bestScore && score >= 0.5) {
      // al menos el 50% de palabras clave deben coincidir
      bestScore = score;
      bestMatch = localInst;
    }
  }

  return bestMatch;
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
  const [autoFilledName, setAutoFilledName] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<number>(0);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<string>("titular");
  const [manualIdparam, setManualIdparam] = useState<number | null>(null);
  const [extraIdparam, setExtraIdparam] = useState<number | null>(null);

  const { data: localInstitutions = [] } = useInstitutions();

  const localSportId = eventCategory.category?.sport?.sportId;
  const categoryName = eventCategory.category?.name ?? "";

  const directIdparam = (eventCategory.category as any)?.sismasterIdParam as
    | number
    | null
    | undefined;

  const { data: sismasterCategories = [], isLoading: isLoadingCategories } =
    useSportCategoriesByEvent(
      localSportId!,
      eventId,
      !!localSportId,  
    );

  const effectiveIdparam = useMemo(() => {
    if (directIdparam) return directIdparam;
    if (manualIdparam) return manualIdparam;
    return (
      findMatchingParam(sismasterCategories, categoryName)?.idparam ?? null
    );
  }, [directIdparam, manualIdparam, sismasterCategories, categoryName]);

  const showCategorySelector = !directIdparam && sismasterCategories.length > 0;

  const { data: athletesFromSismaster = [], isLoading: isLoadingAthletes } =
    useAthletesByCategory(
      eventId,
      localSportId!,
      effectiveIdparam ?? 0,
      !!localSportId && !!effectiveIdparam,
    );

  const { data: extraAthletesFromSismaster = [], isLoading: isLoadingExtra } =
    useAthletesByCategory(
      eventId,
      localSportId!,
      extraIdparam ?? 0,
      !!localSportId && !!extraIdparam,
    );

  const isLoadingData = isLoadingCategories || isLoadingAthletes || isLoadingExtra;

  const institutions = useMemo(() => {
    const localByName = new Map(
      localInstitutions.map((inst) => [
        normalizeInstitutionName(inst.name),
        inst,
      ]),
    );

    const map = new Map<
      number,
      { sismasterId: number; localId: number; name: string }
    >();

    const allAthletes = extraIdparam
      ? [
          ...athletesFromSismaster,
          ...extraAthletesFromSismaster.filter(
            (ea) => !athletesFromSismaster.some((a) => a.idperson === ea.idperson),
          ),
        ]
      : athletesFromSismaster; 

    allAthletes.forEach((a) => {
      if (!a.idinstitution || !a.institutionName) return;
      const localInstitution = findLocalInstitution(localByName, a.institutionName);

      if (!localInstitution) return;
      map.set(a.idinstitution, {
        sismasterId: a.idinstitution,
        localId: localInstitution.institutionId,
        name: localInstitution.name,
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [athletesFromSismaster, extraAthletesFromSismaster, localInstitutions, extraIdparam]);


  const selectedInstitutionData = useMemo(() => {
    return (
      institutions.find((inst) => inst.sismasterId === selectedInstitution) ??
      null
    );
  }, [institutions, selectedInstitution]);

  const availableAthletes = useMemo(() => {
    const allAthletes = extraIdparam
      ? [
          ...athletesFromSismaster,
          ...extraAthletesFromSismaster.filter(
            (ea) => !athletesFromSismaster.some((a) => a.idperson === ea.idperson),
          ),
        ]
      : athletesFromSismaster;

    return allAthletes.filter(
      (a) =>
        a.idinstitution === selectedInstitution &&
        !members.some((m) => m.athleteId === a.idperson),
    );
  }, [athletesFromSismaster, extraAthletesFromSismaster, selectedInstitution, members, extraIdparam]);

  const handleExtraIdparamChange = (newValue: number | null) => {
    setExtraIdparam(newValue);
    setSelectedAthlete(0);
    if (!newValue) {
      const stillValid = athletesFromSismaster.some(
        (a) => a.idinstitution === selectedInstitution,
      );
      if (!stillValid) {
        setSelectedInstitution(0);
        setMembers([]);
        if (autoFilledName) {
          setTeamName("");
          setAutoFilledName(false);
        }
      }
    }
  };

  const handleInstitutionChange = (sismasterId: number) => {
    setSelectedInstitution(sismasterId);
    setMembers([]);
    setSelectedAthlete(0);

    if (sismasterId === 0) {
      if (autoFilledName) {
        setTeamName("");
        setAutoFilledName(false);
      }
      return;
    }

    const inst = institutions.find((i) => i.sismasterId === sismasterId);
    if (!inst) return;

    if (teamName === "" || autoFilledName) {
      setTeamName(inst.name);
      setAutoFilledName(true);
    }
  };

  const handleResetToInstitutionName = () => {
    if (selectedInstitutionData) {
      setTeamName(selectedInstitutionData.name);
      setAutoFilledName(true);
    }
  };

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
    setAutoFilledName(false);
  };

  const institutionOptions = [
    { value: 0, label: "Seleccione una institución" },
    ...institutions.map((inst) => ({
      value: inst.sismasterId,
      label: inst.name,
    })),
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

  const extraCategoryOptions = [
    { value: "", label: "— Solo esta categoría —" },
    ...sismasterCategories.map((p) => ({
      value: String(p.idparam),
      label: `${p.name} (${p.athleteCount} atletas)`,
    })),
  ];


  const addMember = () => {
    const athlete = availableAthletes.find(
      (a) => a.idperson === selectedAthlete,
    );

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

    if (!selectedInstitutionData) return;

    onSubmit({
      teamName: teamName.trim(),
      institutionId: selectedInstitutionData.localId,
      categoryId,
      members: members.map((m) => ({ athleteId: m.athleteId, rol: m.rol })),
    });
  };

  const getRoleBadgeVariant = (rol: string) => {
    if (rol === "capitan") return "primary" as const;
    if (rol === "titular") return "success" as const;
    return "default" as const;
  };

  const showResetNameButton =
    selectedInstitutionData !== null &&
    !autoFilledName &&
    teamName !== selectedInstitutionData.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {isLoadingData && (
        <div className="flex justify-center py-6">
          <Spinner size="lg" label="Cargando atletas de la categoría..." />
        </div>
      )}

      {!isLoadingData && effectiveIdparam && institutions.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            No hay coincidencia entre las instituciones de Sismaster y tus
            instituciones locales. Revisa los nombres de institución.
          </span>
        </div>
      )}

      {!isLoadingData && effectiveIdparam && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información del Equipo
            </h3>

            <Select
              label={`Institución * (${institutions.length} disponibles)`}
              value={selectedInstitution}
              onChange={(e) => handleInstitutionChange(Number(e.target.value))}
              options={institutionOptions}
              required
            />

            <div className="space-y-1">
              <Input
                label="Nombre del Equipo *"
                value={teamName}
                onChange={handleTeamNameChange}
                placeholder={
                  selectedInstitution === 0
                    ? "Selecciona una institución primero..."
                    : "Nombre del equipo"
                }
                required
              />
              <div className="flex items-center justify-between px-1 min-h-[20px]">
                {teamName !== "" && (
                  <span
                    className={`text-xs ${
                      autoFilledName ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {autoFilledName
                      ? "✓ Autocompletado desde institución"
                      : "✏ Nombre personalizado"}
                  </span>
                )}

                {showResetNameButton && (
                  <button
                    type="button"
                    onClick={handleResetToInstitutionName}
                    className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Usar nombre de institución
                  </button>
                )}
              </div>
            </div>
          </div>

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

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                   
                    Buscar en otra categoría
                    <span className="text-gray-400 font-normal normal-case tracking-normal">
                      (opcional)
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(extraIdparam ?? "")}
                      onChange={(e) => handleExtraIdparamChange(e.target.value ? Number(e.target.value) : null)}
                      options={extraCategoryOptions}
                    />
                    {extraIdparam && (
                      <button
                        type="button"
                        onClick={() => handleExtraIdparamChange(null)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Quitar categoría extra"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {extraIdparam && (
                    <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                      {extraIdparam === effectiveIdparam
                        ? <>Mostrando atletas de <strong>esta misma categoría</strong>.</>
                        : <>Mostrando atletas de <strong>2 categorías</strong>. Útil cuando el atleta está en individual pero participa en equipo.</>
                      }
                    </p>
                  )}

                  {isLoadingExtra && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Spinner size="sm" />
                      Cargando atletas de la categoría extra...
                    </div>
                  )}
                </div>

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

                {availableAthletes.length === 0 && !isLoadingExtra && (
                  <p className="text-xs text-gray-500 text-center">
                    {extraIdparam
                      ? "Todos los atletas de ambas categorías ya fueron agregados"
                      : "Todos los atletas de esta institución ya fueron agregados"}
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
                  <p>No hay integrantes en el equipo</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={
            !teamName.trim() ||
            selectedInstitution === 0 ||
            !selectedInstitutionData ||
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