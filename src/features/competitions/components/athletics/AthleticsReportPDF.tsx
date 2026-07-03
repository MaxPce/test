// src/features/competitions/components/athletics/AthleticsReportPDF.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  AthleticsCategoryData,
  AthleticsResultEntry,
  AthleticsEventGroup,
  ParticipatingInstitution,
  CombinedAthleteRow,
} from "../../api/athletics-results.queries";
import { calcIaafPoints } from "../../utils/iaaf-points.utils";


const COMBINED_RANK_POINTS: Record<number, number> = {
  1: 20, 2: 16, 3: 12, 4: 10, 5: 8, 6: 6, 7: 4, 8: 2,
};

interface UniversityRank {
  university: string;
  universityAbrev: string;
  points: number;
}

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
  },
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
  columnsRow: { flexDirection: "row", gap: 4 },
  column:     { flex: 1 },
  colSubHeader: {
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    marginBottom: 1,
    borderRadius: 2,
  },
  colSubText: { fontSize: 6, fontFamily: "Helvetica-Bold" },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 1.5,
    paddingHorizontal: 3,
  },
  thCell: { color: C.white, fontSize: 5, fontFamily: "Helvetica-Bold" },
  row:     { flexDirection: "row", paddingVertical: 1.5, paddingHorizontal: 3, borderBottomWidth: 0.3, borderBottomColor: C.border },
  rowAlt:  { backgroundColor: C.rowAlt },
  tdText:  { fontSize: 5.5, color: C.body },
  tdMuted: { fontSize: 5, color: C.muted },
  cPos:  { width: 18, textAlign: "center" },
  cName: { flex: 1 },
  cMark: { width: 30, textAlign: "right" },
  cPts:  { width: 12, textAlign: "right" },
  empty: { color: C.muted, fontSize: 6, textAlign: "center", paddingVertical: 6 },
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
  rPos:   { width: 14, textAlign: "center" },
  rAbrev: { width: 26, textAlign: "center" },
  rName:  { flex: 1 },
  rPts:   { width: 18, textAlign: "right" },
  divider: {
    height: 0.8,
    backgroundColor: C.border,
    marginVertical: 6,
  },
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
  fPos: { flex: 1 },
  fMed: { display: "none" },
  fPts: { width: 24, textAlign: "right" },
  fhText: { fontSize: 5, color: C.white, fontFamily: "Helvetica-Bold" },
  fdText: { fontSize: 5, color: C.body },
});

const posStyle = (pos: number): object => {
  if (pos === 1) return { color: C.gold,   fontFamily: "Helvetica-Bold" };
  if (pos === 2) return { color: C.silver, fontFamily: "Helvetica-Bold" };
  if (pos === 3) return { color: C.bronze, fontFamily: "Helvetica-Bold" };
  return {};
};

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

function buildCombinedUniversityRanking(
  athletes: CombinedAthleteRow[],
): UniversityRank[] {
  const map = new Map<string, UniversityRank>();
  const sorted = [...athletes]
    .map((a) => ({
      ...a,
      _pts:
        a.totalIaafPoints > 0
          ? a.totalIaafPoints
          : a.subResults.reduce(
              (sum, sub) => sum + calcIaafPoints(sub.mark, sub.subEventName, a.gender),
              0,
            ),
    }))
    .sort((a, b) => b._pts - a._pts)
    .map((a, i) => ({ ...a, rank: i + 1 }));

  for (const a of sorted) {
    const abrev = a.institutionAbrev ?? a.institutionName;
    const rankPts = COMBINED_RANK_POINTS[a.rank] ?? 0;
    if (rankPts <= 0) continue;
    const existing = map.get(abrev);
    if (existing) {
      existing.points += rankPts;
    } else {
      map.set(abrev, {
        university:      a.institutionName,
        universityAbrev: abrev,
        points:          rankPts,
      });
    }
  }
  return Array.from(map.values());
}

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
              i < 3 && u.points > 0 ? { backgroundColor: bgColor } : {},
            ]}
            wrap={false}
          >
            <Text style={[s.rPos, s.tdText, u.points > 0 ? posStyle(i + 1) : {}]}>
              {u.points > 0 ? `${i + 1}.` : "-"}
            </Text>
            <Text style={[s.rAbrev, s.tdText, { fontFamily: i < 3 && u.points > 0 ? "Helvetica-Bold" : "Helvetica" }]}>
              {u.universityAbrev}
            </Text>
            <Text style={[s.rName, s.tdText]}>
              {u.university}
            </Text>
            <Text style={[s.rPts, s.tdText, { color: u.points > 0 ? accentColor : C.muted, fontFamily: "Helvetica-Bold" }]}>
              {u.points > 0 ? u.points : "-"}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const INDIVIDUAL_SCORES = [
  { pos: "1.",    pts: 10 },
  { pos: "2.",    pts: 8  },
  { pos: "3.",    pts: 6  },
  { pos: "4.",    pts: 5  },
  { pos: "5.",    pts: 4  },
  { pos: "6.",    pts: 3  },
  { pos: "7.",    pts: 2  },
  { pos: "8.",    pts: 1  },
  { pos: "9-10.", pts: 0  },
];

