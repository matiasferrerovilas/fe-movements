import { useState } from "react";
import { Button, DatePicker, Flex, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import ModalComponent from "@/components/modals/Modal";
import { useAddGoal, useContributeGoal, useUpdateGoal } from "@/apis/hooks/useGoal";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useCurrentWorkspace } from "@/apis/workspace/WorkspaceContext";
import type { GoalRecord } from "@/models/Goal";

// ── Add form ────────────────────────────────────────────────────────────────

interface AddGoalForm {
  name: string;
  currency: string;
  targetAmount: number;
  targetDate?: Dayjs;
}

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddGoalModal({ open, onClose }: AddGoalModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<AddGoalForm>();
  const addGoal = useAddGoal();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: currencies = [] } = useCurrency();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: AddGoalForm) => {
    if (!currentWorkspace) return;
    addGoal.mutate(
      {
        workspaceId: currentWorkspace.workspaceId,
        name: values.name,
        targetAmount: values.targetAmount,
        currency: values.currency,
        targetDate: values.targetDate ? values.targetDate.format("YYYY-MM-DD") : null,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title={t("goals.addGoalTitle")}
      width={480}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>{t("goals.cancel")}</Button>
          <Button type="primary" loading={addGoal.isPending} onClick={() => form.submit()}>
            {t("goals.add")}
          </Button>
        </Flex>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
        <Form.Item
          name="name"
          label={t("goals.nameLabel")}
          rules={[{ required: true, message: t("goals.enterNameMessage") }]}
        >
          <Input placeholder={t("goals.namePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="currency"
          label={t("goals.currencyLabel")}
          rules={[{ required: true, message: t("goals.selectCurrencyPlaceholder") }]}
        >
          <Select
            placeholder={t("goals.selectCurrencyPlaceholder")}
            options={currencies.map((c) => ({ label: c.symbol, value: c.symbol }))}
          />
        </Form.Item>

        <Form.Item
          name="targetAmount"
          label={t("goals.targetAmountLabel")}
          rules={[
            { required: true, message: t("goals.enterAmountMessage") },
            { type: "number", min: 0.01, message: t("goals.amountMinMessage") },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder={t("goals.amountPlaceholder")}
            precision={2}
            min={0.01}
          />
        </Form.Item>

        <Form.Item name="targetDate" label={t("goals.targetDateLabel")}>
          <DatePicker
            picker="month"
            style={{ width: "100%" }}
            format="MM/YYYY"
            placeholder={t("goals.selectTargetDateMessage")}
            disabledDate={(date) => date.isBefore(dayjs().startOf("month"))}
          />
        </Form.Item>
      </Form>
    </ModalComponent>
  );
}

// ── Edit form ───────────────────────────────────────────────────────────────

interface EditGoalForm {
  name: string;
  targetAmount: number;
  targetDate?: Dayjs;
}

interface EditGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalRecord;
}

export function EditGoalModal({ open, onClose, goal }: EditGoalModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<EditGoalForm>();
  const updateGoal = useUpdateGoal();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: EditGoalForm) => {
    updateGoal.mutate(
      {
        id: goal.id,
        payload: {
          name: values.name,
          targetAmount: values.targetAmount,
          targetDate: values.targetDate ? values.targetDate.format("YYYY-MM-DD") : null,
        },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title={t("goals.edit.title", { name: goal.name })}
      width={440}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>{t("goals.cancel")}</Button>
          <Button type="primary" loading={updateGoal.isPending} onClick={() => form.submit()}>
            {t("goals.edit.save")}
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate ? dayjs(goal.targetDate) : undefined,
        }}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          name="name"
          label={t("goals.nameLabel")}
          rules={[{ required: true, message: t("goals.enterNameMessage") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="targetAmount"
          label={t("goals.targetAmountLabel")}
          rules={[
            { required: true, message: t("goals.enterAmountMessage") },
            { type: "number", min: 0.01, message: t("goals.amountMinMessage") },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            precision={2}
            min={0.01}
          />
        </Form.Item>

        <Form.Item name="targetDate" label={t("goals.targetDateLabel")}>
          <DatePicker picker="month" style={{ width: "100%" }} format="MM/YYYY" />
        </Form.Item>
      </Form>
    </ModalComponent>
  );
}

// ── Contribute form ─────────────────────────────────────────────────────────

interface ContributeGoalForm {
  amount: number;
}

interface ContributeGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalRecord;
}

export function ContributeGoalModal({ open, onClose, goal }: ContributeGoalModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ContributeGoalForm>();
  const contributeGoal = useContributeGoal();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: ContributeGoalForm) => {
    contributeGoal.mutate(
      { id: goal.id, payload: { amount: values.amount } },
      { onSuccess: handleClose },
    );
  };

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title={t("goals.contribute.title", { name: goal.name })}
      width={380}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>{t("goals.cancel")}</Button>
          <Button type="primary" loading={contributeGoal.isPending} onClick={() => form.submit()}>
            {t("goals.contribute.confirm")}
          </Button>
        </Flex>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
        <Form.Item
          name="amount"
          label={t("goals.contribute.amountLabel")}
          rules={[
            { required: true, message: t("goals.enterAmountMessage") },
            { type: "number", min: 0.01, message: t("goals.amountMinMessage") },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder={t("goals.amountPlaceholder")}
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

export function AddGoalButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t("goals.addButton")}
      </Button>
      <AddGoalModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
