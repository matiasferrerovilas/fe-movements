export type UserSettingKey =
  | "DEFAULT_ACCOUNT"
  | "DEFAULT_CURRENCY"
  | "DEFAULT_BANK";

export interface UserSetting {
  key: UserSettingKey;
  value: number | null;
}
