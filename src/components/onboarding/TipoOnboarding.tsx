import ShopOutlined from "@ant-design/icons/ShopOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { Button, Card, Col, Form, Row, Space, Typography } from "antd";
import { useState } from "react";
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
  const [form] = Form.useForm<{ userType: string }>();
  const [userType, setUserType] = useState<boolean>(
    initialValues.userType == "CONSUMER"
  );

  const handleSelect = (value: "CONSUMER" | "COMPANY") => {
    form.setFieldValue("userType", value);
    setUserType(form.getFieldValue("userType") === "CONSUMER");
  };
  const handleSubmit = () => {
    form.validateFields().then(() => {
      const userType = form.getFieldValue("userType");
      onNext({ userType });
    });
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          ¿Cual sera el uso de la cuenta?
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
                  border: userType
                    ? "2px solid var(--ant-color-primary)"
                    : "2px dashed #ccc",
                  borderRadius: 12,
                  textAlign: "center",
                  padding: 20,
                  transition: "all .25s ease",
                  background: userType
                    ? "var(--ant-color-primary-bg)"
                    : "transparent",
                }}
              >
                <Space orientation="vertical" align="center">
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
                  border: !userType
                    ? "2px solid var(--ant-color-primary)"
                    : "2px dashed #ccc",
                  borderRadius: 12,
                  textAlign: "center",
                  padding: 20,
                  transition: "all .25s ease",
                  background: !userType
                    ? "var(--ant-color-primary-bg)"
                    : "transparent",
                }}
              >
                <Space orientation="vertical" align="center">
                  <ShopOutlined style={{ fontSize: 40 }} />
                  <Text strong>Emprendedor</Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}></Col>
          </Row>
        </Form.Item>

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
              Siguiente
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
