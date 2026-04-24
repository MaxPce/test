// src/features/results/components/BestOf3ManualRanks.tsx

import { useState, useMemo } from "react";
import { Save, Trash2, ArrowUpDown, User, Users } from "lucide-react";
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

interface Props {
  phaseId: number;
}

export function BestOf3ManualRanks({ phaseId }: Props) {
  const { data: matches = [], isLoading: matchesLoading } = useMatches(phaseId);
  const { data: savedRanks = [], isLoading: ranksLoading } = useManualRanks(phaseId);
  const setManualRanksMutation = useSetManualStandingRanks();
  const clearManualRanksMutation = useClearManualStandingRanks();

  // orden local: null = usar el orden calculado
  const [swapped, setSwapped] = useState(false);

  // Map: registrationId → manualRankPosition guardado
  const savedRanksMap = useMemo(() => {
    const map = new Map<number, number | null>();
    savedRanks.forEach((r) => map.set(r.registrationId, r.manualRankPosition));
    return map;
  }, [savedRanks]);

  // Extraer los 2 participantes únicos de los matches + contar victorias
  const participants = useMemo(() => {
    const seenIds = new Set<number>();
    const regMap = new Map<number, any>();
    const wins: Record<number, number> = {};

    matches.forEach((match: any) => {
      // Contar victorias
      if (match.winnerRegistrationId) {
        wins[match.winnerRegistrationId] = (wins[match.winnerRegistrationId] ?? 0) + 1;
      }
      // Registrar participantes únicos
      match.participations?.forEach((p: any) => {
        const regId = p.registration?.registrationId;
        if (regId && !seenIds.has(regId)) {
          seenIds.add(regId);
          regMap.set(regId, p.registration);
        }
      });
    });

    return Array.from(regMap.entries()).map(([regId, registration]) => ({
      registrationId: regId,
      registration,
      wins: wins[regId] ?? 0,
      manualRankPosition: savedRanksMap.get(regId) ?? null,
    }));
  }, [matches, savedRanksMap]);

  // Total de partidos jugados (con resultado)
  const totalPlayed = useMemo(
    () => matches.filter((m: any) => m.status === "FINALIZADO" || m.winnerRegistrationId).length,
    [matches],
  );

  // Ganador automático: el que tiene 2 victorias
  const autoWinner = useMemo(
    () => participants.find((p) => p.wins >= 2) ?? null,
    [participants],
  );

  const serieCompleta = autoWinner !== null;

  // Orden base: si hay manual ranks → por manualRankPosition, si no → más victorias primero
  const baseOrdered = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aM = a.manualRankPosition;
      const bM = b.manualRankPosition;
      if (aM !== null && bM !== null) return aM - bM;
      if (aM !== null) return -1;
      if (bM !== null) return 1;
      return b.wins - a.wins;
    });
  }, [participants]);

  // Aplicar swap local si el usuario lo activó
  const ordered = swapped ? [...baseOrdered].reverse() : baseOrdered;

  const hasAnyManualSaved = savedRanks.some((r) => r.manualRankPosition != null);

  const handleSave = async () => {
    const ranks = ordered.map((p, idx) => ({
      registrationId: p.registrationId,
      manualRankPosition: idx + 1,
    }));
    await setManualRanksMutation.mutateAsync({ phaseId, ranks });
    setSwapped(false); // el servidor ya tiene el nuevo orden
  };

  const handleClear = async () => {
    await clearManualRanksMutation.mutateAsync(phaseId);
    setSwapped(false);
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
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-14">
                    Pos.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Institución
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                    Victorias
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ordered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-gray-400">
                      <p className="text-sm font-medium text-gray-500">
                        No hay participantes en esta fase
                      </p>
                    </td>
                  </tr>
                ) : (
                  ordered.map((participant, idx) => {
                    const reg = participant.registration;
                    const isAthlete = !!reg?.athlete;
                    const name = reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                    const institution = reg?.athlete?.institution || reg?.team?.institution;
                    const photoUrl = reg?.athlete?.photoUrl;
                    const savedPos = savedRanksMap.get(participant.registrationId) ?? null;

                    return (
                      <tr
                        key={participant.registrationId}
                        className={`transition-colors
                          ${idx === 0
                            ? "bg-amber-50/60 dark:bg-amber-950/10"
                            : "hover:bg-gray-50"}
                        `}
                      >
                        {/* Posición */}
                        <td className="px-4 py-3 text-center">
                          <span className={`
                            inline-flex w-8 h-8 rounded-full items-center justify-center
                            text-sm font-bold
                            ${idx === 0
                              ? "bg-amber-400 text-white"
                              : "bg-gray-200 text-gray-700"}
                          `}>
                            {idx + 1}
                          </span>
                        </td>

                        {/* Participante */}
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
                              {savedPos !== null && !swapped && (
                                <span className="text-xs text-orange-600 font-medium">
                                  Guardado: {savedPos}°
                                </span>
                              )}
                              {swapped && (
                                <span className="text-xs text-amber-600 font-medium">
                                  Sin guardar
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Institución */}
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

                        {/* Victorias */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full
                                           bg-green-100 text-green-700 text-sm font-bold">
                            {participant.wins}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Botón swap dentro de la card */}
          {ordered.length === 2 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setSwapped((s) => !s)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg
                           border border-dashed border-gray-300 dark:border-gray-600
                           text-sm text-gray-500 dark:text-gray-400
                           hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                Intercambiar posiciones
              </button>
            </div>
          )}
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
          disabled={setManualRanksMutation.isPending || ordered.length === 0}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {setManualRanksMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}