import { useMutation } from "@tanstack/react-query";
import { api } from "@/apis/axios";

export type CronJobId =
  | "recurring-income"
  | "credit-installments"
  | "subscription-overdue"
  | "monthly-summary"
  | "budget-badges";

/**
 * Hook para disparar manualmente un cron desde el panel de admin.
 * Solo disponible para usuarios con rol ADMIN (backend + frontend).
 *
 * @returns Mutación que llama a POST /v1/admin/crons/{jobId}
 */
export const useRunCronJob = () => {
  return useMutation({
    mutationFn: (jobId: CronJobId) =>
      api.post(`/admin/crons/${jobId}`).then((r) => r.data),
  });
};
