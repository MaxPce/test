import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Medal, User, Users, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { useStandings } from "@/features/competitions/api/standings.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface PodiumTableProps {
  phaseId: number;
}

export function PodiumTable({ phaseId }: PodiumTableProps) {
  const { data: matches = [], isLoading: matchesLoading } =
    useMatches(phaseId);
  const { data: standings = [], isLoading: standingsLoading } =
    useStandings(phaseId);

  const isLoading = matchesLoading || standingsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  // ── Prioridad 1: puestos manuales ────────────────────────────────────
  const manualTop3 = (standings as any[])
    .filter(
      (s) => s.manualRankPosition != null && s.manualRankPosition <= 3
    )
    .sort((a, b) => a.manualRankPosition - b.manualRankPosition);

  const hasManual = manualTop3.length > 0;
  const manualIncomplete = hasManual && manualTop3.length < 3;

  // ── Construir podiumData ─────────────────────────────────────────────
  let podiumData: {
    position: number;
    name: string;
    institution: any;
    photoUrl: string | undefined;
    isAthlete: boolean;
  }[] = [];

  let isTeamCompetition = false;

  if (hasManual) {
    // Fuente manual
    isTeamCompetition = manualTop3.some(
      (s: any) => !!s.registration?.team
    );
    podiumData = manualTop3.map((s: any) => {
      const reg = s.registration;
      return {
        position: s.manualRankPosition,
        name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
        institution: reg?.athlete?.institution || reg?.team?.institution,
        photoUrl: reg?.athlete?.photoUrl,
        isAthlete: !!reg?.athlete,
      };
    });
  } else {
    // Fuente automática: buscar por matches (lógica original)
    const finalMatch = (matches as any[]).find(
      (m) =>
        m.round?.toLowerCase().includes("final") &&
        !m.round?.toLowerCase().includes("semi") &&
        !m.round?.toLowerCase().includes("tercer") &&
        !m.round?.toLowerCase().includes("3er")
    );

    const thirdPlaceMatch = (matches as any[]).find(
      (m) =>
        m.round?.toLowerCase().includes("tercer") ||
        m.round?.toLowerCase().includes("3er") ||
        m.round?.toLowerCase().includes("3°")
    );

    if (!finalMatch || finalMatch.status !== "finalizado") {
      return (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-sm text-gray-400 mt-2">
              El podio aparecerá cuando termine la final
            </p>
          </CardBody>
        </Card>
      );
    }

    isTeamCompetition = finalMatch.participations?.some(
      (p: any) =>
        p.registration?.team !== undefined &&
        p.registration?.team !== null
    );

    const winner = finalMatch.participations?.find(
      (p: any) =>
        p.registration?.registrationId === finalMatch.winnerRegistrationId
    );
    if (winner) {
      const reg = winner.registration;
      podiumData.push({
        position: 1,
        name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
        institution: reg?.athlete?.institution || reg?.team?.institution,
        photoUrl: reg?.athlete?.photoUrl,
        isAthlete: !!reg?.athlete,
      });
    }

    const runnerUp = finalMatch.participations?.find(
      (p: any) =>
        p.registration?.registrationId !== finalMatch.winnerRegistrationId
    );
    if (runnerUp) {
      const reg = runnerUp.registration;
      podiumData.push({
        position: 2,
        name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
        institution: reg?.athlete?.institution || reg?.team?.institution,
        photoUrl: reg?.athlete?.photoUrl,
        isAthlete: !!reg?.athlete,
      });
    }

    if (
      thirdPlaceMatch &&
      thirdPlaceMatch.status === "finalizado" &&
      thirdPlaceMatch.winnerRegistrationId
    ) {
      const thirdPlace = thirdPlaceMatch.participations?.find(
        (p: any) =>
          p.registration?.registrationId ===
          thirdPlaceMatch.winnerRegistrationId
      );
      if (thirdPlace) {
        const reg = thirdPlace.registration;
        podiumData.push({
          position: 3,
          name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
          institution:
            reg?.athlete?.institution || reg?.team?.institution,
          photoUrl: reg?.athlete?.photoUrl,
          isAthlete: !!reg?.athlete,
        });
      }
    }
  }

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (position === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getMedalColor = (position: number) => {
    if (position === 1) return "from-yellow-50 to-amber-50 border-yellow-300";
    if (position === 2) return "from-gray-50 to-slate-50 border-gray-300";
    if (position === 3)
      return "from-orange-50 to-amber-50 border-orange-300";
    return "from-gray-50 to-gray-100 border-gray-300";
  };

  return (
    <div className="space-y-4">
      {/* Badge de advertencia si el manual está incompleto */}
      {manualIncomplete && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
          <span>
            Podio manual incompleto (faltan puestos). Complétalo en la
            vista Manual.
          </span>
        </div>
      )}

      {hasManual && !manualIncomplete && (
        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium px-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
          Mostrando clasificación manual
        </div>
      )}

      {/* Tabla del Podio — render idéntico al original */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
                    Posición
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    {isTeamCompetition ? "Equipo" : "Participante"}
                  </th>
                  {!isTeamCompetition && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                      Institución
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {podiumData.map((item) => (
                  <tr
                    key={item.position}
                    className={`bg-gradient-to-r ${getMedalColor(item.position)} border-l-4 transition-all hover:shadow-md`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        {getMedalIcon(item.position)}
                        <Badge
                          variant={
                            item.position === 1 ? "warning" : "default"
                          }
                          className="text-base px-3 py-1"
                        >
                          {item.position}° Lugar
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {isTeamCompetition ? (
                          item.institution?.logoUrl ? (
                            <img
                              src={getImageUrl(item.institution.logoUrl)}
                              alt={item.institution.name}
                              className="w-14 h-14 rounded-full object-contain bg-white p-2 border-3 border-white shadow-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center border-3 border-white shadow-lg">
                              <Users className="h-7 w-7 text-white" />
                            </div>
                          )
                        ) : item.isAthlete && item.photoUrl ? (
                          <img
                            src={getImageUrl(item.photoUrl)}
                            alt={item.name}
                            className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center border-3 border-white shadow-lg">
                            <User className="h-7 w-7 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {item.name}
                          </p>
                          {isTeamCompetition && item.institution && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.institution.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {!isTeamCompetition && (
                      <td className="px-6 py-5">
                        {item.institution && (
                          <div className="flex items-center gap-3">
                            {item.institution.logoUrl && (
                              <img
                                src={getImageUrl(item.institution.logoUrl)}
                                alt={item.institution.name}
                                className="h-8 w-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div>
                              <p className="text-sm text-gray-700 font-semibold">
                                {item.institution.name}
                              </p>
                              {item.institution.abrev && (
                                <p className="text-xs text-gray-500">
                                  {item.institution.abrev}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
