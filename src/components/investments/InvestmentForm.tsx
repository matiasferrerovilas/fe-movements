import { useEffect } from "react";
import { Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { InvestmentType } from "../../models/InvestmentType";
import type { Investment, CreateInvestmentForm } from "../../models/Investment";
import type { Currency } from "../../models/Currency";

interface InvestmentFormValues {
  description?: string;
  investmentTypeId: number;
  amount: number;
  currencySymbol: string;
  startDate: Dayjs;
  endDate?: Dayjs;
}

interface InvestmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateInvestmentForm) => void;
  isLoading: boolean;
  investmentTypes: InvestmentType[];
  currencies: Currency[];
  investment?: Investment;
}

export function InvestmentForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  investmentTypes,
  currencies,
  investment,
}: InvestmentFormProps) {
  const [form] = Form.useForm<InvestmentFormValues>();
  const isEdit = investment != null;

  useEffect(() => {
    if (open && investment) {
      form.setFieldsValue({
        description: investment.description ?? undefined,
        investmentTypeId: investment.investmentType.id,
        amount: investment.amount,
        currencySymbol: investment.currency.symbol,
        startDate: dayjs(investment.startDate),
        endDate: investment.endDate ? dayjs(investment.endDate) : undefined,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, investment, form]);

  const handleFinish = (values: InvestmentFormValues) => {
    onSubmit({
      ...values,
      startDate: values.startDate.toDate(),
      endDate: values.endDate?.toDate(),
    });
  };

  return (
    <Modal
      title={isEdit ? "Editar inversión" : "Nueva inversión"}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? "Guardar" : "Agregar"}
      cancelText="Cancelar"
      confirmLoading={isLoading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item name="description" label="Descripción">
              <Input placeholder="Ej: AAPL, BTC, plazo fijo..." />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="investmentTypeId"
              label="Tipo"
              rules={[{ required: true, message: "Seleccioná un tipo" }]}
            >
              <Select placeholder="Seleccioná un tipo" aria-label="tipo">
                {investmentTypes.map((t) => (
                  <Select.Option key={t.id} value={t.id}>
                    {t.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="amount"
              label="Monto invertido"
              rules={[{ required: true, message: "Ingresá el monto" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="currencySymbol"
              label="Moneda"
              rules={[{ required: true, message: "Seleccioná la moneda" }]}
            >
              <Select placeholder="Seleccioná la moneda">
                {currencies.map((c) => (
                  <Select.Option key={c.id} value={c.symbol}>
                    {c.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Fecha de inicio"
              rules={[{ required: true, message: "Seleccioná la fecha" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="Fecha de fin">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
