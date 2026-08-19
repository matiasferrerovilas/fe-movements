import ShopOutlined from "@ant-design/icons/ShopOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { Button, Card, Col, Form, Row, Space, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import type { OnboardingForm } from "@/apis/onboarding/OnboardingApi";
import { UserTypeEnum } from "@/enums/UserTypeEnum";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: Pick<OnboardingForm, "userType">) => void;
}

export default function UserTypeOnboarding({
  initialValues,
  onNext,
}: Props) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [form] = Form.useForm<{ userType: UserTypeEnum }>();

  // Derivamos el tipo seleccionado directamente del Form — único source of truth.
  const selectedType =
    Form.useWatch("userType", form) ?? initialValues.userType ?? UserTypeEnum.PERSONAL;
  const isPersonal = selectedType === UserTypeEnum.PERSONAL;

  const handleSelect = (value: UserTypeEnum) => {
    form.setFieldValue("userType", value);
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      onNext({ userType: form.getFieldValue("userType") });
    });
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.userType.question")}
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ userType: initialValues.userType || UserTypeEnum.PERSONAL }}
      >
        <Form.Item
          name="userType"
          label={<Text strong>{t("onboarding.userType.label")}</Text>}
          rules={[{ required: true, message: t("onboarding.userType.selectRequired") }]}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                onClick={() => handleSelect(UserTypeEnum.PERSONAL)}
                hoverable
                style={{
                  border: `2px ${isPersonal ? "solid" : "dashed"} ${isPersonal ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: 12,
                  textAlign: "center",
                  padding: 20,
                  transition: "all .25s ease",
                  background: isPersonal ? token.colorPrimaryBg : "transparent",
                }}
              >
                 <Space orientation="vertical" align="center">
                  <UserOutlined style={{ fontSize: 40 }} />
                  <Text strong>{t("onboarding.userType.personalCard")}</Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                onClick={() => handleSelect(UserTypeEnum.ENTERPRISE)}
                hoverable
                style={{
                  border: `2px ${!isPersonal ? "solid" : "dashed"} ${!isPersonal ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: 12,
                  textAlign: "center",
                  padding: 20,
                  transition: "all .25s ease",
                  background: !isPersonal ? token.colorPrimaryBg : "transparent",
                }}
              >
                 <Space orientation="vertical" align="center">
                  <ShopOutlined style={{ fontSize: 40 }} />
                  <Text strong>{t("onboarding.userType.enterpriseCard")}</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24}>
            <Button block color="geekblue" variant="filled" onClick={handleSubmit}>
              {t("onboarding.nextButton")}
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
