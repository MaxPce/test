// src/features/results/components/PodiumTable.tsx
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Medal, Award } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useMatches } from "@/features/competitions/api/matches.queries";

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
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">La competencia aún no ha finalizado</p>
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
    podiumData.push({
      position: 1,
      name:
        winner.registration?.athlete?.name ||
        winner.registration?.team?.name ||
        "Sin nombre",
      institution:
        winner.registration?.athlete?.institution?.code ||
        winner.registration?.athlete?.institution?.name ||
        winner.registration?.team?.institution?.code ||
        winner.registration?.team?.institution?.name ||
        "",
    });
  }

  // 2do lugar - Perdedor de la final
  const runnerUp = finalMatch.participations?.find(
    (p: any) =>
      p.registration?.registrationId !== finalMatch.winnerRegistrationId,
  );

  if (runnerUp) {
    podiumData.push({
      position: 2,
      name:
        runnerUp.registration?.athlete?.name ||
        runnerUp.registration?.team?.name ||
        "Sin nombre",
      institution:
        runnerUp.registration?.athlete?.institution?.code ||
        runnerUp.registration?.athlete?.institution?.name ||
        runnerUp.registration?.team?.institution?.code ||
        runnerUp.registration?.team?.institution?.name ||
        "",
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
      podiumData.push({
        position: 3,
        name:
          thirdPlace.registration?.athlete?.name ||
          thirdPlace.registration?.team?.name ||
          "Sin nombre",
        institution:
          thirdPlace.registration?.athlete?.institution?.code ||
          thirdPlace.registration?.athlete?.institution?.name ||
          thirdPlace.registration?.team?.institution?.code ||
          thirdPlace.registration?.team?.institution?.name ||
          "",
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
      {/* ✅ ELIMINADO: Header del Podio */}

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
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
                    Participante
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
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
                      <div className="flex items-center gap-3">
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
                      <p className="text-base font-bold text-gray-900">
                        {item.name}
                      </p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm text-gray-700 font-semibold">
                        {item.institution}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> El podio se genera automáticamente al finalizar
          los matches.
        </p>
      </div>
    </div>
  );
}
