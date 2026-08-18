import { Card, Empty, Flex, Skeleton, theme, Typography } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProjection } from "@/apis/hooks/useProjection";
import { useUserDefault } from "@/apis/hooks/useSettings";

const { Text } = Typography;

function formatAmount(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export default function ProjectionChart() {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const { data: defaultWorkspace } = useUserDefault("DEFAULT_WORKSPACE");
  const workspaceId = defaultWorkspace?.value ?? null;

  const { data, isFetching } = useProjection(workspaceId);

  const chartData = useMemo(
    () =>
      (data?.projectedPoints ?? []).map((point) => ({
        label:
          point.monthsOut === 0
            ? t("home.projection.today")
            : t("home.projection.monthsOutLabel", { count: point.monthsOut }),
        balance: point.projectedBalance,
      })),
    [data, t],
  );

  const isPositiveTrend = (data?.averageMonthlyNet ?? 0) >= 0;

  return (
    <Card
      title={t("home.projection.title")}
      className="fade-in-up"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
      }}
    >
      {isFetching ? (
        <Flex justify="center" style={{ padding: 40 }}>
          <LoadingOutlined spin style={{ fontSize: 24 }} />
        </Flex>
      ) : !data || chartData.length === 0 ? (
        <Flex justify="center" style={{ padding: 40 }}>
          <Empty description={t("home.projection.empty")} />
        </Flex>
      ) : (
        <>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 16 }}>
            {t("home.projection.subtitle", {
              trend: t(isPositiveTrend ? "home.projection.trendUp" : "home.projection.trendDown"),
              amount: formatAmount(Math.abs(data.averageMonthlyNet), data.currency),
              months: data.trailingMonths,
            })}
          </Text>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                width={80}
                tickFormatter={(val) => formatAmount(Number(val), data.currency)}
              />
              <ReferenceLine y={0} stroke={token.colorBorder} />
              <Tooltip formatter={(val) => formatAmount(Number(val ?? 0), data.currency)} />
              <Line
                type="monotone"
                dataKey="balance"
                name={t("home.projection.balanceLegend")}
                stroke={isPositiveTrend ? token.colorSuccess : token.colorError}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
            {t("home.projection.disclaimer")}
          </Text>
        </>
      )}
    </Card>
  );
}

// Loading skeleton exportado para el Suspense boundary del home
export function ProjectionChartSkeleton() {
  return (
    <div style={{ padding: 20, minHeight: 280 }}>
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  );
}
