import type { BadgeRecord, StreakRecord } from "@/models/Gamification";
import { api } from "@/apis/axios";

const BASE_PATH = "gamification";

export const getStreakApi = () =>
  api.get<StreakRecord>(`${BASE_PATH}/streak`).then((response) => response.data);

export const getBadgesApi = () =>
  api.get<BadgeRecord[]>(`${BASE_PATH}/badges`).then((response) => response.data);
