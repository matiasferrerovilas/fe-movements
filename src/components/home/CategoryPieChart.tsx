import { Card, Empty, Flex, Spin, theme } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMemo } from "react";
import { CHART_COLORS } from "./constants";

type CategoryChartItem = {
  name: string;
  value: number;
};

type CategoryPieChartProps = {
  data: CategoryChartItem[];
  isFetching: boolean;
};

export default function CategoryPieChart({
  data,
  isFetching,
}: CategoryPieChartProps) {
  const { token } = theme.useToken();

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  if (isFetching) {
    return (
      <Card
        title="Gastos por Categoría"
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          height: "100%",
          animationDelay: "300ms",
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
        title="Gastos por Categoría"
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          height: "100%",
          animationDelay: "300ms",
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
      title="Gastos por Categoría"
      className="fade-in-up"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
        height: "100%",
        animationDelay: "300ms",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            label={false}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Pie>
          {/* Total central */}
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: 13,
              fill: token.colorTextSecondary,
              fontFamily: "inherit",
            }}
          >
            Total
          </text>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: 16,
              fontWeight: 700,
              fill: token.colorText,
              fontFamily: "inherit",
            }}
          >
            ${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </text>
          <Tooltip
            formatter={(val, name) => {
              const pct =
                total > 0 ? ((Number(val) / total) * 100).toFixed(1) : "0.0";
              return [
                `$${Number(val).toLocaleString("es-AR")} (${pct}%)`,
                name,
              ];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
