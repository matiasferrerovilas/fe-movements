import ApartmentOutlined from "@ant-design/icons/ApartmentOutlined";
import { Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import type { ServiceToAdd } from "@/apis/SubscriptionApi";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getServiceLabels } from "@/utils/serviceLabels";
import { ServiceCardForm } from "@/components/services/ServiceCardForm";

const { Title, Text } = Typography;

interface ServicesEmptyStateProps {
  onAddService: (service: ServiceToAdd) => Promise<void> | void;
}

export default function ServicesEmptyState({ onAddService }: ServicesEmptyStateProps) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const labels = getServiceLabels(currentUser?.userType ?? null, t);

  return (
    <div
      className="fade-in-up"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 12,
        minHeight: "60vh",
        padding: "56px 24px 48px",
        borderRadius: token.borderRadiusLG,
        border: `1px dashed ${token.colorPrimaryBorder}`,
        background: token.colorPrimaryBg,
      }}
    >
      <ApartmentOutlined style={{ fontSize: 40, color: token.colorPrimary }} />
      <Title level={3} style={{ margin: 0 }}>
        {labels.emptyStateTitle}
      </Title>
      <Text type="secondary" style={{ maxWidth: 460 }}>
        {labels.emptyStateSubtitle}
      </Text>
      <div style={{ width: "100%", maxWidth: 480, marginTop: 16, textAlign: "left" }}>
        <ServiceCardForm handleAddService={onAddService} />
      </div>
    </div>
  );
}
