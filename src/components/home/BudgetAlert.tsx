import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button, Col, Divider, Flex, Row, theme, Typography } from "antd";
import { ArrowRightOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useUserDefault } from "../../apis/hooks/useSettings";
import { useCurrency } from "../../apis/hooks/useCurrency";
import { useBudgets, useDeleteBudget } from "../../apis/hooks/useBudget";
import { BudgetCard } from "../budgets/BudgetCard";
import { EditBudgetModal } from "../budgets/BudgetFormModal";
import type { BudgetRecord } from "../../models/Budget";

const { Text, Title } = Typography;

const ALERT_THRESHOLD = 50;

export default function BudgetAlert() {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");
  const { data: currencies } = useCurrency();

  const currencyId = defaultCurrency?.value ?? null;
  const currencySymbol =
    currencyId !== null
      ? (currencies?.find((c) => c.id === currencyId)?.symbol ?? null)
      : null;

  const now = dayjs();
  const year = now.year();
  const month = now.month() + 1;

  // El backend usa el workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: budgets } = useBudgets({
    currency: currencySymbol ?? "",
    year,
    month,
  });

  const deleteBudget = useDeleteBudget();
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);

  // Don't render anything if the user has no currency configured
  if (!currencySymbol) return null;

  const alertBudgets = (budgets ?? []).filter(
    (b) => b.percentage >= ALERT_THRESHOLD,
  );

  if (alertBudgets.length === 0) return null;

  return (
    <>
      <Divider style={{ margin: "20px 0 14px" }} />

      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: 16 }}
        className="fade-in-up"
      >
        <Flex align="center" gap={8}>
          <WarningOutlined
            style={{ color: token.colorWarning, fontSize: 16 }}
          />
          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
            Presupuestos en alerta
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              background: token.colorFillSecondary,
              padding: "1px 8px",
              borderRadius: 99,
            }}
          >
            {alertBudgets.length}
          </Text>
        </Flex>

        <Button
          type="link"
          size="small"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          onClick={() => navigate({ to: "/budgets" })}
          style={{ padding: 0, fontSize: 13 }}
          data-testid="ver-todos-link"
        >
          Ver todos
        </Button>
      </Flex>

      <Row
        gutter={[16, 16]}
        className="fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        {alertBudgets.map((budget) => (
          <Col key={budget.id} xs={24} sm={12} lg={8}>
            <BudgetCard
              budget={budget}
              onEdit={setEditingBudget}
              onDelete={(id) => deleteBudget.mutate(id)}
              isDeleting={
                deleteBudget.isPending &&
                deleteBudget.variables === budget.id
              }
            />
          </Col>
        ))}
      </Row>

      {editingBudget && (
        <EditBudgetModal
          open
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
        />
      )}
    </>
  );
}
