export type CombinedEventTableType = "pista" | "distancia" | "altura";

export interface CombinedEventDraft {
  id: string;
  name: string;
  tableType: CombinedEventTableType;
  enabled: boolean;
}

export const DECATHLON_DEFAULTS: CombinedEventDraft[] = [
  { id: "dec_100m", name: "100m", tableType: "pista", enabled: true },
  { id: "dec_lj", name: "Salto largo", tableType: "distancia", enabled: true },
  {
    id: "dec_sp",
    name: "Lanzamiento de bala",
    tableType: "distancia",
    enabled: true,
  },
  { id: "dec_hj", name: "Salto alto", tableType: "altura", enabled: true },
  { id: "dec_400m", name: "400m", tableType: "pista", enabled: true },
  { id: "dec_110h", name: "110m vallas", tableType: "pista", enabled: true },
  {
    id: "dec_disc",
    name: "Lanzamiento de disco",
    tableType: "distancia",
    enabled: true,
  },
  {
    id: "dec_pv",
    name: "Salto con garrocha",
    tableType: "altura",
    enabled: true,
  },
  {
    id: "dec_jav",
    name: "Lanzamiento de jabalina",
    tableType: "distancia",
    enabled: true,
  },
  { id: "dec_1500m", name: "1500m", tableType: "pista", enabled: true },
];

export const HEPTATHLON_DEFAULTS: CombinedEventDraft[] = [
  { id: "hep_100h", name: "100m vallas", tableType: "pista", enabled: true },
  { id: "hep_hj", name: "Salto alto", tableType: "altura", enabled: true },
  {
    id: "hep_sp",
    name: "Lanzamiento de bala",
    tableType: "distancia",
    enabled: true,
  },
  { id: "hep_200m", name: "200m", tableType: "pista", enabled: true },
  { id: "hep_lj", name: "Salto largo", tableType: "distancia", enabled: true },
  {
    id: "hep_jav",
    name: "Lanzamiento de jabalina",
    tableType: "distancia",
    enabled: true,
  },
  { id: "hep_800m", name: "800m", tableType: "pista", enabled: true },
];
