import { useState } from "react";
import { App, Button, Flex, Select, Typography } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import { useWorkspaces } from "../apis/hooks/useWorkspaces";
import {
  useInvestments,
  useCreateInvestment,
  useUpdateInvestment,
  useDeleteInvestment,
} from "../apis/hooks/useInvestments";
import { useInvestmentTypes } from "../apis/hooks/useInvestmentTypes";
import { useCurrency } from "../apis/hooks/useCurrency";
import { useInvestmentsSubscription } from "../apis/websocket/useInvestmentsSubscription";
import { InvestmentDashboard } from "../components/investments/InvestmentDashboard";
import { InvestmentTable } from "../components/investments/InvestmentTable";
import { InvestmentForm } from "../components/investments/InvestmentForm";
import type { Investment, CreateInvestmentForm } from "../models/Investment";

const { Title } = Typography;

export const Route = createFileRoute("/inversiones")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { message } = App.useApp();
  const { data: workspaces = [] } = useWorkspaces();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | undefined>(
    () => workspaces[0]?.workspaceId,
  );

  const accountId = selectedWorkspaceId ?? workspaces[0]?.workspaceId;

  const { data: investments = [], isFetching } = useInvestments(accountId);
  const { data: investmentTypes = [] } = useInvestmentTypes();
  const { data: currencies = [] } = useCurrency();

  useInvestmentsSubscription();

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();

  const createMutation = useCreateInvestment(accountId ?? 0, {
    onSuccess: () => {
      void message.success("Inversión agregada");
      setFormOpen(false);
    },
  });

  const updateMutation = useUpdateInvestment({
    onSuccess: () => {
      void message.success("Inversión actualizada");
      setFormOpen(false);
      setEditingInvestment(undefined);
    },
  });

  const deleteMutation = useDeleteInvestment({
    onSuccess: () => {
      void message.success("Inversión eliminada");
    },
  });

  const handleOpenCreate = () => {
    setEditingInvestment(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingInvestment(undefined);
  };

  const handleSubmit = (values: CreateInvestmentForm) => {
    if (editingInvestment) {
      updateMutation.mutate({ id: editingInvestment.id, form: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ paddingTop: 30 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Inversiones
        </Title>
        <Flex gap={8} align="center">
          {workspaces.length > 1 && (
            <Select
              value={accountId}
              onChange={setSelectedWorkspaceId}
              style={{ minWidth: 160 }}
              options={workspaces.map((w) => ({
                value: w.workspaceId,
                label: w.workspaceName,
              }))}
            />
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            disabled={accountId == null}
          >
            Agregar inversión
          </Button>
        </Flex>
      </Flex>

      <InvestmentDashboard investments={investments} isFetching={isFetching} />

      <InvestmentTable
        investments={investments}
        isFetching={isFetching}
        onEdit={handleOpenEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />

      <InvestmentForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        investmentTypes={investmentTypes}
        currencies={currencies}
        investment={editingInvestment}
      />
    </div>
  );
}
