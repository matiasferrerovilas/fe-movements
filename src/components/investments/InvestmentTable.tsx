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
import { useTranslation } from "react-i18next";
import type { Investment } from "@/models/Investment";

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
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
      <Tooltip title={t("investments.edit")}>
        <Button
          icon={<EditOutlined />}
          size="small"
          aria-label={t("investments.editAriaLabel")}
          onClick={() => onEdit(investment)}
        />
      </Tooltip>
      <Popconfirm
        title={t("investments.deleteConfirmTitle")}
        okText={t("investments.yes")}
        cancelText={t("investments.no")}
        placement="topRight"
        onConfirm={() => onDelete(investment.id)}
      >
        <Tooltip title={t("investments.delete")}>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            aria-label={t("investments.deleteAriaLabel")}
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
  const { t } = useTranslation();
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
            {t("investments.mobileStartLabel")}{" "}
            {dayjs(investment.startDate).format("DD/MM/YY")}
          </Text>
          {investment.endDate && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("investments.mobileEndLabel")}{" "}
                {dayjs(investment.endDate).format("DD/MM/YY")}
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
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (investments.length === 0) {
    return (
      <Empty
        description={t("investments.emptyState")}
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
          <Col span={6}>{t("investments.columnDescriptionType")}</Col>
          <Col span={5}>{t("investments.columnAmount")}</Col>
          <Col span={4}>{t("investments.columnStartDate")}</Col>
          <Col span={4}>{t("investments.columnEndDate")}</Col>
          <Col span={3}>{t("investments.columnOwner")}</Col>
          <Col span={2} style={{ textAlign: "right" }}>
            {t("investments.columnActions")}
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
