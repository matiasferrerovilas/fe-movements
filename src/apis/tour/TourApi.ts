import { api } from "../axios";

const BASE_PATH = "users/me/tour";

export const markTourAsSeen = (): Promise<void> =>
  api.put(BASE_PATH).then(() => undefined);
