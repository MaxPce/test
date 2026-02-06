import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  ArrowRight,
  Users,
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
      {/* Header con imagen y gradiente */}
      <div className="relative h-40 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 overflow-hidden">
        {logoUrl ? (
          <>
            <img
              src={logoUrl}
              alt={event.name}
              className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white/60" />
            </div>
          </div>
        )}

        {/* Badge de estado flotante mejorado */}
        <div className="absolute top-4 right-4">
          <Badge variant={statusConfig.variant} dot={statusConfig.dot}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Overlay gradient al hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título mejorado */}
        <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {event.name}
        </h3>

        {/* Info con iconos mejorados */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
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
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
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

        {/* Acciones mejoradas */}
        <div className="flex gap-2">
          <Button
            size="md"
            variant="gradient"
            onClick={() => navigate(`/admin/events/${event.eventId}`)}
            className="flex-1 group/btn"
          >
            <span>Ver Detalles</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="md"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="px-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="md"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event);
            }}
            className="px-3 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
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
