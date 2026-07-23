// src/features/competitions/components/AssignParticipantsModal.tsx

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { UserCircle2, Loader2, Users } from "lucide-react";
import { usePhaseRegistrations } from "../api/phaseRegistrations.queries";
import type { Match } from "../types";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface TeamMember {
  athleteId: number;
  name: string;
  photo?: string | null;
}

interface PhaseRegistration {
  phaseRegistrationId: number;
  registrationId: number;
  registration: {
    registrationId: number;
    isTeam?: boolean;
    athlete?: {
      athleteId: number;
      name: string;
      institution?: { name: string };
      photo?: string | null;
    };
    team?: {
      teamId: number;
      name: string;
      institution?: { name: string };
    };
    members?: TeamMember[];
    teamMembers?: TeamMember[];
  };
}

interface AssignParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onAssign: (data: {
    matchId: number;
    registrationId: number;
    corner: string;
  }) => void;
  isLoading?: boolean;
}

// ── Helper: lista de integrantes de un registro ───────────────────────────────
function getMembersForReg(
  regs: PhaseRegistration[],
  regId: number
): TeamMember[] {
  const found = regs.find((pr) => pr.registrationId === regId);
  return (
    found?.registration?.members ??
    found?.registration?.teamMembers ??
    []
  );
}

