import { useState } from "react";
import { useParams } from "react-router-dom";
import { SwimmingResultsTable } from "../components/SwimmingResultsTable";
import { TimeInputForm } from "../components/TimeInputForm";

export function SwimmingResultsPage() {
  const { eventCategoryId } = useParams<{ eventCategoryId: string }>();
  const [showForm, setShowForm] = useState(false);

  const categoryId = eventCategoryId ? parseInt(eventCategoryId) : null;

  if (!categoryId) {
    return <p className="text-sm text-red-400">ID de categoría inválido</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resultados de Natación</h1>
          <p className="text-sm text-slate-400 mt-1">Categoría #{categoryId}</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Ver Tabla" : "Registrar Tiempo"}
        </button>
      </header>

      {showForm ? (
        <div className="max-w-2xl">
          {/* Aquí necesitarías listar las participaciones disponibles */}
          <TimeInputForm
            participationId={1} // Este valor vendría de una lista de participaciones
            participantName="Atleta Example"
            onSuccess={() => setShowForm(false)}
          />
        </div>
      ) : (
        <SwimmingResultsTable eventCategoryId={categoryId} />
      )}
    </div>
  );
}
