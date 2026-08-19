import TrophyOutlined from "@ant-design/icons/TrophyOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import { Button, Card, Empty, Flex, List, Progress, theme, Typography } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useGoals } from "@/apis/hooks/useGoal";
import { useUserDefault } from "@/apis/hooks/useSettings";
import { AddGoalButton } from "@/components/goals/GoalFormModal";
import type { GoalRecord } from "@/models/Goal";

const { Text, Title } = Typography;

const MAX_GOALS_SHOWN = 3;

function formatAmount(amount: number): string {
  return amount.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function getProgressColor(percent: number, token: ReturnType<typeof theme.useToken>["token"]): string {
  if (percent >= 100) return token.colorSuccess;
  if (percent >= 60) return token.colorPrimary;
  return token.colorWarning;
}

function GoalRow({ goal }: { goal: GoalRecord }) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const color = getProgressColor(goal.progressPercent, token);

  return (
    <List.Item style={{ padding: "10px 0", border: "none" }}>
      <div style={{ width: "100%" }}>
        <Flex justify="space-between" align="baseline" style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>{goal.name}</Text>
          <Text style={{ fontSize: 12, color, fontWeight: 600 }}>
            {goal.progressPercent.toFixed(0)}%
          </Text>
        </Flex>
        <Progress
          percent={goal.progressPercent}
          strokeColor={color}
          trailColor={token.colorFillSecondary}
          showInfo={false}
          size="small"
          style={{ marginBottom: 2 }}
        />
        <Text type="secondary" style={{ fontSize: 11 }}>
          {t("home.goals.rowDetail", {
            saved: `${goal.currency.symbol} ${formatAmount(goal.currentAmount)}`,
            target: `${goal.currency.symbol} ${formatAmount(goal.targetAmount)}`,
          })}
        </Text>
      </div>
    </List.Item>
  );
}

export default function GoalsPanel() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: defaultWorkspace } = useUserDefault("DEFAULT_WORKSPACE");
  const workspaceId = defaultWorkspace?.value ?? null;

  const { data: goals = [], isFetching } = useGoals(workspaceId);
  const shownGoals = goals.slice(0, MAX_GOALS_SHOWN);

  return (
    <Card
      className="fade-in-up"
      loading={isFetching}
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
        height: "100%",
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
        <Flex align="center" gap={8}>
          <TrophyOutlined style={{ color: token.colorWarning, fontSize: 16 }} />
          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
            {t("home.goals.title")}
          </Title>
        </Flex>
        {goals.length > 0 && (
          <Button
            type="link"
            size="small"
            onClick={() => navigate({ to: "/goals" })}
            style={{ paddingRight: 0, fontSize: 12 }}
          >
            {t("home.goals.viewAll")} <RightOutlined style={{ fontSize: 10 }} />
          </Button>
        )}
      </Flex>

      {goals.length === 0 ? (
        <Flex vertical align="center" gap={12} style={{ padding: "12px 0 4px" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("home.goals.empty")}
            style={{ margin: 0 }}
          />
          <AddGoalButton />
        </Flex>
      ) : (
        <>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("home.goals.subtitle")}
          </Text>
          <List
            dataSource={shownGoals}
            renderItem={(goal) => <GoalRow key={goal.id} goal={goal} />}
            split
            style={{ marginTop: 8 }}
          />
        </>
      )}
    </Card>
  );
}
