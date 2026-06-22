// src/features/competitions/components/athletics/AthleticsEventTable.tsx
import type { AthleticsEventGroup, AthleticsResultEntry } from "../../api/athletics-results.queries";

type GenderFilter = "all" | "F" | "M";

interface Props {
  event: AthleticsEventGroup;
  genderFilter: GenderFilter;
}

const POSITION_STYLE: Record<number, string> = {
  1: "bg-yellow-50 border-l-4 border-yellow-400",
  2: "bg-slate-50 border-l-4 border-slate-400",
  3: "bg-orange-50 border-l-4 border-orange-400",
};

export function AthleticsEventTable({ event, genderFilter }: Props) {
  const showFemale = genderFilter === "all" || genderFilter === "F";
  const showMale   = genderFilter === "all" || genderFilter === "M";
  const splitView  = genderFilter === "all";

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Nombre de la prueba */}
      <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
        <h3 className="font-bold text-sm tracking-wide">{event.eventName}</h3>
      </div>

      <div className={`grid ${splitView ? "grid-cols-2 divide-x divide-slate-200" : "grid-cols-1"}`}>
        {showFemale && (
          <ResultColumn
            label="Damas"
            results={event.femaleResults}
            accent="pink"
          />
        )}
        {showMale && (
          <ResultColumn
            label="Varones"
            results={event.maleResults}
            accent="blue"
          />
        )}
      </div>
    </div>
  );
}

function ResultColumn({
  label,
  results,
  accent,
}: {
  label: string;
  results: AthleticsResultEntry[];
  accent: "pink" | "blue";
}) {
  const headerBg   = accent === "pink" ? "bg-pink-50"   : "bg-blue-50";
  const headerText = accent === "pink" ? "text-pink-700" : "text-blue-700";

  const valid = results.filter((r) => r.position > 0);

  if (valid.length === 0)
    return (
      <div className={`${headerBg}`}>
        <div className={`px-3 py-1.5 border-b border-slate-200`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${headerText}`}>{label}</span>
        </div>
        <p className="text-xs text-slate-400 px-3 py-4 text-center">Sin resultados</p>
      </div>
    );

  return (
    <div>
      <div className={`${headerBg} px-3 py-1.5 border-b border-slate-200`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${headerText}`}>{label}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-2 py-2 text-left text-slate-400 font-medium w-7">#</th>
            <th className="px-2 py-2 text-left text-slate-400 font-medium">Atleta</th>
            <th className="px-2 py-2 text-right text-slate-400 font-medium">Marca</th>
            <th className="px-2 py-2 text-right text-slate-400 font-medium w-12">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {valid.map((r) => (
            <tr
              key={r.position}
              className={`${POSITION_STYLE[r.position] ?? ""} hover:bg-slate-50 transition-colors`}
            >
              <td className="px-2 py-2 font-bold text-slate-500">{r.position}</td>
              <td className="px-2 py-2">
                <div className="font-semibold text-slate-800 leading-tight">{r.athleteName}</div>
                <div className="text-slate-400 text-[10px]">{r.universityAbrev}</div>
              </td>
              <td className="px-2 py-2 text-right font-mono font-semibold text-slate-700">
                {r.mark}
                {r.windSpeed && (
                  <span className="ml-1 text-[10px] text-slate-400">{r.windSpeed}</span>
                )}
              </td>
              <td className="px-2 py-2 text-right">
                <span
                  className={`inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold ${
                    r.points > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {r.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}