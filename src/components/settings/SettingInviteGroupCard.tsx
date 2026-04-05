import Card from "antd/es/card/Card";
import type { ConfirmInvitations, Invitations } from "../../models/UserGroup";
import { Button, Col, Flex, Row, theme, Typography } from "antd";
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
  const { token } = theme.useToken();

  const addGroupMutation = useMutation({
    mutationFn: (confirmInvitation: ConfirmInvitations) =>
      acceptRejectGroupInvitationApi(confirmInvitation),
    onError: (err) => console.error("Error respondiendo invitacion:", err),
  });

  const handleAccept = () =>
    addGroupMutation.mutate({ id: invite.id, status: true });
  const handleReject = () =>
    addGroupMutation.mutate({ id: invite.id, status: false });

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
              loading={addGroupMutation.isPending}
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
              disabled={addGroupMutation.isPending}
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
