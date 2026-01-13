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
        {registrations.map((registration) => (
          <TableRow key={registration.registrationId}>
            <TableCell>
              <div className="flex items-center gap-3">
                {registration.athlete ? (
                  <>
                    {registration.athlete.photoUrl ? (
                      <img
                        src={registration.athlete.photoUrl}
                        alt={registration.athlete.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                        {registration.athlete.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">
                      {registration.athlete.name}
                    </span>
                  </>
                ) : registration.team ? (
                  <>
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {registration.team.name.charAt(0)}
                    </div>
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
        ))}
      </TableBody>
    </Table>
  );
}
