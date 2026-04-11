import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  Col,
  Empty,
  Flex,
  Grid,
  Row,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { useBudgets } from "../apis/hooks/useBudget";
import { useDeleteBudget } from "../apis/hooks/useBudget";
import { useUserDefault } from "../apis/hooks/useSettings";
import { useWorkspaces } from "../apis/hooks/useWorkspaces";
import { useCurrency } from "../apis/hooks/useCurrency";
import { RoleEnum } from "../enums/RoleEnum";
import { BudgetCard } from "../components/budgets/BudgetCard";
import {
  BudgetFilters,
  type BudgetFilterValues,
} from "../components/budgets/BudgetFilters";
import {
  AddBudgetButton,
  EditBudgetModal,
} from "../components/budgets/BudgetFormModal";
import type { BudgetRecord } from "../models/Budget";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CURRENT_YEAR = dayjs().year();
const CURRENT_MONTH = dayjs().month() + 1;

export const Route = createFileRoute("/budgets")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [filters, setFilters] = useState<BudgetFilterValues>({
    workspaceId: null,
    currency: null,
  });
  const filtersRef = useRef(filters);

  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);

  const { data: memberships = [] } = useWorkspaces();
  const { data: currencies = [] } = useCurrency();
  const { data: defaultAccount } = useUserDefault("DEFAULT_WORKSPACE");
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");

  // Pre-populate filters with user defaults once data is available
  useEffect(() => {
    if (
      defaultAccount?.value &&
      filtersRef.current.workspaceId === null &&
      memberships.some((m) => m.workspaceId === defaultAccount.value)
    ) {
      const next = { ...filtersRef.current, workspaceId: defaultAccount.value };
      filtersRef.current = next;
      setFilters(next);
    }
  }, [defaultAccount, memberships]);

  useEffect(() => {
    const symbol = currencies.find(
      (c) => c.id === defaultCurrency?.value,
    )?.symbol;
    if (symbol && filtersRef.current.currency === null) {
      const next = { ...filtersRef.current, currency: symbol };
      filtersRef.current = next;
      setFilters(next);
    }
  }, [currencies, defaultCurrency]);

  const handleFiltersChange = useCallback((next: BudgetFilterValues) => {
    filtersRef.current = next;
    setFilters(next);
  }, []);

  const isReady = !!(filters.workspaceId && filters.currency);

  const { data: budgets = [], isFetching } = useBudgets(
    {
      workspaceId: filters.workspaceId ?? 0,
      currency: filters.currency ?? "",
      year: CURRENT_YEAR,
      month: CURRENT_MONTH,
    },
  );

  const deleteBudget = useDeleteBudget();

  const monthLabel = dayjs()
    .locale("es")
    .format("MMMM YYYY")
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div style={{ paddingTop: 24, paddingBottom: 40 }}>
      {/* ── Page header ── */}
      <div
        className="fade-in-up"
        style={{ marginBottom: 20, animationDelay: "0ms" }}
      >
        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
          Presupuestos
        </Title>
        <Text type="secondary">{monthLabel}</Text>
      </div>

      {/* ── Filters + Add button ── */}
      <Card
        className="fade-in-up"
        style={{ marginBottom: 24, animationDelay: "60ms" }}
      >
        <Flex
          justify="space-between"
          align={isMobile ? "flex-start" : "flex-end"}
          gap={16}
          vertical={isMobile}
        >
          <div style={{ flex: 1 }}>
            <BudgetFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          <AddBudgetButton />
        </Flex>
      </Card>

      {/* ── Budget list ── */}
      {!isReady ? (
        <Card
          className="fade-in-up"
          style={{ animationDelay: "120ms", textAlign: "center" }}
        >
          <Empty description="Seleccioná un grupo y una moneda para ver los presupuestos" />
        </Card>
      ) : isFetching ? (
        <Flex justify="center" style={{ padding: 60 }}>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      ) : budgets.length === 0 ? (
        <Card
          className="fade-in-up"
          style={{ animationDelay: "120ms", textAlign: "center" }}
        >
          <Empty
            description={`No hay presupuestos para ${filters.currency} en ${monthLabel}`}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {budgets.map((budget, index) => (
            <Col
              key={budget.id}
              xs={24}
              md={12}
              xl={8}
              className="fade-in-up"
              style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
            >
              <BudgetCard
                budget={budget}
                onEdit={setEditingBudget}
                onDelete={(id) => deleteBudget.mutate(id)}
                isDeleting={deleteBudget.isPending}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* ── Edit modal ── */}
      {editingBudget && (
        <EditBudgetModal
          open={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          budget={editingBudget}
        />
      )}
    </div>
  );
}
