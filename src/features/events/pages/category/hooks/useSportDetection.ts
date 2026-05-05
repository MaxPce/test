import { useMemo } from "react";
import type { EventCategory } from "../../../types";
import type { Phase } from "@/features/competitions/types";
import type { FieldEventType } from "@/features/competitions/types/athletics.types";

// ─── Tipos exportados ────────────────────────────────────────────────────────

export type TaekwondoType = "poomsae" | "kyorugui";
export type WushuType = "taolu" | "sanda";
export type CombinedType = "heptatlon" | "decatlon";

export interface SportDetection {
  // Nombre raw (conveniente para derivaciones en consumers)
  sportName: string;

  // Booleanos de deporte
  isTableTennis: boolean;
  isJudo: boolean;
  isKarate: boolean;
  isWushu: boolean;
  isWrestling: boolean;
  isCollectiveSport: boolean;
  isWeightlifting: boolean;
  isAtletismo: boolean;
  isTimedSport: boolean;
  isTiroDeportivo: boolean;
  isClimbing: boolean;
  isChess: boolean;
  isCombined: boolean;

  // Getters con lógica derivada
  getTaekwondoType: (selectedPhase?: Phase | null) => TaekwondoType | null;
  getWushuType: () => WushuType | null;
  getCombinedType: () => CombinedType | null;
  getFieldEventTypeFromName: (phase: Phase) => FieldEventType;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSportDetection(eventCategory: EventCategory): SportDetection {
  // Calculamos sportName una sola vez — todos los booleanos lo consumen
  const sportName = useMemo(
    () => eventCategory.category?.sport?.name?.toLowerCase() ?? "",
    [eventCategory.category?.sport?.name],
  );

  const categoryName = useMemo(
    () => eventCategory.category?.name?.toLowerCase() ?? "",
    [eventCategory.category?.name],
  );

  const resultType = eventCategory.category?.resultType;

  // ── Booleanos simples ──────────────────────────────────────────────────────

  const isTableTennis = useMemo(
    () =>
      sportName.includes("tenis de mesa") ||
      sportName.includes("tennis de mesa") ||
      sportName.includes("ping pong") ||
      sportName.includes("table tennis"),
    [sportName],
  );

  const isJudo = useMemo(() => sportName.includes("judo"), [sportName]);

  const isKarate = useMemo(() => sportName.includes("karate"), [sportName]);

  const isWushu = useMemo(() => sportName.includes("wushu"), [sportName]);

  const isWrestling = useMemo(
    () =>
      sportName.includes("lucha olímpica") ||
      sportName.includes("lucha olimpica"),
    [sportName],
  );

  const isCollectiveSport = useMemo(
    () =>
      sportName.includes("fútbol") ||
      sportName.includes("futbol") ||
      sportName.includes("futsal") ||
      sportName.includes("basquetbol") ||
      sportName.includes("básquetbol") ||
      sportName.includes("basketball") ||
      sportName.includes("voleybol") ||
      sportName.includes("voleibol") ||
      sportName.includes("volleyball") ||
      sportName.includes("rugby"),
    [sportName],
  );

  const isWeightlifting = useMemo(
    () =>
      sportName.includes("halterofilia") ||
      sportName.includes("weightlifting") ||
      sportName.includes("levantamiento de pesas"),
    [sportName],
  );

  const isAtletismo = useMemo(
    () => sportName.includes("atletismo"),
    [sportName],
  );

  const isTimedSport = useMemo(
    () =>
      sportName.includes("natación") ||
      sportName.includes("natacion") ||
      sportName.includes("ciclismo"),
    [sportName],
  );

  const isTiroDeportivo = useMemo(
    () =>
      sportName.includes("tiro deportivo") ||
      sportName.includes("tiro al blanco") ||
      sportName.includes("shooting"),
    [sportName],
  );

  const isClimbing = useMemo(
    () =>
      sportName.includes("escalada") ||
      sportName.includes("climbing") ||
      sportName.includes("boulder"),
    [sportName],
  );

  const isChess = useMemo(
    () => sportName.includes("ajedrez") || sportName.includes("chess"),
    [sportName],
  );

  // ── Getters con lógica derivada ───────────────────────────────────────────

  const getCombinedType = (): CombinedType | null => {
    if (
      categoryName.includes("heptatlón") ||
      categoryName.includes("heptatlon") ||
      categoryName.includes("heptathlon")
    )
      return "heptatlon";

    if (
      categoryName.includes("decatlón") ||
      categoryName.includes("decatlon") ||
      categoryName.includes("decathlon")
    )
      return "decatlon";

    return null;
  };

  const isCombined = getCombinedType() !== null;

  /**
   * Recibe la fase seleccionada como parámetro porque el tipo kyorugui
   * puede derivarse del tipo de fase cuando no hay resultType ni nombre claro.
   */
  const getTaekwondoType = (
    selectedPhase?: Phase | null,
  ): TaekwondoType | null => {
    if (!sportName.includes("taekwondo")) return null;

    if (resultType === "score") return "poomsae";
    if (resultType === "combat") return "kyorugui";

    if (categoryName.includes("poomsae") || categoryName.includes("forma"))
      return "poomsae";
    if (categoryName.includes("kyorugi") || categoryName.includes("combate"))
      return "kyorugui";

    if (
      selectedPhase?.type === "eliminacion" ||
      selectedPhase?.type === "grupo"
    )
      return "kyorugui";

    return null;
  };

  const getWushuType = (): WushuType | null => {
    if (!sportName.includes("wushu")) return null;

    if (resultType === "score") return "taolu";
    if (resultType === "combat") {
      // Detectar Taolu por nombre aunque tenga result_type = 'combat'
      const taoluKeywords = [
        "changquan", "chang quan", "nanquan", "nan quan",
        "daoshu", "jianshu", "jiashu", "nandao", "qiangshu",
        "gunshu", "nangun", "taijiquan", "taijijian", "tai qi",
        "tai qui", "duilian", "jiti", "tradicional",
        "taolu", "forma",
      ];
      if (taoluKeywords.some((kw) => categoryName.includes(kw))) return "taolu";
      return "sanda";
    }

    if (categoryName.includes("taolu") || categoryName.includes("forma"))
      return "taolu";

    return "sanda";
  };

  const getFieldEventTypeFromName = (phase: Phase): FieldEventType => {
    const n = phase.name.toLowerCase();
    if (n.includes("garrocha") || n.includes("pértiga")) return "pole_vault";
    if (n.includes("salto alto")) return "high_jump";
    if (n.includes("triple")) return "triple_jump";
    if (n.includes("salto largo")) return "long_jump";
    if (n.includes("bala")) return "shot_put";
    if (n.includes("disco")) return "discus";
    if (n.includes("jabalina")) return "javelin";
    if (n.includes("martillo")) return "hammer";
    return "long_jump"; // fallback
  };

  return {
    sportName,
    isTableTennis,
    isJudo,
    isKarate,
    isWushu,
    isWrestling,
    isCollectiveSport,
    isWeightlifting,
    isAtletismo,
    isTimedSport,
    isTiroDeportivo,
    isClimbing,
    isChess,
    isCombined,
    getTaekwondoType,
    getWushuType,
    getCombinedType,
    getFieldEventTypeFromName,
  };
}