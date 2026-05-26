import { Button, Card, Col, Empty, Grid, Popconfirm, Row, Tag, Tooltip, Typography } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import dayjs from "dayjs";
import type { Investment } from "../../models/Investment";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const COL_PADDING = "8px 16px";
const GP_POSITIVE = "#3f8600";
const GP_NEGATIVE = "#cf1322";

interface InvestmentTableProps {
  investments: Investment[];
  isFetching: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function ActionButtons({
  investment,
  onEdit,
  onDelete,
  isDeleting,
}: {
  investment: Investment;
  onEdit: (inv: Investment) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
      <Tooltip title="Editar">
        <Button
          icon={<EditOutlined />}
          size="small"
          aria-label="editar"
          onClick={() => onEdit(investment)}
        />
      </Tooltip>
      <Popconfirm
        title="¿Eliminar esta inversión?"
        okText="Sí"
        cancelText="No"
        placement="topRight"
        onConfirm={() => onDelete(investment.id)}
      >
        <Tooltip title="Eliminar">
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            aria-label="eliminar"
            loading={isDeleting}
          />
        </Tooltip>
      </Popconfirm>
    </div>
  );
}

function GpText({ investment }: { investment: Investment }) {
  const gp = investment.valorActual - investment.montoInvertido;
  const isPositive = gp >= 0;
  return (
    <Text
      data-testid={`gp-${investment.id}`}
      style={{ color: isPositive ? GP_POSITIVE : GP_NEGATIVE }}
    >
      {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{" "}
      {isPositive ? "+" : ""}
      {investment.moneda.symbol} {Math.abs(gp).toLocaleString("es-AR")}
    </Text>
  );
}

function DesktopRow({
  investment,
  index,
  onEdit,
  onDelete,
  isDeleting,
}: {
  investment: Investment;
  index: number;
  onEdit: (inv: Investment) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const gp = investment.valorActual - investment.montoInvertido;
  const pct = investment.montoInvertido > 0 ? (gp / investment.montoInvertido) * 100 : 0;
  const isPositive = pct >= 0;

  return (
    <Card
      hoverable
      className="step-enter-right"
      style={{ marginBottom: 4, animationDelay: `${Math.min(index, 9) * 40}ms` }}
      styles={{ body: { padding: COL_PADDING } }}
    >
      <Row justify="center" align="middle">
        <Col span={5}>
          <Text strong>{investment.instrumento}</Text>
          <Tag
            color={investment.tipo.iconColor ?? undefined}
            style={{ marginLeft: 8 }}
          >
            {investment.tipo.description}
          </Tag>
        </Col>
        <Col span={4}>
          <Text>
            {investment.moneda.symbol} {investment.montoInvertido.toLocaleString("es-AR")}
          </Text>
        </Col>
        <Col span={4}>
          <Text>
            {investment.moneda.symbol} {investment.valorActual.toLocaleString("es-AR")}
          </Text>
        </Col>
        <Col span={4}>
          <GpText investment={investment} />
        </Col>
        <Col span={3}>
          <Text style={{ color: isPositive ? GP_POSITIVE : GP_NEGATIVE }}>
            {isPositive ? "+" : ""}
            {pct.toFixed(2)}%
          </Text>
        </Col>
        <Col span={2}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(investment.fechaInversion).format("DD/MM/YY")}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(investment.fechaInversion).fromNow()}
          </Text>
        </Col>
        <Col span={2} style={{ textAlign: "right" }}>
          <ActionButtons
            investment={investment}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </Col>
      </Row>
    </Card>
  );
}

function MobileRow({
  investment,
  index,
  onEdit,
  onDelete,
  isDeleting,
}: {
  investment: Investment;
  index: number;
  onEdit: (inv: Investment) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const gp = investment.valorActual - investment.montoInvertido;
  const isPositive = gp >= 0;

  return (
    <Card
      hoverable
      className="step-enter-right"
      style={{ marginBottom: 8, animationDelay: `${Math.min(index, 9) * 40}ms` }}
      styles={{ body: { padding: "10px 12px" } }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
        <Text strong style={{ fontSize: 15 }}>
          {investment.instrumento}
        </Text>
        <Text
          data-testid={`gp-${investment.id}`}
          style={{ color: isPositive ? GP_POSITIVE : GP_NEGATIVE, fontSize: 14 }}
        >
          {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{" "}
          {isPositive ? "+" : ""}
          {investment.moneda.symbol} {Math.abs(gp).toLocaleString("es-AR")}
        </Text>
      </Row>

      <Row gutter={[8, 4]} style={{ marginBottom: 6 }}>
        <Col>
          <Tag color={investment.tipo.iconColor ?? undefined}>{investment.tipo.description}</Tag>
        </Col>
        <Col>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(investment.fechaInversion).fromNow()}
          </Text>
        </Col>
      </Row>

      <Row justify="space-between" align="middle">
        <Col>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Invertido:{" "}
            <Text>
              {investment.moneda.symbol} {investment.montoInvertido.toLocaleString("es-AR")}
            </Text>
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Actual:{" "}
            <Text>
              {investment.moneda.symbol} {investment.valorActual.toLocaleString("es-AR")}
            </Text>
          </Text>
        </Col>
        <Col>
          <ActionButtons
            investment={investment}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </Col>
      </Row>
    </Card>
  );
}

export function InvestmentTable({
  investments,
  isFetching: _isFetching,
  onEdit,
  onDelete,
  isDeleting,
}: InvestmentTableProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (investments.length === 0) {
    return <Empty description="Sin inversiones registradas" style={{ padding: "40px 0" }} />;
  }

  if (isMobile) {
    return (
      <div>
        {investments.map((inv, index) => (
          <MobileRow
            key={inv.id}
            investment={inv}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <Card
        style={{ marginBottom: 8, borderRadius: 6 }}
        styles={{ body: { padding: COL_PADDING } }}
      >
        <Row justify="center" align="middle">
          <Col span={5}>Instrumento / Tipo</Col>
          <Col span={4}>Monto invertido</Col>
          <Col span={4}>Valor actual</Col>
          <Col span={4}>G / P</Col>
          <Col span={3}>Rendimiento</Col>
          <Col span={2}>Fecha</Col>
          <Col span={2} style={{ textAlign: "right" }}>
            Acciones
          </Col>
        </Row>
      </Card>

      <div>
        {investments.map((inv, index) => (
          <DesktopRow
            key={inv.id}
            investment={inv}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </>
  );
}
