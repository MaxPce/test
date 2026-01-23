import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Medal, Award, User } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface PodiumTableProps {
  phaseId: number;
}

export function PodiumTable({ phaseId }: PodiumTableProps) {
  const { data: matches = [], isLoading } = useMatches(phaseId);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  // Buscar el match final
  const finalMatch = matches.find(
    (m: any) =>
      m.round?.toLowerCase().includes("final") &&
      !m.round?.toLowerCase().includes("semi") &&
      !m.round?.toLowerCase().includes("tercer") &&
      !m.round?.toLowerCase().includes("3er"),
  );

  // Buscar el match de tercer lugar
  const thirdPlaceMatch = matches.find(
    (m: any) =>
      m.round?.toLowerCase().includes("tercer") ||
      m.round?.toLowerCase().includes("3er") ||
      m.round?.toLowerCase().includes("3°"),
  );

  // Verificar si el torneo ha finalizado
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

  // Construir el podio
  const podiumData: any[] = [];

  // 1er lugar - Ganador de la final
  const winner = finalMatch.participations?.find(
    (p: any) =>
      p.registration?.registrationId === finalMatch.winnerRegistrationId,
  );

  if (winner) {
    const reg = winner.registration;
    const isAthlete = !!reg?.athlete;
    podiumData.push({
      position: 1,
      name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
      institution: reg?.athlete?.institution || reg?.team?.institution,
      photoUrl: reg?.athlete?.photoUrl,
      isAthlete,
    });
  }

  // 2do lugar - Perdedor de la final
  const runnerUp = finalMatch.participations?.find(
    (p: any) =>
      p.registration?.registrationId !== finalMatch.winnerRegistrationId,
  );

  if (runnerUp) {
    const reg = runnerUp.registration;
    const isAthlete = !!reg?.athlete;
    podiumData.push({
      position: 2,
      name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
      institution: reg?.athlete?.institution || reg?.team?.institution,
      photoUrl: reg?.athlete?.photoUrl,
      isAthlete,
    });
  }

  // 3er lugar - Ganador del match de tercer lugar (si existe)
  if (
    thirdPlaceMatch &&
    thirdPlaceMatch.status === "finalizado" &&
    thirdPlaceMatch.winnerRegistrationId
  ) {
    const thirdPlace = thirdPlaceMatch.participations?.find(
      (p: any) =>
        p.registration?.registrationId === thirdPlaceMatch.winnerRegistrationId,
    );

    if (thirdPlace) {
      const reg = thirdPlace.registration;
      const isAthlete = !!reg?.athlete;
      podiumData.push({
        position: 3,
        name: reg?.athlete?.name || reg?.team?.name || "Sin nombre",
        institution: reg?.athlete?.institution || reg?.team?.institution,
        photoUrl: reg?.athlete?.photoUrl,
        isAthlete,
      });
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
    if (position === 3) return "from-orange-50 to-amber-50 border-orange-300";
    return "from-gray-50 to-gray-100 border-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Tabla del Podio */}
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
                    Participante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Institución
                  </th>
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
                          variant={item.position === 1 ? "warning" : "default"}
                          className="text-base px-3 py-1"
                        >
                          {item.position}° Lugar
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {/* Foto del atleta o avatar */}
                        {item.isAthlete && item.photoUrl ? (
                          <img
                            src={getImageUrl(item.photoUrl)}
                            alt={item.name}
                            className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const placeholder =
                                  document.createElement("div");
                                placeholder.className =
                                  "w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center border-3 border-white shadow-lg";
                                const icon = document.createElementNS(
                                  "http://www.w3.org/2000/svg",
                                  "svg",
                                );
                                icon.setAttribute(
                                  "class",
                                  "h-7 w-7 text-white",
                                );
                                icon.setAttribute("fill", "currentColor");
                                icon.setAttribute("viewBox", "0 0 24 24");
                                icon.innerHTML =
                                  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
                                placeholder.appendChild(icon);
                                parent.appendChild(placeholder);
                              }
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {item.institution && (
                        <div className="flex items-center gap-3">
                          {/* Logo de la institución */}
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
