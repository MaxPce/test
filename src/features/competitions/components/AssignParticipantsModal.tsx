import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { UserCircle2, Loader2 } from "lucide-react";
import type { Match } from "../types";
import { apiClient } from "@/lib/api/client";

interface AssignParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  registrations: any[];
  onAssign: (data: {
    matchId: number;
    registrationId: number;
    corner: string;
  }) => void;
  isLoading?: boolean;
}

export function AssignParticipantsModal({
  isOpen,
  onClose,
  match,
  registrations,
  onAssign,
  isLoading,
}: AssignParticipantsModalProps) {
  const [participant1, setParticipant1] = useState<number>(0);
  const [participant2, setParticipant2] = useState<number>(0);

  const phaseId = match.phase?.phaseId;

  // ── Fetch de registrations asignados a esta fase ─────────────────────
  const {
    data: phaseRegistrations,
    isLoading: isLoadingPhaseRegs,
  } = useQuery<{ registrationId: number; registration: any }[]>({
    queryKey: ["phase-registrations", phaseId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/competitions/phases/${phaseId}/registrations`
      );
      return data;
    },
    enabled: isOpen && Boolean(phaseId),
    staleTime: 1000 * 30,
  });

  // ── Filtrado robusto ──────────────────────────────────────────────────
  // - Si está cargando → lista vacía (no mostrar datos incorrectos)
  // - Si la fase tiene registrations → filtrar
  // - Si la fase no tiene ninguno asignado ([] vacío) → mostrar todos
  // - Si no hay phaseId → mostrar todos (fase sin restricción)
  const filteredRegistrations = (() => {
    if (!phaseId) return registrations;
    if (isLoadingPhaseRegs) return [];
    if (phaseRegistrations && phaseRegistrations.length > 0) {
      return registrations.filter((r) =>
        phaseRegistrations.some((pr) => pr.registrationId === r.registrationId)
      );
    }
    return registrations; // fase sin restricción de participantes
  })();

  const assignedIds =
    match.participations?.map((p) => p.registrationId) || [];
  const availableRegistrations = filteredRegistrations.filter(
    (r) => !assignedIds.includes(r.registrationId)
  );

  const registrationOptions = [
    { value: 0, label: "Seleccione un participante" },
    ...availableRegistrations.map((reg) => {
      const name = reg.athlete
        ? `${reg.athlete.name} (${reg.athlete.institution?.name})`
        : reg.team
          ? `${reg.team.name} (${reg.team.institution?.name})`
          : "Sin nombre";
      return { value: reg.registrationId, label: name };
    }),
  ];

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

  const currentParticipants = match.participations || [];

  const getCornerLabel = (corner?: string) => {
    if (corner === "blue") return "Azul";
    if (corner === "white") return "Blanco";
    if (corner === "A") return "Equipo A";
    if (corner === "B") return "Equipo B";
    return corner || "Sin asignar";
  };

  const getCornerBadgeVariant = (corner?: string) => {
    if (corner === "blue") return "primary";
    if (corner === "white") return "default";
    return "default";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Participantes" size="lg">
      <div className="space-y-6">

        {/* Estado de carga del filtro de fase */}
        {isLoadingPhaseRegs && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Cargando participantes de la fase...</span>
          </div>
        )}

        {/* Info: filtrado activo por fase */}
        {!isLoadingPhaseRegs && phaseRegistrations && phaseRegistrations.length > 0 && (
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            Mostrando{" "}
            <span className="font-semibold">{availableRegistrations.length}</span>{" "}
            de{" "}
            <span className="font-semibold">{phaseRegistrations.length}</span>{" "}
            participantes asignados a esta fase.
          </p>
        )}

        {/* Participantes actuales */}
        {currentParticipants.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Participantes Asignados
            </h4>
            <div className="space-y-2">
              {currentParticipants.map((participation) => {
                const reg = participation.registration;
                const name = reg?.athlete
                  ? reg.athlete.name
                  : reg?.team?.name || "Sin nombre";
                const institution =
                  reg?.athlete?.institution?.name ||
                  reg?.team?.institution?.name ||
                  "";

                return (
                  <div
                    key={participation.participationId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        {institution && (
                          <p className="text-sm text-gray-600">{institution}</p>
                        )}
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

        {/* Agregar nuevos participantes */}
        {!isLoadingPhaseRegs &&
          availableRegistrations.length > 0 &&
          currentParticipants.length < 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Agregar Participantes</h4>

              {currentParticipants.length === 0 && (
                <>
                  <Select
                    label={
                      match.phase?.type === "grupo"
                        ? "Participante 1 (A)"
                        : "Participante 1 (Azul)"
                    }
                    value={participant1}
                    onChange={(e) => setParticipant1(Number(e.target.value))}
                    options={registrationOptions}
                  />
                  <Select
                    label={
                      match.phase?.type === "grupo"
                        ? "Participante 2 (B) — opcional"
                        : "Participante 2 (Blanco) — opcional"
                    }
                    value={participant2}
                    onChange={(e) => setParticipant2(Number(e.target.value))}
                    options={registrationOptions.filter(
                      (opt) => opt.value !== participant1
                    )}
                  />
                </>
              )}

              {currentParticipants.length === 1 && (
                <Select
                  label={`Participante 2 (${getCornerLabel(
                    currentParticipants[0].corner === "blue" ? "white" : "blue"
                  )})`}
                  value={participant1}
                  onChange={(e) => setParticipant1(Number(e.target.value))}
                  options={registrationOptions}
                />
              )}
            </div>
          )}

        {!isLoadingPhaseRegs &&
          availableRegistrations.length === 0 &&
          currentParticipants.length < 2 && (
            <div className="text-center py-6 text-gray-500">
              <p>No hay más participantes disponibles</p>
            </div>
          )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {!isLoadingPhaseRegs &&
            availableRegistrations.length > 0 &&
            currentParticipants.length < 2 && (
              <Button
                onClick={handleAssign}
                isLoading={isLoading}
                disabled={
                  currentParticipants.length === 0
                    ? participant1 === 0
                    : participant1 === 0
                }
              >
                Asignar
              </Button>
            )}
        </div>
      </div>
    </Modal>
  );
}