import { useSwimmingResults } from "../api/results.queries";
import type { SwimmingResult } from "@/services/resultsApi";

interface SwimmingResultsTableProps {
  eventCategoryId: number;
  categoryName?: string;
}

export function SwimmingResultsTable({
  eventCategoryId,
  categoryName,
}: SwimmingResultsTableProps) {
  const {
    data: results,
    isLoading,
    isError,
    error,
  } = useSwimmingResults(eventCategoryId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm text-slate-300">Cargando resultados...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
        Error:{" "}
        {error instanceof Error ? error.message : "Error al cargar resultados"}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm text-slate-400">No hay tiempos registrados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categoryName && (
        <header>
          <h2 className="text-lg font-semibold">{categoryName}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {results.length} participantes
          </p>
        </header>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Pos
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Edad
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Equipo
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Tiempo Final
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((result: SwimmingResult) => {
                const isTeam = !!result.participation?.registration?.team;
                const isDQ = result.notes?.includes("DQ");

                return (
                  <tr
                    key={result.resultId}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 font-medium">
                        {result.rankPosition || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isTeam ? (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {result.participation.registration.team?.name}
                          </p>
                          <div className="text-xs text-slate-400 space-y-0.5">
                            {result.participation.registration.team?.members?.map(
                              (member, idx) => (
                                <p key={member.tmId}>
                                  {idx + 1}) {member.athlete.firstName}{" "}
                                  {member.athlete.lastName}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="font-medium">
                          {result.participation.registration.athlete?.firstName}{" "}
                          {result.participation.registration.athlete?.lastName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {/* Aquí podrías calcular la edad si tienes birthDate */}
                      {isTeam
                        ? "-"
                        : result.participation.registration.athlete?.birthDate
                        ? calculateAge(
                            result.participation.registration.athlete.birthDate
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {isTeam
                        ? result.participation.registration.team?.institution
                            ?.code
                        : result.participation.registration.athlete?.institution
                            ?.code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono font-medium ${
                          isDQ ? "text-red-400 line-through" : "text-white"
                        }`}
                      >
                        {isDQ && "x"}
                        {result.timeValue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">
                      {result.notes || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Función helper para calcular edad
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
