import { Card, Col, Spin } from "antd";
import dayjs from "dayjs";
import { useBalanceSeparateByGroup } from "../../apis/hooks/useBalance";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function BalanceGrupoGastado() {
  const { data: balance = [], isFetching } = useBalanceSeparateByGroup(
    dayjs().year(),
    dayjs().month() + 1
  );
  const currencies = [...new Set(balance.map((b) => b.currencySymbol))];

  const transformed = Object.values(
    balance.reduce((acc, item) => {
      const group = item.groupDescription;
      const currency = item.currencySymbol;

      if (!acc[group]) acc[group] = { group };

      acc[group][currency] = Number(item.total);

      return acc;
    }, {} as Record<string, Record<string, string | number>>)
  );

  return (
    <Col xs={24} sm={20} lg={8}>
      <Card
        title="Distribución de movimientos por Grupo y Moneda"
        style={{ marginTop: 20 }}
      >
        {isFetching ? (
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        ) : (
          <BarChart
            responsive
            style={{
              width: "100%",
              maxHeight: "100%",
              aspectRatio: 1,
            }}
            data={transformed}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis />
            <Tooltip />
            <Legend />

            {currencies.map((currency, idx) => (
              <Bar
                key={currency}
                dataKey={currency}
                name={currency}
                fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][idx % 4]}
                activeBar={<Rectangle fill="gold" stroke="purple" />}
              />
            ))}
          </BarChart>
        )}
      </Card>
    </Col>
  );
}
