import type { TFunction } from "i18next";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getExpenseApi } from "@/apis/movement/MovementApi";
import type { MovementFilters } from "@/routes/movements";
import { getTypeEnumLabel, type TypeEnum } from "@/enums/TypeEnum";
import type { Movement } from "@/models/Movement";

// Misma page size que usa la exportación de movements-mobile, recorrida completa (no solo lo que
// ya está en pantalla) para que el export cubra todo lo que matchea `filters`.
const PAGE_SIZE = 200;

async function fetchAllMovements(filters: MovementFilters): Promise<Movement[]> {
  const all: Movement[] = [];
  let page = 0;

  while (true) {
    const response = await getExpenseApi({ page, size: PAGE_SIZE, filters });
    all.push(...response.content);
    if (response.last) break;
    page += 1;
  }

  return all;
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Compartido entre CSV y PDF: mismo header y mismas filas, cada exportador solo decide cómo
// serializarlos.
function toExportRows(movements: Movement[], t: TFunction): { header: string[]; rows: string[][] } {
  const typeEnumLabel = getTypeEnumLabel(t);
  const header = [
    t("movements.csvHeaders.date"),
    t("movements.csvHeaders.description"),
    t("movements.csvHeaders.type"),
    t("movements.csvHeaders.category"),
    t("movements.csvHeaders.bank"),
    t("movements.csvHeaders.currency"),
    t("movements.csvHeaders.amount"),
    t("movements.csvHeaders.installment"),
  ];
  const rows = movements.map((movement) => [
    movement.date,
    movement.description,
    typeEnumLabel[movement.type as TypeEnum] ?? movement.type,
    movement.categories.map((c) => c.description).join(" / "),
    movement.bank,
    movement.currency?.symbol ?? "",
    String(movement.amount),
    movement.cuotasTotales ? `${movement.cuotaActual}/${movement.cuotasTotales}` : "",
  ]);

  return { header, rows };
}

function toCsv(movements: Movement[], t: TFunction) {
  const { header, rows } = toExportRows(movements, t);

  // BOM inicial para que Excel (que si no adivina el codepage del sistema) muestre bien los
  // acentos de "Débito"/"Categoría" — sin esto un CSV UTF-8 plano los rompe de forma confiable.
  return "﻿" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function toPdf(movements: Movement[], t: TFunction): Blob {
  const { header, rows } = toExportRows(movements, t);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  doc.setFontSize(14);
  doc.text(t("movements.pdfTitle"), 40, 36);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleDateString(), 40, 52);

  autoTable(doc, {
    startY: 64,
    head: [header],
    body: rows,
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [22, 119, 255] },
    // Última columna (cuota) es angosta y a menudo vacía — dejarla encogerse en vez de
    // repartir el ancho parejo entre las 8 columnas evita desperdiciar espacio horizontal.
    columnStyles: { 7: { cellWidth: 50 } },
  });

  return doc.output("blob");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporta todos los movimientos que matchean `filters` (recorriendo todas las páginas, no solo lo
 * cargado en pantalla) a un CSV y dispara la descarga del navegador. Devuelve la cantidad
 * exportada para que quien llama pueda avisar cuando no hay nada para exportar.
 */
export async function exportMovementsToCsv(filters: MovementFilters, t: TFunction): Promise<number> {
  const movements = await fetchAllMovements(filters);
  if (movements.length === 0) return 0;

  downloadBlob(new Blob([toCsv(movements, t)], { type: "text/csv;charset=utf-8" }), `movimientos-${Date.now()}.csv`);
  return movements.length;
}

/**
 * Igual que {@link exportMovementsToCsv} pero arma un PDF con jspdf-autotable en vez de un CSV —
 * mismo recorrido de páginas y mismas columnas, formateadas en una tabla para lectura/impresión
 * directa en vez de para abrir en una planilla.
 */
export async function exportMovementsToPdf(filters: MovementFilters, t: TFunction): Promise<number> {
  const movements = await fetchAllMovements(filters);
  if (movements.length === 0) return 0;

  downloadBlob(toPdf(movements, t), `movimientos-${Date.now()}.pdf`);
  return movements.length;
}
