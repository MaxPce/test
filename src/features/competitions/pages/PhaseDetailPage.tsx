import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Play, BarChart3, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { usePhase } from "../api/phases.queries";
import { useMatch } from "../api/matches.queries";
import {
  useInitializeBracket,
  useInitializeRoundRobin,
} from "../api/phases.mutations";
import { useUpdateMatch } from "../api/matches.mutations";
import {
  useBulkParticipations,
  useDeleteParticipation,
} from "../api/participations.mutations";
import { useRegistrations } from "@/features/events/api/registrations.queries";
import { MatchForm } from "../components/MatchForm";
import { MatchCard } from "../components/MatchCard";
import { BracketView } from "../components/BracketView";
import { StandingsTable } from "../components/StandingsTable";
import { ParticipationsList } from "../components/ParticipationsList";
import { TableTennisMatchWrapper } from "../components/table-tennis/TableTennisMatchWrapper";
import { JudoScoreModal } from "../components/judo/JudoScoreModal";
import { KyoruguiScoreModal } from "../components/taekwondo/KyoruguiScoreModal";
import { PoomsaeScoreTable } from "../components/taekwondo/PoomsaeScoreTable"; // ⭐ NUEVO
import type { Match } from "../types";

export function PhaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const phaseId = Number(id);

  const [isEditMatchModalOpen, setIsEditMatchModalOpen] = useState(false);
  const [isAddParticipantsModalOpen, setIsAddParticipantsModalOpen] =
    useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    [],
  );
  const [viewMode, setViewMode] = useState<"list" | "bracket" | "standings">(
    "list",
  );

  const { data: phase, isLoading: phaseLoading } = usePhase(phaseId);

  const { data: selectedMatch, isLoading: selectedMatchLoading } = useMatch(
    selectedMatchId || 0,
  );

  const { data: registrations = [] } = useRegistrations(
    phase ? { eventCategoryId: phase.eventCategoryId } : undefined,
  );

  const updateMatchMutation = useUpdateMatch();
  const bulkParticipationsMutation = useBulkParticipations();
  const deleteParticipationMutation = useDeleteParticipation();
  const initializeBracketMutation = useInitializeBracket();
  const initializeRoundRobinMutation = useInitializeRoundRobin();

  // ⭐ NUEVO: Detectar si es Poomsae
  const isPoomsaePhase = () => {
    if (!phase) return false;
    const sportName =
      phase.eventCategory?.category?.sport?.name?.toLowerCase() || "";
    const categoryName =
      phase.eventCategory?.category?.name?.toLowerCase() || "";

    return sportName.includes("taekwondo") && categoryName.includes("poomsae");
  };

  const handleUpdateMatch = async (data: any) => {
    if (selectedMatch) {
      await updateMatchMutation.mutateAsync({
        id: selectedMatch.matchId,
        data,
      });
      setIsEditMatchModalOpen(false);
      setSelectedMatchId(null);
    }
  };

  const handleAddParticipants = async () => {
    if (selectedParticipants.length === 0) return;

    const isTeam = phase?.eventCategory?.category?.type === "equipo";

    await bulkParticipationsMutation.mutateAsync({
      phaseId,
      participantIds: selectedParticipants,
      isTeam,
    });

    setSelectedParticipants([]);
    setIsAddParticipantsModalOpen(false);
  };

  const handleDeleteParticipation = async (participationId: number) => {
    await deleteParticipationMutation.mutateAsync(participationId);
  };

  const handleInitializeBracket = async () => {
    if (confirm("¿Inicializar bracket de eliminación directa?")) {
      await initializeBracketMutation.mutateAsync({ phaseId });
    }
  };

  const handleInitializeRoundRobin = async () => {
    if (confirm("¿Inicializar partidos de round robin?")) {
      await initializeRoundRobinMutation.mutateAsync({ phaseId });
    }
  };

  const openEditMatchModal = (match: Match) => {
    setSelectedMatchId(match.matchId);
    setIsEditMatchModalOpen(true);
  };

  const isTableTennisMatch = (match: Match | null) => {
    if (!match) return false;

    const sportName =
      match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() || "";

    return (
      sportName.includes("tenis de mesa") ||
      sportName.includes("tennis de mesa") ||
      sportName.includes("tenis mesa") ||
      sportName.includes("tenis de campo") ||
      sportName.includes("table tennis")
    );
  };

  const isJudoMatch = (match: Match | null) => {
    if (!match) return false;

    const sportName =
      match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() || "";

    return sportName.includes("judo");
  };

  const isTaekwondoKyorugiMatch = (match: Match | null) => {
    if (!match) return false;

    const sportName =
      match.phase?.eventCategory?.category?.sport?.name?.toLowerCase() || "";
    const categoryName =
      match.phase?.eventCategory?.category?.name?.toLowerCase() || "";

    return sportName.includes("taekwondo") && categoryName.includes("kyorugi");
  };

  const getModalTitle = (match: Match | null) => {
    if (!match) return "Actualizar Resultado";
    if (isTableTennisMatch(match)) return "Gestionar Match - Tenis de Mesa";
    if (isJudoMatch(match)) return "Editar Puntaje - Judo";
    if (isTaekwondoKyorugiMatch(match))
      return "Editar Puntaje - Taekwondo Kyorugi";
    return "Actualizar Resultado";
  };

  const getModalSize = (match: Match | null) => {
    if (!match) return "lg";
    if (isTableTennisMatch(match)) return "full";
    if (isJudoMatch(match) || isTaekwondoKyorugiMatch(match)) return "md";
    return "lg";
  };

  const availableParticipants = registrations.filter(
    (reg) =>
      !phase?.participations?.some((p) => {
        if (phase.eventCategory?.category?.type === "equipo") {
          return p.teamId === reg.teamId;
        }
        return p.athleteId === reg.athleteId;
      }),
  );

  if (phaseLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Fase no encontrada</p>
        <Button
          onClick={() => navigate("/admin/competitions")}
          className="mt-4"
        >
          Volver a Competencias
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "primary" | "default"> = {
      pendiente: "default",
      en_curso: "success",
      finalizado: "primary",
    };
    return variants[status] || "default";
  };

  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      eliminacion_directa: "Eliminación Directa",
      round_robin: "Round Robin",
      grupos: "Fase de Grupos",
    };
    return labels[format] || format;
  };

  // ⭐ NUEVO: Renderizar vista específica para Poomsae
  const renderPoomsaeView = () => {
    // Para Poomsae en modo bracket, mostrar bracket
    if (phase.format === "eliminacion_directa" && viewMode === "bracket") {
      return (
        <BracketView
          matches={phase.matches || []}
          participations={phase.participations || []}
        />
      );
    }

    // Para Poomsae en modo grupos o lista, mostrar tabla de scores
    return <PoomsaeScoreTable phaseId={phaseId} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/competitions")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Competencias
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{phase.name}</h1>
            <p className="text-gray-600 mt-2">
              {phase.eventCategory?.event?.name} -{" "}
              {phase.eventCategory?.category?.name}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={getStatusBadgeVariant(phase.status)} size="lg">
                {phase.status === "pendiente" && "Pendiente"}
                {phase.status === "en_curso" && "En Curso"}
                {phase.status === "finalizado" && "Finalizado"}
              </Badge>
              <Badge variant="info" size="lg">
                {getFormatLabel(phase.format)}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {phase.format === "eliminacion_directa" && (
              <Button
                onClick={handleInitializeBracket}
                disabled={
                  !phase.participations ||
                  phase.participations.length === 0 ||
                  (phase.matches && phase.matches.length > 0) ||
                  initializeBracketMutation.isPending
                }
                isLoading={initializeBracketMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Inicializar Bracket
              </Button>
            )}
            {phase.format === "round_robin" && (
              <Button
                onClick={handleInitializeRoundRobin}
                disabled={
                  !phase.participations ||
                  phase.participations.length === 0 ||
                  (phase.matches && phase.matches.length > 0) ||
                  initializeRoundRobinMutation.isPending
                }
                isLoading={initializeRoundRobinMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Inicializar Round Robin
              </Button>
            )}
            <Button onClick={() => setIsAddParticipantsModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Participantes
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Participantes ({phase.participations?.length || 0})
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          <ParticipationsList
            participations={phase.participations || []}
            onDelete={handleDeleteParticipation}
            isDeleting={deleteParticipationMutation.isPending}
          />
        </CardBody>
      </Card>

      {/* ⭐ MODIFICADO: Renderizado condicional para Poomsae */}
      {isPoomsaePhase() ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {phase.format === "eliminacion_directa"
                  ? "Competencia"
                  : "Tabla de Puntajes"}
              </h2>
              {/* ⭐ Mostrar botón de bracket solo para eliminación directa */}
              {phase.format === "eliminacion_directa" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "primary" : "ghost"}
                    onClick={() => setViewMode("list")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "bracket" ? "primary" : "ghost"}
                    onClick={() => setViewMode("bracket")}
                  >
                    Bracket
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>{renderPoomsaeView()}</CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Partidos ({phase.matches?.length || 0})
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  onClick={() => setViewMode("list")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                {phase.format === "eliminacion_directa" && (
                  <Button
                    size="sm"
                    variant={viewMode === "bracket" ? "primary" : "ghost"}
                    onClick={() => setViewMode("bracket")}
                  >
                    Bracket
                  </Button>
                )}
                {phase.format === "round_robin" && (
                  <Button
                    size="sm"
                    variant={viewMode === "standings" ? "primary" : "ghost"}
                    onClick={() => setViewMode("standings")}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Tabla
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {viewMode === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phase.matches && phase.matches.length > 0 ? (
                  phase.matches.map((match) => (
                    <MatchCard
                      key={match.matchId}
                      match={match}
                      participations={phase.participations || []}
                      onEdit={openEditMatchModal}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No hay partidos. Inicializa la fase para generar los
                    partidos.
                  </div>
                )}
              </div>
            )}

            {viewMode === "bracket" && (
              <BracketView
                matches={phase.matches || []}
                participations={phase.participations || []}
              />
            )}

            {viewMode === "standings" && (
              <StandingsTable participations={phase.participations || []} />
            )}
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={isEditMatchModalOpen}
        onClose={() => {
          setIsEditMatchModalOpen(false);
          setSelectedMatchId(null);
        }}
        title={
          selectedMatchLoading ? "Cargando..." : getModalTitle(selectedMatch)
        }
        size={getModalSize(selectedMatch)}
      >
        {selectedMatchLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Cargando match...</span>
          </div>
        ) : selectedMatch ? (
          <>
            {isTableTennisMatch(selectedMatch) ? (
              <TableTennisMatchWrapper match={selectedMatch} />
            ) : isJudoMatch(selectedMatch) ? (
              <JudoScoreModal
                match={selectedMatch as any}
                isOpen={true}
                onClose={() => {
                  setIsEditMatchModalOpen(false);
                  setSelectedMatchId(null);
                }}
              />
            ) : isTaekwondoKyorugiMatch(selectedMatch) ? (
              <KyoruguiScoreModal
                match={selectedMatch as any}
                isOpen={true}
                onClose={() => {
                  setIsEditMatchModalOpen(false);
                  setSelectedMatchId(null);
                }}
              />
            ) : (
              <MatchForm
                match={selectedMatch}
                participations={phase.participations || []}
                onSubmit={handleUpdateMatch}
                onCancel={() => {
                  setIsEditMatchModalOpen(false);
                  setSelectedMatchId(null);
                }}
                isLoading={updateMatchMutation.isPending}
              />
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Match no encontrado
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddParticipantsModalOpen}
        onClose={() => {
          setIsAddParticipantsModalOpen(false);
          setSelectedParticipants([]);
        }}
        title="Agregar Participantes"
        size="lg"
      >
        <div className="space-y-4">
          {availableParticipants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay participantes disponibles para agregar
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedParticipants.length} de{" "}
                  {availableParticipants.length} seleccionados
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (
                      selectedParticipants.length ===
                      availableParticipants.length
                    ) {
                      setSelectedParticipants([]);
                    } else {
                      setSelectedParticipants(
                        availableParticipants.map((reg) =>
                          phase.eventCategory?.category?.type === "equipo"
                            ? reg.teamId!
                            : reg.athleteId!,
                        ),
                      );
                    }
                  }}
                >
                  {selectedParticipants.length === availableParticipants.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {availableParticipants.map((registration) => {
                  const participantId =
                    phase.eventCategory?.category?.type === "equipo"
                      ? registration.teamId!
                      : registration.athleteId!;
                  const name =
                    registration.athlete?.name ||
                    registration.team?.name ||
                    "N/A";
                  const institution =
                    registration.athlete?.institution?.name ||
                    registration.team?.institution?.name ||
                    "N/A";

                  return (
                    <label
                      key={registration.registrationId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participantId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([
                              ...selectedParticipants,
                              participantId,
                            ]);
                          } else {
                            setSelectedParticipants(
                              selectedParticipants.filter(
                                (id) => id !== participantId,
                              ),
                            );
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-sm text-gray-500">{institution}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddParticipantsModalOpen(false);
                setSelectedParticipants([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddParticipants}
              isLoading={bulkParticipationsMutation.isPending}
              disabled={selectedParticipants.length === 0}
            >
              Agregar {selectedParticipants.length} participante(s)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
