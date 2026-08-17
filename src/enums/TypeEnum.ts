import type { TFunction } from "i18next";

export const TypeEnum = {
  DEBITO: "DEBITO",
  CREDITO: "CREDITO",
  INGRESO: "INGRESO",
} as const;
export type TypeEnum = (typeof TypeEnum)[keyof typeof TypeEnum];

export const getTypeEnumLabel = (t: TFunction): Record<TypeEnum, string> => ({
  DEBITO: t("movements.type.DEBITO"),
  CREDITO: t("movements.type.CREDITO"),
  INGRESO: t("movements.type.INGRESO"),
});
