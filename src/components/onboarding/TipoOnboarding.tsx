import ShopOutlined from "@ant-design/icons/ShopOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { Button, Card, Col, Form, Row, Space, Typography, theme } from "antd";
import type { OnboardingForm } from "../../apis/onboarding/OnBoarding";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: Pick<OnboardingForm, "userType">) => void;
  onPrev: () => void;
}

export default function TipoOnboarding({
  initialValues,
  onNext,
  onPrev,
}: Props) {
  const { token } = theme.useToken();
  const [form] = Form.useForm<{ userType: string }>();

  // Derivamos el tipo seleccionado directamente del Form — único source of truth.
  const selectedType = Form.useWatch("userType", form) ?? initialValues.userType ?? "CONSUMER";
  const isConsumer = selectedType === "CONSUMER";

  const handleSelect = (value: "CONSUMER" | "COMPANY") => {
    form.setFieldValue("userType", value);
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      onNext({ userType: form.getFieldValue("userType") });
    });
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          ¿Cuál será el uso de la cuenta?
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ userType: initialValues.userType || "CONSUMER" }}
      >
        <Form.Item
          name="userType"
          label={<Text strong>Tipo de usuario</Text>}
          rules={[{ required: true, message: "Seleccioná una opción" }]}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                onClick={() => handleSelect("CONSUMER")}
                hoverable
                style={{
                  border: `2px ${isConsumer ? "solid" : "dashed"} ${isConsumer ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: 12,
                  textAlign: "center",
                  padding: 20,
                  transition: "all .25s ease",
                  background: isConsumer ? token.colorPrimaryBg : "transparent",
                }}
              >
                <Space direction="vertical" align="center">
                  <UserOutlined style={{ fontSize: 40 }} />
                  <Text strong>Usuario</Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                onClick={() => handleSelect("COMPANY")}
                hoverable
                style={{
                  border: `2px ${!isConsumer ? "solid" : "dashed"} ${!isConsumer ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: 12,
                  textAlign: "center",
                  padding: 20,
                  transition: "all .25s ease",
                  background: !isConsumer ? token.colorPrimaryBg : "transparent",
                }}
              >
                <Space direction="vertical" align="center">
                  <ShopOutlined style={{ fontSize: 40 }} />
                  <Text strong>Emprendedor</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form.Item>

        <Row gutter={16} justify="space-between">
          <Col xs={12} md={12}>
            <Button block type="default" onClick={onPrev}>
              Volver
            </Button>
          </Col>
          <Col xs={12} md={12}>
            <Button block color="geekblue" variant="filled" onClick={handleSubmit}>
              Siguiente
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
