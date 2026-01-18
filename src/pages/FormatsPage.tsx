import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatosService } from "@/services/formatos.service";
import type { Format } from "@/features/formats/types";
import { Plus, FileText, AlertCircle } from "lucide-react";

export function FormatsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<Format[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [lastFormatId, setLastFormatId] = useLocalStorage<number | null>(
    "last_format_id",
    null,
  );

  const loadFormats = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const formats = await formatosService.list();
      setData(formats);
    } catch (e) {
      setIsError(true);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFormats();
  }, []);

  const onCreateDemo = async () => {
    try {
      setIsCreating(true);

      await formatosService.create({
        name: `Formato Demo ${new Date().toISOString().slice(11, 19)}`,
        fields: [
          { label: "Equipo Local", type: "text", required: true, order: 0 },
          { label: "Equipo Visita", type: "text", required: true, order: 1 },
          { label: "Goles Local", type: "number", required: true, order: 2 },
          { label: "Goles Visita", type: "number", required: true, order: 3 },
        ],
      });

      await loadFormats();
    } catch (e) {
      setIsError(true);
      setError(e);
    } finally {
      setIsCreating(false);
    }
  };

  const onOpen = (id: number) => {
    setLastFormatId(id);
    navigate(`/formats/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Formatos</h1>
              <p className="mt-1 text-sm text-slate-600">
                Gestione los formatos de competencias deportivas
              </p>
            </div>

            <button
              onClick={onCreateDemo}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? "Creando..." : "Crear Formato"}
            </button>
          </div>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-3 text-sm text-slate-600">Cargando formatos...</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Error al cargar formatos
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error instanceof Error ? error.message : "Error desconocido"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formats grid */}
        {!isLoading && !isError && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((f) => (
              <button
                key={f.id}
                onClick={() => onOpen(f.id)}
                className="group text-left rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition">
                        {f.name}
                      </h3>
                      <span className="text-xs text-slate-500">
                        ID: #{f.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>
                    <span className="font-medium">{f.fields?.length ?? 0}</span>{" "}
                    campos
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${f.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {f.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && data.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No hay formatos disponibles
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Comience creando su primer formato de competencia
            </p>
            <button
              onClick={onCreateDemo}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              Crear Primer Formato
            </button>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
