import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  List,
  Result,
  Skeleton,
  Statistic,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import { useUserDefault } from "@/apis/hooks/useSettings";
import { usePayService, useUnpaidSubscriptions } from "@/apis/hooks/useService";
import {
  useWorkspaceSummary,
  useWorkspaceSummaryByUser,
  useMarkMonthlySummarySeen,
} from "@/apis/hooks/useWorkspaceSummary";
import AddMovementModal from "@/components/modals/movements/AddMovementModal";
import type { Service } from "@/models/Service";
import type { WorkspaceSummaryPerCurrency } from "@/models/WorkspaceSummary";

const { Title, Text, Paragraph } = Typography;

interface MonthCloseFlowProps {
  year: number;
  month: number;
}

function money(amount: number, symbol = "$"): string {
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  // Símbolos de un solo carácter ("$", "€") pegados; códigos ("ARS", "EUR") con espacio.
  const sep = symbol.length > 1 ? " " : "";
  return `${amount < 0 ? "-" : ""}${symbol}${sep}${formatted}`;
}

function serviceAmount(service: Service): string {
  return money(service.amount, service.currency?.symbol ?? "$");
}

// ── Paso 1: conciliación ──────────────────────────────────────────────────────

function ReconcileStep({
  year,
  month,
  onContinue,
}: {
  year: number;
  month: number;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: unpaid = [], isLoading, isError, refetch } = useUnpaidSubscriptions(year, month);
  const payService = usePayService();
  const [payingId, setPayingId] = useState<number | null>(null);

  const handlePay = async (service: Service) => {
    setPayingId(service.id);
    try {
      await payService.mutateAsync(service);
      await refetch();
    } finally {
      setPayingId(null);
    }
  };

  return (
    <>
      <Title level={4} style={{ marginTop: 0 }}>
        {t("home.monthClose.reconcileTitle")}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 20 }}>
        {t("home.monthClose.reconcileHelp")}
      </Paragraph>

      {isLoading && <Skeleton active paragraph={{ rows: 3 }} />}

      {isError && (
        <Alert type="error" showIcon title={t("home.monthClose.errorMessage")} style={{ marginBottom: 16 }} />
      )}

      {!isLoading && !isError && unpaid.length === 0 && (
        <Alert
          type="success"
          showIcon
          title={t("home.monthClose.reconcileAllPaid")}
          style={{ marginBottom: 16 }}
        />
      )}

      {unpaid.length > 0 && (
        <List
          size="small"
          bordered
          style={{ marginBottom: 16, borderRadius: token.borderRadius }}
          dataSource={unpaid}
          renderItem={(service) => (
            <List.Item
              actions={[
                <Button
                  key="pay"
                  size="small"
                  type="primary"
                  loading={payingId === service.id}
                  onClick={() => handlePay(service)}
                >
                  {t("home.monthClose.pay")}
                </Button>,
              ]}
            >
              <Flex vertical gap={0}>
                <Text>{service.description}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {serviceAmount(service)}
                </Text>
              </Flex>
            </List.Item>
          )}
        />
      )}

      <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
        <AddMovementModal
          trigger={(onClick) => (
            <Button icon={<PlusOutlined />} onClick={onClick}>
              {t("home.monthClose.addMovement")}
            </Button>
          )}
        />
        <Button type="primary" iconPosition="end" icon={<RightOutlined />} onClick={onContinue}>
          {t("home.monthClose.continue")}
        </Button>
      </Flex>
    </>
  );
}

// ── Paso 2: recap ─────────────────────────────────────────────────────────────

// Un bloque por moneda — solo se rinden las que tuvieron actividad (ver el filtro en WorkspaceTab).
function CurrencyRecap({ data }: { data: WorkspaceSummaryPerCurrency }) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const saved = data.net;

  return (
    <div>
      <Flex align="baseline" gap={8} style={{ marginBottom: 8 }}>
        <Text strong style={{ letterSpacing: "0.02em" }}>
          {data.currency}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {t("home.monthClose.movementsCount", { count: data.movementCount })}
        </Text>
      </Flex>

      <Flex gap={24} wrap="wrap" style={{ marginBottom: 8 }}>
        <Statistic
          title={t("home.monthClose.spent")}
          value={money(data.totalSpent, data.currency)}
          valueStyle={{ color: token.colorError }}
        />
        <Statistic
          title={saved >= 0 ? t("home.monthClose.saved") : t("home.monthClose.overspent")}
          value={money(saved, data.currency)}
          valueStyle={{ color: saved >= 0 ? token.colorSuccess : token.colorError }}
        />
      </Flex>

      <Flex gap={24} wrap="wrap">
        <Statistic
          title={t("home.monthClose.inDebit")}
          value={money(data.totalSpentDebit, data.currency)}
          valueStyle={{ fontSize: 18 }}
        />
        <Statistic
          title={t("home.monthClose.inCredit")}
          value={money(data.totalSpentCredit, data.currency)}
          valueStyle={{ fontSize: 18 }}
        />
      </Flex>

      {data.topSpendingCategory && (
        <Flex align="center" gap={8} style={{ marginTop: 16 }}>
          <Text type="secondary">{t("home.monthClose.topCategory")}:</Text>
          <Tag style={{ margin: 0, fontWeight: 600 }}>{data.topSpendingCategory}</Tag>
        </Flex>
      )}
    </div>
  );
}

