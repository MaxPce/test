import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Edit2, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../types";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const navigate = useNavigate();

  const getStatusConfig = (status: string) => {
    const configs = {
      programado: {
        variant: "primary" as const,
        label: "Programado",
        dot: true,
      },
      en_curso: { variant: "success" as const, label: "En Curso", dot: true },
      finalizado: {
        variant: "default" as const,
        label: "Finalizado",
        dot: false,
      },
    };
    return configs[status as keyof typeof configs] || configs.programado;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = getStatusConfig(event.status);

  // ✅ AGREGAR: Obtener URL completa de la imagen
  const logoUrl = getImageUrl(event.logoUrl);

  return (
    <Card hover className="group overflow-hidden">
      <CardBody className="p-0">
        {/* Header con imagen/logo */}
        <div className="relative h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
          {logoUrl ? ( // ✅ CAMBIAR: usar logoUrl en lugar de event.logoUrl
            <>
              <img
                src={logoUrl} // ✅ CAMBIAR: usar la URL completa
                alt={event.name}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
                onError={(e) => {
                  // ✅ AGREGAR: Manejo de error
                  // Si la imagen falla al cargar, ocultar el elemento
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20 text-6xl font-bold">
                {event.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Badge de estado flotante */}
          <div className="absolute top-3 right-3">
            <Badge
              variant={statusConfig.variant}
              dot={statusConfig.dot}
              size="sm"
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5">
          {/* Título */}
          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.name}
          </h3>

          {/* Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate(`/admin/events/${event.eventId}`)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Ver Detalles
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(event)}
              className="px-3"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(event)}
              className="px-3 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
