import { Button, Card, Divider, Flex, Typography, message, theme } from "antd";
import ToolOutlined from "@ant-design/icons/ToolOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import CreditCardOutlined from "@ant-design/icons/CreditCardOutlined";
import BellOutlined from "@ant-design/icons/BellOutlined";
import BarChartOutlined from "@ant-design/icons/BarChartOutlined";
import TrophyOutlined from "@ant-design/icons/TrophyOutlined";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { useRunCronJob, type CronJobId } from "@/apis/hooks/useCronJobs";

const { Title, Text } = Typography;

interface CronJobConfig {
  id: CronJobId;
  icon: ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const CRON_JOBS: CronJobConfig[] = [
  {
    id: "recurring-income",
    icon: <DollarOutlined />,
    titleKey: "admin.maintenance.jobs.recurringIncome.title",
    descriptionKey: "admin.maintenance.jobs.recurringIncome.description",
  },
  {
    id: "credit-installments",
    icon: <CreditCardOutlined />,
    titleKey: "admin.maintenance.jobs.creditInstallments.title",
    descriptionKey: "admin.maintenance.jobs.creditInstallments.description",
  },
  {
    id: "subscription-overdue",
    icon: <BellOutlined />,
    titleKey: "admin.maintenance.jobs.subscriptionOverdue.title",
    descriptionKey: "admin.maintenance.jobs.subscriptionOverdue.description",
  },
  {
    id: "monthly-summary",
    icon: <BarChartOutlined />,
    titleKey: "admin.maintenance.jobs.monthlySummary.title",
    descriptionKey: "admin.maintenance.jobs.monthlySummary.description",
  },
  {
    id: "budget-badges",
    icon: <TrophyOutlined />,
    titleKey: "admin.maintenance.jobs.budgetBadges.title",
    descriptionKey: "admin.maintenance.jobs.budgetBadges.description",
  },
];

/**
 * Panel para que usuarios ADMIN disparen manualmente los crons del sistema.
 *
 * Llama a POST /v1/admin/crons/{jobId} — protegido con ROLE_ADMIN en el backend
 * (ver SecurityConfiguration) además del guard de rol en la ruta /admin.
 */
export default function AdminMaintenance() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const runCronJob = useRunCronJob();

  const handleRun = (job: CronJobConfig) => {
    runCronJob.mutate(job.id, {
      onSuccess: () => {
        message.success(t("admin.maintenance.successMessage", { job: t(job.titleKey) }));
      },
      onError: (error) => {
        // @ts-expect-error - response puede estar presente en el error de Axios
        const status = error?.response?.status;
        if (status === 403) {
          message.error(t("admin.maintenance.errorForbidden"));
        } else {
          message.error(t("admin.maintenance.errorGeneric"));
        }
      },
    });
  };

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex align="center" gap={10} style={{ marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: token.borderRadius,
              background: token.colorFillSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ToolOutlined style={{ fontSize: 16, color: token.colorTextTertiary }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
              {t("admin.maintenance.title")}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("admin.maintenance.subtitle")}
            </Text>
          </div>
        </Flex>

        <Flex vertical>
          {CRON_JOBS.map((job, index) => {
            const isRunning = runCronJob.isPending && runCronJob.variables === job.id;
            return (
              <div key={job.id}>
                {index > 0 && <Divider style={{ margin: "12px 0" }} />}
                <Flex align="center" justify="space-between" gap={12} wrap="wrap">
                  <Flex align="center" gap={10}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: token.borderRadius,
                        background: token.colorPrimaryBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: token.colorPrimary,
                      }}
                    >
                      {job.icon}
                    </div>
                    <div>
                      <Text strong style={{ display: "block" }}>
                        {t(job.titleKey)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t(job.descriptionKey)}
                      </Text>
                    </div>
                  </Flex>
                  <Button
                    onClick={() => handleRun(job)}
                    loading={isRunning}
                    disabled={runCronJob.isPending && !isRunning}
                  >
                    {isRunning
                      ? t("admin.maintenance.runningButton")
                      : t("admin.maintenance.runButton")}
                  </Button>
                </Flex>
              </div>
            );
          })}
        </Flex>
      </Card>
    </Flex>
  );
}
