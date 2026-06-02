import { useState, useMemo } from "react";
import { Trash2, UserPlus, Check, X, Loader2, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  useUpdateTeam,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
} from "@/features/institutions/api/teams.mutations";
import {
  useAccreditedAthletes,
  useAthletesByCategory,
  useSportCategoriesByEvent,
  type SismasterAthlete,
} from "@/features/institutions/api/sismaster.queries";
import type { Team } from "@/features/institutions/types";
import type { EventCategory } from "@/features/events/types";
import { useTeam } from "@/features/institutions/api/teams.queries";


interface TeamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  eventId: number;
  eventCategory: EventCategory;
}

const ROLES = ["titular", "suplente", "capitán", "entrenador"];

function normalizeStr(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export function TeamEditModal({
  isOpen,
  onClose,
  team,
  eventId,
  eventCategory,
}: TeamEditModalProps) {
  const [teamName, setTeamName] = useState(team.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingAthlete, setAddingAthlete] = useState(false);
  const [addMode, setAddMode] = useState<"same-institution" | "other-category">("same-institution");
  const [extraIdparam, setExtraIdparam] = useState<number | null>(null);
  const [crossSearch, setCrossSearch] = useState("");

  const updateTeamMutation = useUpdateTeam();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();
  const { data: liveTeam } = useTeam(team.teamId);
    const liveMembers = liveTeam?.members ?? team.members ?? [];

  const localSportId =
    (eventCategory.category as any)?.sportId ??
    eventCategory.category?.sport?.sportId ??
    null;

  const directIdparam =
    (eventCategory.category as any)?.sismasterIdparam ??
    (eventCategory.category as any)?.sismasterIdParam ??
    null;

  const currentCategoryName = eventCategory.category?.name ?? "";

  const { data: availableAthletes = [], isLoading: loadingAthletes } =
    useAccreditedAthletes(
      { idevent: eventId, idinstitution: team.institutionId },
      !!eventId,
    );

  const { data: sismasterCategories = [] } = useSportCategoriesByEvent(
    localSportId!,
    eventId,
    !!localSportId && addMode === "other-category",
  );

  const effectiveCurrentIdparam = useMemo(() => {
    if (directIdparam) return directIdparam;
    const target = normalizeStr(currentCategoryName);
    return (
      sismasterCategories.find((p) => normalizeStr(p.name) === target)?.idparam ??
      sismasterCategories.find((p) => normalizeStr(p.name).includes(target))?.idparam ??
      null
    );
  }, [directIdparam, sismasterCategories, currentCategoryName]);

  const extraCategoryOptions = useMemo(
    () => sismasterCategories.filter((p) => p.idparam !== effectiveCurrentIdparam),
    [sismasterCategories, effectiveCurrentIdparam],
  );

  const { data: extraAthletes = [], isLoading: loadingExtra } =
    useAthletesByCategory(
      eventId,
      localSportId!,
      extraIdparam ?? 0,
      !!localSportId && !!extraIdparam,
    );

  const currentMemberIds = new Set(liveMembers.map((m) => m.athleteId));
  

  const filteredAthletes = availableAthletes.filter(
    (a: SismasterAthlete) =>
      !currentMemberIds.has(a.idperson) &&
      (searchQuery === "" ||
        `${a.firstname} ${a.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.docnumber?.includes(searchQuery)),
  );

  const filteredExtraAthletes = useMemo(() => {
    const query = normalizeStr(crossSearch);
    return extraAthletes.filter(
      (a) =>
        !currentMemberIds.has(a.idperson) &&
        (query === "" ||
          normalizeStr(`${a.firstname} ${a.lastname}`).includes(query) ||
          a.docnumber?.includes(query)),
    );
  }, [extraAthletes, crossSearch, currentMemberIds]);

  const handleSaveName = async () => {
    if (teamName.trim() === team.name) { setIsEditingName(false); return; }
    await updateTeamMutation.mutateAsync({ id: team.teamId, data: { name: teamName.trim() } });
    setIsEditingName(false);
  };

  const handleRemoveMember = async (athleteId: number) => {
    await removeMemberMutation.mutateAsync({ teamId: team.teamId, athleteId });
  };

  const handleRoleChange = async (athleteId: number, rol: string) => {
    await updateRoleMutation.mutateAsync({ teamId: team.teamId, athleteId, data: { rol } });
  };

  const handleAddMember = async (athleteId: number) => {
    await addMemberMutation.mutateAsync({
      teamId: team.teamId,
      data: { athleteId, rol: "titular" },
    });
    setSearchQuery("");
    setCrossSearch("");
  };

  const handleCloseAdding = () => {
    setAddingAthlete(false);
    setAddMode("same-institution");
    setExtraIdparam(null);
    setSearchQuery("");
    setCrossSearch("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar equipo" size="lg">
      <div className="space-y-5">

        {/* Nombre del equipo */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Nombre del equipo
          </label>
          <div className="mt-1 flex items-center gap-2">
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") { setTeamName(team.name); setIsEditingName(false); }
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={updateTeamMutation.isPending}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  {updateTeamMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setTeamName(team.name); setIsEditingName(false); }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                  {teamName}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg"
                >
                  Editar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Miembros actuales */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Integrantes ({liveMembers.length})
          </label>
          <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1">
            {(liveMembers.length === 0) ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin integrantes aún</p>
            ) : (
              liveMembers.map((member) => (
                <div
                  key={member.athleteId}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {member.athlete?.name?.charAt(0) ?? "?"}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">
                    {member.athlete?.name?.toUpperCase() ?? `Atleta #${member.athleteId}`}
                  </span>
                  <select
                    value={member.rol || "titular"}
                    onChange={(e) => handleRoleChange(member.athleteId, e.target.value)}
                    disabled={updateRoleMutation.isPending}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.athleteId)}
                    disabled={removeMemberMutation.isPending}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    {removeMemberMutation.isPending
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Agregar nuevo integrante */}
        <div>
          <button
            onClick={() => (addingAthlete ? handleCloseAdding() : setAddingAthlete(true))}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <UserPlus className="h-4 w-4" />
            {addingAthlete ? "Cancelar" : "Agregar integrante"}
          </button>

          {addingAthlete && (
            <div className="mt-3 space-y-3">

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setAddMode("same-institution"); setCrossSearch(""); setExtraIdparam(null); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    addMode === "same-institution"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Misma institución
                </button>
                <button
                  type="button"
                  onClick={() => { setAddMode("other-category"); setSearchQuery(""); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    addMode === "other-category"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Otras categorías
                </button>
              </div>

              {/* Tab: misma institución (comportamiento original) */}
              {addMode === "same-institution" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-lg">
                    {loadingAthletes ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    ) : filteredAthletes.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">
                        {searchQuery ? "Sin resultados" : "Escribe para buscar"}
                      </p>
                    ) : (
                      filteredAthletes.map((athlete) => (
                        <button
                          key={athlete.idperson}
                          onClick={() => handleAddMember(athlete.idperson)}
                          disabled={addMemberMutation.isPending}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-left transition-colors"
                        >
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {athlete.firstname?.charAt(0) ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {`${athlete.firstname} ${athlete.lastname}`}
                            </p>
                            <p className="text-xs text-gray-400">{athlete.docnumber}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: otras categorías */}
              {addMode === "other-category" && (
                <div className="space-y-2">
                  

                  {!localSportId ? (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Esta categoría no tiene deporte configurado con ID de Sismaster.
                    </p>
                  ) : (
                    <>
                      <select
                        value={extraIdparam ?? ""}
                        onChange={(e) => setExtraIdparam(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">— Seleccionar categoría de origen —</option>
                        {sismasterCategories.map((p) => (
                        <option key={p.idparam} value={p.idparam}>
                            {p.name} ({p.athleteCount} atletas)
                            {p.idparam === effectiveCurrentIdparam ? " (categoría actual)" : ""}
                        </option>
                        ))}
                      </select>

                      {extraIdparam && (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Buscar por nombre o DNI..."
                              value={crossSearch}
                              onChange={(e) => setCrossSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-lg">
                            {loadingExtra ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            ) : filteredExtraAthletes.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-3">
                                {crossSearch ? "Sin resultados" : "No hay atletas disponibles en esta categoría"}
                              </p>
                            ) : (
                              filteredExtraAthletes.map((athlete) => (
                                <button
                                  key={athlete.idperson}
                                  onClick={() => handleAddMember(athlete.idperson)}
                                  disabled={addMemberMutation.isPending}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-left transition-colors"
                                >
                                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                    {athlete.firstname?.charAt(0) ?? "?"}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">
                                      {`${athlete.firstname} ${athlete.lastname}`}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {athlete.institutionName} • {athlete.docnumber}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="default" onClick={onClose}>
            Listo
          </Button>
        </div>

      </div>
    </Modal>
  );
}