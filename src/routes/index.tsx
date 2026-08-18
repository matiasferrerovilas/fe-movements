import { createFileRoute } from "@tanstack/react-router";
import { Col, Divider, Grid, Row, Skeleton, Typography } from "antd";
import { protectedRouteGuard } from "@/apis/auth/protectedRouteGuard";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { RoleEnum } from "@/enums/RoleEnum";
import MonthlySummary from "@/components/home/MonthlySummary";
import InsightsPanel from "@/components/home/InsightsPanel";
import GoalsPanel from "@/components/home/GoalsPanel";
import TopCategories from "@/components/home/TopCategories";
import BalanceFiltersCollapsible from "@/components/home/BalanceFiltersCollapsible";
import { getUserDisplayName } from "@/utils/userDisplayName";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CurrencyEnum } from "@/enums/CurrencyEnum";
import dayjs from "dayjs";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useUserDefault } from "@/apis/hooks/useSettings";
import { useBalanceSeparateByCategory } from "@/apis/hooks/useBalance";
import type { BalanceFilters } from "@/models/BalanceFilters";

// Lazy load de componentes con Recharts para reducir bundle inicial
const CategoryPieChart = lazy(() => import("@/components/home/CategoryPieChart"));
const AnnualEvolution = lazy(() => import("@/components/home/AnnualEvolution"));
const ProjectionChart = lazy(() => import("@/components/home/ProjectionChart"));

// Componente de loading para gráficos
function ChartSkeleton() {
  return (
    <div style={{ padding: 20, minHeight: 300 }}>
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  );
}

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

  const categoryChart = useMemo(
    () =>
      categoryData.map((item) => ({ name: item.category, value: item.total })),
    [categoryData],
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
      <div style={{ marginBottom: 24 }}>
        <MonthlySummary />
      </div>

      {/* 3. Insights de gasto y metas de ahorro, lado a lado */}
      <Row gutter={[20, 0]}>
        <Col xs={24} md={12}>
          <InsightsPanel />
        </Col>
        <Col xs={24} md={12}>
          <GoalsPanel />
        </Col>
      </Row>

      {/* 4. Top 5 Categorías */}
      <TopCategories />

      {/* 5. Divider visual */}
      <Divider style={{ margin: "8px 0 24px" }} />

      {/* 6. Filtros colapsables (cerrados por defecto) */}
      <BalanceFiltersCollapsible
        filters={filters}
        currencies={currencies}
        onFilterChange={handleChange}
      />

      {/* 6. Gráficos en Row/Col */}
      <Suspense fallback={<ChartSkeleton />}>
        <Row gutter={[20, 20]}>
          <Col xs={24}>
            <CategoryPieChart data={categoryChart} isFetching={fetchingCategory} />
          </Col>
        </Row>

        {/* 7. Evolución temporal */}
        <div style={{ marginTop: 20 }}>
          <AnnualEvolution year={dayjs(filters.dates[0]).year()} />
        </div>

        {/* 8. Proyección de balance futuro */}
        <div style={{ marginTop: 20 }}>
          <ProjectionChart />
        </div>
      </Suspense>
    </div>
  );
}
