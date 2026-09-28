import type { TFunction } from "i18next";

export const MovementItemUnitEnum = {
  KILOGRAMO: "KILOGRAMO",
  LITRO: "LITRO",
  UNIDAD: "UNIDAD",
} as const;
export type MovementItemUnitEnum =
  (typeof MovementItemUnitEnum)[keyof typeof MovementItemUnitEnum];

export const getMovementItemUnitLabel = (
  t: TFunction,
): Record<MovementItemUnitEnum, string> => ({
  KILOGRAMO: t("movements.form.items.unit.KILOGRAMO"),
  LITRO: t("movements.form.items.unit.LITRO"),
  UNIDAD: t("movements.form.items.unit.UNIDAD"),
});
