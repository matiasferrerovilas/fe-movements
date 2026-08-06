import CalculatorOutlined from "@ant-design/icons/CalculatorOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  InputNumber,
  Row,
  Select,
  Statistic,
  theme,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useUserDefault } from "@/apis/hooks/useSettings";
import { useRecoveryTime } from "@/apis/hooks/useBalance";
import type { RecoveryTimeParams } from "@/models/RecoveryTime";

const { Title, Text } = Typography;

interface RecoveryTimeForm {
  amount: number;
  currency: string;
  months?: number;
}

export function RecoveryTimeCalculator() {
  const { token } = theme.useToken();
  const [form] = Form.useForm<RecoveryTimeForm>();
  const { data: currencies = [] } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");

  const [params, setParams] = useState<RecoveryTimeParams | null>(null);
  const { data: result, isFetching, isError } = useRecoveryTime(params);

  // currencies/defaultCurrency llegan async (React Query) después del primer
  // render, así que initialValues no alcanza — hay que setear el campo cuando lleguen.
  useEffect(() => {
    const symbol = currencies.find((c) => c.id === defaultCurrency?.value)?.symbol;
    if (symbol) {
      form.setFieldsValue({ currency: symbol });
    }
  }, [currencies, defaultCurrency, form]);

  const onFinish = (values: RecoveryTimeForm) => {
    setParams({
      amount: values.amount,
      currency: values.currency,
      months: values.months || undefined,
    });
  };

  return (
    <Card style={{ borderRadius: 16 }}>
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <CalculatorOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Tiempo de recuperación de un gasto
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Calculá cuántos meses tardarías en recuperarte de un gasto según
            tu ahorro promedio.
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          months: 3,
          currency: currencies.find((c) => c.id === defaultCurrency?.value)
            ?.symbol,
        }}
      >
        <Row gutter={[12, 0]} align="middle">
          <Col xs={24} sm={10}>
            <Form.Item
              name="amount"
              label="Monto del gasto"
              rules={[{ required: true, message: "Ingresá el monto" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                controls={false}
                precision={2}
                min={0.01}
                placeholder="0.00"
                prefix={
                  <DollarOutlined style={{ color: token.colorTextTertiary }} />
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="currency"
              label="Moneda"
              rules={[{ required: true, message: "Seleccioná una moneda" }]}
            >
              <Select placeholder="Moneda">
                {currencies.map((currency) => (
                  <Select.Option key={currency.id} value={currency.symbol}>
                    {currency.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="months"
              label="Meses a promediar"
              tooltip="Cuántos meses cerrados hacia atrás se usan para calcular tu ahorro promedio"
            >
              <InputNumber
                style={{ width: "100%" }}
                controls={false}
                min={1}
                max={24}
                placeholder="3"
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          htmlType="submit"
          icon={<CalculatorOutlined />}
          loading={isFetching}
        >
          Calcular
        </Button>
      </Form>

      {isError && (
        <Alert
          style={{ marginTop: 16 }}
          type="error"
          showIcon
          message="No pudimos calcular el tiempo de recuperación. Probá de nuevo."
        />
      )}

      {result && !isError && (
        <>
          <Divider style={{ margin: "20px 0 16px" }} />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Statistic
                title={`Ahorro promedio mensual (últimos ${result.mesesConsiderados} meses)`}
                value={result.ahorroPromedioMensual}
                precision={2}
                suffix={result.moneda}
                valueStyle={{
                  color:
                    result.ahorroPromedioMensual > 0
                      ? token.colorSuccess
                      : token.colorError,
                }}
              />
            </Col>
            <Col xs={24} sm={12}>
              {result.recuperable ? (
                <Statistic
                  title="Tiempo estimado de recuperación"
                  value={result.mesesParaRecuperar ?? 0}
                  precision={1}
                  suffix="meses"
                  valueStyle={{ color: token.colorSuccess }}
                />
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  message="No recuperable a este ritmo"
                  description={`Tu ahorro promedio de los últimos ${result.mesesConsiderados} meses fue cero o negativo, así que a este ritmo nunca recuperarías este gasto.`}
                />
              )}
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}
