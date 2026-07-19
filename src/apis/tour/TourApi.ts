import { api } from "@/apis/axios";

const BASE_PATH = "onboarding/tour";

export const markTourAsSeen = (): Promise<void> =>
  api.put(BASE_PATH).then(() => undefined);
