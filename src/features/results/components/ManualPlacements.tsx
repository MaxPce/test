import { useState, useMemo } from "react";
import { Save, Trash2, AlertCircle, User, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useMatches } from "@/features/competitions/api/matches.queries";
import { useManualRanks } from "@/features/competitions/api/standings.queries"; 
import {
  useSetManualStandingRanks,
  useClearManualStandingRanks,
} from "@/features/competitions/api/standings.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface ManualPlacementsProps {
  phaseId: number;
}

export function ManualPlacements({ phaseId }: ManualPlacementsProps) {
  const { data: matches = [], isLoading: matchesLoading } = useMatches(phaseId);
  const { data: savedRanks = [], isLoading: ranksLoading } = useManualRanks(phaseId);
  const setManualRanksMutation = useSetManualStandingRanks();
  const clearManualRanksMutation = useClearManualStandingRanks();

  const [localRanks, setLocalRanks] = useState<Record<number, number | null>>({});

  const savedRanksMap = useMemo(() => {
    const map = new Map<number, number | null>();
    savedRanks.forEach((r) => map.set(r.registrationId, r.manualRankPosition));
    return map;
  }, [savedRanks]);

  const participants = useMemo(() => {
    const seen = new Set<number>();
    const result: any[] = [];

    matches.forEach((match: any) => {
      match.participations?.forEach((p: any) => {
        const regId = p.registration?.registrationId;
        if (regId && !seen.has(regId)) {
          seen.add(regId);
          result.push({
            registrationId: regId,
            registration: p.registration,
            manualRankPosition: savedRanksMap.get(regId) ?? null,
          });
        }
      });
    });

    return result;
  }, [matches, savedRanksMap]); 

  const getRankValue = (
    registrationId: number,
    serverValue: number | null
  ): number | null => {
    if (registrationId in localRanks) return localRanks[registrationId];
    return serverValue;
  };

  
  const hasAnyManualSaved = savedRanks.some((r) => r.manualRankPosition != null);
  const hasLocalChanges = Object.keys(localRanks).length > 0;

  const handleSave = async () => {
    const ranks = participants.map((p) => ({
      registrationId: p.registrationId,
      manualRankPosition: getRankValue(p.registrationId, p.manualRankPosition),
    }));
    await setManualRanksMutation.mutateAsync({ phaseId, ranks });
    setLocalRanks({});
  };

  const handleClear = async () => {
    await clearManualRanksMutation.mutateAsync(phaseId);
    setLocalRanks({});
  };

  if (matchesLoading || ranksLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Institución
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-36">
                    Puesto Manual
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-14 text-center text-gray-400">
                      <User className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        No hay participantes en esta fase
                      </p>
                      <p className="text-xs mt-1">
                        Genera las llaves primero en la pestaña Programación
                      </p>
                    </td>
                  </tr>
                ) : (
                  participants.map((participant) => {
                    const reg = participant.registration;
                    const isAthlete = !!reg?.athlete;
                    const name = reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                    const institution = reg?.athlete?.institution || reg?.team?.institution;
                    const photoUrl = reg?.athlete?.photoUrl;
                    const currentRank = getRankValue(
                      participant.registrationId,
                      participant.manualRankPosition
                    );
                    const isModified = participant.registrationId in localRanks;

                    return (
                      <tr
                        key={participant.registrationId}
                        className={`transition-colors ${
                          isModified ? "bg-purple-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {isAthlete && photoUrl ? (
                              <img
                                src={getImageUrl(photoUrl)}
                                alt={name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : isAthlete ? (
                              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white shadow">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{name}</p>
                              {participant.manualRankPosition != null && !isModified && (
                                <span className="text-xs text-purple-600 font-medium">
                                  Guardado: {participant.manualRankPosition}°
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {institution && (
                            <div className="flex items-center gap-2">
                              {institution.logoUrl && (
                                <img
                                  src={getImageUrl(institution.logoUrl)}
                                  alt={institution.name}
                                  className="h-5 w-5 object-contain flex-shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                              )}
                              <span className="text-xs text-gray-600 font-medium">
                                {institution.abrev || institution.name}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={currentRank ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocalRanks((prev) => ({
                                ...prev,
                                [participant.registrationId]:
                                  val === "" ? null : parseInt(val, 10),
                              }));
                            }}
                            className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                            placeholder="—"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-3 justify-end">
        {hasAnyManualSaved && (
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={clearManualRanksMutation.isPending}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
          >
            <Trash2 className="h-4 w-4" />
            {clearManualRanksMutation.isPending ? "Limpiando..." : "Limpiar manual"}
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={setManualRanksMutation.isPending || participants.length === 0}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {setManualRanksMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
