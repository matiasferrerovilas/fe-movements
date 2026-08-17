import { useState } from "react";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  InputNumber,
  Select,
  Tabs,
  Typography,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import ModalComponent from "@/components/modals/Modal";
import { useAddBudget, useUpdateBudget } from "@/apis/hooks/useBudget";
import { useCategory } from "@/apis/hooks/useCategory";
import { useCurrency } from "@/apis/hooks/useCurrency";
import type { BudgetRecord, BudgetToAdd } from "@/models/Budget";

const { Text } = Typography;

// ── Add form ────────────────────────────────────────────────────────────────

type BudgetType = "RECURRING" | "ONE_TIME" | "ANNUAL";

interface AddBudgetForm {
  category: string | null;
  currency: string;
  amount: number;
  monthYear?: Dayjs;
  year?: Dayjs;
}

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddBudgetModal({ open, onClose }: AddBudgetModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<AddBudgetForm>();
  const [budgetType, setBudgetType] = useState<BudgetType>("RECURRING");

  const BUDGET_TYPE_TABS = [
    { key: "RECURRING", label: t("budgets.typeRecurring") },
    { key: "ONE_TIME", label: t("budgets.typeOneTime") },
    { key: "ANNUAL", label: t("budgets.typeAnnual") },
  ];

  const addBudget = useAddBudget();

  // Las categorías se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: categories = [] } = useCategory();

  const { data: currencies = [] } = useCurrency();

  const handleClose = () => {
    form.resetFields();
    setBudgetType("RECURRING");
    onClose();
  };

  const onFinish = (values: AddBudgetForm) => {
    const year =
      budgetType === "ONE_TIME"
        ? (values.monthYear?.year() ?? null)
        : budgetType === "ANNUAL"
          ? (values.year?.year() ?? null)
          : null;
    const month =
      budgetType === "ONE_TIME" && values.monthYear
        ? values.monthYear.month() + 1
        : null;

    const payload: BudgetToAdd = {
      category: values.category ?? null,
      currency: values.currency,
      amount: values.amount,
      year,
      month,
    };

    addBudget.mutate(payload, { onSuccess: handleClose });
  };

  const categoryOptions = [
    { label: t("budgets.noCategoryOption"), value: "__none__" },
    ...categories.map((c) => ({ label: c.description, value: c.description })),
  ];

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title={t("budgets.addBudgetTitle")}
      width={480}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>{t("budgets.cancel")}</Button>
          <Button
            type="primary"
            loading={addBudget.isPending}
            onClick={() => form.submit()}
          >
            {t("budgets.add")}
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ monthYear: dayjs(), year: dayjs() }}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          name="currency"
          label={t("budgets.currencyLabel")}
          rules={[{ required: true, message: t("budgets.selectCurrencyPlaceholder") }]}
        >
          <Select
            placeholder={t("budgets.selectCurrencyPlaceholder")}
            options={currencies.map((c) => ({
              label: c.symbol,
              value: c.symbol,
            }))}
          />
        </Form.Item>

        <Form.Item name="category" label={t("budgets.categoryLabel")}>
          <Select
            placeholder={t("budgets.noCategoryOption")}
            options={categoryOptions}
            allowClear
            onChange={(val) => {
              if (val === "__none__") form.setFieldValue("category", null);
            }}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label={t("budgets.amountLabel")}
          rules={[
            { required: true, message: t("budgets.enterAmountMessage") },
            {
              type: "number",
              min: 0.01,
              message: t("budgets.amountMinMessage"),
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder={t("budgets.amountPlaceholder")}
            precision={2}
            min={0.01}
          />
        </Form.Item>

        <Form.Item label={t("budgets.budgetTypeLabel")}>
          <Tabs
            activeKey={budgetType}
            onChange={(key) => setBudgetType(key as BudgetType)}
            items={BUDGET_TYPE_TABS}
          />
        </Form.Item>

        {budgetType === "ONE_TIME" && (
          <Form.Item
            name="monthYear"
            label={t("budgets.monthYearLabel")}
            rules={[{ required: true, message: t("budgets.selectMonthMessage") }]}
          >
            <DatePicker
              picker="month"
              style={{ width: "100%" }}
              format="MM/YYYY"
              placeholder={t("budgets.selectMonthMessage")}
            />
          </Form.Item>
        )}

        {budgetType === "ANNUAL" && (
          <Form.Item
            name="year"
            label={t("budgets.yearLabel")}
            rules={[{ required: true, message: t("budgets.selectYearMessage") }]}
          >
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              format="YYYY"
              placeholder={t("budgets.selectYearMessage")}
            />
          </Form.Item>
        )}
      </Form>
    </ModalComponent>
  );
}

// ── Edit form ───────────────────────────────────────────────────────────────

interface EditBudgetForm {
  amount: number;
}

interface EditBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetRecord;
}

export function EditBudgetModal({
  open,
  onClose,
  budget,
}: EditBudgetModalProps) {
  const [form] = Form.useForm<EditBudgetForm>();
  const updateBudget = useUpdateBudget();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: EditBudgetForm) => {
    updateBudget.mutate(
      { id: budget.id, payload: { amount: values.amount } },
      { onSuccess: handleClose },
    );
  };

  const categoryName = budget.category?.description ?? "Sin categoría";

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title={`Editar presupuesto — ${categoryName}`}
      width={400}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="primary"
            loading={updateBudget.isPending}
            onClick={() => form.submit()}
          >
            Guardar
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ amount: budget.amount }}
        style={{ marginTop: 8 }}
      >
        <Flex gap={16} style={{ marginBottom: 16 }}>
          <Flex vertical>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Moneda
            </Text>
            <Text strong>{budget.currency.symbol}</Text>
          </Flex>
          <Flex vertical>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Categoría
            </Text>
            <Text strong>{categoryName}</Text>
          </Flex>
        </Flex>

        <Form.Item
          name="amount"
          label="Nuevo monto"
          rules={[
            { required: true, message: "Ingresá un monto" },
            {
              type: "number",
              min: 0.01,
              message: "El monto debe ser mayor a 0",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="0.00"
            precision={2}
            min={0.01}
            autoFocus
          />
        </Form.Item>
      </Form>
    </ModalComponent>
  );
}

// ── Trigger button wrapper ──────────────────────────────────────────────────

export function AddBudgetButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        + Agregar presupuesto
      </Button>
      <AddBudgetModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
