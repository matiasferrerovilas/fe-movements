import { useEffect } from "react";
import { Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { InvestmentType } from "../../models/InvestmentType";
import type { Investment, CreateInvestmentForm } from "../../models/Investment";
import type { Currency } from "../../models/Currency";

interface InvestmentFormValues {
  instrumento: string;
  tipoId: number;
  montoInvertido: number;
  currency: string;
  fechaInversion: Dayjs;
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
        instrumento: investment.instrumento,
        tipoId: investment.tipo.id,
        montoInvertido: investment.montoInvertido,
        currency: investment.moneda.symbol,
        fechaInversion: dayjs(investment.fechaInversion),
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, investment, form]);

  const handleFinish = (values: InvestmentFormValues) => {
    onSubmit({
      ...values,
      fechaInversion: values.fechaInversion.toDate(),
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
      destroyOnHide
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="instrumento"
              label="Instrumento / descripción"
              rules={[{ required: true, message: "Ingresá el instrumento" }]}
            >
              <Input placeholder="Ej: AAPL, ES0113040035, BTC" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="tipoId"
              label="Tipo"
              rules={[{ required: true, message: "Seleccioná un tipo" }]}
            >
              <Select placeholder="Seleccioná un tipo" aria-label="tipo">
                {investmentTypes.map((t) => (
                  <Select.Option key={t.id} value={t.id}>
                    {t.description}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="montoInvertido"
              label="Monto invertido"
              rules={[{ required: true, message: "Ingresá el monto" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="currency"
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

        <Form.Item
          name="fechaInversion"
          label="Fecha de inversión"
          rules={[{ required: true, message: "Seleccioná la fecha" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
