import { DollarOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Flex, Space, theme, Tooltip, Typography } from "antd";
import { useCurrency } from "../../apis/hooks/useCurrency";
import { useUserDefault, useSetUserDefault } from "../../apis/hooks/useSettings";
import type { Currency } from "../../apis/currencies/CurrencyApi";

const { Title, Text } = Typography;

interface CurrencyCardProps {
  currency: Currency;
  defaultCurrencyId?: number | null;
  onSetDefault: (id: number) => void;
  isSettingDefault?: boolean;
}

function CurrencyCard({
  currency,
  defaultCurrencyId,
  onSetDefault,
  isSettingDefault,
}: CurrencyCardProps) {
  const { token } = theme.useToken();
  const isDefault = currency.id === defaultCurrencyId;

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        background: isDefault ? token.colorPrimaryBg : token.colorFillAlter,
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={14}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: isDefault
                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                : `linear-gradient(135deg, ${token.colorFill} 0%, ${token.colorFillSecondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDefault
                ? `0 4px 14px ${token.colorPrimaryBorder}`
                : "0 2px 6px rgba(0,0,0,0.08)",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              {currency.symbol}
            </Text>
          </div>
          <Flex vertical gap={3}>
            <Flex align="center" gap={8}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: token.colorText,
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}
              >
                {currency.description}
              </Text>
              {isDefault && (
                <span
                  style={{
                    background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                    borderRadius: 20,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    padding: "2px 9px",
                    textTransform: "uppercase",
                    lineHeight: "18px",
                  }}
                >
                  ★ Default
                </span>
              )}
            </Flex>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currency.symbol}
            </Text>
          </Flex>
        </Flex>
        <Space size={4}>
          <Tooltip
            title={
              isDefault
                ? "Ya es la moneda por defecto"
                : "Establecer como moneda por defecto"
            }
          >
            <Button
              type="text"
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              disabled={isDefault || isSettingDefault}
              onClick={() => onSetDefault(currency.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: token.colorWarning, fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: token.colorTextQuaternary, fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
        </Space>
      </Flex>
    </Card>
  );
}

export function SettingCurrency() {
  const { data: currencies = [], isLoading } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");
  const setDefaultMutation = useSetUserDefault();
  const { token } = theme.useToken();

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      {/* Header */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <DollarOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Moneda por defecto
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Seleccioná la moneda que se pre-completa en los formularios.
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Lista de monedas */}
      <Flex vertical gap={10}>
        {currencies.map((currency: Currency) => (
          <CurrencyCard
            key={currency.id}
            currency={currency}
            defaultCurrencyId={defaultCurrency?.value}
            onSetDefault={(id) =>
              setDefaultMutation.mutate({ key: "DEFAULT_CURRENCY", value: id })
            }
            isSettingDefault={setDefaultMutation.isPending}
          />
        ))}
      </Flex>
    </Card>
  );
}
