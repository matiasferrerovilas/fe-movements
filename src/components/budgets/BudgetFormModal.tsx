import { useState } from "react";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  InputNumber,
  Select,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import ModalComponent from "../modals/Modal";
import { useAddBudget, useUpdateBudget } from "../../apis/hooks/useBudget";
import { useCategory } from "../../apis/hooks/useCategory";
import { useCurrency } from "../../apis/hooks/useCurrency";
import type { BudgetRecord, BudgetToAdd } from "../../models/Budget";

const { Text } = Typography;

// ── Add form ────────────────────────────────────────────────────────────────

interface AddBudgetForm {
  category: string | null;
  currency: string;
  amount: number;
  isRecurring: boolean;
  monthYear?: Dayjs;
}

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddBudgetModal({ open, onClose }: AddBudgetModalProps) {
  const [form] = Form.useForm<AddBudgetForm>();
  const isRecurring = Form.useWatch("isRecurring", form);

  const addBudget = useAddBudget();
  
  // Las categorías se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: categories = [] } = useCategory();
  
  const { data: currencies = [] } = useCurrency();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: AddBudgetForm) => {
    const year = values.isRecurring ? null : (values.monthYear?.year() ?? null);
    const month = values.isRecurring
      ? null
      : (values.monthYear?.month() != null
          ? values.monthYear!.month() + 1
          : null);

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
    { label: "Sin categoría", value: "__none__" },
    ...categories.map((c) => ({ label: c.description, value: c.description })),
  ];

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title="Agregar presupuesto"
      width={480}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="primary"
            loading={addBudget.isPending}
            onClick={() => form.submit()}
          >
            Agregar
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ isRecurring: true, monthYear: dayjs() }}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          name="currency"
          label="Moneda"
          rules={[{ required: true, message: "Seleccioná una moneda" }]}
        >
          <Select
            placeholder="Seleccioná una moneda"
            options={currencies.map((c) => ({
              label: c.symbol,
              value: c.symbol,
            }))}
          />
        </Form.Item>

        <Form.Item name="category" label="Categoría">
          <Select
            placeholder="Sin categoría"
            options={categoryOptions}
            allowClear
            onChange={(val) => {
              if (val === "__none__") form.setFieldValue("category", null);
            }}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Monto"
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
          />
        </Form.Item>

        <Form.Item name="isRecurring" label="Recurrente" valuePropName="checked">
          <Switch />
        </Form.Item>

        {!isRecurring && (
          <Form.Item
            name="monthYear"
            label="Mes y año"
            rules={[{ required: true, message: "Seleccioná el mes" }]}
          >
            <DatePicker
              picker="month"
              style={{ width: "100%" }}
              format="MM/YYYY"
              placeholder="Seleccioná el mes"
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
