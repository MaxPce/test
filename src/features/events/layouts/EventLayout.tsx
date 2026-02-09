import { Outlet, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useEvent } from "../api/events.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function EventLayout() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEvent(Number(eventId));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando evento..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Evento no encontrado</p>
        <Button onClick={() => navigate("/admin/events")} variant="gradient">
          Volver a Eventos
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "primary" | "default"> = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
    };
    return variants[status] || "default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const logoUrl = event.logoUrl ? getImageUrl(event.logoUrl) : null;

  return (
    <div className="space-y-6 animate-in">
      {/* Header compacto */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={event.name}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    e.currentTarget.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className =
                      "h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md";
                    placeholder.textContent = event.name.charAt(0);
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {event.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Información */}
          <div className="flex-1 min-w-0">
            {/* Título y badge */}
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {event.name}
              </h1>
              <Badge variant={getStatusBadgeVariant(event.status)} dot>
                {event.status === "programado" && "Programado"}
                {event.status === "en_curso" && "En Curso"}
                {event.status === "finalizado" && "Finalizado"}
              </Badge>
            </div>

            {/* Info en línea */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span className="font-medium truncate">{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contenido */}
      <Outlet />
    </div>
  );
}
