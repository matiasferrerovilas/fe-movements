import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  theme,
  Typography,
} from "antd";
import ApartmentOutlined from "@ant-design/icons/ApartmentOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import dayjs from "dayjs";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import type { ServiceToAdd } from "../../apis/ServiceApi";
import { useGroups } from "../../apis/hooks/useGroups";
import { useCurrency } from "../../apis/hooks/useCurrency";

const { Text } = Typography;

interface CreateServiceForm {
  description: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  lastPayment?: dayjs.Dayjs;
  groupId: number;
}

interface ServiceCardFormProps extends React.HTMLAttributes<HTMLElement> {
  handleAddService: (service: ServiceToAdd) => Promise<void> | void;
}

export const ServiceCardForm = ({ handleAddService }: ServiceCardFormProps) => {
  const [form] = Form.useForm<CreateServiceForm>();
  const [isPaid, setIsPaid] = useState(false);
  const { data: memberships = [] } = useGroups();
  const { data: currencies = [] } = useCurrency();
  const { token } = theme.useToken();

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
      groupId: values.groupId,
    };
    handleAddService(service);
    form.resetFields();
    setIsPaid(false);
  };
  useEffect(() => {
    if (!memberships.length) return;

    const defaultGroup = memberships.find((m) => m.isDefault)?.groupId;

    form.setFieldsValue({
      groupId: defaultGroup,
      currency: CurrencyEnum.ARS,
      isPaid: false,
    });
  }, [memberships]);

  return (
    <Card
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: isPaid ? token.colorSuccessBorder : token.colorErrorBorder,
        borderWidth: 2,
      }}
      styles={{ body: { padding: 20 } }}
    >
      {/* Header */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 4 }}>
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: token.borderRadius,
              background: isPaid ? token.colorSuccessBg : token.colorErrorBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ApartmentOutlined
              style={{
                fontSize: 18,
                color: isPaid ? token.colorSuccess : token.colorError,
              }}
            />
          </div>
          <div>
            <Text strong style={{ fontSize: 15 }}>
              Nuevo Servicio
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {isPaid ? "Marcado como pagado" : "Pendiente de pago"}
            </Text>
          </div>
        </Flex>
        {isPaid ? (
          <CheckCircleOutlined
            style={{ color: token.colorSuccess, fontSize: 22 }}
          />
        ) : (
          <CloseCircleOutlined
            style={{ color: token.colorError, fontSize: 22 }}
          />
        )}
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={
          memberships && {
            groupId: memberships.find((m) => m.isDefault)?.groupId,
            isPaid: false,
            currency: CurrencyEnum.ARS,
          }
        }
      >
        <Row gutter={[12, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="description"
              label="Descripción"
              rules={[{ required: true, message: "Ingrese una descripción" }]}
            >
              <Input placeholder="Ej: Internet, Luz, Netflix..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="groupId"
              label="Grupo"
              rules={[{ required: true, message: "Seleccione un grupo" }]}
            >
              <Select
                placeholder="Seleccionar grupo"
                options={memberships.map((membership) => ({
                  label: membership.groupDescription,
                  value: membership.groupId,
                  key: membership.groupId,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="amount"
              label="Monto"
              rules={[{ required: true, message: "Ingrese el monto" }]}
            >
              <InputNumber
                precision={2}
                style={{ width: "100%" }}
                controls={false}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="currency"
              label="Moneda"
              rules={[{ required: true, message: "Ingrese Moneda" }]}
            >
              <Select placeholder="Seleccionar moneda">
                {currencies.map((currency) => (
                  <Select.Option key={currency.id} value={currency.symbol}>
                    {currency.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={isPaid ? 12 : 24}>
            <Form.Item name="isPaid" label="Estado" valuePropName="checked">
              <Switch
                checkedChildren="Pagado"
                unCheckedChildren="Pendiente"
                onChange={(checked) => setIsPaid(checked)}
              />
            </Form.Item>
          </Col>
          {isPaid && (
            <Col xs={24} sm={12}>
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
            </Col>
          )}
        </Row>

        <Button
          htmlType="submit"
          block
          variant="solid"
          icon={<PlusOutlined />}
          style={{
            background: isPaid ? token.colorSuccess : token.colorError,
            borderColor: isPaid ? token.colorSuccess : token.colorError,
            color: "#fff",
            transition: "background 0.4s ease, border-color 0.4s ease",
          }}
        >
          Agregar Servicio
        </Button>
      </Form>
    </Card>
  );
};
