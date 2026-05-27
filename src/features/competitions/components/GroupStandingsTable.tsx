import type { Phase } from "../types";
import type { GroupStanding } from "../types/index"; 

interface Props {
  group: Phase;
}

export function GroupStandingsTable({ group }: Props) {
  // Usar los standings que ya vienen en el prop, sin fetch adicional
  const standings = group.groupStandings ?? [];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700">
          Grupo {group.groupLabel ?? group.name}
        </h4>
        <span className="text-xs text-slate-400">
          Clasifican: {group.qualifiersCount ?? 2}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Participante</th>
            <th className="px-3 py-2 text-center">PJ</th>
            <th className="px-3 py-2 text-center">G</th>
            <th className="px-3 py-2 text-center">P</th>
            <th className="px-3 py-2 text-center font-bold">Pts</th>
            <th className="px-3 py-2 text-center">Clasifica</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {standings.map((s, idx) => {
            // Resolver nombre e institución desde la relación registration
            const name =
              s.registration?.athlete?.name ??
              s.registration?.team?.name ??
              `Participante ${s.registrationId}`;

            const institution =
              s.registration?.athlete?.institution?.name ??
              s.registration?.team?.institution?.name ??
              null;

            return (
              <tr
                key={s.groupStandingId}
                className={s.qualified ? "bg-emerald-50" : ""}
              >
                <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                <td className="px-3 py-2">
                  <span className="font-medium text-slate-900">{name}</span>
                  {institution && (
                    <span className="text-xs text-slate-400 ml-1">
                      ({institution})
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-slate-600">{s.played}</td>
                <td className="px-3 py-2 text-center text-slate-600">{s.won}</td>
                <td className="px-3 py-2 text-center text-slate-600">{s.lost}</td>
                <td className="px-3 py-2 text-center font-bold text-slate-900">{s.points}</td>
                <td className="px-3 py-2 text-center">
                  {s.qualified
                    ? <span className="text-emerald-600 font-semibold">✓</span>
                    : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            );
          })}
          {standings.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-slate-400 text-sm">
                Sin resultados aún
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}