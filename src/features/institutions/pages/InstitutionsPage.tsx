import { useState } from "react";
import { Building2, Search } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSismasterInstitutions } from "../api/sismaster.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function InstitutionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: institutions = [], isLoading } = useSismasterInstitutions();

  console.log("INSTITUTION SAMPLE", institutions[0]);
  // Filtrar instituciones por búsqueda
  const filteredInstitutions = institutions.filter((inst) => {
    const name = inst.businessName?.toLowerCase() || "";
    const abrev = inst.abrev?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return name.includes(search) || abrev.includes(search);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Cargando instituciones..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instituciones</h1>
          <p className="text-gray-600 mt-1">
            Instituciones registradas en Sismaster ({institutions.length})
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o abreviatura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Lista de Instituciones */}
      {filteredInstitutions.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No se encontraron instituciones"
          description={
            searchTerm
              ? "Intenta ajustar los términos de búsqueda"
              : "No hay instituciones disponibles en Sismaster"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstitutions.map((institution) => (
            <Card
              key={institution.idinstitution}
              variant="elevated"
              className="hover:shadow-lg transition-shadow"
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  {institution.avatar ? (
                    <img
                      src={getImageUrl(institution.avatar)}
                      alt={institution.businessName || "Logo"}
                      className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                      {institution.businessName?.charAt(0) || "?"}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      {institution.businessName || "Sin nombre"}
                    </h3>
                    {institution.abrev && (
                      <p className="text-sm text-gray-600 mt-1">
                        {institution.abrev}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        ID: {institution.idinstitution}
                      </span>
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
