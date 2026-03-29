import { api } from "../axios";
import type { UserSetting, UserSettingKey } from "../../models/UserSetting";

const BASE_URL = "/settings/defaults";

export async function getUserDefaults(): Promise<UserSetting[]> {
  return api
    .get<UserSetting[]>(BASE_URL)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching user defaults:", error);
      throw error;
    });
}

export async function getUserDefault(
  key: UserSettingKey
): Promise<UserSetting> {
  return api
    .get<UserSetting>(`${BASE_URL}/${key}`)
    .then((response) => response.data)
    .catch((error) => {
      if (error?.response?.status === 404) {
        return { key, value: null };
      }
      console.error(`Error fetching user default for key "${key}":`, error);
      throw error;
    });
}

export async function setUserDefault(
  key: UserSettingKey,
  value: number
): Promise<UserSetting> {
  return api
    .put<UserSetting>(`${BASE_URL}/${key}`, { value })
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Error setting user default for key "${key}":`, error);
      throw error;
    });
}
