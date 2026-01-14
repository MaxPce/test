import { useParams } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { useEventCategories } from "../api/eventCategories.queries";

export function EventInstitutionsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: eventCategories = [], isLoading } = useEventCategories({
    eventId: Number(eventId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Extraer instituciones únicas de las inscripciones
  const institutionsMap = new Map<
    number,
    {
      id: number;
      name: string;
      athleteCount: number;
      teamCount: number;
      categories: Set<string>;
    }
  >();

  eventCategories.forEach((eventCategory) => {
    eventCategory.registrations?.forEach((registration) => {
      const institution =
        registration.athlete?.institution || registration.team?.institution;
      if (institution) {
        if (!institutionsMap.has(institution.institutionId)) {
          institutionsMap.set(institution.institutionId, {
            id: institution.institutionId,
            name: institution.name,
            athleteCount: 0,
            teamCount: 0,
            categories: new Set(),
          });
        }
        const inst = institutionsMap.get(institution.institutionId)!;
        if (registration.athlete) inst.athleteCount++;
        if (registration.team) inst.teamCount++;
        if (eventCategory.category?.name) {
          inst.categories.add(eventCategory.category.name);
        }
      }
    });
  });

  const institutions = Array.from(institutionsMap.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Instituciones Participantes
        </h2>
        <p className="text-gray-600 mt-1">
          Colegios y clubes con atletas o equipos inscritos en este evento
        </p>
      </div>

      {/* Lista de Instituciones */}
      {institutions.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay instituciones inscritas en este evento todavía
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Las instituciones aparecerán aquí cuando se inscriban atletas o
                equipos
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutions.map((institution) => (
            <Card key={institution.id}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {institution.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {institution.name}
                    </h3>
                    <div className="mt-2 space-y-1">
                      {institution.athleteCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>
                            {institution.athleteCount} atleta
                            {institution.athleteCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {institution.teamCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>
                            {institution.teamCount} equipo
                            {institution.teamCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Array.from(institution.categories)
                        .slice(0, 3)
                        .map((category) => (
                          <Badge key={category} variant="default" size="sm">
                            {category}
                          </Badge>
                        ))}
                      {institution.categories.size > 3 && (
                        <Badge variant="default" size="sm">
                          +{institution.categories.size - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
