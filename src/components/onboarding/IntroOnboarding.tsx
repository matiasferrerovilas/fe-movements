import BellOutlined from "@ant-design/icons/BellOutlined";
import AimOutlined from "@ant-design/icons/AimOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import BankOutlined from "@ant-design/icons/BankOutlined";
import { Button, Col, Row, Space, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { OnboardingForm } from "@/apis/onboarding/OnboardingApi";

const { Title, Text, Paragraph } = Typography;

interface Props {
  onNext: (values: Partial<OnboardingForm>) => void;
}

interface ValueProp {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function IntroOnboarding({ onNext }: Props) {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const values: ValueProp[] = [
    {
      icon: <BellOutlined />,
      title: t("onboarding.intro.value1Title"),
      description: t("onboarding.intro.value1Description"),
    },
    {
      icon: <AimOutlined />,
      title: t("onboarding.intro.value2Title"),
      description: t("onboarding.intro.value2Description"),
    },
    {
      icon: <LineChartOutlined />,
      title: t("onboarding.intro.value3Title"),
      description: t("onboarding.intro.value3Description"),
    },
    {
      icon: <TeamOutlined />,
      title: t("onboarding.intro.value4Title"),
      description: t("onboarding.intro.value4Description"),
    },
    {
      icon: <BankOutlined />,
      title: t("onboarding.intro.value5Title"),
      description: t("onboarding.intro.value5Description"),
    },
  ];

  return (
    <Space orientation="vertical" style={{ width: "100%" }} size={24}>
      <div style={{ textAlign: "center" }}>
        <Title level={3} style={{ margin: "0 0 8px" }}>
          {t("onboarding.intro.headline")}
        </Title>
        <Text type="secondary">{t("onboarding.intro.subheadline")}</Text>
      </div>

      <Row gutter={[12, 12]}>
        {values.map((value) => (
          <Col xs={24} sm={12} key={value.title}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                height: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorFillQuaternary,
              }}
            >
              <div
                style={{
                  flex: "none",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: token.colorPrimaryBg,
                  color: token.colorPrimary,
                  fontSize: 16,
                }}
              >
                {value.icon}
              </div>
              <div>
                <Text strong style={{ display: "block" }}>
                  {value.title}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {value.description}
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Space orientation="vertical" style={{ width: "100%" }} size={8}>
        <Button
          block
          size="large"
          color="geekblue"
          variant="filled"
          onClick={() => onNext({})}
        >
          {t("onboarding.intro.ctaButton")}
        </Button>
        <Paragraph
          type="secondary"
          style={{ fontSize: 12, textAlign: "center", margin: 0 }}
        >
          {t("onboarding.intro.footnote")}
        </Paragraph>
      </Space>
    </Space>
  );
}
