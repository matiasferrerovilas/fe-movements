import { createFileRoute } from "@tanstack/react-router";
import { Col, Divider, Grid, Row, Typography } from "antd";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { useCurrentUser } from "../apis/hooks/useCurrentUser";
import { RoleEnum } from "../enums/RoleEnum";
import MonthlySummary from "../components/home/MonthlySummary";
import TopCategorias from "../components/home/TopCategorias";
import CategoryPieChart from "../components/home/CategoryPieChart";
import GroupBarChart from "../components/home/GroupBarChart";
import EvolucionAnual from "../components/home/EvolucionAnual";
import BalanceFiltersCollapsible from "../components/home/BalanceFiltersCollapsible";
import { getUserDisplayName } from "../components/utils/userDisplayName";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CurrencyEnum } from "../enums/CurrencyEnum";
import dayjs from "dayjs";
import { useCurrency } from "../apis/hooks/useCurrency";
import { useUserDefault } from "../apis/hooks/useSettings";
import {
  useBalanceSeparateByCategory,
  useBalanceSeparateByGroup,
} from "../apis/hooks/useBalance";
import type { BalanceFilters } from "../models/BalanceFilters";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export const Route = createFileRoute("/")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

const DEFAULT_DATES: [Date, Date] = [
  dayjs().startOf("month").toDate(),
  dayjs().endOf("month").toDate(),
];

function RouteComponent() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { data: currentUser } = useCurrentUser();
  const displayName = currentUser ? getUserDisplayName(currentUser) : null;

  // Filtros para gráficos
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
    <div
      style={{
        width: "100%",
        paddingTop: isMobile ? 24 : 32,
        paddingBottom: 32,
      }}
    >
      {/* 1. Bienvenido, {nombre} */}
      <Title
        level={isMobile ? 3 : 2}
        className="fade-in-up"
        style={{
          margin: 0,
          fontWeight: 700,
          marginBottom: isMobile ? 20 : 28,
          animationDelay: "0ms",
        }}
      >
        Bienvenido{displayName ? `, ${displayName}` : ""}
      </Title>

      {/* 2. KPIs mensuales (MonthlySummary incluye: KPIs, Mayor categoría, Total USD, BudgetAlert) */}
      <MonthlySummary />

      {/* 3. Top 5 Categorías */}
      <TopCategorias />

      {/* 4. Divider visual */}
      <Divider style={{ margin: "8px 0 24px" }} />

      {/* 5. Filtros colapsables (cerrados por defecto) */}
      <BalanceFiltersCollapsible
        filters={filters}
        currencies={currencies}
        onFilterChange={handleChange}
      />

      {/* 6. Gráficos en Row/Col */}
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

      {/* 7. Evolución temporal */}
      <div style={{ marginTop: 20 }}>
        <EvolucionAnual year={dayjs(filters.dates[0]).year()} />
      </div>
    </div>
  );
}
