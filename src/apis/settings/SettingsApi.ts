import { api } from "../axios";
import type { UserSetting, UserSettingKey } from "../../models/UserSetting";

const BASE_URL = "/settings/defaults";

export const getUserDefaults = (): Promise<UserSetting[]> =>
  api.get<UserSetting[]>(BASE_URL).then((response) => response.data);

export const getUserDefault = (key: UserSettingKey): Promise<UserSetting> =>
  api
    .get<UserSetting>(`${BASE_URL}/${key}`)
    .then((response) => response.data)
    .catch((error) => {
      if (error?.response?.status === 404) {
        return { key, value: null };
      }
      throw error;
    });

export const setUserDefault = (
  key: UserSettingKey,
  value: number,
): Promise<UserSetting> =>
  api.put<UserSetting>(`${BASE_URL}/${key}`, { value }).then((response) => response.data);
