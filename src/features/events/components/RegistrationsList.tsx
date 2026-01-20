import { Trash2 } from "lucide-react";
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
          <TableHead>Participante</TableHead>
          <TableHead>Institución</TableHead>
          <TableHead>Seed</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {registrations.map((registration) => {
          // Procesar photoUrl del atleta
          const athletePhotoUrl = registration.athlete?.photoUrl
            ? getImageUrl(registration.athlete.photoUrl)
            : null;

          // ✅ AGREGAR: Procesar logoUrl de la institución del equipo
          const teamLogoUrl = registration.team?.institution?.logoUrl
            ? getImageUrl(registration.team.institution.logoUrl)
            : null;

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
                      {/* ✅ MODIFICAR: Mostrar logo de la institución o fallback */}
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
                {registration.seedNumber ? (
                  <Badge variant="success">#{registration.seedNumber}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
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
