import MailOutlined from "@ant-design/icons/MailOutlined";
import { Badge, Card, Space, theme, Typography } from "antd";
import { useWorkspaceInvitations } from "../../apis/hooks/useWorkspaces";
import type { Invitations } from "../../models/UserWorkspace";
import SettingInviteWorkspaceCard from "./SettingInviteWorkspaceCard";
import { useInvitationSubscription } from "../../apis/websocket/useInvitationSubscription";

const { Text } = Typography;

export function SettingInviteWorkspaces() {
  const { data: invitations, isFetching } = useWorkspaceInvitations();
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
          <SettingInviteWorkspaceCard key={invite.id} invite={invite} />
        ))}
      </Space>
      </Card>
    </div>
  );
}
