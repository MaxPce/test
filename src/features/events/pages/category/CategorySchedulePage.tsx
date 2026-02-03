import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Plus, Calendar, Trophy, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PhaseForm } from "@/features/competitions/components/PhaseForm";
import { MatchForm } from "@/features/competitions/components/MatchForm";
import { AssignParticipantsModal } from "@/features/competitions/components/AssignParticipantsModal";
import { ResultModal } from "@/features/competitions/components/ResultModal";
import { BracketView } from "@/features/competitions/components/BracketView";
import { TableTennisMatchWrapper } from "@/features/competitions/components/table-tennis/TableTennisMatchWrapper";
import { KyoruguiBracketView } from "@/features/competitions/components/taekwondo/KyoruguiBracketView";
import { PoomsaeScoreModal } from "@/features/competitions/components/taekwondo/PoomsaeScoreModal";
import { PoomsaeScoreTable } from "@/features/competitions/components/taekwondo/PoomsaeScoreTable";
import { KyoruguiScoreModal } from "@/features/competitions/components/taekwondo/KyoruguiScoreModal";
import { JudoScoreModal } from "@/features/competitions/components/judo/JudoScoreModal";
import { useAdvanceWinner } from "@/features/competitions/api/bracket.mutations";
import { usePhases } from "@/features/competitions/api/phases.queries";
import {
  useMatches,
  useMatch,
} from "@/features/competitions/api/matches.queries";
import {
  useCreatePhase,
  useDeletePhase,
} from "@/features/competitions/api/phases.mutations";
import {
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
} from "@/features/competitions/api/matches.mutations";
import { useCreateParticipation } from "@/features/competitions/api/participations.mutations";
import type { EventCategory } from "../../types";
import type { Phase, Match } from "@/features/competitions/types";
import { GenerateRoundRobinModal } from "@/features/competitions/components/GenerateRoundRobinModal";
import { useInitializeRoundRobin } from "@/features/competitions/api/round-robin.mutations";
import { useUpdateStandings } from "@/features/competitions/api/standings.mutations";
import { BestOf3View } from "@/features/competitions/components/BestOf3View";
import { GenerateBestOf3Modal } from "@/features/competitions/components/GenerateBestOf3Modal";
import { useInitializeBestOf3 } from "@/features/competitions/api/best-of-3.mutations";
import { GenerateBracketModal } from "@/features/competitions/components/GenerateBracketModal";
import { useGenerateBracket } from "@/features/competitions/api/bracket.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function CategorySchedulePage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();
  const { eventId, sportId, categoryId } = useParams();

  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerateBestOf3ModalOpen, setIsGenerateBestOf3ModalOpen] =
    useState(false);
  const [isGenerateBracketModalOpen, setIsGenerateBracketModalOpen] =
    useState(false);

  const initializeRoundRobinMutation = useInitializeRoundRobin();
  const updateStandingsMutation = useUpdateStandings();
  const initializeBestOf3Mutation = useInitializeBestOf3();
  const generateBracketMutation = useGenerateBracket();
  const advanceWinnerMutation = useAdvanceWinner();

  const { data: phases = [], isLoading: phasesLoading } = usePhases(
    eventCategory.eventCategoryId,
  );
  const { data: matches = [], isLoading: matchesLoading } = useMatches(
    selectedPhase?.phaseId,
  );

  const { data: fullMatch, isLoading: fullMatchLoading } = useMatch(
    selectedMatchId || 0,
  );

  const createPhaseMutation = useCreatePhase();
  const deletePhaseMutation = useDeletePhase();
  const createMatchMutation = useCreateMatch();
  const updateMatchMutation = useUpdateMatch();
  const deleteMatchMutation = useDeleteMatch();
  const createParticipationMutation = useCreateParticipation();

  const isTableTennis = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return (
      sportName.includes("tenis de mesa") ||
      sportName.includes("tennis de mesa") ||
      sportName.includes("ping pong") ||
      sportName.includes("table tennis")
    );
  };

  const isJudo = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
    return sportName.includes("judo");
  };

  const getTaekwondoType = () => {
    const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";

    if (!sportName.includes("taekwondo")) return null;

    const categoryName = eventCategory.category?.name?.toLowerCase() || "";

    if (
      categoryName.includes("poomsae") ||
      categoryName.includes("formas") ||
      categoryName.includes("forma")
    ) {
      return "poomsae";
    }

    if (
      categoryName.includes("kyorugui") ||
      categoryName.includes("combate") ||
      categoryName.includes("pelea") ||
      categoryName.includes("lucha")
    ) {
      return "kyorugui";
    }

    if (selectedPhase?.type === "eliminacion") {
      return "kyorugui";
    }

    return null;
  };

  const handleCreatePhase = async (data: any) => {
    await createPhaseMutation.mutateAsync(data);
    setIsPhaseModalOpen(false);
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (
      confirm(
        "¿Estás seguro de eliminar esta fase? Se eliminarán todos sus partidos.",
      )
    ) {
      await deletePhaseMutation.mutateAsync(phaseId);
      if (selectedPhase?.phaseId === phaseId) {
        setSelectedPhase(null);
      }
    }
  };

  const handleCreateMatch = async (data: any) => {
    await createMatchMutation.mutateAsync(data);
    setIsMatchModalOpen(false);
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (confirm("¿Estás seguro de eliminar este partido?")) {
      await deleteMatchMutation.mutateAsync(matchId);
    }
  };

  const handleAssignParticipant = async (data: any) => {
    await createParticipationMutation.mutateAsync(data);
  };

  const handleRegisterResult = async (matchId: number, winnerId: number) => {
    if (selectedPhase?.type === "eliminacion") {
      await advanceWinnerMutation.mutateAsync({
        matchId,
        winnerRegistrationId: winnerId,
      });
    } else {
      await updateMatchMutation.mutateAsync({
        id: matchId,
        data: {
          status: "finalizado",
          winnerRegistrationId: winnerId,
        },
      });

      if (selectedPhase?.type === "grupo") {
        await updateStandingsMutation.mutateAsync(selectedPhase.phaseId);
      }
    }
  };

  const handleGenerateBestOf3 = async (data: {
    phaseId: number;
    registrationIds: number[];
  }) => {
    await initializeBestOf3Mutation.mutateAsync(data);
    setIsGenerateBestOf3ModalOpen(false);
  };

  const handleGenerateBracket = async (data: {
    phaseId: number;
    registrationIds: number[];
    includeThirdPlace?: boolean;
  }) => {
    await generateBracketMutation.mutateAsync(data);
    setIsGenerateBracketModalOpen(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "success" | "primary" | "default" | "warning"
    > = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
      cancelado: "warning",
    };
    return variants[status] || "default";
  };

  const getPhaseTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      grupo: "Grupos",
      eliminacion: "Eliminación",
      repechaje: "Repechaje",
      mejor_de_3: "Mejor de 3",
    };
    return types[type] || type;
  };

  const handleGenerateRoundRobin = async (data: {
    phaseId: number;
    registrationIds: number[];
  }) => {
    await initializeRoundRobinMutation.mutateAsync(data);
    setIsGenerateModalOpen(false);
  };

  if (phasesLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Programación</h3>
        </div>
        <Button onClick={() => setIsPhaseModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Fase
        </Button>
      </div>

      {phases.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay fases creadas</p>
              <p className="text-sm text-gray-400 mb-4">
                Crea la primera fase para comenzar a organizar la competencia
              </p>
              <Button variant="ghost" onClick={() => setIsPhaseModalOpen(true)}>
                Crear Primera Fase
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <Card
                key={phase.phaseId}
                className={`cursor-pointer transition-all ${
                  selectedPhase?.phaseId === phase.phaseId
                    ? "ring-2 ring-blue-500"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPhase(phase)}
              >
                <CardBody>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {phase.name}
                      </h4>
                      <Badge variant="default" size="sm" className="mt-1">
                        {getPhaseTypeBadge(phase.type)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhase(phase.phaseId);
                      }}
                    >
                      <span className="text-red-600">×</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {phase.matches?.length || 0} partido
                    {phase.matches?.length !== 1 ? "s" : ""}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {selectedPhase && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedPhase.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getTaekwondoType() === "poomsae"
                        ? `${eventCategory.registrations?.length || 0} participante${
                            eventCategory.registrations?.length !== 1 ? "s" : ""
                          }`
                        : `${matches.length} partido${matches.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Generar Bracket - para Kyorugui y Poomsae en eliminación */}
                    {selectedPhase.type === "eliminacion" &&
                      matches.length === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log(
                              "📊 EventCategory registrations:",
                              eventCategory.registrations,
                            );
                            console.log(
                              "📊 Total registrations:",
                              eventCategory.registrations?.length || 0,
                            );
                            console.log(
                              "📊 RegistrationIds:",
                              eventCategory.registrations?.map(
                                (r) => r.registrationId,
                              ),
                            );
                            setIsGenerateBracketModalOpen(true);
                          }}
                        >
                          Generar Bracket Completo
                        </Button>
                      )}

                    {getTaekwondoType() !== "poomsae" && (
                      <>
                        {selectedPhase.type === "grupo" &&
                          matches.length === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsGenerateModalOpen(true)}
                            >
                              Generar Partidos
                            </Button>
                          )}
                        {selectedPhase.type === "mejor_de_3" &&
                          matches.length === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setIsGenerateBestOf3ModalOpen(true)
                              }
                            >
                              Generar Serie
                            </Button>
                          )}
                      </>
                    )}

                    {/* Nuevo Partido - disponible para todos excepto Poomsae en grupo */}
                    {!(
                      getTaekwondoType() === "poomsae" &&
                      selectedPhase.type === "grupo"
                    ) && (
                      <Button
                        size="sm"
                        onClick={() => setIsMatchModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Partido
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {matchesLoading ? (
                  <div className="text-center py-8">Cargando partidos...</div>
                ) : getTaekwondoType() === "poomsae" &&
                  selectedPhase.type !== "eliminacion" ? (
                  <PoomsaeScoreTable phaseId={selectedPhase.phaseId} />
                ) : matches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>No hay partidos en esta fase</p>
                  </div>
                ) : selectedPhase.type === "mejor_de_3" ? (
                  <BestOf3View
                    matches={matches}
                    phase={selectedPhase}
                    eventCategory={eventCategory}
                  />
                ) : (
                  <div className="space-y-3">
                    {matches.map((match) => {
                      const participants = match.participations || [];
                      const hasParticipants = participants.length > 0;
                      const isTaekwondoKyorugui =
                        getTaekwondoType() === "kyorugui";
                      const isJudoMatch = isJudo();

                      return (
                        <div
                          key={match.matchId}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {match.matchNumber && (
                                  <span className="text-sm font-semibold text-gray-700">
                                    Partido #{match.matchNumber}
                                  </span>
                                )}
                                {match.round && (
                                  <Badge variant="default" size="sm">
                                    {match.round}
                                  </Badge>
                                )}
                                <Badge
                                  variant={getStatusBadgeVariant(match.status)}
                                  size="sm"
                                >
                                  {match.status === "programado" &&
                                    "Programado"}
                                  {match.status === "en_curso" && "En Curso"}
                                  {match.status === "finalizado" &&
                                    "Finalizado"}
                                  {match.status === "cancelado" && "Cancelado"}
                                </Badge>
                              </div>
                              {match.scheduledTime && (
                                <p className="text-sm text-gray-600">
                                  Fecha:{" "}
                                  {new Date(match.scheduledTime).toLocaleString(
                                    "es-ES",
                                  )}
                                </p>
                              )}
                              {match.platformNumber && (
                                <p className="text-sm text-gray-600">
                                  Plataforma {match.platformNumber}
                                </p>
                              )}

                              {/* Mostrar puntaje para Poomsae, Kyorugui y Judo */}
                              {(getTaekwondoType() === "poomsae" ||
                                getTaekwondoType() === "kyorugui" ||
                                isJudoMatch) &&
                                (match.participant1Score !== null ||
                                  match.participant2Score !== null) && (
                                  <p className="text-sm font-semibold text-gray-700 mt-1">
                                    Puntaje: {match.participant1Score ?? "-"} -{" "}
                                    {match.participant2Score ?? "-"}
                                    {/* Extra: Mostrar detalles de Poomsae si existen */}
                                    {getTaekwondoType() === "poomsae" &&
                                      match.participant1Accuracy !== null &&
                                      match.participant1Accuracy !==
                                        undefined && (
                                        <span className="text-xs text-gray-500 block">
                                          (
                                          {Number(
                                            match.participant1Accuracy,
                                          ).toFixed(2)}
                                          +
                                          {Number(
                                            match.participant1Presentation,
                                          ).toFixed(2)}
                                          ) - (
                                          {Number(
                                            match.participant2Accuracy,
                                          ).toFixed(2)}
                                          +
                                          {Number(
                                            match.participant2Presentation,
                                          ).toFixed(2)}
                                          )
                                        </span>
                                      )}
                                  </p>
                                )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMatch(match.matchId)}
                            >
                              <span className="text-red-600">×</span>
                            </Button>
                          </div>

                          {hasParticipants ? (
                            <div className="space-y-2 mb-3">
                              {participants.map((participation) => {
                                const reg = participation.registration;
                                const name = reg?.athlete
                                  ? reg.athlete.name
                                  : reg?.team?.name || "Sin nombre";

                                const institution =
                                  reg?.athlete?.institution ||
                                  reg?.team?.institution;
                                const logoUrl = institution?.logoUrl;

                                const isWinner =
                                  match.winnerRegistrationId ===
                                  participation.registrationId;

                                return (
                                  <div
                                    key={participation.participationId}
                                    className={`flex items-center justify-between p-2 rounded ${
                                      isWinner ? "bg-green-100" : "bg-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {logoUrl && (
                                        <img
                                          src={getImageUrl(logoUrl)}
                                          alt={institution?.name || ""}
                                          className="h-6 w-6 object-contain"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      )}

                                      <div>
                                        <p className="font-medium text-sm text-gray-900">
                                          {name}
                                        </p>
                                        {institution && (
                                          <p className="text-xs text-gray-600">
                                            {institution.name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        participation.corner === "blue" ||
                                        participation.corner === "A"
                                          ? "primary"
                                          : "default"
                                      }
                                      size="sm"
                                    >
                                      {participation.corner === "blue" &&
                                        "Azul"}
                                      {participation.corner === "white" &&
                                        "Blanco"}
                                      {participation.corner === "A" &&
                                        "Equipo A"}
                                      {participation.corner === "B" &&
                                        "Equipo B"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-gray-500 text-sm">
                              Sin participantes asignados
                            </div>
                          )}

                          <div className="flex gap-2">
                            {participants.length < 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setIsAssignModalOpen(true);
                                }}
                              >
                                Asignar Participantes
                              </Button>
                            )}

                            {participants.length === 2 && (
                              <>
                                {/* Poomsae, Kyorugui o Judo - Todos usan el mismo patrón */}
                                {getTaekwondoType() === "poomsae" ||
                                getTaekwondoType() === "kyorugui" ||
                                isJudoMatch ? (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMatchId(match.matchId);
                                      setSelectedMatch(match);
                                      setIsResultModalOpen(true);
                                    }}
                                  >
                                    {/* Detectar si ya tiene puntajes guardados */}
                                    {(match.participant1Score !== null &&
                                      match.participant1Score !== undefined) ||
                                    (match.participant2Score !== null &&
                                      match.participant2Score !== undefined) ||
                                    match.status === "finalizado"
                                      ? "Editar Puntaje"
                                      : "Registrar Puntaje"}
                                  </Button>
                                ) : isTableTennis() ? (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMatch(match);
                                      setIsResultModalOpen(true);
                                    }}
                                  >
                                    {match.status === "finalizado"
                                      ? "Ver/Editar Match"
                                      : "Gestionar Match"}
                                  </Button>
                                ) : (
                                  match.status !== "finalizado" && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMatch(match);
                                        setIsResultModalOpen(true);
                                      }}
                                    >
                                      Registrar Resultado
                                    </Button>
                                  )
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        title="Crear Nueva Fase"
      >
        <PhaseForm
          eventCategoryId={eventCategory.eventCategoryId}
          existingPhases={phases.length}
          onSubmit={handleCreatePhase}
          onCancel={() => setIsPhaseModalOpen(false)}
          isLoading={createPhaseMutation.isPending}
        />
      </Modal>

      {selectedPhase && (
        <>
          <Modal
            isOpen={isMatchModalOpen}
            onClose={() => setIsMatchModalOpen(false)}
            title="Crear Nuevo Partido"
          >
            <MatchForm
              phase={selectedPhase}
              onSubmit={handleCreateMatch}
              onCancel={() => setIsMatchModalOpen(false)}
              isLoading={createMatchMutation.isPending}
            />
          </Modal>

          {selectedPhase.type === "grupo" && (
            <GenerateRoundRobinModal
              isOpen={isGenerateModalOpen}
              onClose={() => setIsGenerateModalOpen(false)}
              phase={selectedPhase}
              registrations={eventCategory.registrations || []}
              onGenerate={handleGenerateRoundRobin}
              isLoading={initializeRoundRobinMutation.isPending}
            />
          )}

          {selectedPhase.type === "mejor_de_3" && (
            <GenerateBestOf3Modal
              isOpen={isGenerateBestOf3ModalOpen}
              onClose={() => setIsGenerateBestOf3ModalOpen(false)}
              phase={selectedPhase}
              registrations={eventCategory.registrations || []}
              onGenerate={handleGenerateBestOf3}
              isLoading={initializeBestOf3Mutation.isPending}
            />
          )}

          {selectedPhase.type === "eliminacion" && (
            <GenerateBracketModal
              isOpen={isGenerateBracketModalOpen}
              onClose={() => setIsGenerateBracketModalOpen(false)}
              phase={selectedPhase}
              availableRegistrations={
                eventCategory.registrations?.map((r) => r.registrationId) || []
              }
            />
          )}

          {selectedMatch && (
            <>
              <AssignParticipantsModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                  setIsAssignModalOpen(false);
                  setSelectedMatch(null);
                }}
                match={selectedMatch}
                registrations={eventCategory.registrations || []}
                onAssign={handleAssignParticipant}
                isLoading={createParticipationMutation.isPending}
              />

              {getTaekwondoType() === "poomsae" ? (
                <PoomsaeScoreModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch}
                  phase={selectedPhase}
                />
              ) : getTaekwondoType() === "kyorugui" ? (
                <KyoruguiScoreModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch}
                  phase={selectedPhase}
                />
              ) : isJudo() ? (
                <JudoScoreModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch}
                  phase={selectedPhase}
                />
              ) : isTableTennis() ? (
                <Modal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  title="Gestionar Match - Tenis de Mesa"
                  size="full"
                >
                  <TableTennisMatchWrapper
                    match={selectedMatch}
                    eventCategory={eventCategory}
                  />
                </Modal>
              ) : (
                <ResultModal
                  isOpen={isResultModalOpen}
                  onClose={() => {
                    setIsResultModalOpen(false);
                    setSelectedMatch(null);
                  }}
                  match={selectedMatch}
                  onSubmit={handleRegisterResult}
                  isLoading={
                    selectedPhase?.type === "eliminacion"
                      ? advanceWinnerMutation.isPending
                      : updateMatchMutation.isPending
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
