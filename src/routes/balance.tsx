import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import {
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Select,
  Spin,
  theme,
  Typography,
} from "antd";
import { CurrencyEnum } from "../enums/CurrencyEnum";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoleEnum } from "../enums/RoleEnum";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker } from "antd";
import { DollarOutlined, EuroOutlined } from "@ant-design/icons";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { useGroups } from "../apis/hooks/useGroups";
import { useCurrency } from "../apis/hooks/useCurrency";
import { useUserDefault } from "../apis/hooks/useSettings";
import {
  useBalanceSeparateByCategory,
  useBalanceSeparateByGroup,
} from "../apis/hooks/useBalance";
import ResumenMensual from "../components/balance/ResumenMensual";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EvolucionAnual from "../components/balance/EvolucionAnual";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const Route = createFileRoute("/balance")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["balance-category"] });
  },
  component: RouteComponent,
});

export type BalanceFilters = {
  account: number[] | null;
  currency: CurrencyEnum;
  year?: number;
  month?: number;
  dates: [Date, Date];
};

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

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const currencyIcon = (currency?: CurrencyEnum) =>
  currency === CurrencyEnum.EUR ? <EuroOutlined /> : <DollarOutlined />;

const DEFAULT_DATES: [Date, Date] = [
  dayjs().startOf("month").toDate(),
  dayjs().endOf("month").toDate(),
];

function RouteComponent() {
  const { token } = theme.useToken();

  const [filters, setFilters] = useState<BalanceFilters>({
    currency: CurrencyEnum.ARS,
    account: null,
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

  const { data: memberships = [] } = useGroups();
  const { data: currencies = [] } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");

  useEffect(() => {
    if (memberships.length > 0 && filtersRef.current.account === null) {
      handleChange(
        "account",
        memberships.map((m) => m.accountId),
      );
    }
  }, [memberships, handleChange]);

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
            const group = item.groupDescription;
            if (!acc[group]) acc[group] = { group };
            acc[group][item.currencySymbol] = Number(item.total);
            return acc;
          },
          {} as Record<string, Record<string, unknown>>,
        ),
      ),
    [groupData],
  );

  const rangePickerValue = useMemo(
    () =>
      filters.dates
        ? ([dayjs(filters.dates[0]), dayjs(filters.dates[1])] as [Dayjs, Dayjs])
        : null,
    [filters.dates],
  );

  const handleRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates?.[0] || !dates?.[1]) return;
      handleChange("dates", [
        dates[0].hour(12).minute(0).second(0).millisecond(0).toDate(),
        dates[1].hour(12).minute(0).second(0).millisecond(0).toDate(),
      ]);
    },
    [handleChange],
  );

  const categoryTotal = useMemo(
    () => categoryChart.reduce((sum, item) => sum + item.value, 0),
    [categoryChart],
  );

  return (
    <div style={{ paddingTop: 24, paddingBottom: 40 }}>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          Balance Financiero
        </Title>
        <Text type="secondary">Vista detallada de ingresos y gastos</Text>
      </div>

      {/* ── Filtros en card separada ── */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Flex vertical gap={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Moneda</Text>
              <Select
                value={filters.currency}
                onChange={(val: CurrencyEnum) => handleChange("currency", val)}
                style={{ width: "100%" }}
                suffixIcon={currencyIcon(filters.currency)}
                options={currencies.map((c) => ({
                  value: c.symbol,
                  label: (
                    <Flex gap={6} align="center">
                      {currencyIcon(c.symbol as CurrencyEnum)}
                      {capitalize(c.symbol)}
                    </Flex>
                  ),
                }))}
              />
            </Flex>
          </Col>

          <Col xs={24} sm={12} md={10}>
            <Flex vertical gap={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Período</Text>
              <RangePicker
                style={{ width: "100%" }}
                value={rangePickerValue}
                onChange={handleRangeChange}
              />
            </Flex>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Flex vertical gap={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Grupos</Text>
              <Select
                mode="multiple"
                value={filters.account ?? []}
                onChange={(val: number[]) => handleChange("account", val)}
                style={{ width: "100%" }}
                allowClear
                placeholder="Todos los grupos"
                options={memberships.map((m) => ({
                  label: m.groupDescription,
                  value: m.accountId,
                  key: m.accountId,
                }))}
              />
            </Flex>
          </Col>
        </Row>
      </Card>

      {/* ── Summary cards ── */}
      <ResumenMensual filters={filters} />

      <Divider style={{ margin: "8px 0 24px" }} />

      {/* ── Charts ── */}
      <Row gutter={[20, 20]}>
        {/* Donut — Gastos por categoría */}
        <Col xs={24} lg={12}>
          <Card
            title="Gastos por Categoría"
            style={{
              borderRadius: token.borderRadiusLG,
              borderColor: token.colorBorder,
              height: "100%",
            }}
          >
            {fetchingCategory ? (
              <Flex justify="center" style={{ padding: 40 }}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </Flex>
            ) : categoryChart.length === 0 ? (
              <Flex justify="center" style={{ padding: 40 }}>
                <Empty description="Sin datos para el período" />
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    label={false}
                  >
                    {categoryChart.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
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
                    ${categoryTotal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </text>
                  <Tooltip
                    formatter={(val, name) => {
                      const pct = categoryTotal > 0
                        ? ((Number(val) / categoryTotal) * 100).toFixed(1)
                        : "0.0";
                      return [`$${Number(val).toLocaleString("es-AR")} (${pct}%)`, name];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Barras — Gastos por grupo y moneda */}
        <Col xs={24} lg={12}>
          <Card
            title="Gastos por Grupo"
            style={{
              borderRadius: token.borderRadiusLG,
              borderColor: token.colorBorder,
              height: "100%",
            }}
          >
            {fetchingGroup ? (
              <Flex justify="center" style={{ padding: 40 }}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </Flex>
            ) : groupChart.length === 0 ? (
              <Flex justify="center" style={{ padding: 40 }}>
                <Empty description="Sin datos para el período" />
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={groupChart}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={token.colorBorderSecondary}
                  />
                  <XAxis dataKey="group" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={60} />
                  <Tooltip
                    formatter={(val) =>
                      `$${(val ?? 0).toLocaleString("es-AR")}`
                    }
                  />
                  <Legend />
                  {groupCurrencies.map((currency, idx) => (
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
            )}
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 20 }}>
        <EvolucionAnual
          year={dayjs(filters.dates[0]).year()}
          groupIds={filters.account}
        />
      </div>
    </div>
  );
}
