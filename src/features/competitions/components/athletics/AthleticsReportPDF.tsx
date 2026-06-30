// src/features/competitions/components/athletics/AthleticsReportPDF.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  AthleticsCategoryData,
  AthleticsResultEntry,
  AthleticsEventGroup,
} from "../../api/athletics-results.queries";

// ── Tipos internos ─────────────────────────────────────────────────────────────
interface UniversityRank {
  university: string;
  universityAbrev: string;
  points: number;
}

// ── Paleta de colores ─────────────────────────────────────────────────────────
const C = {
  navy:       "#1a2e4a",
  blue:       "#1e4d8c",
  lightBlue:  "#2563eb",
  femaleBg:   "#fdf2f8",
  femaleHdr:  "#be185d",
  maleBg:     "#eff6ff",
  maleHdr:    "#1d4ed8",
  totalBg:    "#f0fdf4",
  totalHdr:   "#15803d",
  generalBg:  "#fef9c3",
  generalHdr: "#92400e",
  gold:       "#b45309",
  silver:     "#374151",
  bronze:     "#78350f",
  rowAlt:     "#f8fafc",
  border:     "#e2e8f0",
  body:       "#111827",
  muted:      "#6b7280",
  white:      "#ffffff",
  green:      "#15803d",
  rankBg:     "#f0fdf4",
};

const s = StyleSheet.create({
  page: {
    fontSize: 6,
    fontFamily: "Helvetica",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    // SIN orientation landscape → portrait por defecto
  },

  // ── Encabezado principal
  mainHeader: {
    backgroundColor: C.navy,
    borderRadius: 3,
    padding: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  mainTitle: {
    color: C.white,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },
  mainSubtitle: {
    color: "#93c5fd",
    fontSize: 6.5,
    marginTop: 2,
  },

  // ── Badge de categoría
  categoryHeader: {
    backgroundColor: C.lightBlue,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  categoryTitle: {
    color: C.white,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
  },

  // ── Sección de prueba
  eventBlock:  { marginBottom: 6 },
  eventHeader: {
    backgroundColor: C.blue,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRadius: 2,
    marginBottom: 2,
  },
  eventTitle: {
    color: C.white,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
  },

  // ── Columnas damas/varones
  columnsRow: { flexDirection: "row", gap: 4 },
  column:     { flex: 1 },

  // ── Sub-encabezado Damas / Varones
  colSubHeader: {
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    marginBottom: 1,
    borderRadius: 2,
  },
  colSubText: { fontSize: 6, fontFamily: "Helvetica-Bold" },

  // ── Cabecera de tabla
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 1.5,
    paddingHorizontal: 3,
  },
  thCell: { color: C.white, fontSize: 5, fontFamily: "Helvetica-Bold" },

  // ── Fila de resultado
  row:     { flexDirection: "row", paddingVertical: 1.5, paddingHorizontal: 3, borderBottomWidth: 0.3, borderBottomColor: C.border },
  rowAlt:  { backgroundColor: C.rowAlt },
  tdText:  { fontSize: 5.5, color: C.body },
  tdMuted: { fontSize: 5, color: C.muted },

  // ── Anchos de columna (resultados) — ajustados para portrait
  cPos:  { width: 18, textAlign: "center" },
  cName: { flex: 1 },
  cMark: { width: 30, textAlign: "right" },
  cPts:  { width: 12, textAlign: "right" },

  empty: { color: C.muted, fontSize: 6, textAlign: "center", paddingVertical: 6 },

  // ── Rankings página final
  rankingPageHeader: {
    backgroundColor: C.navy,
    borderRadius: 3,
    padding: 7,
    marginBottom: 8,
    alignItems: "center",
  },
  rankingPageTitle: {
    color: C.white,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
  },
  rankingPageSubtitle: {
    color: "#93c5fd",
    fontSize: 6,
    marginTop: 2,
  },

  // ── Grid 2 columnas
  rankGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 6 },
  rankGridCell: { width: "48.8%" },

  rankSectionTitle: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 2,
    marginBottom: 2,
  },
  rankSectionTitleText: {
    color: C.white,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
  },

  rankTableHead: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 1.5,
    paddingHorizontal: 3,
  },
  rankRow:    { flexDirection: "row", paddingVertical: 1.5, paddingHorizontal: 3, borderBottomWidth: 0.3, borderBottomColor: C.border },
  rankRowAlt: { backgroundColor: C.rowAlt },

  // Columnas ranking
  rPos:   { width: 14, textAlign: "center" },
  rAbrev: { width: 26, textAlign: "center" },
  rName:  { flex: 1 },
  rPts:   { width: 18, textAlign: "right" },

  divider: {
    height: 0.8,
    backgroundColor: C.border,
    marginVertical: 6,
  },

  // ── Cuadro de fórmula
  formulaBox: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#f0f4f8",
    borderRadius: 3,
    borderTopWidth: 2,
    borderTopColor: C.blue,
  },
  formulaTitle: { fontFamily: "Helvetica-Bold", fontSize: 6.5, marginBottom: 4 },
  formulaRow:   { flexDirection: "row", gap: 4 },
  formulaCol:   { flex: 1 },
  formulaColTitle: {
    backgroundColor: C.navy,
    color: C.white,
    fontSize: 5.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderRadius: 2,
    marginBottom: 2,
  },
  formulaTableHead: {
    flexDirection: "row",
    backgroundColor: "#94a3b8",
    paddingVertical: 1.5,
    paddingHorizontal: 3,
  },
  formulaEntry: {
    flexDirection: "row",
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    borderBottomWidth: 0.3,
    borderBottomColor: C.border,
  },
  fPos:  { flex: 1 },
    fMed:  { display: "none" },  
    fPts:  { width: 24, textAlign: "right" },

  fhText: { fontSize: 5, color: C.white, fontFamily: "Helvetica-Bold" },
  fdText: { fontSize: 5, color: C.body },
});

