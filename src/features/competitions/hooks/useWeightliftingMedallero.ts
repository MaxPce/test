import { useMemo } from "react";
import { useWeightliftingPhaseResults } from "../api/weightlifting.queries";
import type { MedalEntry } from "./useMedallero";

/**
 * Deriva el medallero de levantamiento de pesas a partir de los resultados
 * de una fase. Si hay divisiones (weightClass), retorna top-3 por división.
 * Si no hay divisiones, retorna top-3 global.
 *
 * Usa el campo `rank` calculado por el backend cuando está disponible;
 * si no, ordena por `total` descendente.
 */
export function useWeightliftingMedallero(
  phaseId: number | undefined,
): MedalEntry[] {
  const { data: results = [] } = useWeightliftingPhaseResults(phaseId ?? 0);

  return useMemo(() => {
    if (!phaseId || results.length === 0) return [];

    const medals: MedalEntry[] = [];
    const MEDAL_TYPES = ["gold", "silver", "bronze"] as const;

    // ── Detectar si hay divisiones ──────────────────────────────────────────
    const hasDivisions = results.some(
      (r) => r.participation?.registration?.weightClass,
    );

    const buildMedalsFromGroup = (
      group: typeof results,
    ): MedalEntry[] => {
      // Ordenar: primero por rank si existe, luego por total descendente
      const sorted = [...group]
        .filter((r) => r.total != null || r.rank != null)
        .sort((a, b) => {
          if (a.rank != null && b.rank != null) return a.rank - b.rank;
          return (b.total ?? 0) - (a.total ?? 0);
        });

      return sorted.slice(0, 3).map((r, idx) => ({
        registrationId:
          r.participation.registration?.registrationId ??
          r.participation.registrationId ??
          0,
        name:
          r.participation.registration?.athlete?.name ??
          r.participation.registration?.team?.name ??
          "Desconocido",
        institution:
          r.participation.registration?.athlete?.institution?.name ??
          r.participation.registration?.team?.institution?.name,
        logoUrl:
          r.participation.registration?.athlete?.institution?.logoUrl ??
          r.participation.registration?.team?.institution?.logoUrl ??
          undefined,
        medal: MEDAL_TYPES[idx],
      }));
    };

    if (hasDivisions) {
      // Agrupar por weightClass y generar top-3 por cada división
      const groups = new Map<string, typeof results>();
      results.forEach((r) => {
        const div = r.participation?.registration?.weightClass ?? "Sin división";
        if (!groups.has(div)) groups.set(div, []);
        groups.get(div)!.push(r);
      });
      groups.forEach((group) => {
        medals.push(...buildMedalsFromGroup(group));
      });
    } else {
      medals.push(...buildMedalsFromGroup(results));
    }

    return medals;
  }, [phaseId, results]);
}