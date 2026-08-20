import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TrophyOutlined from "@ant-design/icons/TrophyOutlined";
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
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { GoalRecord } from "@/models/Goal";
import PendingDeleteIndicator from "@/components/PendingDeleteIndicator";

const { Text } = Typography;

interface GoalCardProps {
  goal: GoalRecord;
  onEdit: (goal: GoalRecord) => void;
  onContribute: (goal: GoalRecord) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  isPendingRemoval?: boolean;
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return "#22c55e";
  if (percent >= 60) return "#3b82f6";
  return "#f59e0b";
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function GoalCard({
  goal,
  onEdit,
  onContribute,
  onDelete,
  isDeleting,
  isPendingRemoval,
}: GoalCardProps) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const progressColor = getProgressColor(goal.progressPercent);
  const isCompleted = goal.progressPercent >= 100;

  return (
    <Card
      styles={{ body: { padding: "16px 20px" } }}
      style={{
        position: "relative",
        borderRadius: token.borderRadiusLG,
        border: `1.5px solid ${token.colorBorderSecondary}`,
        ...(isPendingRemoval
          ? { opacity: 0.45, filter: "grayscale(70%)", pointerEvents: "none" }
          : {}),
      }}
    >
      {isPendingRemoval && <PendingDeleteIndicator />}
      <Flex align="flex-start" justify="space-between" gap={12}>
        <Flex align="flex-start" gap={14} style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: token.borderRadius,
              background: isCompleted
                ? `linear-gradient(135deg, ${token.colorSuccess} 0%, #16a34a 100%)`
                : `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrophyOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
              <Text strong style={{ fontSize: 15, color: token.colorText }}>
                {goal.name}
              </Text>
              {goal.targetDate && (
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
                  {dayjs(goal.targetDate).format("MM/YYYY")}
                </Text>
              )}
            </Flex>

            <Flex gap={16} style={{ marginBottom: 10 }}>
              <Flex vertical>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {t("goals.card.target")}
                </Text>
                <Text strong style={{ fontSize: 14 }}>
                  {goal.currency.symbol} {formatAmount(goal.targetAmount)}
                </Text>
              </Flex>
              <Flex vertical>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {t("goals.card.saved")}
                </Text>
                <Text strong style={{ fontSize: 14, color: progressColor }}>
                  {goal.currency.symbol} {formatAmount(goal.currentAmount)}
                </Text>
              </Flex>
            </Flex>

            <Progress
              percent={goal.progressPercent}
              strokeColor={progressColor}
              trailColor={token.colorFillSecondary}
              showInfo={false}
              size="small"
              style={{ marginBottom: 4 }}
            />
            <Text style={{ fontSize: 12, color: progressColor, fontWeight: 600 }}>
              {goal.progressPercent.toFixed(1)}% {t("goals.card.progressSuffix")}
              {isCompleted && (
                <Text
                  style={{
                    fontSize: 11,
                    color: token.colorSuccess,
                    marginLeft: 6,
                    fontWeight: 400,
                  }}
                >
                  {t("goals.card.completed")}
                </Text>
              )}
            </Text>
          </div>
        </Flex>

        <Space size={4} style={{ flexShrink: 0 }}>
          <Tooltip title={t("goals.card.contributeTooltip")}>
            <Button
              type="text"
              aria-label={t("goals.card.contributeAriaLabel", { name: goal.name })}
              icon={<PlusOutlined style={{ fontSize: 15 }} />}
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              onClick={() => onContribute(goal)}
            />
          </Tooltip>
          <Tooltip title={t("goals.card.editTooltip")}>
            <Button
              type="text"
              aria-label={t("goals.card.editAriaLabel", { name: goal.name })}
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
              onClick={() => onEdit(goal)}
            />
          </Tooltip>
          <Tooltip title={t("goals.card.deleteTooltip")}>
            <Popconfirm
              title={t("goals.card.deleteConfirmTitle")}
              description={t("goals.card.deleteConfirmDescription")}
              onConfirm={() => onDelete(goal.id)}
              okText={t("goals.card.deleteConfirmOk")}
              cancelText={t("goals.cancel")}
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                aria-label={t("goals.card.deleteAriaLabel", { name: goal.name })}
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