// ── Helpers — SIN emojis (no soportados por react-pdf) ───────────────────────
const medalLabel = (pos: number): string => {
  return `${pos}.`;
};

const posStyle = (pos: number): object => {
  if (pos === 1) return { color: C.gold,   fontFamily: "Helvetica-Bold" };
  if (pos === 2) return { color: C.silver, fontFamily: "Helvetica-Bold" };
  if (pos === 3) return { color: C.bronze, fontFamily: "Helvetica-Bold" };
  return {};
};

// ── Rankings ──────────────────────────────────────────────────────────────────
function buildUniversityRanking(
  events: AthleticsEventGroup[],
  gender: "female" | "male",
): UniversityRank[] {
  const map = new Map<string, UniversityRank>();
  for (const event of events) {
    const results = gender === "female" ? event.femaleResults : event.maleResults;
    for (const r of results) {
      if (!r.universityAbrev || r.points <= 0) continue;
      const existing = map.get(r.universityAbrev);
      if (existing) {
        existing.points += r.points;
      } else {
        map.set(r.universityAbrev, {
          university:      r.university,
          universityAbrev: r.universityAbrev,
          points:          r.points,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.points - a.points);
}

function mergeRankings(...rankings: UniversityRank[][]): UniversityRank[] {
  const map = new Map<string, UniversityRank>();
  for (const ranking of rankings) {
    for (const u of ranking) {
      const existing = map.get(u.universityAbrev);
      if (existing) {
        existing.points += u.points;
      } else {
        map.set(u.universityAbrev, { ...u });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.points - a.points);
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
function ResultColumn({
  results,
  label,
  bgColor,
  textColor,
}: {
  results: AthleticsResultEntry[];
  label: string;
  bgColor: string;
  textColor: string;
}) {
  const valid = results.filter((r) => r.position > 0);
  return (
    <View style={s.column}>
      <View style={[s.colSubHeader, { backgroundColor: bgColor }]}>
        <Text style={[s.colSubText, { color: textColor }]}>{label}</Text>
      </View>
      <View style={s.tableHead}>
        <Text style={[s.cPos,  s.thCell]}>Pos.</Text>
        <Text style={[s.cName, s.thCell]}>Atleta / Universidad</Text>
        <Text style={[s.cMark, s.thCell]}>Marca</Text>
        <Text style={[s.cPts,  s.thCell]}>Pts</Text>
      </View>
      {valid.length === 0 ? (
        <Text style={s.empty}>Sin resultados</Text>
      ) : (
        valid.map((r, i) => (
          <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]} wrap={false}>
            <Text style={[s.cPos, s.tdText, posStyle(r.position)]}>
              {`${r.position}.`}
            </Text>
            <View style={s.cName}>
              <Text style={[s.tdText, { fontFamily: r.position <= 3 ? "Helvetica-Bold" : "Helvetica" }]}>
                {r.athleteName}
              </Text>
              <Text style={s.tdMuted}>{r.universityAbrev} - {r.university}</Text>
            </View>
            <Text style={[s.cMark, s.tdText, { fontFamily: "Helvetica-Bold" }]}>
              {r.mark}{r.windSpeed ? ` (${r.windSpeed})` : ""}
            </Text>
            <Text style={[s.cPts, s.tdText, { color: r.points > 0 ? C.green : C.muted }]}>
              {r.points}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function EventSection({ event }: { event: AthleticsEventGroup }) {
  return (
    <View style={s.eventBlock} wrap={false}>
      <View style={s.eventHeader}>
        <Text style={s.eventTitle}>{event.eventName}</Text>
      </View>
      <View style={s.columnsRow}>
        <ResultColumn results={event.femaleResults} label="DAMAS"   bgColor={C.femaleBg} textColor={C.femaleHdr} />
        <ResultColumn results={event.maleResults}   label="VARONES" bgColor={C.maleBg}   textColor={C.maleHdr} />
      </View>
    </View>
  );
}

function RankingTable({
  title,
  ranking,
  accentColor,
  bgColor,
}: {
  title: string;
  ranking: UniversityRank[];
  accentColor: string;
  bgColor: string;
}) {
  return (
    <View>
      <View style={[s.rankSectionTitle, { backgroundColor: accentColor }]}>
        <Text style={s.rankSectionTitleText}>{title}</Text>
      </View>
      <View style={s.rankTableHead}>
        <Text style={[s.rPos,   s.thCell]}>Pos</Text>
        <Text style={[s.rAbrev, s.thCell]}>Abrev</Text>
        <Text style={[s.rName,  s.thCell]}>Universidad</Text>
        <Text style={[s.rPts,   s.thCell]}>Pts</Text>
      </View>
      {ranking.length === 0 ? (
        <Text style={s.empty}>Sin datos</Text>
      ) : (
        ranking.map((u, i) => (
          <View
            key={i}
            style={[
              s.rankRow,
              i % 2 === 1 ? s.rankRowAlt : {},
              i < 3 ? { backgroundColor: bgColor } : {},
            ]}
            wrap={false}
          >
            <Text style={[s.rPos, s.tdText, posStyle(i + 1)]}>
              {`${i + 1}.`}
            </Text>
            <Text style={[s.rAbrev, s.tdText, { fontFamily: i < 3 ? "Helvetica-Bold" : "Helvetica" }]}>
              {u.universityAbrev}
            </Text>
            <Text style={[s.rName, s.tdText]}>
              {u.university}
            </Text>
            <Text style={[s.rPts, s.tdText, { color: accentColor, fontFamily: "Helvetica-Bold" }]}>
              {u.points}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

// ── Cuadro de fórmula ─────────────────────────────────────────────────────────
const INDIVIDUAL_SCORES = [
  { pos: "1.",  pts: 10 },
  { pos: "2.",  pts: 8  },
  { pos: "3.",  pts: 6  },
  { pos: "4.",  pts: 5  },
  { pos: "5.",  pts: 4  },
  { pos: "6.",  pts: 3  },
  { pos: "7.",  pts: 2  },
  { pos: "8.",  pts: 1  },
  { pos: "9-10.", pts: 0 },
];

const RELAY_SCORES = [
  { pos: "1.",  pts: 20 },
  { pos: "2.",  pts: 16 },
  { pos: "3.",  pts: 12 },
  { pos: "4.",  pts: 10 },
  { pos: "5.",  pts: 8  },
  { pos: "6.",  pts: 6  },
  { pos: "7.",  pts: 4  },
  { pos: "8.",  pts: 2  },
  { pos: "9-10.", pts: 0 },
];

function FormulaTable({ title, rows }: { title: string; rows: { pos: string; pts: number }[] }) {
  return (
    <View style={s.formulaCol}>
      <Text style={s.formulaColTitle}>{title}</Text>
      <View style={s.formulaTableHead}>
        <Text style={[s.fPos, s.fhText]}>Puesto</Text>
        <Text style={[s.fPts, s.fhText]}>Puntos</Text>
      </View>
      {rows.map((r, i) => (
        <View key={i} style={[s.formulaEntry, i % 2 === 1 ? s.rankRowAlt : {}]}>
          <Text style={[s.fPos, s.fdText]}>{r.pos}</Text>
          <Text style={[s.fPts, s.fdText, { color: r.pts > 0 ? C.green : C.muted }]}>
            {r.pts}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Bloque por categoría ──────────────────────────────────────────────────────
function CategoryBlock({
  categoryData,
  isFirst,
}: {
  categoryData: AthleticsCategoryData;
  isFirst: boolean;
}) {
  return (
    <View break={!isFirst}>
      <View style={s.categoryHeader}>
        <Text style={s.categoryTitle}>
          CATEGORIA: {categoryData.category.toUpperCase()}
        </Text>
      </View>
      {categoryData.events.map((event, i) => (
        <EventSection key={i} event={event} />
      ))}
    </View>
  );
}

// ── Página de rankings ────────────────────────────────────────────────────────
function RankingsPage({ data }: { data: AthleticsCategoryData[] }) {
  const noveles   = data.find((d) => d.category.toLowerCase().includes("novel"))?.events ?? [];
  const avanzados = data.find((d) => d.category.toLowerCase().includes("avanz"))?.events ?? [];

  const rDamasNoveles      = buildUniversityRanking(noveles,   "female");
  const rVaronesNoveles    = buildUniversityRanking(noveles,   "male");
  const rDamasAvanzadas    = buildUniversityRanking(avanzados, "female");
  const rVaronesAvanzados  = buildUniversityRanking(avanzados, "male");

  const rTotalDamas     = mergeRankings(rDamasNoveles,   rDamasAvanzadas);
  const rTotalVarones   = mergeRankings(rVaronesNoveles, rVaronesAvanzados);
  const rTotalNoveles   = mergeRankings(rDamasNoveles,   rVaronesNoveles);
  const rTotalAvanzados = mergeRankings(rDamasAvanzadas, rVaronesAvanzados);
  const rGeneral        = mergeRankings(rTotalDamas,     rTotalVarones);

  return (
    <View break>
      <View style={s.rankingPageHeader}>
        <Text style={s.rankingPageTitle}>PUNTAJE ACUMULADO POR UNIVERSIDAD</Text>
        <Text style={s.rankingPageSubtitle}>
          Rankings consolidados al final del evento
        </Text>
      </View>

      {/* Fila 1: Damas Noveles + Varones Noveles */}
      <View style={s.rankGrid}>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE DAMAS NOVELES"     ranking={rDamasNoveles}     accentColor={C.femaleHdr} bgColor={C.femaleBg} />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE VARONES NOVELES"   ranking={rVaronesNoveles}   accentColor={C.maleHdr}   bgColor={C.maleBg}   />
        </View>

        {/* Fila 2: Damas Avanzadas + Varones Avanzados */}
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE DAMAS AVANZADAS"   ranking={rDamasAvanzadas}   accentColor={C.femaleHdr} bgColor={C.femaleBg} />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE VARONES AVANZADOS" ranking={rVaronesAvanzados} accentColor={C.maleHdr}   bgColor={C.maleBg}   />
        </View>
      </View>

      <View style={s.divider} />

      {/* Fila 3: Total Damas + Total Varones */}
      <View style={s.rankGrid}>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL DAMAS"       ranking={rTotalDamas}       accentColor={C.femaleHdr}  bgColor={C.femaleBg} />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL VARONES"     ranking={rTotalVarones}     accentColor={C.maleHdr}    bgColor={C.maleBg}   />
        </View>

        {/* Fila 4: Total Noveles + Total Avanzados */}
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL NOVELES"     ranking={rTotalNoveles}     accentColor={C.lightBlue}  bgColor={C.maleBg}   />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL AVANZADOS"   ranking={rTotalAvanzados}   accentColor={C.lightBlue}  bgColor={C.maleBg}   />
        </View>
      </View>

      <View style={s.divider} />

      {/* Puntaje General — ancho completo */}
      <View style={{ marginBottom: 8 }}>
        <RankingTable
          title="*** PUNTAJE GENERAL ***"
          ranking={rGeneral}
          accentColor={C.generalHdr}
          bgColor={C.generalBg}
        />
      </View>

      {/* Cuadro de fórmula */}
      <View style={s.formulaBox} wrap={false}>
        <Text style={s.formulaTitle}>CUADRO DE FORMULA DE PUNTAJE</Text>
        <View style={s.formulaRow}>
          <FormulaTable title="PRUEBAS INDIVIDUALES"          rows={INDIVIDUAL_SCORES} />
          <FormulaTable title="PRUEBAS COMBINADAS Y RELEVOS"  rows={RELAY_SCORES}      />
        </View>
      </View>
    </View>
  );
}

// ── Documento principal ───────────────────────────────────────────────────────
interface Props {
  data: AthleticsCategoryData[];
  eventName?: string;
}

export function AthleticsReportPDF({ data, eventName }: Props) {
  return (
    <Document
      title={`Atletismo - ${eventName ?? ""} - Todas las categorias`}
      author="Sistema FEDUP"
    >
      {/* ✅ Sin orientation="landscape" → A4 portrait */}
      <Page size="A4" style={s.page}>

        <View style={s.mainHeader}>
          <Text style={s.mainTitle}>
            RESULTADOS DE ATLETISMO{eventName ? ` - ${eventName.toUpperCase()}` : ""}
          </Text>
          <Text style={s.mainSubtitle}>
            Todas las categorias · {data.map((d) => d.category).join(" / ")}
          </Text>
        </View>

        {data.map((categoryData, i) => (
          <CategoryBlock key={i} categoryData={categoryData} isFirst={i === 0} />
        ))}

        <RankingsPage data={data} />

      </Page>
    </Document>
  );
}