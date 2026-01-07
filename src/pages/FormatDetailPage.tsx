import { Link, useParams } from "react-router-dom";
import { useFormatById } from "@/features/formats/api/formats.queries";

export function FormatDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading, isError, error } = useFormatById(Number.isFinite(id) ? id : null);

  if (isLoading) return <p className="text-sm text-slate-300">Cargando...</p>;

  if (isError) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          Error: {error instanceof Error ? error.message : "Error desconocido"}
        </div>
        <Link to="/formats" className="text-sm underline text-slate-300">
          Volver
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="text-sm text-slate-300">Formato #{data.id}</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium">Fields</p>
        <div className="mt-3 space-y-2">
          {data.fields?.map((fld) => (
            <div key={fld.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <div className="flex justify-between gap-3">
                <p className="text-sm">{fld.label}</p>
                <p className="text-xs text-slate-300">{fld.type}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                required: {String(fld.required)} · order: {fld.order}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/formats" className="text-sm underline text-slate-300">
          Volver a lista
        </Link>
      </div>
    </div>
  );
}
