import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import TagOutlined from "@ant-design/icons/TagOutlined";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  Card,
  Col,
  Flex,
  Row,
  Skeleton,
  Statistic,
  Tag,
  theme,
  Typography,
} from "antd";
import { useWorkspaceSummary } from "../../apis/hooks/useWorkspaceSummary";

dayjs.locale("es");

const { Text, Title } = Typography;

interface DeltaBadgeProps {
  delta: number;
  label: string;
}

function DeltaBadge({ delta, label }: DeltaBadgeProps) {
  const { token } = theme.useToken();
  const isPositive = delta >= 0;
  const color = isPositive ? token.colorSuccess : token.colorError;
  const Icon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;
  const sign = isPositive ? "+" : "";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(delta));

  return (
    <Flex align="center" gap={4}>
      <Icon style={{ color, fontSize: 11 }} />
      <Text style={{ color, fontSize: 11 }}>
        {sign}
        {isPositive ? "" : "-"}${formatted} {label}
      </Text>
    </Flex>
  );
}

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

  const ingresado = data?.totalIngresado ?? 0;
  const gastado = data?.totalGastado ?? 0;
  const diferencia = data?.diferencia ?? 0;
  const categoria = data?.categoriaConMayorGasto ?? null;
  const comp = data?.comparacionVsMesAnterior;
  const deltaIngreso = comp?.diferenciaIngreso ?? 0;
  const deltaGasto = comp?.diferenciaGasto ?? 0;
  const deltaDiff = deltaIngreso - deltaGasto;

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

      {/* KPI row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <KpiCard
          title="Ingresado"
          amount={ingresado}
          delta={deltaIngreso}
          deltaLabel="vs mes anterior"
          icon={<ArrowUpOutlined style={{ color: token.colorSuccess }} />}
          iconBg={token.colorSuccessBg}
          loading={isFetching && !data}
          animationDelay="60ms"
        />
        <KpiCard
          title="Gastado"
          amount={-gastado}
          delta={-deltaGasto}
          deltaLabel="vs mes anterior"
          icon={<ArrowDownOutlined style={{ color: token.colorError }} />}
          iconBg={token.colorErrorBg}
          loading={isFetching && !data}
          animationDelay="120ms"
        />
        <KpiCard
          title="Diferencia"
          amount={diferencia}
          delta={deltaDiff}
          deltaLabel="vs mes anterior"
          icon={
            diferencia >= 0 ? (
              <ArrowUpOutlined style={{ color: token.colorSuccess }} />
            ) : (
              <ArrowDownOutlined style={{ color: token.colorError }} />
            )
          }
          iconBg={
            diferencia >= 0 ? token.colorSuccessBg : token.colorErrorBg
          }
          loading={isFetching && !data}
          animationDelay="180ms"
        />
      </Row>

      {/* Top category strip */}
      {(isFetching && !data) ? (
        <Skeleton.Input active style={{ width: 200, height: 22 }} />
      ) : categoria ? (
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
            style={{
              margin: 0,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {categoria}
          </Tag>
        </Flex>
      ) : null}
    </div>
  );
}
