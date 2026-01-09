import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

import { formatosService } from "@/services/formatos.service";
import type { Format } from "@/features/formats/types";

export function FormatsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<Format[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const [isCreating, setIsCreating] = useState(false);

  const [lastFormatId, setLastFormatId] =
    useLocalStorage<number | null>("last_format_id", null);

  const loadFormats = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const formats = await formatosService.list(); // GET /formats
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
      }); // POST a /formats

      // refetch de la lista
      await loadFormats();
    } catch (e) {
      setIsError(true);
      setError(e);
    } finally {
      setIsCreating(false);
    }
  };

  const onOpen = (id: number) => {
    console.log("Last format ID:", lastFormatId);
    setLastFormatId(id);
    navigate(`/formats/${id}`);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Formatos</h1>
        </div>

        <button
          onClick={onCreateDemo}
          disabled={isCreating}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          {isCreating ? "Creando..." : "Crear formato"}
        </button>
      </header>

      {isLoading ? <p className="text-sm text-slate-300">Cargando...</p> : null}

      {isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          Error: {error instanceof Error ? error.message : "Error desconocido"}
        </div>
      ) : null}

      <div className="space-y-2">
        {data.map((f) => (
          <button
            key={f.id}
            onClick={() => onOpen(f.id)}
            className="w-full text-left rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{f.name}</p>
              <span className="text-xs text-slate-300">#{f.id}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Fields: {f.fields?.length ?? 0} · Activo: {String(f.isActive)}
            </p>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <Link to="/" className="text-sm text-slate-300 underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
