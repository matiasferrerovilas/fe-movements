export type UserSettingKey =
  | "DEFAULT_WORKSPACE"
  | "DEFAULT_CURRENCY"
  | "DEFAULT_BANK"
  | "MONTHLY_SUMMARY_ENABLED"
  | "AUTO_INCOME_ENABLED";

export interface UserSetting {
  key: UserSettingKey;
  value: number | null;
}
