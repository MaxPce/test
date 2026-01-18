import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatosService } from "@/services/formatos.service";
import type { Format } from "@/features/formats/types";
import { ArrowLeft, FileText, Trash2, AlertCircle } from "lucide-react";

export function FormatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [format, setFormat] = useState<Format | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadFormat = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setIsError(false);
        const data = await formatosService.getById(Number(id));
        setFormat(data);
      } catch (e) {
        setIsError(true);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormat();
  }, [id]);

  const handleDelete = async () => {
    if (!format || !window.confirm(`¿Eliminar "${format.name}"?`)) return;

    try {
      setIsDeleting(true);
      await formatosService.delete(format.id);
      navigate("/formats");
    } catch (e) {
      alert("Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600">Cargando formato...</p>
        </div>
      </div>
    );
  }

  if (isError || !format) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-bold text-red-900">
                Error al cargar
              </h2>
            </div>
            <p className="text-red-700">
              {error instanceof Error
                ? error.message
                : "No se pudo cargar el formato"}
            </p>
            <Link
              to="/formats"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a formatos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/formats"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a formatos
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {format.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">ID: #{format.id}</p>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Campos del Formato
            </h2>
          </div>

          <div className="p-6">
            {format.fields && format.fields.length > 0 ? (
              <div className="space-y-3">
                {format.fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                        {field.order + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {field.label}
                        </p>
                        <p className="text-sm text-slate-500">
                          Tipo: {field.type}
                        </p>
                      </div>
                    </div>
                    {field.required && (
                      <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full border border-red-200">
                        Requerido
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                No hay campos definidos
              </p>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Estado: {format.isActive ? "Activo" : "Inactivo"}</span>
              <span>•</span>
              <span>{format.fields?.length || 0} campos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
