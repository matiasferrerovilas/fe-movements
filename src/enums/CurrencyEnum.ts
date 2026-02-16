export const CurrencyEnum = {
  ARS: "ARS",
  USD: "USD",
  EUR: "EUR",
} as const;
export type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];
