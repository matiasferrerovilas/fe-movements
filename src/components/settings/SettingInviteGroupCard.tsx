import Card from "antd/es/card/Card";
import type { ConfirmInvitations, Invitations } from "../../models/UserGroup";
import { Button, Col, Row, Space, Tag, Typography } from "antd";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { useMutation } from "@tanstack/react-query";
import { acceptRejectGroupInvitationApi } from "../../apis/GroupApi";
const { Text } = Typography;

interface SettingInviteGroupCardProps {
  invite: Invitations;
}

const css = `
  .invite-card {
    border-radius: 14px !important;
    border: 1.5px solid #e0eaff !important;
    background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%) !important;
    transition: all 0.2s ease !important;
  }
  .invite-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(13, 89, 164, 0.1) !important;
  }
  .accept-btn {
    border-radius: 20px !important;
    font-weight: 600 !important;
    background: linear-gradient(90deg, #22c55e, #16a34a) !important;
    border: none !important;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3) !important;
    transition: all 0.2s ease !important;
  }
  .accept-btn:hover {
    opacity: 0.88 !important;
    transform: scale(1.04) !important;
  }
  .reject-btn {
    border-radius: 20px !important;
    font-weight: 600 !important;
    border: 1.5px solid #fca5a5 !important;
    color: #ef4444 !important;
    background: #fff5f5 !important;
    transition: all 0.2s ease !important;
  }
  .reject-btn:hover {
    background: #fee2e2 !important;
    border-color: #ef4444 !important;
    transform: scale(1.04) !important;
  }
`;

export default function SettingInviteGroupCard({
  invite,
}: SettingInviteGroupCardProps) {
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
    <>
      <style>{css}</style>
      <Card
        hoverable
        className="invite-card"
        styles={{ body: { padding: "14px 18px" } }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Top: avatar + info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                flexShrink: 0,
                background: "linear-gradient(135deg, #1a6fd4 0%, #4f9cf7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(26, 111, 212, 0.25)",
              }}
            >
              <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: "#1a3a6b",
                  letterSpacing: "-0.2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {invite.nameAccount}
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <Text style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>
                  Invitado por
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#1d4ed8",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {invite.invitedBy}
                </Text>
              </div>
            </div>
          </div>

          {/* Bottom: buttons full width */}
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12}>
              <Button
                className="accept-btn"
                icon={<CheckOutlined />}
                loading={addGroupMutation.isPending}
                onClick={handleAccept}
                block
              >
                Aceptar
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                className="reject-btn"
                icon={<CloseOutlined />}
                disabled={addGroupMutation.isPending}
                onClick={handleReject}
                block
              >
                Rechazar
              </Button>
            </Col>
          </Row>
        </div>
      </Card>
    </>
  );
}
