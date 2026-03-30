import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
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

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <BalanceCard
        isFetching={isFetching}
        title="Ingresos Totales"
        amount={ingreso}
        subtitle={`Moneda ${filters.currency ?? ""}`}
        icon={<ArrowUpOutlined style={{ color: token.colorSuccess }} />}
        iconBg={token.colorSuccessBg}
      />
      <BalanceCard
        isFetching={isFetching}
        title="Gastos Totales"
        amount={-gasto}
        subtitle={`Moneda ${filters.currency ?? ""}`}
        icon={<CalendarOutlined style={{ color: token.colorError }} />}
        iconBg={token.colorErrorBg}
      />
      <BalanceCard
        isFetching={isFetching}
        title="Balance Total"
        amount={balanceTotal}
        subtitle={`Moneda ${filters.currency ?? ""}`}
        icon={
          balanceTotal >= 0 ? (
            <ArrowUpOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <ArrowDownOutlined style={{ color: token.colorError }} />
          )
        }
      />
    </Row>
  );
}