function WorkspaceTab({
  workspaceId,
  year,
  month,
}: {
  workspaceId: number | null;
  year: number;
  month: number;
}) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWorkspaceSummary(workspaceId, year, month);

  const visibleCurrencies = (data?.perCurrency ?? []).filter(
    (c) => c.totalSpent > 0 || c.totalIncome > 0,
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (isError)
    return <Alert type="error" showIcon title={t("home.monthClose.errorMessage")} />;
  if (visibleCurrencies.length === 0)
    return <Empty description={t("home.monthClose.noData")} image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <>
      {visibleCurrencies.map((currency, idx) => (
        <div key={currency.currency}>
          {idx > 0 && <Divider style={{ margin: "16px 0" }} />}
          <CurrencyRecap data={currency} />
        </div>
      ))}
    </>
  );
}

function UserBreakdownTab({
  workspaceId,
  year,
  month,
  active,
}: {
  workspaceId: number | null;
  year: number;
  month: number;
  active: boolean;
}) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data, isLoading, isError } = useWorkspaceSummaryByUser(
    workspaceId,
    year,
    month,
    active,
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (isError)
    return <Alert type="error" showIcon title={t("home.monthClose.errorMessage")} />;
  if (!data || data.length === 0)
    return (
      <Empty
        description={t("home.monthClose.byUserEmpty")}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <List
      size="small"
      dataSource={data}
      renderItem={(user) => (
        <List.Item>
          <Flex vertical gap={4} style={{ width: "100%" }}>
            <Text strong>{user.name}</Text>
            {user.perCurrency.map((c) => (
              <Flex key={c.currency} justify="space-between" wrap="wrap" gap={8}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {c.currency} · {t("home.monthClose.movementsCount", { count: c.movementCount })}
                </Text>
                <Text style={{ fontSize: 13, color: token.colorError }}>
                  {money(c.totalSpent, c.currency)}
                </Text>
              </Flex>
            ))}
          </Flex>
        </List.Item>
      )}
    />
  );
}

function RecapStep({
  workspaceId,
  year,
  month,
  onBack,
  onDone,
  dismissing,
}: {
  workspaceId: number | null;
  year: number;
  month: number;
  onBack: () => void;
  onDone: () => void;
  dismissing: boolean;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"workspace" | "byUser">("workspace");

  return (
    <>
      <Title level={4} style={{ marginTop: 0 }}>
        {t("home.monthClose.recapTitle")}
      </Title>

      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as "workspace" | "byUser")}
        items={[
          {
            key: "workspace",
            label: t("home.monthClose.tabWorkspace"),
            children: <WorkspaceTab workspaceId={workspaceId} year={year} month={month} />,
          },
          {
            key: "byUser",
            label: t("home.monthClose.tabByUser"),
            children: (
              <UserBreakdownTab
                workspaceId={workspaceId}
                year={year}
                month={month}
                active={tab === "byUser"}
              />
            ),
          },
        ]}
      />

      <Flex justify="space-between" align="center" style={{ marginTop: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} disabled={dismissing}>
          {t("home.monthClose.back")}
        </Button>
        <Button type="primary" icon={<CheckOutlined />} loading={dismissing} onClick={onDone}>
          {t("home.monthClose.done")}
        </Button>
      </Flex>
    </>
  );
}

// ── Flujo completo (guard a pantalla completa) ────────────────────────────────

export default function MonthCloseFlow({ year, month }: MonthCloseFlowProps) {
  const { t, i18n } = useTranslation();
  const { token } = theme.useToken();
  const [step, setStep] = useState<"reconcile" | "recap">("reconcile");

  const { data: defaultWorkspace } = useUserDefault("DEFAULT_WORKSPACE");
  const workspaceId = defaultWorkspace?.value ?? null;

  const markSeen = useMarkMonthlySummarySeen();

  const monthLabel = dayjs()
    .locale(i18n.language.startsWith("es") ? "es" : "en")
    .year(year)
    .month(month - 1)
    .format("MMMM YYYY");

  const handleDone = () => {
    if (workspaceId == null) return;
    markSeen.mutate({ workspaceId, year, month });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: token.colorBgLayout,
        padding: "24px 16px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{ width: 560, maxWidth: "100%", borderRadius: token.borderRadiusLG }}
        styles={{ body: { padding: 28 } }}
      >
        {markSeen.isError ? (
          <Result
            status="warning"
            title={t("home.monthClose.errorMessage")}
            extra={
              <Button type="primary" onClick={handleDone} loading={markSeen.isPending}>
                {t("home.monthClose.done")}
              </Button>
            }
          />
        ) : (
          <>
            <Text type="secondary" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>
              {t("home.monthClose.title")}{" "}
              <span style={{ color: token.colorPrimary, textTransform: "capitalize" }}>{monthLabel}</span>
            </Text>
            <Paragraph type="secondary" style={{ margin: "6px 0 20px" }}>
              {t("home.monthClose.subtitle")}
            </Paragraph>

            {step === "reconcile" ? (
              <ReconcileStep year={year} month={month} onContinue={() => setStep("recap")} />
            ) : (
              <RecapStep
                workspaceId={workspaceId}
                year={year}
                month={month}
                onBack={() => setStep("reconcile")}
                onDone={handleDone}
                dismissing={markSeen.isPending}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
