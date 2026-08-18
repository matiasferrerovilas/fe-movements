import { createFileRoute } from "@tanstack/react-router";
import { Card, Col, Empty, Flex, Grid, Row, Spin, Typography } from "antd";
import { useState } from "react";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { useTranslation } from "react-i18next";
import { protectedRouteGuard } from "@/apis/auth/protectedRouteGuard";
import { useDeleteGoal, useGoals } from "@/apis/hooks/useGoal";
import { useCurrentWorkspace } from "@/apis/workspace/WorkspaceContext";
import { RoleEnum } from "@/enums/RoleEnum";
import { GoalCard } from "@/components/goals/GoalCard";
import {
  AddGoalButton,
  ContributeGoalModal,
  EditGoalModal,
} from "@/components/goals/GoalFormModal";
import type { GoalRecord } from "@/models/Goal";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export const Route = createFileRoute("/goals")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId ?? null;

  const { data: goals = [], isFetching } = useGoals(workspaceId);
  const deleteGoal = useDeleteGoal();

  const [editingGoal, setEditingGoal] = useState<GoalRecord | null>(null);
  const [contributingGoal, setContributingGoal] = useState<GoalRecord | null>(null);

  return (
    <div style={{ paddingTop: 24, paddingBottom: 40 }}>
      {/* Page header */}
      <div className="fade-in-up" style={{ marginBottom: 20, animationDelay: "0ms" }}>
        <Flex justify="space-between" align={isMobile ? "flex-start" : "center"} gap={12} vertical={isMobile}>
          <div>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
              {t("nav.goals")}
            </Title>
            <Text type="secondary">{t("goals.pageSubtitle")}</Text>
          </div>
          <AddGoalButton />
        </Flex>
      </div>

      {/* Goal list */}
      {!workspaceId ? (
        <Flex justify="center" style={{ padding: 60 }}>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      ) : isFetching ? (
        <Flex justify="center" style={{ padding: 60 }}>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      ) : goals.length === 0 ? (
        <Card className="fade-in-up" style={{ animationDelay: "120ms", textAlign: "center" }}>
          <Empty description={t("goals.noGoalsEmpty")} />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {goals.map((goal, index) => (
            <Col
              key={goal.id}
              xs={24}
              md={12}
              xl={8}
              className="fade-in-up"
              style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
            >
              <GoalCard
                goal={goal}
                onEdit={setEditingGoal}
                onContribute={setContributingGoal}
                onDelete={(id) => deleteGoal.mutate(id)}
                isDeleting={deleteGoal.isPending && deleteGoal.variables === goal.id}
              />
            </Col>
          ))}
        </Row>
      )}

      {editingGoal && (
        <EditGoalModal open={!!editingGoal} onClose={() => setEditingGoal(null)} goal={editingGoal} />
      )}
      {contributingGoal && (
        <ContributeGoalModal
          open={!!contributingGoal}
          onClose={() => setContributingGoal(null)}
          goal={contributingGoal}
        />
      )}
    </div>
  );
}