const RELAY_SCORES = [
  { pos: "1.",    pts: 20 },
  { pos: "2.",    pts: 16 },
  { pos: "3.",    pts: 12 },
  { pos: "4.",    pts: 10 },
  { pos: "5.",    pts: 8  },
  { pos: "6.",    pts: 6  },
  { pos: "7.",    pts: 4  },
  { pos: "8.",    pts: 2  },
  { pos: "9-10.", pts: 0  },
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

function CombinedSection({
  label,
  athletes,
}: {
  label: string;
  athletes: CombinedAthleteRow[];
}) {
  if (!athletes.length) return null;

  const withPts = athletes
    .map((a) => ({
      ...a,
      _computedPts:
        a.totalIaafPoints > 0
          ? a.totalIaafPoints
          : a.subResults.reduce(
              (sum, sub) => sum + calcIaafPoints(sub.mark, sub.subEventName, a.gender),
              0,
            ),
    }))
    .sort((a, b) => b._computedPts - a._computedPts)
    .map((a, i) => ({ ...a, rank: i + 1 }));

  return (
    <View style={s.eventBlock} wrap={false}>
      <View style={[s.eventHeader, { backgroundColor: "#92400e" }]}>
        <Text style={s.eventTitle}>{label.toUpperCase()}</Text>
      </View>
      <View style={s.tableHead}>
        <Text style={[s.cPos,  s.thCell]}>Pos.</Text>
        <Text style={[s.cName, s.thCell]}>Atleta / Universidad</Text>
        <Text style={[s.cMark, s.thCell]}>Pts IAAF</Text>
        <Text style={[s.cPts,  s.thCell]}>Pts rank.</Text>
      </View>
      {withPts.map((a, i) => {
        const rankPts = COMBINED_RANK_POINTS[a.rank] ?? 0;
        return (
          <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]} wrap={false}>
            <Text style={[s.cPos, s.tdText, posStyle(a.rank)]}>
              {`${a.rank}.`}
            </Text>
            <View style={s.cName}>
              <Text style={[s.tdText, { fontFamily: a.rank <= 3 ? "Helvetica-Bold" : "Helvetica" }]}>
                {a.athleteName}
              </Text>
              <Text style={s.tdMuted}>
                {a.institutionAbrev ?? a.institutionName}
              </Text>
            </View>
            <Text style={[s.cMark, s.tdText, { fontFamily: "Helvetica-Bold", color: "#b45309" }]}>
              {a._computedPts > 0 ? a._computedPts.toLocaleString() : "—"}
            </Text>
            <Text style={[s.cPts, s.tdText, { color: rankPts > 0 ? C.green : C.muted, fontFamily: "Helvetica-Bold" }]}>
              {rankPts > 0 ? rankPts : "—"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

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

function RankingsPage({
  data,
  participatingInstitutions = [],
  combinedRankings,
}: {
  data: AthleticsCategoryData[];
  participatingInstitutions?: ParticipatingInstitution[];
  combinedRankings?: {          
    heptatlon?: CombinedAthleteRow[];
    decatlon?: CombinedAthleteRow[];
  };

}) {
  const noveles   = data.find((d) => d.category.toLowerCase().includes("novel"))?.events ?? [];
  const avanzados = data.find((d) => d.category.toLowerCase().includes("avanz"))?.events ?? [];

  const rDamasNoveles     = buildUniversityRanking(noveles,   "female");
  const rVaronesNoveles   = buildUniversityRanking(noveles,   "male");
  const rDamasAvanzadas   = buildUniversityRanking(avanzados, "female");
  const rVaronesAvanzados = buildUniversityRanking(avanzados, "male");

  const rTotalDamas     = mergeRankings(rDamasNoveles,   rDamasAvanzadas);
  const rTotalVarones   = mergeRankings(rVaronesNoveles, rVaronesAvanzados);
  const rTotalNoveles   = mergeRankings(rDamasNoveles,   rVaronesNoveles);
  const rTotalAvanzados = mergeRankings(rDamasAvanzadas, rVaronesAvanzados);
  const rGeneralBase = mergeRankings(rTotalDamas, rTotalVarones);

  const allCombined = [
    ...(combinedRankings?.heptatlon ?? []),
    ...(combinedRankings?.decatlon  ?? []),
  ];
  const rCombined = buildCombinedUniversityRanking(allCombined);
  const rGeneralConCombined = mergeRankings(rGeneralBase, rCombined);

  const scoredAbrevs = new Set(rGeneralBase.map((u) => u.universityAbrev));
  const zeroInstitutions: UniversityRank[] = participatingInstitutions
    .filter((p) => p.institutionAbrev && !scoredAbrevs.has(p.institutionAbrev ?? ""))
    .map((p) => ({
      university:      p.institutionName,
      universityAbrev: p.institutionAbrev ?? p.institutionName,
      points:          0,
    }));
  const rGeneral = [...rGeneralConCombined, ...zeroInstitutions];


  return (
    <View break>
      <View style={s.rankingPageHeader}>
        <Text style={s.rankingPageTitle}>PUNTAJE ACUMULADO POR UNIVERSIDAD</Text>
        <Text style={s.rankingPageSubtitle}>
          Rankings consolidados al final del evento
        </Text>
      </View>

      <View style={s.rankGrid}>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE DAMAS NOVELES"     ranking={rDamasNoveles}     accentColor={C.femaleHdr} bgColor={C.femaleBg} />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE VARONES NOVELES"   ranking={rVaronesNoveles}   accentColor={C.maleHdr}   bgColor={C.maleBg}   />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE DAMAS AVANZADAS"   ranking={rDamasAvanzadas}   accentColor={C.femaleHdr} bgColor={C.femaleBg} />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE VARONES AVANZADOS" ranking={rVaronesAvanzados} accentColor={C.maleHdr}   bgColor={C.maleBg}   />
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.rankGrid}>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL DAMAS"     ranking={rTotalDamas}     accentColor={C.femaleHdr} bgColor={C.femaleBg} />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL VARONES"   ranking={rTotalVarones}   accentColor={C.maleHdr}   bgColor={C.maleBg}   />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL NOVELES"   ranking={rTotalNoveles}   accentColor={C.lightBlue} bgColor={C.maleBg}   />
        </View>
        <View style={s.rankGridCell}>
          <RankingTable title="PUNTAJE TOTAL AVANZADOS" ranking={rTotalAvanzados} accentColor={C.lightBlue} bgColor={C.maleBg}   />
        </View>
      </View>

      <View style={s.divider} />

      <View style={{ marginBottom: 8 }}>
        <RankingTable
          title="*** PUNTAJE GENERAL ***"
          ranking={rGeneral}
          accentColor={C.generalHdr}
          bgColor={C.generalBg}
        />
      </View>

      <View style={s.formulaBox} wrap={false}>
        <Text style={s.formulaTitle}>CUADRO DE FORMULA DE PUNTAJE</Text>
        <View style={s.formulaRow}>
          <FormulaTable title="PRUEBAS INDIVIDUALES"         rows={INDIVIDUAL_SCORES} />
          <FormulaTable title="PRUEBAS COMBINADAS Y RELEVOS" rows={RELAY_SCORES}      />
        </View>
      </View>
    </View>
  );
}

interface Props {
  data: AthleticsCategoryData[];
  eventName?: string;
  participatingInstitutions?: ParticipatingInstitution[];
  combinedRankings?: {          
    heptatlon?: CombinedAthleteRow[];
    decatlon?: CombinedAthleteRow[];
  };
}


export function AthleticsReportPDF({ data, eventName, participatingInstitutions, combinedRankings }: Props) {
  const heptatlon = combinedRankings?.heptatlon ?? [];
  const decatlon  = combinedRankings?.decatlon  ?? [];
  const hasCombined = heptatlon.length > 0 || decatlon.length > 0;

  return (
    <Document
      title={`Atletismo - ${eventName ?? ""} - Todas las categorias`}
      author="Sistema FEDUP"
    >
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

        {/* ── SECCIÓN COMBINADAS (nueva) ───────────────────────── */}
        {hasCombined && (
          <View break>
            <View style={s.categoryHeader}>
              <Text style={s.categoryTitle}>PRUEBAS COMBINADAS</Text>
            </View>
            <CombinedSection label="Heptatlón" athletes={heptatlon} />
            <CombinedSection label="Decatlón"  athletes={decatlon}  />
          </View>
        )}

        <RankingsPage
            data={data}
            participatingInstitutions={participatingInstitutions}
            combinedRankings={combinedRankings}
          />
      </Page>
    </Document>
  );
}
