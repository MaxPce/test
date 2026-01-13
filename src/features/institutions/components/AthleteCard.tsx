import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit2, Trash2 } from "lucide-react";
import type { Athlete } from "../types";

interface AthleteCardProps {
  athlete: Athlete;
  onEdit: (athlete: Athlete) => void;
  onDelete: (athlete: Athlete) => void;
}

export function AthleteCard({ athlete, onEdit, onDelete }: AthleteCardProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <Card hover>
      <CardBody>
        <div className="flex items-start gap-4">
          {athlete.photoUrl ? (
            <img
              src={athlete.photoUrl}
              alt={athlete.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-2xl font-bold">
              {athlete.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {athlete.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {athlete.institution?.name}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">
                {athlete.gender === "M" ? "Masculino" : "Femenino"}
              </Badge>
              <Badge variant="default">
                {calculateAge(athlete.dateBirth)} años
              </Badge>
              <Badge variant="default">{athlete.nationality}</Badge>
              {athlete.docNumber && (
                <Badge variant="default">Doc: {athlete.docNumber}</Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(athlete)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(athlete)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
