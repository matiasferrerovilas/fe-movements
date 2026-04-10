import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import dayjs from "dayjs";
import { Row } from "antd";
import { useBalance } from "../../apis/hooks/useBalance";
import BalanceCard from "./BalanceCard";
import type { BalanceFilters } from "../../routes/balance";
import { theme } from "antd";

interface ResumenMensualProps {
  filters: BalanceFilters;
}

export default function ResumenMensual({ filters }: ResumenMensualProps) {
  const { token } = theme.useToken();

  const currentMonthFilters = {
    ...filters,
    year: dayjs().year(),
    month: dayjs().month() + 1,
  };
  const { data: rawData, isFetching } = useBalance(currentMonthFilters);

  const ingreso = rawData?.INGRESO ?? 0;
  const gasto = rawData?.GASTO ?? 0;
  const balanceTotal = ingreso - gasto;

  const [dateFrom, dateTo] = filters.dates;
  const from = dayjs(dateFrom).format("MMM YYYY");
  const to = dayjs(dateTo).format("MMM YYYY");
  const periodLabel = from === to ? from : `${from} – ${to}`;
  const subtitle = `${periodLabel} · ${filters.currency ?? ""}`;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <BalanceCard
        isFetching={isFetching}
        title="Ingresos Totales"
        amount={ingreso}
        subtitle={subtitle}
        icon={<ArrowUpOutlined style={{ color: token.colorSuccess }} />}
        iconBg={token.colorSuccessBg}
        animationDelay="120ms"
      />
      <BalanceCard
        isFetching={isFetching}
        title="Gastos Totales"
        amount={-gasto}
        subtitle={subtitle}
        icon={<ArrowDownOutlined style={{ color: token.colorError }} />}
        iconBg={token.colorErrorBg}
        animationDelay="180ms"
      />
      <BalanceCard
        isFetching={isFetching}
        title="Balance Total"
        amount={balanceTotal}
        subtitle={subtitle}
        icon={
          balanceTotal >= 0 ? (
            <ArrowUpOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <ArrowDownOutlined style={{ color: token.colorError }} />
          )
        }
        animationDelay="240ms"
      />
    </Row>
  );
}
