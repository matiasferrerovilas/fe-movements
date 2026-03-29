import { DollarOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tooltip, Typography } from "antd";
import { useCurrency } from "../../apis/hooks/useCurrency";
import { useUserDefault, useSetUserDefault } from "../../apis/hooks/useSettings";
import type { Currency } from "../../apis/currencies/CurrencyApi";

const { Title, Text } = Typography;

const css = `
  .currency-card {
    border-radius: 16px !important;
    transition: all 0.25s ease !important;
    overflow: hidden;
  }
  .currency-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important;
  }
  .currency-card-default {
    background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%) !important;
    border: 1.5px solid #91b4f5 !important;
  }
  .currency-card-normal {
    background: #f7f8fa !important;
    border: 1.5px solid #e8eaed !important;
  }
  .currency-star-btn {
    border-radius: 50% !important;
    width: 34px !important;
    height: 34px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
  }
  .currency-star-btn:not(:disabled):hover {
    background: #fff8e1 !important;
    transform: scale(1.18);
  }
`;

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
  const isDefault = currency.id === defaultCurrencyId;

  return (
    <Card
      hoverable
      className={`currency-card ${isDefault ? "currency-card-default" : "currency-card-normal"}`}
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: isDefault
                ? "linear-gradient(135deg, #1a6fd4 0%, #4f9cf7 100%)"
                : "linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDefault
                ? "0 4px 14px rgba(26, 111, 212, 0.32)"
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
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: isDefault ? "#1a3a6b" : "#1f2937",
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}
              >
                {currency.description}
              </Text>
              {isDefault && (
                <span
                  style={{
                    background: "linear-gradient(90deg, #1a6fd4, #4f9cf7)",
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
            </div>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {currency.symbol}
            </Text>
          </div>
        </div>
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
              className="currency-star-btn"
              disabled={isDefault || isSettingDefault}
              onClick={() => onSetDefault(currency.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: "#f5a623", fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: "#c4c9d4", fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
}

export function SettingCurrency() {
  const { data: currencies = [], isLoading } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");
  const setDefaultMutation = useSetUserDefault();

  return (
    <>
      <style>{css}</style>
      <Card loading={isLoading} style={{ borderRadius: 16 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #1a6fd4, #4f9cf7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(26,111,212,0.25)",
            }}
          >
            <DollarOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: "#1a3a6b" }}>
              Moneda por defecto
            </Title>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              Seleccioná la moneda que se pre-completa en los formularios.
            </Text>
          </div>
        </div>

        <div style={{ height: 1, background: "#f0f4ff", margin: "14px 0" }} />

        {/* Lista de monedas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
        </div>
      </Card>
    </>
  );
}
