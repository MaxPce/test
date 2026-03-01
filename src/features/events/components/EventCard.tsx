import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../types";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  companyLogoUrl?: string;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  companyLogoUrl,
}: EventCardProps) {
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
  const fallbackUrl = getImageUrl(companyLogoUrl);

  // Imagen que se usará como fondo difuminado (evento o compañía)
  const blurBgUrl = logoUrl || fallbackUrl;

  return (
    <Card
      variant="elevated"
      hover
      padding="none"
      className="group overflow-hidden flex flex-col"
    >
      {/* ── Banner ── */}
      <div className="relative h-44 bg-white overflow-hidden shrink-0">
        {blurBgUrl ? (
          <>
            {/* Fondo difuminado */}
            <div
              className="absolute inset-0 scale-110 blur-xl opacity-20"
              style={{
                backgroundImage: `url(${blurBgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Logo contenido sin recortar */}
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <img
                src={blurBgUrl}
                alt={logoUrl ? event.name : "Logo organización"}
                className="max-h-full max-w-full object-contain drop-shadow-sm
                           group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </>
        ) : (
          /* Sin imagen ni logo de compañía */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-slate-300/50 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        )}

        {/* Badge estado */}
        <div className="absolute top-3 left-3">
          <Badge variant={statusConfig.variant} dot={statusConfig.dot}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* ── Franja de acento ── */}
      <div className={`h-1 bg-gradient-to-r ${statusConfig.gradient}`} />

      {/* ── Contenido ── */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
          {event.name}
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Fechas
              </p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {formatDate(event.startDate)} — {formatDate(event.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <MapPin className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Ubicación
              </p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {event.location}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-slate-100">
          <Button
            size="md"
            variant="gradient"
            className="w-full"
            onClick={() =>
              navigate(`/admin/sismaster-events/${event.eventId}/sports`)
            }
          >
            Gestionar Deportes
          </Button>
        </div>
      </div>
    </Card>
  );
}
