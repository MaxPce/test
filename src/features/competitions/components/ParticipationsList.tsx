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
import type { Participation } from "../types";

interface ParticipationsListProps {
  participations: Participation[];
  onDelete: (participationId: number) => void;
  isDeleting?: boolean;
}

export function ParticipationsList({
  participations,
  onDelete,
  isDeleting,
}: ParticipationsListProps) {
  if (participations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay participantes en esta fase
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Participante</TableHead>
          <TableHead>Institución</TableHead>
          <TableHead className="text-center">V/D</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participations.map((participation) => (
          <TableRow key={participation.participationId}>
            <TableCell>
              <div className="flex items-center gap-3">
                {participation.athlete ? (
                  <>
                    {participation.athlete.photoUrl ? (
                      <img
                        src={participation.athlete.photoUrl}
                        alt={participation.athlete.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                        {participation.athlete.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">
                      {participation.athlete.name}
                    </span>
                  </>
                ) : participation.team ? (
                  <>
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {participation.team.name.charAt(0)}
                    </div>
                    <span className="font-medium">
                      {participation.team.name}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="primary">
                {participation.athlete?.institution?.name ||
                  participation.team?.institution?.name ||
                  "N/A"}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-green-600 font-medium">
                {participation.wins}
              </span>
              {" / "}
              <span className="text-red-600 font-medium">
                {participation.losses}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(participation.participationId)}
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
