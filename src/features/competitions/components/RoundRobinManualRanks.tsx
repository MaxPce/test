// src/features/results/components/RoundRobinManualRanks.tsx

import { useState, useMemo } from "react";
import { Save, Trash2, GripVertical, User, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useStandings, useManualRanks } from "@/features/competitions/api/standings.queries";
import {
  useSetManualStandingRanks,
  useClearManualStandingRanks,
} from "@/features/competitions/api/standings.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";

interface Props {
  phaseId: number;
}

export function RoundRobinManualRanks({ phaseId }: Props) {
  const { data: standings = [], isLoading: standingsLoading } = useStandings(phaseId);
  const { data: savedRanks = [], isLoading: ranksLoading } = useManualRanks(phaseId);
  const setManualRanksMutation = useSetManualStandingRanks();
  const clearManualRanksMutation = useClearManualStandingRanks();

  // Estado local: orden manual por drag & drop
  const [dragOrder, setDragOrder] = useState<number[] | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // Map: registrationId → manualRankPosition guardado en servidor
  const savedRanksMap = useMemo(() => {
    const map = new Map<number, number | null>();
    savedRanks.forEach((r) => map.set(r.registrationId, r.manualRankPosition));
    return map;
  }, [savedRanks]);

  // Construir lista base ordenada: primero manual, luego automático
  const baseOrdered = useMemo(() => {
    if (!standings.length) return [];
    return [...standings].sort((a, b) => {
      const aM = savedRanksMap.get(a.registrationId) ?? null;
      const bM = savedRanksMap.get(b.registrationId) ?? null;
      if (aM !== null && bM !== null) return aM - bM;
      if (aM !== null) return -1;
      if (bM !== null) return 1;
      return (a.rankPosition ?? 999) - (b.rankPosition ?? 999);
    });
  }, [standings, savedRanksMap]);

  // Si hay un dragOrder local lo usamos, si no usamos el baseOrdered
  const orderedIds: number[] = dragOrder ?? baseOrdered.map((s: any) => s.registrationId);

  // Reconstruir los standings en el orden actual
  const standingsMap = useMemo(() => {
    const map = new Map<number, any>();
    standings.forEach((s: any) => map.set(s.registrationId, s));
    return map;
  }, [standings]);

  const orderedStandings = orderedIds
    .map((id) => standingsMap.get(id))
    .filter(Boolean);

  const hasAnyManualSaved = savedRanks.some((r) => r.manualRankPosition != null);

  // ── Drag & drop ────────────────────────────────────────────────────────────

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
    // Inicializar dragOrder desde el orden actual si aún no existe
    if (!dragOrder) setDragOrder(orderedIds);
  };

  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const next = [...orderedIds];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    setDragOrder(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  // ── Save / Clear ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const ranks = orderedStandings.map((s: any, idx: number) => ({
      registrationId: s.registrationId,
      manualRankPosition: idx + 1,
    }));
    await setManualRanksMutation.mutateAsync({ phaseId, ranks });
    setDragOrder(null); // resetear orden local — el servidor ya tiene el nuevo orden
  };

  const handleClear = async () => {
    await clearManualRanksMutation.mutateAsync(phaseId);
    setDragOrder(null);
  };

  if (standingsLoading || ranksLoading) {
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
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-10" />
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-14">
                    Pos.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Institución
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-16">
                    Pts
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                    G
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                    P
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-16">
                    Dif.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orderedStandings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-gray-400">
                      <p className="text-sm font-medium text-gray-500">
                        No hay participantes en esta fase
                      </p>
                    </td>
                  </tr>
                ) : (
                  orderedStandings.map((standing: any, idx: number) => {
                    const reg = standing.registration;
                    const isAthlete = !!reg?.athlete;
                    const name = reg?.athlete?.name || reg?.team?.name || "Sin nombre";
                    const institution = reg?.athlete?.institution || reg?.team?.institution;
                    const photoUrl = reg?.athlete?.photoUrl;
                    const savedPos = savedRanksMap.get(standing.registrationId) ?? null;
                    // "Manual" badge: si hay dragOrder local o si hay rank guardado
                    const isManual = dragOrder !== null || savedPos !== null;

                    return (
                      <tr
                        key={standing.registrationId}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                        className={`
                          cursor-grab active:cursor-grabbing select-none transition-colors
                          ${overIdx === idx && dragIdx !== idx
                            ? "bg-teal-50 dark:bg-teal-950/20"
                            : dragIdx === idx
                            ? "opacity-40 bg-gray-50"
                            : "hover:bg-gray-50"}
                        `}
                      >
                        {/* Handle */}
                        <td className="px-3 py-3 text-center">
                          <GripVertical className="w-4 h-4 text-gray-400 mx-auto" />
                        </td>

                        {/* Posición */}
                        <td className="px-3 py-3 text-center">
                          <span className={`
                            inline-flex w-7 h-7 rounded-full items-center justify-center
                            text-xs font-bold
                            ${idx === 0
                              ? "bg-amber-400 text-white"
                              : idx === 1
                              ? "bg-gray-300 text-gray-800"
                              : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-gray-100 text-gray-500"}
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
                              {savedPos !== null && dragOrder === null && (
                                <span className="text-xs text-teal-600 font-medium">
                                  Guardado: {savedPos}°
                                </span>
                              )}
                              {dragOrder !== null && (
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

                        {/* Stats */}
                        <td className="px-3 py-3 text-center text-sm font-semibold text-gray-900">
                          {standing.points}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-medium text-green-600">
                          {standing.wins}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-medium text-red-500">
                          {standing.losses}
                        </td>
                        <td className={`px-3 py-3 text-center text-xs font-medium
                          ${standing.scoreDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {standing.scoreDiff > 0 ? "+" : ""}{standing.scoreDiff}
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
          disabled={setManualRanksMutation.isPending || orderedStandings.length === 0}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {setManualRanksMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}