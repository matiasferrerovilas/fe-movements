export type UserSettingKey =
  | "DEFAULT_WORKSPACE"
  | "DEFAULT_CURRENCY"
  | "DEFAULT_BANK"
  | "MONTHLY_SUMMARY_ENABLED";

export interface UserSetting {
  key: UserSettingKey;
  value: number | null;
}
