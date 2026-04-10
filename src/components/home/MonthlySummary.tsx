import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import TagOutlined from "@ant-design/icons/TagOutlined";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  Card,
  Col,
  Divider,
  Flex,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Tabs,
  theme,
  Typography,
} from "antd";
import { useWorkspaceSummary } from "../../apis/hooks/useWorkspaceSummary";
import type { WorkspaceSummaryPorMoneda } from "../../models/WorkspaceSummary";

dayjs.locale("es");

const { Text, Title } = Typography;

// ── DeltaBadge ────────────────────────────────────────────────────────────────

interface DeltaBadgeProps {
  delta: number;
  label: string;
}

function DeltaBadge({ delta, label }: DeltaBadgeProps) {
  const { token } = theme.useToken();
  const isPositive = delta >= 0;
  const color = isPositive ? token.colorSuccess : token.colorError;
  const Icon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;
  const sign = isPositive ? "+" : "-";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(delta));

  return (
    <Flex align="center" gap={4}>
      <Icon style={{ color, fontSize: 11 }} />
      <Text style={{ color, fontSize: 11 }}>
        {sign}${formatted} {label}
      </Text>
    </Flex>
  );
}

// ── KpiCard ───────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  amount: number;
  delta: number;
  deltaLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
  animationDelay: string;
}

function KpiCard({
  title,
  amount,
  delta,
  deltaLabel,
  icon,
  iconBg,
  loading,
  animationDelay,
}: KpiCardProps) {
  const { token } = theme.useToken();
  const isNegative = amount < 0;
  const valueColor = isNegative ? token.colorError : token.colorSuccess;

  return (
    <Col xs={24} sm={12} lg={8}>
      <Card
        loading={loading}
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          height: "100%",
          animationDelay,
        }}
        styles={{ body: { padding: "18px 20px" } }}
      >
        <Flex align="flex-start" gap={14}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: token.borderRadius,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 18,
              marginTop: 2,
            }}
          >
            {icon}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 2 }}
            >
              {title}
            </Text>
            <Statistic
              value={Math.abs(amount)}
              prefix={isNegative ? "-$" : "$"}
              precision={2}
              styles={{
                content: {
                  fontSize: 20,
                  fontWeight: 700,
                  color: valueColor,
                  lineHeight: 1.2,
                },
              }}
              style={{ marginBottom: 4 }}
            />
            <DeltaBadge delta={delta} label={deltaLabel} />
          </div>
        </Flex>
      </Card>
    </Col>
  );
}

// ── CurrencyPanel ─────────────────────────────────────────────────────────────

interface CurrencyPanelProps {
  data: WorkspaceSummaryPorMoneda;
  loading: boolean;
}

function CurrencyPanel({ data, loading }: CurrencyPanelProps) {
  const { token } = theme.useToken();
  const { ingresado, gastado, diferencia, categoriaConMayorGasto, comparacion } = data;

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <KpiCard
          title="Ingresado"
          amount={ingresado}
          delta={comparacion.diferenciaIngresado}
          deltaLabel="vs mes anterior"
          icon={<ArrowUpOutlined style={{ color: token.colorSuccess }} />}
          iconBg={token.colorSuccessBg}
          loading={loading}
          animationDelay="60ms"
        />
        <KpiCard
          title="Gastado"
          amount={-gastado}
          delta={-comparacion.diferenciaGastado}
          deltaLabel="vs mes anterior"
          icon={<ArrowDownOutlined style={{ color: token.colorError }} />}
          iconBg={token.colorErrorBg}
          loading={loading}
          animationDelay="120ms"
        />
        <KpiCard
          title="Diferencia"
          amount={diferencia}
          delta={comparacion.diferenciaIngresado - comparacion.diferenciaGastado}
          deltaLabel="vs mes anterior"
          icon={
            diferencia >= 0 ? (
              <ArrowUpOutlined style={{ color: token.colorSuccess }} />
            ) : (
              <ArrowDownOutlined style={{ color: token.colorError }} />
            )
          }
          iconBg={diferencia >= 0 ? token.colorSuccessBg : token.colorErrorBg}
          loading={loading}
          animationDelay="180ms"
        />
      </Row>

      {loading ? (
        <Skeleton.Input active style={{ width: 200, height: 22 }} />
      ) : categoriaConMayorGasto ? (
        <Flex
          align="center"
          gap={8}
          className="fade-in-up"
          style={{ animationDelay: "240ms" }}
        >
          <TagOutlined
            style={{ color: token.colorTextSecondary, fontSize: 13 }}
          />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Mayor gasto del mes:
          </Text>
          <Tag
            color="default"
            style={{ margin: 0, fontWeight: 600, letterSpacing: "0.02em" }}
          >
            {categoriaConMayorGasto}
          </Tag>
        </Flex>
      ) : null}
    </>
  );
}

