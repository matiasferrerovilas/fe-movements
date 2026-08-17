import { Card, Empty, Flex, Spin, theme } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { useBalanceMonthlyEvolution } from "@/apis/hooks/useBalance";
import AnnualEvolutionFilters from "@/components/home/AnnualEvolutionFilters";
import { useLocalStorage } from "@/utils/useLocalStorage";

const SELECTED_CURRENCIES_STORAGE_KEY = "annualEvolution.selectedCurrencies";

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
};

export default function AnnualEvolution({ year }: Props) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  // Los datos de evolución se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data = [], isFetching } = useBalanceMonthlyEvolution(year);

  const currencies = useMemo(
    () => [...new Set(data.map((d) => d.currencySymbol))],
    [data],
  );

  const [selectedCurrencies, setSelectedCurrencies] = useLocalStorage<string[]>(
    SELECTED_CURRENCIES_STORAGE_KEY,
    [],
  );

  useEffect(() => {
    if (currencies.length === 0) return;
    setSelectedCurrencies((prev) => {
      const stillValid = prev.filter((c) => currencies.includes(c));
      return stillValid.length > 0 ? stillValid : currencies;
    });
  }, [currencies, setSelectedCurrencies]);

  const chartData = useMemo(() => {
    const byMonth = data.reduce(
      (acc, item) => {
        const label = MONTH_LABELS[item.month - 1];
        if (!acc[label]) acc[label] = { month: label };
        acc[label][`${item.currencySymbol}_spent`] = item.spent;
        acc[label][`${item.currencySymbol}_savings`] = item.savings;
        return acc;
      },
      {} as Record<string, Record<string, unknown>>,
    );
    // Garantizar los 12 meses en el frontend como fallback defensivo
    return MONTH_LABELS.map((label) => byMonth[label] ?? { month: label });
  }, [data]);

  return (
    <Card
      title={t("home.annualEvolutionTitle")}
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
          <Empty description={t("home.annualEvolutionEmpty")} />
        </Flex>
      ) : (
        <>
          <AnnualEvolutionFilters
            currencies={currencies}
            selected={selectedCurrencies}
            onChange={setSelectedCurrencies}
          />
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
              {currencies.flatMap((currency, idx) =>
                selectedCurrencies.includes(currency)
                  ? [
                      <Line
                        key={`${currency}_spent`}
                        type="monotone"
                        dataKey={`${currency}_spent`}
                        name={`${currency} - Gasto`}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />,
                      <Line
                        key={`${currency}_savings`}
                        type="monotone"
                        dataKey={`${currency}_savings`}
                        name={`${currency} - Ahorro`}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />,
                    ]
                  : [],
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}
