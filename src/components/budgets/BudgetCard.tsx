import {
  DeleteOutlined,
  EditOutlined,
  FundOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Popconfirm,
  Progress,
  Space,
  theme,
  Tooltip,
  Typography,
} from "antd";
import type { BudgetRecord } from "../../models/Budget";

const { Text } = Typography;

interface BudgetCardProps {
  budget: BudgetRecord;
  onEdit: (budget: BudgetRecord) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return "#ef4444";
  if (percentage >= 80) return "#f59e0b";
  return "#22c55e";
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function BudgetCard({
  budget,
  onEdit,
  onDelete,
  isDeleting,
}: BudgetCardProps) {
  const { token } = theme.useToken();
  const progressColor = getProgressColor(budget.percentage);
  const categoryName = budget.category?.description ?? "Sin categoría";
  const isRecurring = budget.year === null && budget.month === null;

  return (
    <Card
      styles={{ body: { padding: "16px 20px" } }}
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1.5px solid ${token.colorBorderSecondary}`,
        transition: "box-shadow 0.2s ease",
      }}
    >
      <Flex align="flex-start" justify="space-between" gap={12}>
        {/* Icon + Info */}
        <Flex align="flex-start" gap={14} style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: token.borderRadius,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FundOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
              <Text
                strong
                style={{ fontSize: 15, color: token.colorText }}
              >
                {categoryName}
              </Text>
              {isRecurring && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    background: token.colorFillSecondary,
                    padding: "1px 7px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  Recurrente
                </Text>
              )}
            </Flex>

            <Flex gap={16} style={{ marginBottom: 10 }}>
              <Flex vertical>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Presupuestado
                </Text>
                <Text strong style={{ fontSize: 14 }}>
                  {budget.currency.symbol} {formatAmount(budget.amount)}
                </Text>
              </Flex>
              <Flex vertical>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Gastado
                </Text>
                <Text
                  strong
                  style={{ fontSize: 14, color: progressColor }}
                >
                  {budget.currency.symbol} {formatAmount(budget.spent)}
                </Text>
              </Flex>
            </Flex>

            <Progress
              percent={Math.min(budget.percentage, 100)}
              strokeColor={progressColor}
              trailColor={token.colorFillSecondary}
              showInfo={false}
              size="small"
              style={{ marginBottom: 4 }}
            />
            <Text
              style={{ fontSize: 12, color: progressColor, fontWeight: 600 }}
            >
              {budget.percentage.toFixed(1)}% utilizado
              {budget.percentage > 100 && (
                <Text
                  style={{
                    fontSize: 11,
                    color: token.colorError,
                    marginLeft: 6,
                    fontWeight: 400,
                  }}
                >
                  (excedido)
                </Text>
              )}
            </Text>
          </div>
        </Flex>

        {/* Actions */}
        <Space size={4} style={{ flexShrink: 0 }}>
          <Tooltip title="Editar monto">
            <Button
              type="text"
              aria-label={`Editar presupuesto ${categoryName}`}
              icon={<EditOutlined style={{ fontSize: 15 }} />}
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              onClick={() => onEdit(budget)}
            />
          </Tooltip>
          <Tooltip title="Eliminar presupuesto">
            <Popconfirm
              title="¿Eliminar este presupuesto?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => onDelete(budget.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                aria-label={`Eliminar presupuesto ${categoryName}`}
                icon={<DeleteOutlined style={{ fontSize: 15 }} />}
                style={{
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                disabled={isDeleting}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </Flex>
    </Card>
  );
}
