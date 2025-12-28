import {
  Button,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import { BankEnum } from "../../enums/BankEnum";

const { Text } = Typography;

interface Props {
  initialValues: any; // { bank, currency, accountsToAdd: string[] }
  onNext: (values: any) => void;
  onPrev: () => void;
}

export default function IngresoOnBoarding({
  initialValues,
  onNext,
  onPrev,
}: Props) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => onNext(values));
  };

  const accountsToAddOptions: string[] = (
    initialValues.accountsToAdd || []
  ).filter((g: string) => g && g.trim());

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {initialValues.userType == "CONSUMER"
            ? "Ingrese su Ingreso Mensual"
            : "Ingrese si tiene Ingreso Diario"}
        </Text>
      </div>

      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Col xs={24} md={18} lg={24} style={{ marginBottom: 16 }}>
          <Text strong>Banco</Text>
          <Form.Item name="bank">
            <Select placeholder="Banco en el cual recibe el ingreso">
              {Object.values(BankEnum).map((bank) => (
                <Select.Option key={bank} value={bank}>
                  {bank}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={18} lg={24} style={{ marginBottom: 16 }}>
          <Text strong>Moneda</Text>
          <Form.Item name="currency">
            <Select placeholder="En qué moneda recibe su ingreso">
              {Object.values(CurrencyEnum).map((currency) => (
                <Select.Option key={currency} value={currency}>
                  {currency}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={18} lg={24} style={{ marginBottom: 16 }}>
          <Text strong>¿Cuál es su sueldo mensual?</Text>
          <Form.Item name="amount">
            <InputNumber
              precision={2}
              placeholder="50000"
              prefix={<DollarOutlined />}
              style={{ width: "100%" }}
              controls={false}
            />
          </Form.Item>
        </Col>

        {accountsToAddOptions.length > 0 && (
          <Col xs={24} md={18} lg={24} style={{ marginBottom: 16 }}>
            <Text strong>Grupo</Text>

            <Form.Item
              name="accountToAdd"
              rules={[{ required: true, message: "Selecciona un grupo" }]}
            >
              <Select
                placeholder="Selecciona un grupo"
                options={accountsToAddOptions.map((g) => ({
                  label: g,
                  value: g,
                }))}
              />
            </Form.Item>
          </Col>
        )}

        <Row gutter={16} justify="space-between">
          <Col xs={12} md={9} lg={12}>
            <Button block type="default" onClick={onPrev}>
              Volver
            </Button>
          </Col>
          <Col xs={12} md={9} lg={12}>
            <Button
              block
              color="geekblue"
              variant="filled"
              onClick={handleSubmit}
            >
              Finalizar
            </Button>
          </Col>
          <Col xs={24} md={18} lg={24} style={{ paddingTop: 10 }}>
            <Button type="dashed" block onClick={handleSubmit}>
              Omitir Por Ahora
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
