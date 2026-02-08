export const BankEnum = {
  BBVA: "BBVA",
  GALICIA: "GALICIA",
  SANTANDER_RIO: "SANTANDER RIO",
  BANCO_CIUDAD: "BANCO CIUDAD",
  UNKNOWN: "DESCONOCIDO",
} as const;

export type BankEnum = (typeof BankEnum)[keyof typeof BankEnum];

export const BankEnumHelper = {
  fromString(value: string): BankEnum {
    const normalized = value.replace(/_/g, " ").toUpperCase();

    const key = Object.keys(BankEnum).find(
      (k) => BankEnum[k as keyof typeof BankEnum] === normalized,
    );
    return key ? BankEnum[key as keyof typeof BankEnum] : BankEnum.UNKNOWN;
  },
};
