import type { TFunction } from "i18next";
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

function toCsv(movements: Movement[], t: TFunction) {
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

  // BOM inicial para que Excel (que si no adivina el codepage del sistema) muestre bien los
  // acentos de "Débito"/"Categoría" — sin esto un CSV UTF-8 plano los rompe de forma confiable.
  return "﻿" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

/**
 * Exporta todos los movimientos que matchean `filters` (recorriendo todas las páginas, no solo lo
 * cargado en pantalla) a un CSV y dispara la descarga del navegador. Devuelve la cantidad
 * exportada para que quien llama pueda avisar cuando no hay nada para exportar.
 */
export async function exportMovementsToCsv(filters: MovementFilters, t: TFunction): Promise<number> {
  const movements = await fetchAllMovements(filters);
  if (movements.length === 0) return 0;

  const blob = new Blob([toCsv(movements, t)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `movimientos-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  return movements.length;
}
