import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Medal, Clock, Timer, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { usePhases } from "@/features/competitions/api/phases.queries";
import { usePhaseResults } from "../api/results.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface StandingsTableProps {
  eventCategoryId: number;
}

function PhaseStandings({ phaseId }: { phaseId: number }) {
  const { data: results = [], isLoading } = usePhaseResults(phaseId);

  const standings = [...results]
    .filter((r: any) => r.timeValue && r.rankPosition && !r.notes?.includes("DQ"))
    .sort((a: any, b: any) => (a.rankPosition || 999) - (b.rankPosition || 999));

  const dqResults = results.filter((r: any) => r.notes?.includes("DQ"));
  const noTimeResults = results.filter(
    (r: any) => !r.timeValue || !r.rankPosition
  ).filter((r: any) => !r.notes?.includes("DQ"));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  

  const getMedalConfig = (position: number) => {
    if (position === 1)
      return {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        bg: "bg-yellow-50",
        border: "border-l-4 border-yellow-400",
        badge: "bg-yellow-100 text-yellow-800",
        label: "🥇",
      };
    if (position === 2)
      return {
        icon: <Medal className="h-5 w-5 text-slate-400" />,
        bg: "bg-slate-50",
        border: "border-l-4 border-slate-400",
        badge: "bg-slate-100 text-slate-700",
        label: "🥈",
      };
    if (position === 3)
      return {
        icon: <Medal className="h-5 w-5 text-amber-600" />,
        bg: "bg-amber-50",
        border: "border-l-4 border-amber-400",
        badge: "bg-amber-100 text-amber-800",
        label: "🥉",
      };
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
              Pos.
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Participante
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Institución
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Tiempo
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {standings.map((result: any) => {
            const position = result.rankPosition;
            const reg = result.participation?.registration;
            const isTeam = !!reg?.team;
            const participantName = isTeam
              ? reg.team.name
              : reg?.athlete?.name || "Sin nombre";
            const institutionObj = isTeam
              ? reg.team.institution
              : reg?.athlete?.institution;
            const institutionName =
              institutionObj?.name || "Sin institución";
            const institutionLogo = institutionObj?.logoUrl;
            const members =
              isTeam && reg.team.members
                ? reg.team.members
                    .map((m: any) => m.athlete?.name)
                    .filter(Boolean)
                    .join(", ")
                : null;
            const medal = getMedalConfig(position);

            return (
              <tr
                key={result.resultId}
                className={`transition-colors hover:brightness-95 ${
                  medal ? `${medal.bg} ${medal.border}` : "hover:bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {medal ? (
                      <>
                        <span className="text-xl">{medal.label}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${medal.badge}`}
                        >
                          {position}°
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500 ml-8">
                        {position}°
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {participantName}
                  </p>
                  {members && (
                    <p className="text-xs text-gray-500 mt-0.5">{members}</p>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {institutionLogo && (
                      <img
                        src={getImageUrl(institutionLogo)}
                        alt={institutionName}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className="text-sm text-gray-700">
                      {institutionName}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span
                      className={`text-base font-bold font-mono ${
                        medal ? "text-blue-700" : "text-blue-500"
                      }`}
                    >
                      {result.timeValue}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}

          {dqResults.map((result: any) => {
            const reg = result.participation?.registration;
            const isTeam = !!reg?.team;
            const participantName = isTeam
              ? reg.team.name
              : reg?.athlete?.name || "Sin nombre";
            const institutionObj = isTeam
              ? reg.team.institution
              : reg?.athlete?.institution;
            const institutionName = institutionObj?.name || "Sin institución";
            const institutionLogo = institutionObj?.logoUrl;

            return (
              <tr
                key={result.resultId}
                className="bg-red-50/40 hover:bg-red-50 transition-colors opacity-70"
              >
                <td className="px-6 py-3 whitespace-nowrap">
                  <Badge
                    variant="default"
                    className="bg-red-100 text-red-700 text-xs ml-7"
                  >
                    DQ
                  </Badge>
                </td>
                <td className="px-6 py-3">
                  <p className="text-sm font-medium text-gray-500 line-through">
                    {participantName}
                  </p>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {institutionLogo && (
                      <img
                        src={getImageUrl(institutionLogo)}
                        alt={institutionName}
                        className="h-5 w-5 object-contain opacity-50"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className="text-sm text-gray-400">
                      {institutionName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-center">
                  <span className="text-sm font-mono text-red-400 line-through">
                    {result.timeValue || "—"}
                  </span>
                </td>
              </tr>
            );
          })}

          {noTimeResults.map((result: any) => {
            const reg = result.participation?.registration;
            const isTeam = !!reg?.team;
            const participantName = isTeam
              ? reg.team.name
              : reg?.athlete?.name || "Sin nombre";

            return (
              <tr
                key={result.resultId}
                className="opacity-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <span className="text-gray-400 text-sm ml-8">—</span>
                </td>
                <td className="px-6 py-3">
                  <p className="text-sm text-gray-400">{participantName}</p>
                </td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-center">
                  <span className="text-xs text-gray-400 italic">Sin tiempo</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StandingsTable({ eventCategoryId }: StandingsTableProps) {
  const { data: phases = [], isLoading: phasesLoading } =
    usePhases(eventCategoryId);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);

  const groupPhases = phases.filter((p: any) => p.type === "grupo");
  const effectivePhaseId =
    activePhaseId ?? groupPhases[0]?.phaseId ?? phases[0]?.phaseId ?? null;

  if (phasesLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-16">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (phases.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-16">
          <Timer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No hay series creadas aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Crea las series desde la pestaña "Series"
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Tabla de Posiciones</h3>
            
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {groupPhases.map((phase: any) => {
          const isActive = effectivePhaseId === phase.phaseId;
          return (
            <button
              key={phase.phaseId}
              onClick={() => setActivePhaseId(phase.phaseId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <Timer className="h-4 w-4" />
              {phase.name}
              {isActive && <ChevronRight className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      <Card>
        {effectivePhaseId && (
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Timer className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Mostrando ranking de
              </p>
              <p className="text-sm font-bold text-gray-800">
                {groupPhases.find((p: any) => p.phaseId === effectivePhaseId)
                  ?.name ?? "Serie"}
              </p>
            </div>
          </div>
        )}
        <CardBody className="p-0">
          {effectivePhaseId ? (
            <PhaseStandings phaseId={effectivePhaseId} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>Selecciona una serie para ver las posiciones</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
