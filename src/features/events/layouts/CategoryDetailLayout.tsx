import { Outlet, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  BarChart3,
  Building2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { useEventCategories } from "../api/eventCategories.queries";

export function CategoryDetailLayout() {
  const { eventId, sportId, categoryId } = useParams<{
    eventId: string;
    sportId: string;
    categoryId: string;
  }>();
  const navigate = useNavigate();
  const { data: eventCategories = [], isLoading } = useEventCategories({
    eventId: Number(eventId),
  });

  const eventCategory = eventCategories.find(
    (ec) => ec.eventCategoryId === Number(categoryId),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!eventCategory) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Categoría no encontrada</p>
        <Button
          onClick={() => navigate(`/admin/events/${eventId}/sports/${sportId}`)}
          className="mt-4"
        >
          Volver a Categorías
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "success" | "primary" | "default" | "warning"
    > = {
      programado: "primary",
      en_curso: "success",
      finalizado: "default",
      pendiente: "warning",
    };
    return variants[status] || "default";
  };

  // Detectar si es un deporte cronometrado (natación, atletismo, etc.)
  const sportName = eventCategory.category?.sport?.name?.toLowerCase() || "";
  const isTimedSport =
    sportName.includes("natación") ||
    sportName.includes("atletismo") ||
    sportName.includes("ciclismo");

  const tabs = [
    {
      label: "Inscripciones",
      to: `/admin/events/${eventId}/sports/${sportId}/categories/${categoryId}`,
      icon: <UserPlus />,
    },
    {
      label: "Programación",
      to: `/admin/events/${eventId}/sports/${sportId}/categories/${categoryId}/schedule`,
      icon: <Calendar />,
    },
    // Tab de Resultados (solo para deportes cronometrados)
    ...(isTimedSport
      ? [
          {
            label: "Registrar Tiempos",
            to: `/admin/events/${eventId}/sports/${sportId}/categories/${categoryId}/results`,
            icon: <Timer />,
          },
        ]
      : []),
    {
      label: "Posiciones",
      to: `/admin/events/${eventId}/sports/${sportId}/categories/${categoryId}/standings`,
      icon: <BarChart3 />,
    },
    {
      label: "Instituciones",
      to: `/admin/events/${eventId}/sports/${sportId}/categories/${categoryId}/institutions`,
      icon: <Building2 />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/events/${eventId}/sports/${sportId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Categorías
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {eventCategory.category?.name}
              </h2>
              <Badge variant={getStatusBadgeVariant(eventCategory.status)}>
                {eventCategory.status === "pendiente" && "Pendiente"}
                {eventCategory.status === "en_curso" && "En Curso"}
                {eventCategory.status === "finalizado" && "Finalizado"}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              {eventCategory.category?.sport?.name} •{" "}
              {eventCategory.category?.type === "equipo"
                ? "Equipo"
                : "Individual"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} />

      {/* Contenido */}
      <div className="py-4">
        <Outlet context={{ eventCategory }} />
      </div>
    </div>
  );
}
