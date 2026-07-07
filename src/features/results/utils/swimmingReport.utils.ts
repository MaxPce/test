// src/features/results/utils/swimmingReport.utils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { SwimmingMedalRow } from '../api/swimmingMedalTable.queries';
import type { SwimmingEventResult } from '../api/swimmingResults.queries';

export const INDIVIDUAL_POINTS = [9, 7, 6, 5, 4, 3, 2, 1] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPoints(pts: number): string {
  return Number.isInteger(pts) ? String(pts) : pts.toFixed(2);
}

/**
 * Desempate oficial FEDUP art. 3.5.5: oro → plata → bronce
 * Instituciones con igual combinación reciben el mismo rank.
 */
export function applyTiedRanks(rows: SwimmingMedalRow[]): SwimmingMedalRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.gold   !== a.gold)   return b.gold   - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    return b.bronze - a.bronze;
  });

  return sorted.map((row, _i, arr) => {
    const firstEqual = arr.findIndex(
      (r) =>
        r.totalPoints === row.totalPoints &&
        r.gold        === row.gold        &&
        r.silver      === row.silver      &&
        r.bronze      === row.bronze,
    );
    return { ...row, rank: firstEqual + 1 };
  });
}

// ─── PDF Medallero ────────────────────────────────────────────────────────────

export function exportSwimmingPDF(rows: SwimmingMedalRow[], eventName: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDALLERO GENERAL — NATACIÓN', 105, 13, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(eventName, 105, 21, { align: 'center' });

  doc.setTextColor(80);
  doc.setFontSize(8);
  doc.text('FEDUP — Campeonato Nacional Universitario', 14, 38);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-PE', { dateStyle: 'long' })}`,
    196, 38, { align: 'right' },
  );

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(7.5);
  doc.text(
    `Escala: ${INDIVIDUAL_POINTS.map((p, i) => `${i + 1}°=${p}`).join('  ')}  |  Postas: puntaje doble`,
    14, 45,
  );
  doc.setTextColor(120);
  doc.text(
    'Máx. 2 ubicaciones/institución en individuales · Solo mejor posta por institución',
    14, 50,
  );

  const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  autoTable(doc, {
    startY: 55,
    head: [['Pos.', 'Institución', '🥇 Oro', '🥈 Plata', '🥉 Bronce', '⭐ Puntos']],
    body: rows.map((row) => [
      `${MEDAL[row.rank] ?? ''}  ${row.rank}°`,
      row.institutionName,
      row.gold,
      row.silver,
      row.bronze,
      formatPoints(row.totalPoints),
    ]),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const rank = rows[data.row.index]?.rank;
      if (rank === 1) data.cell.styles.fillColor = [254, 252, 232];
      if (rank === 2) data.cell.styles.fillColor = [248, 250, 252];
      if (rank === 3) data.cell.styles.fillColor = [255, 251, 235];
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    '* Los puntos decimales (.50) corresponden a empates de tiempo divididos equitativamente entre los competidores.',
    14, finalY,
  );

  doc.save(`medallero-natacion-${Date.now()}.pdf`);
}

// ─── PDF Resultados por Prueba ────────────────────────────────────────────────

