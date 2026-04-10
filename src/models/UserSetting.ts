export type UserSettingKey =
  | "DEFAULT_ACCOUNT"
  | "DEFAULT_CURRENCY"
  | "DEFAULT_BANK"
  | "MONTHLY_SUMMARY_ENABLED";

export interface UserSetting {
  key: UserSettingKey;
  value: number | null;
}
