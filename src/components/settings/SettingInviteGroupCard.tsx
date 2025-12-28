import Card from "antd/es/card/Card";
import type { ConfirmInvitations, Invitations } from "../../models/UserGroup";
import { Button, Space, Typography } from "antd";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { useMutation } from "@tanstack/react-query";
import { acceptRejectGroupInvitationApi } from "../../apis/GroupApi";
const { Text } = Typography;

interface SettingInviteGroupCardProps {
  invite: Invitations;
}
export default function SettingInviteGroupCard({
  invite,
}: SettingInviteGroupCardProps) {
  const handleAccept = () => {
    const confirm: ConfirmInvitations = { id: invite.id, status: true };
    addGroupMutation.mutate(confirm);
  };

  const handleReject = () => {
    const confirm: ConfirmInvitations = { id: invite.id, status: false };
    addGroupMutation.mutate(confirm);
  };

  const addGroupMutation = useMutation({
    mutationFn: (confirmInvitation: ConfirmInvitations) =>
      acceptRejectGroupInvitationApi(confirmInvitation),
    onError: (err) => {
      console.error("Error subiendo archivo:", err);
    },
  });
  return (
    <>
      <Card
        key={invite.id}
        hoverable
        styles={{
          body: {
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            cursor: "default",
            transition: "all 0.2s ease",
          },
        }}
        style={{
          borderRadius: 12,
          backgroundColor: "white",
          padding: 0,
        }}
      >
        <Space
          align="center"
          style={{
            justifyContent: "space-between",
            width: "100%",
            marginBottom: 8,
          }}
        >
          <Space>
            <div
              style={{
                background: "#0D59A4",
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <Space>
              <Text strong>{invite.nameAccount}</Text>
            </Space>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              style={{
                backgroundColor: "#28a745",
                borderColor: "#28a745",
                borderRadius: 8,
              }}
              onClick={handleAccept}
            >
              Aceptar
            </Button>

            <Button
              danger
              icon={<CloseOutlined />}
              style={{
                borderRadius: 8,
              }}
              onClick={handleReject}
            >
              Rechazar
            </Button>
          </Space>
        </Space>
      </Card>
    </>
  );
}
