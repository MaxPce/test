import { useState } from "react";
import { Users, Search } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSearchAthletes, useAthletesCount } from "../api/sismaster.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

export function AthletesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: athletes = [], isLoading } = useSearchAthletes(
    searchTerm,
    searchTerm.length >= 2,
  );

  console.log("ATHLETE SAMPLE", athletes[0]);

  const { data: totalAthletes } = useAthletesCount();

  const showResults = searchTerm.length >= 2;
  const showMinLengthMessage = searchTerm.length > 0 && searchTerm.length < 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Atletas Acreditados
          </h1>
          <p className="text-gray-600 mt-1">
            {totalAthletes
              ? `${totalAthletes.toLocaleString("es-PE")} atletas acreditados en Sismaster`
              : "Atletas acreditados en Sismaster"}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Estados */}
      {showMinLengthMessage && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Escribe al menos 2 caracteres para buscar
          </p>
        </div>
      )}

      {!showResults && !showMinLengthMessage && (
        <EmptyState
          icon={Users}
          title="Busca un atleta acreditado"
          description="Escribe el nombre o documento de un atleta para comenzar la búsqueda"
        />
      )}

      {isLoading && showResults && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Buscando atletas..." />
        </div>
      )}

      {/* Resultados */}
      {showResults && !isLoading && (
        <>
          {athletes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 font-medium">
                No se encontraron atletas acreditados
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Intenta con otro término de búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {athletes.length} resultado{athletes.length !== 1 ? "s" : ""}{" "}
                  encontrado{athletes.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {athletes.map((athlete) => (
                  <Card
                    key={athlete.idperson}
                    variant="elevated"
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardBody>
                      <div className="flex items-start gap-4">
                        {/* Foto */}
                        {athlete.photo ? (
                          <img
                            src={getImageUrl(athlete.photo)}
                            alt={`${athlete.firstname} ${athlete.lastname}`}
                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {athlete.firstname?.charAt(0) || "?"}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">
                            {athlete.firstname || ""} {athlete.lastname || ""}{" "}
                            {athlete.surname || ""}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {athlete.institutionName || "Sin institución"}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                athlete.gender === "M" ? "primary" : "default"
                              }
                              size="sm"
                            >
                              {athlete.gender === "M"
                                ? "Masculino"
                                : "Femenino"}
                            </Badge>
                            {athlete.docnumber && (
                              <span className="text-xs text-gray-500">
                                DNI: {athlete.docnumber}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            ID: {athlete.idperson}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
