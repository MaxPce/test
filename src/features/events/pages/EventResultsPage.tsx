import { useParams } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

export function EventResultsPage() {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resultados</h2>
        <p className="text-gray-600 mt-1">
          Marcadores, tablas de posiciones y estadísticas
        </p>
      </div>

      {/* Placeholder */}
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              La sección de resultados estará disponible próximamente
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Aquí podrás ver y registrar resultados, medalleros y estadísticas
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
