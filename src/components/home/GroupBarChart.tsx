import { Card, Empty, Flex, Spin, theme } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "./constants";

type GroupBarChartProps = {
  data: Record<string, unknown>[];
  currencies: string[];
  isFetching: boolean;
};

export default function GroupBarChart({
  data,
  currencies,
  isFetching,
}: GroupBarChartProps) {
  const { token } = theme.useToken();

  if (isFetching) {
    return (
      <Card
        title="Gastos por Workspace"
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          height: "100%",
          animationDelay: "360ms",
        }}
      >
        <Flex justify="center" style={{ padding: 40 }}>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card
        title="Gastos por Workspace"
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          height: "100%",
          animationDelay: "360ms",
        }}
      >
        <Flex justify="center" style={{ padding: 40 }}>
          <Empty description="Sin datos para el período" />
        </Flex>
      </Card>
    );
  }

  return (
    <Card
      title="Gastos por Workspace"
      className="fade-in-up"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
        height: "100%",
        animationDelay: "360ms",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={token.colorBorderSecondary}
          />
          <XAxis dataKey="group" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={60} />
          <Tooltip
            formatter={(val) => `$${(val ?? 0).toLocaleString("es-AR")}`}
          />
          <Legend />
          {currencies.map((currency, idx) => (
            <Bar
              key={currency}
              dataKey={currency}
              name={currency}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              activeBar={
                <Rectangle
                  fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]}
                />
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
