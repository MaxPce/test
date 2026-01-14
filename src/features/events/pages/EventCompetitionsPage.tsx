import { useParams } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

export function EventCompetitionsPage() {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Competencias</h2>
        <p className="text-gray-600 mt-1">
          Fixtures, llaves y enfrentamientos del evento
        </p>
      </div>

      {/* Placeholder */}
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              La sección de competencias estará disponible próximamente
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Aquí podrás gestionar fases, grupos, llaves eliminatorias y
              partidos
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
