import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { Col, Divider, Row, Typography } from "antd";
import { CurrencyEnum } from "../enums/CurrencyEnum";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoleEnum } from "../enums/RoleEnum";
import dayjs from "dayjs";
import { useCurrency } from "../apis/hooks/useCurrency";
import { useUserDefault } from "../apis/hooks/useSettings";
import {
  useBalanceSeparateByCategory,
  useBalanceSeparateByGroup,
} from "../apis/hooks/useBalance";
import ResumenMensual from "../components/balance/ResumenMensual";
import EvolucionAnual from "../components/balance/EvolucionAnual";
import BalanceFilters from "../components/balance/BalanceFilters";
import CategoryPieChart from "../components/balance/CategoryPieChart";
import GroupBarChart from "../components/balance/GroupBarChart";

const { Title, Text } = Typography;

export const Route = createFileRoute("/balance")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

export type BalanceFilters = {
  currency: CurrencyEnum;
  year?: number;
  month?: number;
  dates: [Date, Date];
};

const DEFAULT_DATES: [Date, Date] = [
  dayjs().startOf("month").toDate(),
  dayjs().endOf("month").toDate(),
];

function RouteComponent() {
  const [filters, setFilters] = useState<BalanceFilters>({
    currency: CurrencyEnum.ARS,
    dates: DEFAULT_DATES,
  });

  const filtersRef = useRef(filters);

  const handleFiltersChange = useCallback((next: BalanceFilters) => {
    filtersRef.current = next;
    setFilters(next);
  }, []);

  const handleChange = useCallback(
    <K extends keyof BalanceFilters>(key: K, value: BalanceFilters[K]) =>
      handleFiltersChange({ ...filtersRef.current, [key]: value }),
    [handleFiltersChange],
  );

  const { data: currencies = [] } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");

  useEffect(() => {
    const symbol = currencies.find(
      (c) => c.id === defaultCurrency?.value,
    )?.symbol;
    if (symbol) {
      handleChange("currency", symbol as CurrencyEnum);
    }
  }, [currencies, defaultCurrency, handleChange]);

  const categoryFilters = useMemo(
    () => ({ ...filters, year: dayjs().year() }),
    [filters],
  );

  const { data: categoryData = [], isFetching: fetchingCategory } =
    useBalanceSeparateByCategory(categoryFilters);

  const { data: groupData = [], isFetching: fetchingGroup } =
    useBalanceSeparateByGroup(dayjs().year(), dayjs().month() + 1);

  const categoryChart = useMemo(
    () =>
      categoryData.map((item) => ({ name: item.category, value: item.total })),
    [categoryData],
  );

  const groupCurrencies = useMemo(
    () => [...new Set(groupData.map((b) => b.currencySymbol))],
    [groupData],
  );

  const groupChart = useMemo(
    () =>
      Object.values(
        groupData.reduce(
          (acc, item) => {
            const group = item.workspaceDescription;
            if (!acc[group]) acc[group] = { group };
            acc[group][item.currencySymbol] = Number(item.total);
            return acc;
          },
          {} as Record<string, Record<string, unknown>>,
        ),
      ),
    [groupData],
  );

  return (
    <div style={{ paddingTop: 24, paddingBottom: 40 }}>
      {/* Page header */}
      <div
        className="fade-in-up"
        style={{ marginBottom: 20, animationDelay: "0ms" }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Balance Financiero
        </Title>
        <Text type="secondary">Vista detallada de ingresos y gastos</Text>
      </div>

      {/* Filtros */}
      <BalanceFilters
        filters={filters}
        currencies={currencies}
        onFilterChange={handleChange}
      />

      {/* Summary cards */}
      <ResumenMensual filters={filters} />

      <Divider style={{ margin: "8px 0 24px" }} />

      {/* Charts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <CategoryPieChart data={categoryChart} isFetching={fetchingCategory} />
        </Col>
        <Col xs={24} lg={12}>
          <GroupBarChart
            data={groupChart}
            currencies={groupCurrencies}
            isFetching={fetchingGroup}
          />
        </Col>
      </Row>

      <div style={{ marginTop: 20 }}>
        <EvolucionAnual year={dayjs(filters.dates[0]).year()} />
      </div>
    </div>
  );
}
