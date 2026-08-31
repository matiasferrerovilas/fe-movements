import MailOutlined from "@ant-design/icons/MailOutlined";
import { Badge, Card, Space, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useSentWorkspaceInvitations } from "@/apis/hooks/useWorkspaces";
import type { SentInvitation } from "@/models/UserWorkspace";
import { InvitationStatusEnum } from "@/enums/InvitationStatusEnum";
import SettingSentInvitationCard from "@/components/settings/SettingSentInvitationCard";

const { Text } = Typography;

export function SettingSentInvitations() {
  const { data: invitations, isFetching } = useSentWorkspaceInvitations();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  // Solo mostramos las pendientes: son las únicas que se pueden cancelar, y el historial de
  // aceptadas/rechazadas/canceladas no aporta nada útil en esta vista.
  const pendingSent = invitations?.filter(
    (invite) => invite.status === InvitationStatusEnum.PENDING,
  );

  if (!pendingSent || pendingSent.length === 0) {
    return null;
  }

  return (
    <div className="fade-in-down">
      <Card
        loading={isFetching}
        title={
          <Space align="center">
            <MailOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
            <Text strong>{t("settings.sentInvitations.title")}</Text>
            <Badge
              count={pendingSent.length}
              style={{
                backgroundColor: token.colorPrimary,
                fontWeight: "bold",
              }}
            />
          </Space>
        }
        style={{
          backgroundColor: token.colorFillTertiary,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
        styles={{
          header: {
            borderBottom: "none",
            padding: "12px 16px",
          },
          body: {
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            cursor: "default",
            transition: "all 0.2s ease",
          },
        }}
      >
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          {pendingSent.map((invite: SentInvitation) => (
            <SettingSentInvitationCard key={invite.id} invite={invite} />
          ))}
        </Space>
      </Card>
    </div>
  );
}
