import RocketOutlined from "@ant-design/icons/RocketOutlined";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import { Button, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import AddMovementModal from "@/components/modals/movements/AddMovementModal";

const { Title, Text } = Typography;

export default function FirstMovementCta() {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <div
      className="fade-in-up"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
        padding: "40px 24px",
        marginBottom: 24,
        borderRadius: token.borderRadiusLG,
        border: `1px dashed ${token.colorPrimaryBorder}`,
        background: token.colorPrimaryBg,
      }}
    >
      <RocketOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
      <Title level={4} style={{ margin: 0 }}>
        {t("home.firstMovement.title")}
      </Title>
      <Text type="secondary" style={{ maxWidth: 420 }}>
        {t("home.firstMovement.subtitle")}
      </Text>
      <AddMovementModal
        trigger={(onClick) => (
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={<PlusCircleOutlined />}
            onClick={onClick}
            style={{ height: 48, paddingInline: 32, fontSize: 16, marginTop: 8 }}
          >
            {t("home.firstMovement.cta")}
          </Button>
        )}
      />
    </div>
  );
}
