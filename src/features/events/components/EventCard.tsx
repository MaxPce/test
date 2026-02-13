import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  ArrowRight,
  Trophy,
} from "lucide-react";
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
        gradient: "from-blue-500 to-blue-600",
      },
      en_curso: {
        variant: "success" as const,
        label: "En Curso",
        dot: true,
        gradient: "from-emerald-500 to-emerald-600",
      },
      finalizado: {
        variant: "default" as const,
        label: "Finalizado",
        dot: false,
        gradient: "from-slate-400 to-slate-500",
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
  const logoUrl = getImageUrl(event.logoUrl);

  return (
    <Card
      variant="elevated"
      hover
      padding="none"
      className="group overflow-hidden"
    >
      {/* Header con imagen */}
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        {logoUrl ? (
          <>
            <img
              src={logoUrl}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Overlay oscuro sutil solo en la parte inferior para el texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-slate-300/50 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-slate-400" />
            </div>
          </div>
        )}

        {/* Badge de estado flotante */}
        <div className="absolute top-4 right-4">
          <Badge variant={statusConfig.variant} dot={statusConfig.dot}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Badge de Sismaster */}
        <div className="absolute top-4 left-4">
          <Badge variant="default" className="bg-purple-600 text-white">
            Sismaster
          </Badge>
        </div>

        {/* Nombre del evento sobre la imagen */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2 leading-tight">
            {event.name}
          </h3>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Info con iconos mejorados */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium mb-0.5">
                Fechas
              </p>
              <p className="text-sm text-slate-900 font-semibold truncate">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium mb-0.5">
                Ubicación
              </p>
              <p className="text-sm text-slate-900 font-semibold truncate">
                {event.location}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5" />

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            size="md"
            variant="gradient"
            onClick={() => navigate(`/admin/sismaster-events/${event.eventId}/sports`)}
            className="flex-1 group/btn"
          >
            <Trophy className="h-4 w-4" />
            <span>Gestionar Deportes</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className={`h-1 bg-gradient-to-r ${statusConfig.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </Card>
  );
}
