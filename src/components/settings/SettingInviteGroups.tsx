import MailOutlined from "@ant-design/icons/MailOutlined";
import { Badge, Card, Space, theme, Typography } from "antd";
import { useInvitations } from "../../apis/hooks/useGroups";
import type { Invitations } from "../../models/UserGroup";
import SettingInviteGroupCard from "./SettingInviteGroupCard";
import { useInvitationSubscription } from "../../apis/websocket/useInvitationSubscription";

const { Text } = Typography;

export function SettingInviteGroups() {
  const { data: invitations, isFetching } = useInvitations();
  const { token } = theme.useToken();

  useInvitationSubscription();

  if (!invitations || invitations.length === 0) {
    return null;
  }

  return (
    <div className="fade-in-down">
      <Card
        loading={isFetching}
      title={
        <Space align="center">
          <MailOutlined
            style={{ color: token.colorPrimary, fontSize: 18 }}
          />
          <Text strong>Invitaciones Pendientes</Text>
          <Badge
            count={invitations?.length}
            style={{
              backgroundColor: token.colorPrimary,
              fontWeight: "bold",
            }}
          />
        </Space>
      }
      style={{
        backgroundColor: token.colorPrimaryBg,
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
        {invitations?.map((invite: Invitations) => (
          <SettingInviteGroupCard key={invite.id} invite={invite} />
        ))}
      </Space>
      </Card>
    </div>
  );
}
