import { useState } from "react";
import {
  Card,
  Space,
  Typography,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
} from "antd";
import ApartmentOutlined from "@ant-design/icons/ApartmentOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import dayjs from "dayjs";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import type { ServiceToAdd } from "../../apis/ServiceApi";
import { useGroups } from "../../apis/hooks/useGroups";
import { ColorEnum } from "../../enums/ColorEnum";
import { useCurrency } from "../../apis/hooks/useCurrency";

const { Title } = Typography;
interface CreateServiceForm {
  description: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  lastPayment?: dayjs.Dayjs;
  accountId: number;
}
interface ServiceCardFormProps extends React.HTMLAttributes<HTMLElement> {
  handleAddService: (service: ServiceToAdd) => Promise<void> | void;
}

export const ServiceCardForm = ({ handleAddService }: ServiceCardFormProps) => {
  const [form] = Form.useForm<CreateServiceForm>();
  const [isPaid, setIsPaid] = useState(false);
  const { data: accounts = [] } = useGroups();
  const { data: currencies = [] } = useCurrency();

  const onFinish = (values: CreateServiceForm) => {
    const service: ServiceToAdd = {
      description: values.description,
      amount: values.amount,
      lastPayment: values.lastPayment
        ? dayjs(values.lastPayment)
            .hour(12)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toDate()
        : null,
      isPaid: values.isPaid,
      currency: { symbol: values.currency },
      accountId: values.accountId,
    };
    handleAddService(service);
    form.resetFields();
    setIsPaid(false);
  };

  const icon = isPaid ? (
    <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
  ) : (
    <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
  );
  const buttonStyle = isPaid
    ? {
        backgroundColor: ColorEnum.VERDE_PAGADO,
        borderColor: ColorEnum.VERDE_PAGADO_BORDE,
        borderRadius: 8,
        borderWidth: 2,
      }
    : {
        backgroundColor: ColorEnum.ROJO_FALTA_PAGO,
        borderColor: ColorEnum.ROJO_FALTA_PAGO_BORDE,
        borderRadius: 8,
        borderWidth: 2,
      };

  return (
    <Card
      variant="outlined"
      style={{
        borderRadius: 16,
        borderWidth: 3,
        borderColor: isPaid ? "#b7eb8f" : "#ffa39e",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      styles={{
        body: { padding: 20 },
      }}
    >
      <Space
        orientation="horizontal"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <Space align="center">
          <div
            style={{
              backgroundColor: isPaid ? "#f6ffed" : "#fff1f0",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ApartmentOutlined
              style={{ color: isPaid ? "#52c41a" : "#ff4d4f" }}
            />
          </div>
          <Title level={5} style={{ margin: 0 }}>
            Nuevo Servicio
          </Title>
        </Space>
        {icon}
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 16 }}
        initialValues={
          accounts && {
            accountId: accounts[0]?.id,
            isPaid: false,
            currency: CurrencyEnum.ARS,
          }
        }
      >
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              name="description"
              label="Descripción"
              rules={[{ required: true, message: "Ingrese una descripción" }]}
            >
              <Input placeholder="Ej: Internet, Luz, Netflix..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="accountId"
              label="Grupo"
              rules={[{ required: true, message: "Seleccione un grupo" }]}
            >
              <Select placeholder="Seleccionar grupo">
                {accounts.map((account) => (
                  <Select.Option key={account.id} value={account.id}>
                    {account.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Monto"
              rules={[{ required: true, message: "Ingrese el monto" }]}
            >
              <InputNumber
                precision={2}
                style={{ width: "100%" }}
                controls={false}
                placeholder="Monto del servicio"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Moneda"
              rules={[{ required: true, message: "Ingrese Moneda" }]}
            >
              <Select placeholder="Ingrese Moneda" style={{ width: "100%" }}>
                {currencies.map((currency) => (
                  <Select.Option key={currency.id} value={currency.symbol}>
                    {currency.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              name="isPaid"
              label="¿Está pagado?"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Pagado"
                unCheckedChildren="Pendiente"
                style={{ width: "100%" }}
                onChange={(checked) => setIsPaid(checked)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {isPaid && (
              <Form.Item
                name="lastPayment"
                label="Fecha de pago"
                rules={[
                  { required: true, message: "Seleccione la fecha de pago" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(d) => d.isAfter(dayjs())}
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Button htmlType="submit" block style={buttonStyle}>
          Agregar Servicio
        </Button>
      </Form>
    </Card>
  );
};
