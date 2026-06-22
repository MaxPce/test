// src/features/competitions/components/athletics/AthleticsMedalTable.tsx
import { useState } from "react";
import { useAthleticsResultsByEvent } from "../../api/athletics-results.queries";
import { Spinner } from "@/components/ui/Spinner";
import { AthleticsEventTable } from "./AthleticsEventTable";

type GenderFilter = "all" | "F" | "M";

interface Props {
  externalEventId: number;
  localSportId: number;
}

export function AthleticsMedalTable({ externalEventId, localSportId }: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderFilter>("all");

  const { data = [], isLoading } = useAthleticsResultsByEvent(
    externalEventId,
    localSportId
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Cargando resultados de atletismo..." />
      </div>
    );

  if (data.length === 0)
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="font-medium">No hay resultados registrados aún.</p>
      </div>
    );

  // Inicializar categoría con la primera disponible
  const activeCategory = category ?? data[0]?.category;
  const currentData = data.find((d) => d.category === activeCategory);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Selector de categoría */}
        {data.length > 1 && (
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {data.map((d) => (
              <button
                key={d.category}
                onClick={() => setCategory(d.category)}
                className={[
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide",
                  activeCategory === d.category
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {d.category}
              </button>
            ))}
          </div>
        )}

        {/* Selector de género */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "F", label: "Damas" },
              { key: "M", label: "Varones" },
            ] as { key: GenderFilter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGender(key)}
              className={[
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                gender === key
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablas por prueba */}
      {currentData && (
        <div className="space-y-4">
          {currentData.events.map((event) => (
            <AthleticsEventTable
              key={event.eventName}
              event={event}
              genderFilter={gender}
            />
          ))}
        </div>
      )}
    </div>
  );
}