import Card from "antd/es/card/Card";
import type { ConfirmInvitations, Invitations } from "../../models/UserWorkspace";
import { Button, Col, Flex, Row, theme, Typography } from "antd";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptRejectWorkspaceInvitationApi } from "../../apis/WorkspaceApi";

const { Text } = Typography;

interface SettingInviteWorkspaceCardProps {
  invite: Invitations;
}

export default function SettingInviteWorkspaceCard({
  invite,
}: SettingInviteWorkspaceCardProps) {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();

  const respondInvitationMutation = useMutation({
    mutationFn: (confirmInvitation: ConfirmInvitations) =>
      acceptRejectWorkspaceInvitationApi(confirmInvitation),
    onSuccess: (_, variables) => {
      if (variables.status) {
        // On accept: user joined a new workspace
        void queryClient.invalidateQueries({ queryKey: ["workspace-count"] });
        void queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      }
      // Always: clear the invitations list (both accept and reject)
      void queryClient.invalidateQueries({ queryKey: ["workspace-invitations"] });
    },
    onError: (err) => console.error("Error respondiendo invitacion:", err),
  });

  const handleAccept = () =>
    respondInvitationMutation.mutate({ id: invite.id, status: true });
  const handleReject = () =>
    respondInvitationMutation.mutate({ id: invite.id, status: false });

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px" } }}
      style={{
        borderRadius: 14,
        border: `1.5px solid ${token.colorPrimaryBorder}`,
        background: token.colorBgContainer,
        transition: "all 0.2s ease",
      }}
    >
      <Flex vertical gap={12}>
        {/* Top: avatar + info */}
        <Flex align="center" gap={12} style={{ minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${token.colorPrimaryBorder}`,
            }}
          >
            <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <Flex
            vertical
            gap={4}
            style={{ minWidth: 0, flex: 1 }}
          >
            <Text
              strong
              style={{
                fontSize: 15,
                color: token.colorText,
                letterSpacing: "-0.2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {invite.nameAccount}
            </Text>
            <Flex align="center" gap={6} style={{ minWidth: 0 }}>
              <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                Invitado por
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: token.colorPrimary,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {invite.invitedBy}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Bottom: buttons full width */}
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={respondInvitationMutation.isPending}
              onClick={handleAccept}
              block
              style={{
                borderRadius: 20,
                fontWeight: 600,
                background: token.colorSuccess,
                borderColor: token.colorSuccess,
              }}
            >
              Aceptar
            </Button>
          </Col>

          <Col xs={24} sm={12}>
            <Button
              danger
              icon={<CloseOutlined />}
              disabled={respondInvitationMutation.isPending}
              onClick={handleReject}
              block
              style={{ borderRadius: 20, fontWeight: 600 }}
            >
              Rechazar
            </Button>
          </Col>
        </Row>
      </Flex>
    </Card>
  );
}
