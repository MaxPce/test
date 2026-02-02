import { Outlet, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { useEvent } from "../api/events.queries";
import { getImageUrl } from "@/lib/utils/imageUrl"; 

export function EventLayout() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
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
        <p className="text-gray-500">Evento no encontrado</p>
        <Button onClick={() => navigate("/admin/events")} className="mt-4">
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

  // ✅ AGREGAR: Procesar URL del logo
  const logoUrl = event.logoUrl ? getImageUrl(event.logoUrl) : null;

  return (
    <div className="space-y-6">
      {/* Header del Evento */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/events")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Eventos
        </Button>

        <div className="flex items-start gap-4">
          {logoUrl ? ( // ✅ CAMBIAR: usar logoUrl procesada
            <img
              src={logoUrl}
              alt={event.name}
              className="h-20 w-20 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                // ✅ AGREGAR: Manejo de error
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".fallback-logo")) {
                  const placeholder = document.createElement("div");
                  placeholder.className =
                    "fallback-logo h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold";
                  placeholder.textContent = event.name.charAt(0);
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              {event.name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
              <Badge variant={getStatusBadgeVariant(event.status)}>
                {event.status === "programado" && "Programado"}
                {event.status === "en_curso" && "En Curso"}
                {event.status === "finalizado" && "Finalizado"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido anidado */}
      <Outlet />
    </div>
  );
}
