export type UserSettingKey =
  | "DEFAULT_WORKSPACE"
  | "DEFAULT_CURRENCY"
  | "DEFAULT_BANK"
  | "AUTO_INCOME_ENABLED";

export interface UserSetting {
  key: UserSettingKey;
  value: number | null;
}
