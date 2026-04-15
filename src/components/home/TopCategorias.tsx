import { Card, Empty, Flex, List, Skeleton, theme, Typography } from "antd";
import TagOutlined from "@ant-design/icons/TagOutlined";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useBalanceSeparateByCategory } from "../../apis/hooks/useBalance";
import { useUserDefault } from "../../apis/hooks/useSettings";
import { useCurrency } from "../../apis/hooks/useCurrency";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import { CHART_COLORS } from "./constants";

const { Text } = Typography;

const DEFAULT_DATES: [Date, Date] = [
  dayjs().startOf("month").toDate(),
  dayjs().endOf("month").toDate(),
];

export default function TopCategorias() {
  const { token } = theme.useToken();

  // Obtener moneda por defecto del usuario
  const { data: currencies = [] } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");

  const currencySymbol = useMemo(() => {
    const symbol = currencies.find((c) => c.id === defaultCurrency?.value)
      ?.symbol;
    return (symbol as CurrencyEnum) ?? CurrencyEnum.ARS;
  }, [currencies, defaultCurrency]);

  // Filtros para el mes actual
  const filters = useMemo(
    () => ({
      currency: currencySymbol,
      dates: DEFAULT_DATES,
      year: dayjs().year(),
    }),
    [currencySymbol],
  );

  const { data = [], isFetching } = useBalanceSeparateByCategory(filters);

  // Top 5 categorías con más gastos
  const topCategories = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 5);
    const total = sorted.reduce((sum, item) => sum + item.total, 0);
    return sorted.map((item, idx) => ({
      ...item,
      percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : "0.0",
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [data]);

  if (isFetching) {
    return (
      <Card
        title={
          <Flex align="center" gap={8}>
            <TagOutlined style={{ fontSize: 16 }} />
            <span>Top Categorías del Mes</span>
          </Flex>
        }
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          marginBottom: 20,
          animationDelay: "240ms",
        }}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  if (topCategories.length === 0) {
    return (
      <Card
        title={
          <Flex align="center" gap={8}>
            <TagOutlined style={{ fontSize: 16 }} />
            <span>Top Categorías del Mes</span>
          </Flex>
        }
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          marginBottom: 20,
          animationDelay: "240ms",
        }}
      >
        <Empty description="Sin gastos registrados este mes" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <TagOutlined style={{ fontSize: 16 }} />
          <span>Top Categorías del Mes</span>
        </Flex>
      }
      className="fade-in-up"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
        marginBottom: 20,
        animationDelay: "240ms",
      }}
    >
      <List
        dataSource={topCategories}
        renderItem={(item, index) => (
          <List.Item
            style={{
              padding: "10px 0",
              borderBottom:
                index < topCategories.length - 1
                  ? `1px solid ${token.colorBorderSecondary}`
                  : "none",
            }}
          >
            <Flex
              align="center"
              gap={12}
              style={{ width: "100%" }}
              justify="space-between"
            >
              <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                {/* Color badge */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                {/* Ranking */}
                <Text
                  type="secondary"
                  style={{ fontSize: 13, width: 20, flexShrink: 0 }}
                >
                  {index + 1}.
                </Text>
                {/* Categoría */}
                <Text
                  strong
                  style={{
                    fontSize: 14,
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.category}
                </Text>
              </Flex>
              {/* Monto y porcentaje */}
              <Flex align="baseline" gap={6} style={{ flexShrink: 0 }}>
                <Text strong style={{ fontSize: 15 }}>
                  ${item.total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({item.percentage}%)
                </Text>
              </Flex>
            </Flex>
          </List.Item>
        )}
      />
    </Card>
  );
}
