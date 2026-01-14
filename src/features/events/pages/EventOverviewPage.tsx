import { useParams } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useEvent } from "../api/events.queries";

export function EventOverviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(Number(eventId));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No se pudo cargar la información del evento
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDuration = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} día${days !== 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Información General */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            Información General
          </h2>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Fecha de Inicio
                </dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {formatDate(event.startDate)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Fecha de Finalización
                </dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {formatDate(event.endDate)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Duración</dt>
                <dd className="mt-1 text-sm text-gray-900">{getDuration()}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event.location || "No especificada"}
                </dd>
              </div>
            </div>
          </dl>
        </CardBody>
      </Card>

      {/* Estadísticas del Evento */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Estadísticas</h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <p>Las estadísticas del evento se mostrarán aquí</p>
            <p className="text-sm mt-2">
              (Categorías, participantes, competencias, etc.)
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
