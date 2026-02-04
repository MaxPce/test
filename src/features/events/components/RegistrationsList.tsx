import { useState } from "react";
import { Trash2, Check, X, Edit2 } from "lucide-react";
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
import type { Registration } from "../types";

interface RegistrationsListProps {
  registrations: Registration[];
  onDelete: (registrationId: number) => void;
  isDeleting?: boolean;
}

export function RegistrationsList({
  registrations,
  onDelete,
  isDeleting,
}: RegistrationsListProps) {
  const [editingSeedId, setEditingSeedId] = useState<number | null>(null);
  const [seedValue, setSeedValue] = useState<string>("");
  
  const updateSeedMutation = useUpdateRegistrationSeed();

  const handleEditSeed = (registration: Registration) => {
    setEditingSeedId(registration.registrationId);
    setSeedValue(registration.seedNumber?.toString() || "");
  };

  const handleSaveSeed = (registrationId: number) => {
    const seedNumber = seedValue.trim() === "" ? null : parseInt(seedValue);
    
    if (seedNumber !== null && (isNaN(seedNumber) || seedNumber < 1)) {
      return;
    }

    updateSeedMutation.mutate(
      { registrationId, seedNumber },
      {
        onSuccess: () => {
          setEditingSeedId(null);
          setSeedValue("");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingSeedId(null);
    setSeedValue("");
  };

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay participantes inscritos en esta categoría
      </div>
    );
  }

  return (
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

          return (
            <TableRow key={registration.registrationId}>
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
                            if (
                              parent &&
                              !parent.querySelector(".fallback-avatar")
                            ) {
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "fallback-avatar h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold";
                              placeholder.textContent =
                                registration.athlete.name.charAt(0);
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {registration.athlete.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">
                        {registration.athlete.name}
                      </span>
                    </>
                  ) : registration.team ? (
                    <>
                      {teamLogoUrl ? (
                        <img
                          src={teamLogoUrl}
                          alt={
                            registration.team.institution?.name ||
                            registration.team.name
                          }
                          className="h-8 w-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".fallback-logo")
                            ) {
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "fallback-logo h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold";
                              placeholder.textContent =
                                registration.team.name.charAt(0);
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {registration.team.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">
                        {registration.team.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="primary">
                  {registration.athlete?.institution?.name ||
                    registration.team?.institution?.name ||
                    "N/A"}
                </Badge>
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
                          if (e.key === "Enter") {
                            handleSaveSeed(registration.registrationId);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(registration.registrationId)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
