import { useState } from "react";
import { Trash2, Check, X, Edit2, ChevronDown, ChevronUp, Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { useUpdateRegistrationSeed } from "../api/registrations.mutations";
import { TeamEditModal } from "./TeamEditModal";
import type { Team } from "@/features/institutions/types";
import type { Registration } from "../types";
import type { EventCategory } from "../types";


import React from "react";

interface RegistrationsListProps {
  registrations: Registration[];
  onDelete: (registrationId: number) => void;
  isDeleting?: boolean;
  eventId?: number;
  eventCategory?: EventCategory;
}

export function RegistrationsList({
  registrations,
  onDelete,
  isDeleting,
  eventId,
  eventCategory,
}: RegistrationsListProps) {
  const [editingSeedId, setEditingSeedId] = useState<number | null>(null);
  const [seedValue, setSeedValue] = useState<string>("");
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const updateSeedMutation = useUpdateRegistrationSeed();

  const handleEditSeed = (registration: Registration) => {
    setEditingSeedId(registration.registrationId);
    setSeedValue(registration.seedNumber?.toString() || "");
  };

  const handleSaveSeed = (registrationId: number) => {
    const seedNumber = seedValue.trim() === "" ? null : parseInt(seedValue);
    if (seedNumber !== null && (isNaN(seedNumber) || seedNumber < 1)) return;
    updateSeedMutation.mutate(
      { registrationId, seedNumber },
      {
        onSuccess: () => {
          setEditingSeedId(null);
          setSeedValue("");
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditingSeedId(null);
    setSeedValue("");
  };

  const toggleTeamExpand = (registrationId: number) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(registrationId)) {
        next.delete(registrationId);
      } else {
        next.add(registrationId);
      }
      return next;
    });
  };

  const getInstitutionName = (registration: Registration): string => {
    if (registration.athlete) return registration.athlete.institution?.name || "Sin institución";
    if (registration.team) return registration.team.institution?.name || "Sin institución";
    return "N/A";
  };

  const getInstitutionLogo = (registration: Registration): string | null => {
    if (registration.athlete?.institution?.logoUrl)
      return getImageUrl(registration.athlete.institution.logoUrl);
    if (registration.team?.institution?.logoUrl)
      return getImageUrl(registration.team.institution.logoUrl);
    return null;
  };

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay participantes inscritos en esta categoría
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Participante</TableHead>
            <TableHead className="text-center">Institución</TableHead>
            <TableHead className="text-center">Seed</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => {
            const athletePhotoUrl = registration.athlete?.photoUrl
              ? getImageUrl(registration.athlete.photoUrl)
              : null;

            const teamLogoUrl = registration.team?.institution?.logoUrl
              ? getImageUrl(registration.team.institution.logoUrl)
              : null;

            const isEditing = editingSeedId === registration.registrationId;
            const institutionName = getInstitutionName(registration);
            const institutionLogo = getInstitutionLogo(registration);
            const isTeam = !!registration.team;
            const isExpanded = expandedTeams.has(registration.registrationId);
            const members = registration.team?.members || [];

            return (
              <React.Fragment key={registration.registrationId}>
                <TableRow className={isExpanded ? "bg-blue-50/40" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {registration.athlete ? (
                        <>
                          {athletePhotoUrl ? (
                            <img
                              src={athletePhotoUrl}
                              alt={registration.athlete.name}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector(".fallback-avatar")) {
                                  const placeholder = document.createElement("div");
                                  placeholder.className =
                                    "fallback-avatar h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold";
                                  placeholder.textContent = registration.athlete.name.charAt(0);
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {registration.athlete.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{registration.athlete.name.toUpperCase()}</span>
                        </>
                      ) : registration.team ? (
                        <>
                          {teamLogoUrl ? (
                            <img
                              src={teamLogoUrl}
                              alt={registration.team.institution?.name || registration.team.name}
                              className="h-8 w-8 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector(".fallback-logo")) {
                                  const placeholder = document.createElement("div");
                                  placeholder.className =
                                    "fallback-logo h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold";
                                  placeholder.textContent = registration.team.name.charAt(0);
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {registration.team.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{registration.team.name}</span>
                            {members.length > 0 && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {members.length} integrante{members.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {institutionLogo && (
                        <img
                          src={institutionLogo}
                          alt={institutionName}
                          className="h-6 w-6 rounded object-contain"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                      <Badge variant="primary">{institutionName}</Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            min="1"
                            value={seedValue}
                            onChange={(e) => setSeedValue(e.target.value)}
                            placeholder="Seed"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveSeed(registration.registrationId);
                              else if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <button
                            onClick={() => handleSaveSeed(registration.registrationId)}
                            disabled={updateSeedMutation.isPending}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={updateSeedMutation.isPending}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {registration.seedNumber ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-sm font-bold">
                                {registration.seedNumber}
                              </div>
                              <button
                                onClick={() => handleEditSeed(registration)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditSeed(registration)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Asignar seed
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isTeam && (
                        <button
                          onClick={() => setEditingTeam(registration.team!)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar equipo"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {isTeam && members.length > 0 && (
                        <button
                          onClick={() => toggleTeamExpand(registration.registrationId)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title={isExpanded ? "Ocultar integrantes" : "Ver integrantes"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(registration.registrationId)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {isTeam && isExpanded && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0 bg-gray-50 border-b">
                      <div className="px-6 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Integrantes del equipo
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {members.map((member) => {
                            const memberPhoto = member.athlete?.photoUrl
                              ? getImageUrl(member.athlete.photoUrl)
                              : null;
                            return (
                              <div
                                key={member.athleteId}
                                className="flex items-center gap-2.5 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm"
                              >
                                {memberPhoto ? (
                                  <img
                                    src={memberPhoto}
                                    alt={member.athlete?.name || ""}
                                    className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                    {member.athlete?.name?.charAt(0) ?? "?"}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {member.athlete?.name?.toUpperCase() ?? `Atleta #${member.athleteId}`}
                                  </p>
                                  <p className="text-xs text-gray-400 capitalize">{member.rol || "titular"}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {editingTeam && (
        <TeamEditModal
          isOpen={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          team={editingTeam}
          eventId={eventId ?? 0}
          eventCategory={eventCategory!} 
        />
        )}
    </>
  );
}