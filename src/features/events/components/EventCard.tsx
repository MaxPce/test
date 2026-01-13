import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Edit2, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../types";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "primary" | "default"> = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
    };
    return variants[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      programado: "Programado",
      en_curso: "En Curso",
      finalizado: "Finalizado",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card hover>
      <CardBody>
        <div className="flex gap-4">
          {event.logoUrl ? (
            <img
              src={event.logoUrl}
              alt={event.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              {event.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {event.name}
              </h3>
              <Badge variant={getStatusBadgeVariant(event.status)}>
                {getStatusLabel(event.status)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => navigate(`/admin/events/${event.eventId}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Detalles
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEdit(event)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(event)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