export function exportSwimmingResultsPDF(
  events: SwimmingEventResult[],
  eventName: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  events.forEach((ev, idx) => {
    if (idx > 0) doc.addPage();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(eventName, 105, 9, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-PE', { dateStyle: 'long' })}`,
      105, 16, { align: 'center' },
    );

    // Título del evento
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Event ${ev.eventNumber}  ${ev.eventName}`, 14, 31);

    // Subtítulo: categoría + marca mínima
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const sub = [
      `Categoría: ${ev.categoryName}`,
      ev.minMark ? `Marca Mínima: ${ev.minMark}` : null,
      ev.isRelay  ? 'Posta — puntaje doble' : null,
    ].filter(Boolean).join('   ·   ');
    doc.text(sub, 14, 37);

    // Tabla de resultados
    const body = ev.entries.map((e) => {
      const isDisq = e.notes && ['DQ', 'DNS', 'DNF', 'NS'].some((d) => e.notes!.includes(d));
      const posLabel = e.rank === 0
        ? (e.notes ?? '---')
        : `${e.isTied ? '*' : ''}${e.rank}`;

      const timeLabel = e.finalTime
        ? `${e.isExcluded ? 'x' : ''}${e.finalTime}${e.notes?.includes('MM') ? ' MM' : ''}`
        : (e.notes ?? '---');

      const ptsLabel = isDisq || e.points === 0
        ? ''
        : formatPoints(e.points);

      return [
        posLabel,
        e.athleteName,
        e.age ?? '',
        e.institutionAbbrev ?? e.institutionName,
        timeLabel,
        ptsLabel,
      ];
    });

    autoTable(doc, {
      startY: 41,
      head: [['Pos.', 'Nombre', 'Edad', 'Institución', 'Tiempo Final', 'Pts']],
      body,
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      didParseCell(data) {
        if (data.section !== 'body') return;
        const entry = ev.entries[data.row.index];
        if (!entry) return;
        const isDisq = entry.notes && ['DQ', 'DNS', 'DNF', 'NS'].some((d) => entry.notes!.includes(d));
        if (isDisq) {
          data.cell.styles.textColor = [180, 180, 180];
          return;
        }
        if (entry.rank === 1) data.cell.styles.fillColor = [254, 252, 232];
        if (entry.rank === 2) data.cell.styles.fillColor = [248, 250, 252];
        if (entry.rank === 3) data.cell.styles.fillColor = [255, 251, 235];
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14 },
        2: { halign: 'center', cellWidth: 12 },
        3: { cellWidth: 38 },
        4: { halign: 'center', cellWidth: 30 },
        5: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // Nota al pie si hubo empates en esta prueba
    const hasDecimalPts = ev.entries.some((e) => !Number.isInteger(e.points) && e.points > 0);
    if (hasDecimalPts) {
      const finalY = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        '* Los puntos .50 corresponden a empates de tiempo divididos equitativamente.',
        14, finalY,
      );
    }
  });

  doc.save(`resultados-natacion-${Date.now()}.pdf`);
}

// ─── Excel Medallero ──────────────────────────────────────────────────────────

export function exportSwimmingExcel(rows: SwimmingMedalRow[], eventName: string) {
  const wb = XLSX.utils.book_new();

  const wsData: (string | number)[][] = [
    ['MEDALLERO GENERAL — NATACIÓN'],
    [eventName],
    ['FEDUP — Campeonato Nacional Universitario'],
    [`Generado: ${new Date().toLocaleDateString('es-PE')}`],
    [],
    ['Pos.', 'Institución', 'Oro 🥇', 'Plata 🥈', 'Bronce 🥉', 'Puntos Totales'],
    ...rows.map((row) => [
      `${row.rank}°`,
      row.institutionName,
      row.gold,
      row.silver,
      row.bronze,
      row.totalPoints,
    ]),
    [],
    ['── Escala de puntaje oficial FEDUP (art. 3.5.6 - 3.5.7) ──'],
    ['Lugar', 'Individual', 'Postas (×2)'],
    ...INDIVIDUAL_POINTS.map((p, i) => [`${i + 1}°`, p, p * 2]),
    [],
    ['Reglas de cómputo:'],
    ['· Máx. 2 ubicaciones por institución en pruebas individuales.'],
    ['· Solo la posta mejor ubicada de cada institución puntúa y recibe medalla.'],
    ['· Empate: mayor nº de oros → platas → bronces (art. 3.5.5).'],
    ['· Los .50 pts corresponden a empates de tiempo (puntos divididos).'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 6 }, { wch: 42 }, { wch: 9 }, { wch: 9 }, { wch: 10 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Medallero Natación');
  XLSX.writeFile(wb, `medallero-natacion-${Date.now()}.xlsx`);
}

// ─── Excel Resultados por Prueba ──────────────────────────────────────────────

export function exportSwimmingResultsExcel(
  events: SwimmingEventResult[],
  eventName: string,
) {
  const wb = XLSX.utils.book_new();

  // Hoja resumen: una fila por participante con columna de prueba
  const summaryData: (string | number)[][] = [
    ['RESULTADOS POR PRUEBA — NATACIÓN'],
    [eventName],
    [`Generado: ${new Date().toLocaleDateString('es-PE')}`],
    [],
    ['Evento', 'Categoría', 'Pos.', 'Nombre', 'Edad', 'Institución', 'Tiempo Final', 'Puntos', 'Notas'],
  ];

  for (const ev of events) {
    for (const e of ev.entries) {
      const isDisq = e.notes && ['DQ', 'DNS', 'DNF', 'NS'].some((d) => e.notes!.includes(d));
      summaryData.push([
        `Ev. ${ev.eventNumber} – ${ev.eventName}`,
        ev.categoryName,
        e.rank === 0 ? (e.notes ?? '---') : `${e.isTied ? '*' : ''}${e.rank}`,
        e.athleteName,
        e.age ?? '',
        e.institutionAbbrev ?? e.institutionName,
        e.isExcluded ? `x${e.finalTime ?? ''}` : (e.finalTime ?? e.notes ?? '---'),
        isDisq ? '' : (e.points > 0 ? e.points : ''),
        e.notes ?? '',
      ]);
    }
    summaryData.push([]); // fila vacía entre pruebas
  }

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  ws['!cols'] = [
    { wch: 38 }, { wch: 14 }, { wch: 6 }, { wch: 34 },
    { wch: 7 }, { wch: 18 }, { wch: 16 }, { wch: 9 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Resultados por Prueba');
  XLSX.writeFile(wb, `resultados-natacion-${Date.now()}.xlsx`);
}