// components/balance/EvolucionAnual.tsx
import { Card, Empty, Flex, Spin, theme } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBalanceMonthlyEvolution } from "../../apis/hooks/useBalance";

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type Props = {
  year: number;
  groupIds?: number[] | null;
};

export default function EvolucionAnual({ year, groupIds }: Props) {
  const { token } = theme.useToken();
  const { data = [], isFetching } = useBalanceMonthlyEvolution(year, groupIds);

  const currencies = useMemo(
    () => [...new Set(data.map((d) => d.currencySymbol))],
    [data],
  );

  const chartData = useMemo(() => {
    const byMonth = data.reduce(
      (acc, item) => {
        const label = MONTH_LABELS[item.month - 1];
        if (!acc[label]) acc[label] = { month: label };
        acc[label][item.currencySymbol] = item.total;
        return acc;
      },
      {} as Record<string, Record<string, unknown>>,
    );
    // Garantizar los 12 meses en el frontend como fallback defensivo
    return MONTH_LABELS.map((label) => byMonth[label] ?? { month: label });
  }, [data]);

  return (
    <Card
      title="Evolución Anual de Gastos"
      className="fade-in-up"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
        animationDelay: "420ms",
      }}
    >
      {isFetching ? (
        <Flex justify="center" style={{ padding: 40 }}>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      ) : data.length === 0 ? (
        <Flex justify="center" style={{ padding: 40 }}>
          <Empty description="Sin datos para el año seleccionado" />
        </Flex>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
            />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={70} />
            <Tooltip
              formatter={(val) => `$${(val ?? 0).toLocaleString("es-AR")}`}
            />
            <Legend />
            {currencies.map((currency, idx) => (
              <Line
                key={currency}
                type="monotone"
                dataKey={currency}
                name={currency}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
