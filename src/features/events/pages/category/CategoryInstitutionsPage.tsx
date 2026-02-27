import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { EventCategory } from "../../types";

interface TeamEntry {
  teamId: number;
  teamName: string;
  institutionName: string;
  members: { athleteId: number; name: string; rol?: string }[];
}

export function CategoryInstitutionsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();

  // IDs de equipos expandidos
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());

  const toggleTeam = (teamId: number) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      next.has(teamId) ? next.delete(teamId) : next.add(teamId);
      return next;
    });
  };

  // ─── Construir lista de equipos desde registrations ───────────────────
  const teamsMap = new Map<number, TeamEntry>();

  eventCategory.registrations?.forEach((registration) => {
    const team = registration.team;
    if (!team) return;

    if (!teamsMap.has(team.teamId)) {
      teamsMap.set(team.teamId, {
        teamId: team.teamId,
        teamName: team.name,
        institutionName: team.institution?.name ?? "Sin institución",
        members: [],
      });
    }

    // Agregar integrantes del equipo
    team.members?.forEach((member) => {
      const entry = teamsMap.get(team.teamId)!;
      const alreadyAdded = entry.members.some(
        (m) => m.athleteId === member.athleteId,
      );
      if (!alreadyAdded && member.athlete) {
        entry.members.push({
          athleteId: member.athleteId,
          name: `${member.athlete.firstName ?? ""} ${member.athlete.lastName ?? ""}`.trim(),
          rol: member.rol,
        });
      }
    });
  });

  const teams = Array.from(teamsMap.values());

  // ─── Estado vacío ──────────────────────────────────────────────────────
  if (teams.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay equipos inscritos en esta categoría
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Equipos Participantes
        </h3>
        <Badge variant="primary">
          {teams.length} equipo{teams.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const isExpanded = expandedTeams.has(team.teamId);

          return (
            <Card
              key={team.teamId}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* ── Cabecera del equipo (clickeable) ── */}
              <CardBody>
                <button
                  onClick={() => toggleTeam(team.teamId)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {team.teamName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {team.teamName}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{team.institutionName}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {team.members.length} integrante
                        {team.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Chevron */}
                    <div className="text-gray-400 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* ── Lista de integrantes (colapsable) ── */}
                {isExpanded && team.members.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.athleteId}
                        className="flex items-center gap-2"
                      >
                        {/* Mini avatar */}
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-800 font-medium truncate block">
                            {member.name || "Atleta sin nombre"}
                          </span>
                        </div>
                        {member.rol && (
                          <Badge variant="default" className="text-xs">
                            {member.rol}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && team.members.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-400">
                    Sin integrantes registrados
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
