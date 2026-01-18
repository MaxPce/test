import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";
import { useMatches } from "@/features/competitions/api/matches.queries";

interface SimpleBracketProps {
  phaseId: number;
}

type RoundType = "quarters" | "semis" | "final" | "third" | "other";

function classifyRound(rawRound?: string | null): RoundType {
  const r = (rawRound || "").toLowerCase().trim();

  if (!r) return "other";

  if (r.includes("cuarto")) return "quarters"; // "cuartos", "cuartos de final"
  if (r.includes("semi")) return "semis"; // "semifinal", "semifinales"
  if (r.includes("tercer") || r.includes("3er") || r.includes("3°"))
    return "third"; // "Tercer Lugar"
  if (r.includes("final")) return "final"; // "final", "gran final"

  return "other";
}

export function SimpleBracket({ phaseId }: SimpleBracketProps) {
  const { data: matches = [], isLoading } = useMatches(phaseId);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando bracket...</p>
        </CardBody>
      </Card>
    );
  }

  // 1) Filtro duro: solo partidos de esta fase y con 2 participantes reales
  const realMatches = matches.filter((match) => {
    if (match.phaseId !== phaseId) return false;
    if (!match.participations || match.participations.length < 2) return false;

    const p1 = match.participations[0]?.registration;
    const p2 = match.participations[1]?.registration;

    return p1 && p2 && (p1.athlete || p1.team) && (p2.athlete || p2.team);
  });

  if (realMatches.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium">No hay combates definidos aún</p>
          <p className="text-sm mt-1">
            Los combates aparecerán cuando se asignen los participantes
          </p>
        </CardBody>
      </Card>
    );
  }

  // 2) Clasificar rondas de forma robusta
  const quarters = realMatches.filter(
    (m) => classifyRound(m.round) === "quarters",
  );
  const semis = realMatches.filter((m) => classifyRound(m.round) === "semis");
  const finals = realMatches.filter((m) => classifyRound(m.round) === "final");
  const thirdMatches = realMatches.filter(
    (m) => classifyRound(m.round) === "third",
  );
  const others = realMatches.filter((m) => classifyRound(m.round) === "other");

  const final = finals[0] || null;
  const third = thirdMatches[0] || null;

  const hasBracketLayout =
    quarters.length > 0 || semis.length > 0 || final || third;

  return (
    <div className="space-y-6">
      {/* 3) Si se puede, mostrar como llaves; si no, lista simple */}
      {hasBracketLayout ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          <div className="min-w-max">
            <div className="flex gap-8 items-center justify-center">
              {/* Cuartos */}
              {quarters.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-center font-bold text-gray-700 mb-2">
                    Cuartos de Final
                  </h3>
                  {quarters.map((match) => (
                    <MatchCard key={match.matchId} match={match} />
                  ))}
                </div>
              )}

              {quarters.length > 0 && semis.length > 0 && (
                <div className="flex items-center">
                  <div className="h-px w-8 bg-gray-300" />
                </div>
              )}

              {/* Semis */}
              {semis.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-center font-bold text-gray-700 mb-2">
                    Semifinales
                  </h3>
                  <div className={semis.length > 1 ? "space-y-24" : ""}>
                    {semis.map((match) => (
                      <MatchCard key={match.matchId} match={match} size="lg" />
                    ))}
                  </div>
                </div>
              )}

              {semis.length > 0 && final && (
                <div className="flex items-center">
                  <div className="h-px w-8 bg-gray-300" />
                </div>
              )}

              {/* Final */}
              {final && (
                <div>
                  <h3 className="text-center font-bold text-yellow-600 mb-2 flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5" />
                    FINAL
                  </h3>
                  <MatchCard match={final} size="xl" isFinal />
                </div>
              )}
            </div>

            {/* Tercer lugar debajo */}
            {third && (
              <div className="mt-10 flex justify-center">
                <div className="max-w-md">
                  <h3 className="text-center font-bold text-amber-600 mb-2">
                    Tercer Lugar
                  </h3>
                  <MatchCard match={third} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Fallback: lista vertical simple si no se pudo clasificar
        <Card>
          <CardHeader>
            <h3 className="font-bold text-gray-800">Combates de eliminación</h3>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-2">
              {realMatches.map((match) => (
                <MatchCard key={match.matchId} match={match} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Mostrar también “otros” (por si hay rondas con nombres raros) */}
      {others.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">
              Otras rondas ({others.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-2">
              {others.map((match) => (
                <MatchCard key={match.matchId} match={match} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

/* ---------- MatchCard: misma idea de antes ---------- */

interface MatchCardProps {
  match: any;
  size?: "sm" | "lg" | "xl";
  isFinal?: boolean;
}

function MatchCard({ match, size = "sm", isFinal = false }: MatchCardProps) {
  const p1Data = match.participations?.[0]?.registration;
  const p2Data = match.participations?.[1]?.registration;

  const name1 = p1Data?.athlete?.name || p1Data?.team?.name || "Por definir";
  const name2 = p2Data?.athlete?.name || p2Data?.team?.name || "Por definir";

  const institution1 =
    p1Data?.athlete?.institution?.abrev ||
    p1Data?.team?.institution?.abrev ||
    "";
  const institution2 =
    p2Data?.athlete?.institution?.abrev ||
    p2Data?.team?.institution?.abrev ||
    "";

  const score1 = match.participant1Score ?? "-";
  const score2 = match.participant2Score ?? "-";

  const winnerId = match.winnerRegistrationId;
  const isP1Winner = winnerId === p1Data?.registrationId;
  const isP2Winner = winnerId === p2Data?.registrationId;

  const p1Corner = match.participations?.[0]?.corner;
  const p2Corner = match.participations?.[1]?.corner;

  const sizeClasses = {
    sm: "w-64",
    lg: "w-72",
    xl: "w-80",
  } as const;

  const textSizeClasses = {
    sm: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  } as const;

  return (
    <div
      className={`${sizeClasses[size]} border-2 ${
        isFinal
          ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
          : "border-gray-300 bg-white"
      } rounded-xl shadow-md hover:shadow-xl transition-all`}
    >
      {/* Participante 1 */}
      <div
        className={`flex items-center justify-between p-3 ${
          isP1Winner
            ? "bg-green-100 border-b-2 border-green-500"
            : p1Corner === "blue"
              ? "bg-blue-50 border-b-2 border-blue-300"
              : "bg-gray-50 border-b-2 border-gray-300"
        } rounded-t-xl`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isP1Winner && (
            <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
          )}
          {p1Corner === "blue" && !isP1Winner && (
            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p
              className={`font-bold text-gray-900 truncate ${textSizeClasses[size]}`}
            >
              {name1}
            </p>
            {institution1 && (
              <p className="text-xs text-gray-600 truncate">{institution1}</p>
            )}
          </div>
        </div>
        <span
          className={`${
            size === "xl" ? "text-3xl" : size === "lg" ? "text-2xl" : "text-xl"
          } font-bold ml-2 flex-shrink-0 ${
            isP1Winner ? "text-green-600" : "text-gray-500"
          }`}
        >
          {score1}
        </span>
      </div>

      {/* Participante 2 */}
      <div
        className={`flex items-center justify-between p-3 ${
          isP2Winner ? "bg-green-100" : "bg-white"
        } rounded-b-xl`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isP2Winner && (
            <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
          )}
          {p2Corner === "white" && !isP2Winner && (
            <div className="h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p
              className={`font-bold text-gray-900 truncate ${textSizeClasses[size]}`}
            >
              {name2}
            </p>
            {institution2 && (
              <p className="text-xs text-gray-600 truncate">{institution2}</p>
            )}
          </div>
        </div>
        <span
          className={`${
            size === "xl" ? "text-3xl" : size === "lg" ? "text-2xl" : "text-xl"
          } font-bold ml-2 flex-shrink-0 ${
            isP2Winner ? "text-green-600" : "text-gray-500"
          }`}
        >
          {score2}
        </span>
      </div>

      {/* Estado */}
      <div className="px-3 py-2 bg-gray-50 rounded-b-xl border-t">
        <div className="flex items-center justify-between">
          <Badge
            variant={
              match.status === "finalizado"
                ? "success"
                : match.status === "en_curso"
                  ? "primary"
                  : "default"
            }
            size="sm"
          >
            {match.status === "finalizado" && "Finalizado"}
            {match.status === "en_curso" && "En Curso"}
            {match.status === "programado" && "Programado"}
          </Badge>
          {match.platformNumber && (
            <span className="text-xs text-gray-500">
              P{match.platformNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
