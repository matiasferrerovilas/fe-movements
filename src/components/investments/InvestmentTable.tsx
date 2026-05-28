import {
  Button,
  Card,
  Col,
  Empty,
  Grid,
  Popconfirm,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import dayjs from "dayjs";
import type { Investment } from "../../models/Investment";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const COL_PADDING = "8px 16px";

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
  return (
    <Card
      hoverable
      className="step-enter-right"
      style={{
        marginBottom: 4,
        animationDelay: `${Math.min(index, 9) * 40}ms`,
      }}
      styles={{ body: { padding: COL_PADDING } }}
    >
      <Row justify="center" align="middle">
        <Col span={6}>
          <Text strong>{investment.description ?? "—"}</Text>
          <Tag
            color={investment.investmentType.iconColor ?? undefined}
            style={{ marginLeft: 8 }}
          >
            {investment.investmentType.name}
          </Tag>
        </Col>
        <Col span={5}>
          <Text>
            {investment.currency.symbol}{" "}
            {investment.amount.toLocaleString("es-AR")}
          </Text>
        </Col>
        <Col span={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(investment.startDate).format("DD/MM/YY")}
          </Text>
        </Col>
        <Col span={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {investment.endDate ? dayjs(investment.endDate).format("DD/MM/YY") : "—"}
          </Text>
        </Col>
        <Col span={3}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {investment.owner}
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
  return (
    <Card
      hoverable
      className="step-enter-right"
      style={{
        marginBottom: 8,
        animationDelay: `${Math.min(index, 9) * 40}ms`,
      }}
      styles={{ body: { padding: "10px 12px" } }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
        <Text strong style={{ fontSize: 15 }}>
          {investment.description ?? "—"}
        </Text>
        <Text>
          {investment.currency.symbol}{" "}
          {investment.amount.toLocaleString("es-AR")}
        </Text>
      </Row>

      <Row gutter={[8, 4]} style={{ marginBottom: 6 }}>
        <Col>
          <Tag color={investment.investmentType.iconColor ?? undefined}>
            {investment.investmentType.name}
          </Tag>
        </Col>
        <Col>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(investment.startDate).fromNow()}
          </Text>
        </Col>
      </Row>

      <Row justify="space-between" align="middle">
        <Col>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Inicio: {dayjs(investment.startDate).format("DD/MM/YY")}
          </Text>
          {investment.endDate && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Fin: {dayjs(investment.endDate).format("DD/MM/YY")}
              </Text>
            </>
          )}
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
  onEdit,
  onDelete,
  isDeleting,
}: InvestmentTableProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (investments.length === 0) {
    return (
      <Empty
        description="Sin inversiones registradas"
        style={{ padding: "40px 0" }}
      />
    );
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
          <Col span={6}>Descripción / Tipo</Col>
          <Col span={5}>Monto</Col>
          <Col span={4}>Fecha inicio</Col>
          <Col span={4}>Fecha fin</Col>
          <Col span={3}>Propietario</Col>
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
