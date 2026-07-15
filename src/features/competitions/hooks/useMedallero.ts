import { useMemo } from "react";
import type { Phase, Match } from "@/features/competitions/types";
import type { TaekwondoType, WushuType } from "@/features/events/pages/category/hooks/useSportDetection";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type MedalType = "gold" | "silver" | "bronze";

export interface MedalEntry {
  registrationId: number;
  name: string;
  institution?: string;
  logoUrl?: string;
  medal: MedalType;
}

interface UseMedalleroOptions {
  phases: Phase[];
  matches: Match[];
  taekwondoType: TaekwondoType | null;
  wushuType: WushuType | null;
  isJudo: boolean;
  isKarate: boolean;
  isTennis: boolean;
  isTableTennis: boolean;
  isWrestling: boolean;
}

// ─── Helper: extraer info de participante desde un match ─────────────────────

function getParticipantInfo(
  match: Match,
  registrationId: number,
): Omit<MedalEntry, "medal"> {
  const participation = match.participations?.find(
    (p) => p.registrationId === registrationId,
  );
  const reg = participation?.registration;
  return {
    registrationId,
    name: reg?.athlete?.name ?? reg?.team?.name ?? "Desconocido",
    institution:
      reg?.athlete?.institution?.name ?? reg?.team?.institution?.name,
    logoUrl:
      reg?.athlete?.institution?.logoUrl ?? reg?.team?.institution?.logoUrl,
  };
}

// ─── Helper: detectar la final (partido con número más alto en fase eliminación) ─

function findFinalMatch(elimMatches: Match[]): Match | undefined {
  const finished = elimMatches.filter((m) => m.status === "finalizado");
  if (finished.length === 0) return undefined;

  // Intentar detectar por round name
  const byRound = finished.find(
    (m) =>
      m.round?.toLowerCase().includes("final") &&
      !m.round?.toLowerCase().includes("semi") &&
      !m.round?.toLowerCase().includes("cuarto") &&
      !m.round?.toLowerCase().includes("1/4") &&
      !m.round?.toLowerCase().includes("1/8"),
  );
  if (byRound) return byRound;

  // Fallback: el partido con matchNumber más alto
  return finished.sort((a, b) => (b.matchNumber ?? 0) - (a.matchNumber ?? 0))[0];
}

// ─── Helper: detectar semifinales ────────────────────────────────────────────

function findSemiFinalMatches(elimMatches: Match[]): Match[] {
  const finished = elimMatches.filter((m) => m.status === "finalizado");
  return finished.filter(
    (m) =>
      m.round?.toLowerCase().includes("semi") ||
      m.round?.toLowerCase().includes("4tos") ||
      m.round?.toLowerCase().includes("semifinal"),
  );
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useMedallero(opts: UseMedalleroOptions): MedalEntry[] {
  const {
    phases,
    matches,
    taekwondoType,
    wushuType,
    isJudo,
    isKarate,
    isTennis,
    isTableTennis,
    isWrestling,
  } = opts;

  return useMemo(() => {
    // ── Deportes de bracket (combate / eliminación directa) ──────────────────
    const isBracketSport =
      taekwondoType === "kyorugui" ||
      wushuType === "sanda" ||
      isJudo ||
      isKarate ||
      isWrestling ||
      (isTennis && !isTableTennis);

    if (isBracketSport) {
      const elimPhase = phases.find((p) => p.type === "eliminacion");
      if (!elimPhase) return [];

      const elimMatches = matches.filter(
        (m) => m.phaseId === elimPhase.phaseId,
      );

      const finalMatch = findFinalMatch(elimMatches);
      if (!finalMatch?.winnerRegistrationId) return [];

      const goldRegId = finalMatch.winnerRegistrationId;
      const silverRegId = finalMatch.participations?.find(
        (p) => p.registrationId !== goldRegId,
      )?.registrationId;

      const medals: MedalEntry[] = [
        { ...getParticipantInfo(finalMatch, goldRegId), medal: "gold" },
      ];
      if (silverRegId) {
        medals.push({
          ...getParticipantInfo(finalMatch, silverRegId),
          medal: "silver",
        });
      }

      // ── Bronces: repechaje (Judo / Karate / Lucha) o semifinales ────────
      const repPhase = phases.find((p) => p.type === "repechaje");

      if (repPhase) {
        // Judo, Karate, Lucha: bronce = ganador de cada partido de repechaje
        const repMatches = matches.filter(
          (m) =>
            m.phaseId === repPhase.phaseId && m.status === "finalizado",
        );
        repMatches.forEach((m) => {
          if (m.winnerRegistrationId) {
            medals.push({
              ...getParticipantInfo(m, m.winnerRegistrationId),
              medal: "bronze",
            });
          }
        });
      } else {
        // Taekwondo Kyorugui / Wushu Sanda / Tenis / Wrestling sin repechaje:
        // bronce = perdedores de semifinal
        const semis = findSemiFinalMatches(elimMatches);
        semis.forEach((m) => {
          const loserRegId = m.participations?.find(
            (p) => p.registrationId !== m.winnerRegistrationId,
          )?.registrationId;
          if (loserRegId) {
            medals.push({
              ...getParticipantInfo(m, loserRegId),
              medal: "bronze",
            });
          }
        });
      }

      return medals;
    }

    // ── Deportes de puntaje: Poomsae y Wushu Taolu ──────────────────────────
    // Usan participant1Score / participant2Score en matches de fase grupo
    const isScoreSport =
      taekwondoType === "poomsae" || wushuType === "taolu";

    if (isScoreSport) {
      type ScoredEntry = {
        registrationId: number;
        score: number;
        match: Match;
      };

      const scored: ScoredEntry[] = [];

      matches
        .filter((m) => m.status === "finalizado")
        .forEach((m) => {
          const parts = m.participations ?? [];

          const p1 =
            parts.find((p) => p.corner === "blue" || p.corner === "A") ??
            parts[0];
          const p2 =
            parts.find((p) => p.corner === "white" || p.corner === "B") ??
            parts[1];

          if (p1?.registrationId && m.participant1Score != null) {
            scored.push({
              registrationId: p1.registrationId,
              score: m.participant1Score,
              match: m,
            });
          }
          if (p2?.registrationId && m.participant2Score != null) {
            scored.push({
              registrationId: p2.registrationId,
              score: m.participant2Score,
              match: m,
            });
          }
        });

      // Deduplicar: quedarse con el mayor score por registrationId
      const byReg = new Map<number, ScoredEntry>();
      scored.forEach((s) => {
        const existing = byReg.get(s.registrationId);
        if (!existing || s.score > existing.score) {
          byReg.set(s.registrationId, s);
        }
      });

      const sorted = [...byReg.values()].sort((a, b) => b.score - a.score);

      return sorted.slice(0, 3).map((entry, idx) => ({
        ...getParticipantInfo(entry.match, entry.registrationId),
        medal: (["gold", "silver", "bronze"] as const)[idx],
      }));
    }

    return [];
  }, [
    phases,
    matches,
    taekwondoType,
    wushuType,
    isJudo,
    isKarate,
    isTennis,
    isTableTennis,
    isWrestling,
  ]);
}