// ── Sub-componente: lista de integrantes ─────────────────────────────────────
function MemberList({
  members,
  dotColor = "bg-gray-400",
}: {
  members: TeamMember[];
  dotColor?: string;
}) {
  if (members.length === 0) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      {members.map((m) => (
        <div key={m.athleteId} className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-xs text-gray-500">{m.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AssignParticipantsModal({
  isOpen,
  onClose,
  match,
  onAssign,
  isLoading,
}: AssignParticipantsModalProps) {
  const [participant1, setParticipant1] = useState<number>(0);
  const [participant2, setParticipant2] = useState<number>(0);

  const phaseId       = match.phase?.phaseId       ?? null;
  const parentPhaseId = match.phase?.parentPhaseId ?? null;

  // ── Registrations del grupo hijo ─────────────────────────────────────────
  const { data: phaseRegs = [], isLoading: isLoadingPhaseRegs } =
    usePhaseRegistrations(isOpen ? phaseId : null) as {
      data: PhaseRegistration[];
      isLoading: boolean;
    };

  // ── Fallback: registrations del padre ────────────────────────────────────
  const { data: parentRegs = [], isLoading: isLoadingParentRegs } =
    usePhaseRegistrations(
      isOpen && !isLoadingPhaseRegs && phaseRegs.length === 0
        ? parentPhaseId
        : null
    ) as { data: PhaseRegistration[]; isLoading: boolean };

  const effectiveRegs = phaseRegs.length > 0 ? phaseRegs : parentRegs;
  const isLoadingAny  = isLoadingPhaseRegs || isLoadingParentRegs;

  // ── Excluir los que ya están participando en este match ───────────────────
  const assignedIds   = match.participations?.map((p) => p.registrationId) ?? [];
  const availableRegs = effectiveRegs.filter(
    (pr) => !assignedIds.includes(pr.registrationId)
  );

  // ── Opciones del Select (label limpio, los members se muestran aparte) ───
  const buildOptions = (excludeId?: number) => [
    { value: 0, label: "Seleccione un participante" },
    ...availableRegs
      .filter((pr) => pr.registrationId !== excludeId)
      .map((pr) => {
        const reg = pr.registration;
        const members =
          reg?.members ?? reg?.teamMembers ?? [];
        const membersSuffix =
          members.length > 0 ? ` · ${members.length} integrantes` : "";
        const name = reg?.athlete
          ? `${reg.athlete.name} (${reg.athlete.institution?.name ?? ""})`
          : reg?.team
            ? `${reg.team.name}${membersSuffix} (${reg.team.institution?.name ?? ""})`
            : "Sin nombre";
        return { value: pr.registrationId, label: name };
      }),
  ];

  // ── Assign handler ────────────────────────────────────────────────────────
  const handleAssign = async () => {
    const isGroupPhase = match.phase?.type === "grupo";

    if (participant1 > 0) {
      await onAssign({
        matchId: match.matchId,
        registrationId: participant1,
        corner: isGroupPhase ? "A" : "blue",
      });
    }
    if (participant2 > 0) {
      await onAssign({
        matchId: match.matchId,
        registrationId: participant2,
        corner: isGroupPhase ? "B" : "white",
      });
    }
    setParticipant1(0);
    setParticipant2(0);
    onClose();
  };

  const currentParticipants = match.participations ?? [];

  const getCornerLabel = (corner?: string) => {
    if (corner === "blue")  return "Azul";
    if (corner === "white") return "Blanco";
    if (corner === "A")     return "Equipo A";
    if (corner === "B")     return "Equipo B";
    return corner ?? "Sin asignar";
  };

  const getCornerBadgeVariant = (corner?: string) => {
    if (corner === "blue") return "primary";
    return "default";
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Participantes" size="lg">
      <div className="space-y-6">

        {/* Cargando */}
        {isLoadingAny && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Cargando participantes de la fase...</span>
          </div>
        )}

        {/* Info: cuántos disponibles */}
        {!isLoadingAny && effectiveRegs.length > 0 && (
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            Mostrando{" "}
            <span className="font-semibold">{availableRegs.length}</span>{" "}
            de{" "}
            <span className="font-semibold">{effectiveRegs.length}</span>{" "}
            participantes asignados a esta fase.
          </p>
        )}

        {/* Sin participantes en ninguna fase */}
        {!isLoadingAny && effectiveRegs.length === 0 && (
          <div className="text-center py-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3">
            Esta fase no tiene participantes asignados aún.
          </div>
        )}

        {/* ── Participantes ya asignados al match ── */}
        {currentParticipants.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Participantes Asignados
            </h4>
            <div className="space-y-2">
              {currentParticipants.map((participation) => {
                const reg = participation.registration;
                const name =
                  reg?.athlete?.name ?? reg?.team?.name ?? "Sin nombre";
                const institution =
                  reg?.athlete?.institution?.name ??
                  reg?.team?.institution?.name ??
                  "";
                const members =
                  (reg as PhaseRegistration["registration"])?.members ??
                  (reg as PhaseRegistration["registration"])?.teamMembers ??
                  [];

                return (
                  <div
                    key={participation.participationId}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícono: equipo vs atleta individual */}
                      {members.length > 0 ? (
                        <Users className="h-8 w-8 text-gray-400 mt-0.5 shrink-0" />
                      ) : (
                        <UserCircle2 className="h-8 w-8 text-gray-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        {institution && (
                          <p className="text-sm text-gray-600">{institution}</p>
                        )}
                        {/* Integrantes del equipo */}
                        <MemberList members={members} dotColor="bg-gray-400" />
                      </div>
                    </div>
                    <Badge variant={getCornerBadgeVariant(participation.corner)}>
                      {getCornerLabel(participation.corner)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Selects para agregar participantes ── */}
        {!isLoadingAny &&
          availableRegs.length > 0 &&
          currentParticipants.length < 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Agregar Participantes</h4>

              {currentParticipants.length === 0 && (
                <>
                  {/* Participante 1 */}
                  <div className="space-y-1">
                    <Select
                      label={
                        match.phase?.type === "grupo"
                          ? "Participante 1 (A)"
                          : "Participante 1 (Azul)"
                      }
                      value={participant1}
                      onChange={(e) => setParticipant1(Number(e.target.value))}
                      options={buildOptions(participant2)}
                    />
                    {/* Preview integrantes P1 */}
                    {participant1 > 0 &&
                      getMembersForReg(availableRegs, participant1).length > 0 && (
                        <div className="pl-1 pb-1">
                          <MemberList
                            members={getMembersForReg(availableRegs, participant1)}
                            dotColor="bg-blue-400"
                          />
                        </div>
                      )}
                  </div>

                  {/* Participante 2 */}
                  <div className="space-y-1">
                    <Select
                      label={
                        match.phase?.type === "grupo"
                          ? "Participante 2 (B) — opcional"
                          : "Participante 2 (Blanco) — opcional"
                      }
                      value={participant2}
                      onChange={(e) => setParticipant2(Number(e.target.value))}
                      options={buildOptions(participant1)}
                    />
                    {/* Preview integrantes P2 */}
                    {participant2 > 0 &&
                      getMembersForReg(availableRegs, participant2).length > 0 && (
                        <div className="pl-1 pb-1">
                          <MemberList
                            members={getMembersForReg(availableRegs, participant2)}
                            dotColor="bg-gray-400"
                          />
                        </div>
                      )}
                  </div>
                </>
              )}

              {currentParticipants.length === 1 && (
                <div className="space-y-1">
                  <Select
                    label={`Participante 2 (${getCornerLabel(
                      currentParticipants[0].corner === "blue" ? "white" : "blue"
                    )})`}
                    value={participant1}
                    onChange={(e) => setParticipant1(Number(e.target.value))}
                    options={buildOptions()}
                  />
                  {/* Preview integrantes cuando solo falta 1 */}
                  {participant1 > 0 &&
                    getMembersForReg(availableRegs, participant1).length > 0 && (
                      <div className="pl-1 pb-1">
                        <MemberList
                          members={getMembersForReg(availableRegs, participant1)}
                          dotColor="bg-gray-400"
                        />
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

        {/* Sin disponibles */}
        {!isLoadingAny &&
          availableRegs.length === 0 &&
          effectiveRegs.length > 0 &&
          currentParticipants.length < 2 && (
            <div className="text-center py-6 text-gray-500">
              <p>No hay más participantes disponibles</p>
            </div>
          )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {!isLoadingAny &&
            availableRegs.length > 0 &&
            currentParticipants.length < 2 && (
              <Button
                onClick={handleAssign}
                isLoading={isLoading}
                disabled={participant1 === 0}
              >
                Asignar
              </Button>
            )}
        </div>

      </div>
    </Modal>
  );
}