// ── MonthlySummary ────────────────────────────────────────────────────────────

export default function MonthlySummary() {
  const { token } = theme.useToken();
  const now = dayjs();
  const year = now.year();
  const month = now.month() + 1;
  const monthLabel = now.format("MMMM YYYY");

  const { data, isFetching, isError } = useWorkspaceSummary(year, month);

  if (isError) {
    return (
      <Text type="secondary" style={{ display: "block", paddingTop: 16 }}>
        No se pudo cargar el resumen mensual.
      </Text>
    );
  }

  const loading = isFetching && !data;
  const porMoneda = data?.porMoneda ?? [];
  const totalUSD = data?.totalUnificadoUSD;

  // ── Tabs items ──────────────────────────────────────────────────────────────
  const tabItems = porMoneda.map((moneda) => ({
    key: moneda.currency,
    label: moneda.currency,
    children: <CurrencyPanel data={moneda} loading={loading} />,
  }));

  return (
    <div style={{ width: "100%" }}>
      {/* Section header */}
      <Flex
        align="baseline"
        gap={12}
        style={{ marginBottom: 16 }}
        className="fade-in-up"
      >
        <Title
          level={5}
          style={{ margin: 0, fontWeight: 600, animationDelay: "0ms" }}
        >
          Resumen de{" "}
          <span
            style={{ color: token.colorPrimary, textTransform: "capitalize" }}
          >
            {monthLabel}
          </span>
        </Title>
        {isFetching && (
          <Skeleton.Input active size="small" style={{ width: 80 }} />
        )}
      </Flex>

      {/* Loading skeleton cuando no hay datos todavía */}
      {loading ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {[60, 120, 180].map((delay) => (
            <Col key={delay} xs={24} sm={12} lg={8}>
              <Card
                loading
                className="fade-in-up"
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorder,
                  height: "100%",
                  animationDelay: `${delay}ms`,
                }}
                styles={{ body: { padding: "18px 20px" } }}
              />
            </Col>
          ))}
        </Row>
      ) : porMoneda.length === 0 ? (
        <Text type="secondary" style={{ display: "block", paddingBottom: 8 }}>
          Sin movimientos registrados este mes.
        </Text>
      ) : porMoneda.length === 1 ? (
        /* Una sola moneda — sin tabs */
        <CurrencyPanel data={porMoneda[0]} loading={false} />
      ) : (
        /* Múltiples monedas — tabs */
        <Tabs
          defaultActiveKey={porMoneda[0].currency}
          items={tabItems}
          style={{ marginBottom: 8 }}
        />
      )}

      {/* Total unificado en USD */}
      {totalUSD && !loading && (
        <>
          <Divider style={{ margin: "20px 0 14px" }} />
          <Flex
            align="center"
            gap={6}
            style={{ marginBottom: 6 }}
            className="fade-in-up"
          >
            <Text
              type="secondary"
              style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Total en USD
            </Text>
          </Flex>
          <Flex gap={24} wrap="wrap" className="fade-in-up" style={{ animationDelay: "60ms" }}>
            <Flex align="center" gap={6}>
              <ArrowUpOutlined style={{ color: token.colorSuccess, fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Ingresos</Text>
              <Text strong style={{ fontSize: 13 }}>
                ${totalUSD.ingresado.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <ArrowDownOutlined style={{ color: token.colorError, fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Gastos</Text>
              <Text strong style={{ fontSize: 13 }}>
                ${totalUSD.gastado.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              {totalUSD.diferencia >= 0 ? (
                <ArrowUpOutlined style={{ color: token.colorSuccess, fontSize: 12 }} />
              ) : (
                <ArrowDownOutlined style={{ color: token.colorError, fontSize: 12 }} />
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>Diferencia neta</Text>
              <Text
                strong
                style={{
                  fontSize: 13,
                  color: totalUSD.diferencia >= 0 ? token.colorSuccess : token.colorError,
                }}
              >
                {totalUSD.diferencia >= 0 ? "" : "-"}$
                {Math.abs(totalUSD.diferencia).toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </Text>
            </Flex>
          </Flex>
        </>
      )}
    </div>
  );
}
