import { useOutletContext } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { EventCategory } from "../../types";

export function CategoryInstitutionsPage() {
  const { eventCategory } = useOutletContext<{
    eventCategory: EventCategory;
  }>();

  const institutionsMap = new Map<
    number,
    { id: number; name: string; count: number }
  >();

  eventCategory.registrations?.forEach((registration) => {
    const institution =
      registration.athlete?.institution || registration.team?.institution;
    if (institution) {
      if (!institutionsMap.has(institution.institutionId)) {
        institutionsMap.set(institution.institutionId, {
          id: institution.institutionId,
          name: institution.name,
          count: 0,
        });
      }
      institutionsMap.get(institution.institutionId)!.count++;
    }
  });

  const institutions = Array.from(institutionsMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Instituciones Participantes
        </h3>
        <p className="text-gray-600 mt-1">
          {institutions.length} institución
          {institutions.length !== 1 ? "es" : ""} participando en esta categoría
        </p>
      </div>

      {institutions.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay instituciones inscritas en esta categoría
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutions.map((institution) => (
            <Card key={institution.id}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {institution.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {institution.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {institution.count} participante
                      {institution.count !== 1 ? "s" : ""}
                    </p>
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
