import { useMemo } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import type { Participation } from "../types";

interface StandingsTableProps {
  participations: Participation[];
}

export function StandingsTable({ participations }: StandingsTableProps) {
  const standings = useMemo(() => {
    return participations
      .map((participation) => ({
        participation,
        played: participation.wins + participation.losses,
        goalDifference: participation.goalsFor - participation.goalsAgainst,
      }))
      .sort((a, b) => {
        // Ordenar por puntos (descendente)
        if (b.participation.points !== a.participation.points) {
          return b.participation.points - a.participation.points;
        }
        // Si tienen los mismos puntos, ordenar por diferencia de goles
        if (b.goalDifference !== a.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }
        // Si tienen la misma diferencia, ordenar por goles a favor
        return b.participation.goalsFor - a.participation.goalsFor;
      })
      .map((item, index) => ({
        position: index + 1,
        ...item,
      }));
  }, [participations]);

  if (participations.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            No hay participantes en esta fase
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Participante</TableHead>
              <TableHead className="text-center">PJ</TableHead>
              <TableHead className="text-center">G</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GC</TableHead>
              <TableHead className="text-center">DG</TableHead>
              <TableHead className="text-center font-semibold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((row) => (
              <TableRow key={row.participation.participationId}>
                <TableCell className="font-semibold">{row.position}</TableCell>
                <TableCell className="font-medium">
                  {row.participation.athlete?.name ||
                    row.participation.team?.name ||
                    "N/A"}
                </TableCell>
                <TableCell className="text-center">{row.played}</TableCell>
                <TableCell className="text-center text-green-600 font-medium">
                  {row.participation.wins}
                </TableCell>
                <TableCell className="text-center text-red-600 font-medium">
                  {row.participation.losses}
                </TableCell>
                <TableCell className="text-center">
                  {row.participation.goalsFor}
                </TableCell>
                <TableCell className="text-center">
                  {row.participation.goalsAgainst}
                </TableCell>
                <TableCell
                  className={`text-center font-medium ${
                    row.goalDifference > 0
                      ? "text-green-600"
                      : row.goalDifference < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </TableCell>
                <TableCell className="text-center font-bold text-blue-600">
                  {row.participation.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
