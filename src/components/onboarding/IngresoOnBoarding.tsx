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
import { useCurrency } from "../../apis/hooks/useCurrency";
import type { OnboardingBankEntry, OnboardingForm, OnboardingIngresoForm } from "../../apis/onboarding/OnBoarding";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onFinish: (values: OnboardingIngresoForm) => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export default function IngresoOnBoarding({
  initialValues,
  onFinish,
  onPrev,
  isLoading,
}: Props) {
  const [form] = Form.useForm<OnboardingIngresoForm>();
  const { data: currencies = [] } = useCurrency();

  // Usamos los bancos ingresados en el paso anterior (si los hay)
  const banksToAdd: OnboardingBankEntry[] = initialValues.banksToAdd ?? [];
  const accountsToAddOptions: string[] = (initialValues.accountsToAdd || []).filter(
    (g: string) => g && g.trim(),
  );

  // Default bank pre-seleccionado si hay uno marcado como default
  const defaultBank = banksToAdd.find((b) => b.isDefault)?.description;

  // Finalizar: envía los valores actuales sin requerir ningún campo
  const handleSubmit = () => {
    onFinish(form.getFieldsValue());
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {initialValues.userType === "CONSUMER"
            ? "Ingresá tu ingreso mensual"
            : "Ingresá tu ingreso diario si tenés"}
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ ...initialValues, bank: defaultBank }}
      >
        <Row gutter={[0, 0]}>
          <Col xs={24}>
            <Form.Item name="bank" label={<Text strong>Banco</Text>}>
              <Select placeholder="Banco en el cual recibís el ingreso">
                {banksToAdd.length > 0
                  ? banksToAdd.map((bank) => (
                      <Select.Option key={bank.description} value={bank.description}>
                        {bank.description.charAt(0) + bank.description.slice(1).toLowerCase()}
                      </Select.Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="currency" label={<Text strong>Moneda</Text>}>
              <Select placeholder="En qué moneda recibís tu ingreso">
                {currencies.map((currency) => (
                  <Select.Option key={currency.id} value={currency.symbol}>
                    {currency.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="amount"
              label={<Text strong>¿Cuál es tu sueldo mensual?</Text>}
            >
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
            <Col xs={24}>
              <Form.Item
                name="accountToAdd"
                label={<Text strong>Grupo</Text>}
              >
                <Select
                  placeholder="Seleccioná un grupo"
                  options={accountsToAddOptions.map((g) => ({ label: g, value: g }))}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12, textAlign: "center" }}>
          Podés completar esto más tarde desde Configuración.
        </Text>

        <Row gutter={[16, 10]}>
          <Col xs={12}>
            <Button block type="default" onClick={onPrev}>
              Volver
            </Button>
          </Col>
          <Col xs={12}>
            <Button
              block
              color="geekblue"
              variant="filled"
              onClick={handleSubmit}
              loading={isLoading}
            >
              Finalizar
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
