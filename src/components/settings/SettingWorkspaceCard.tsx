import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Space, theme, Tooltip, Typography } from "antd";
import type { WorkspaceDetail } from "../../models/UserWorkspace";
import InviteUserToWorkspace from "../modals/workspaces/InviteUserToWorkspace";
import ExitWorkspaceModal from "../modals/workspaces/ExitWorkspaceModal";

const { Text } = Typography;

interface SettingWorkspaceCardProps {
  group: WorkspaceDetail;
  onSetDefault: (workspaceId: number) => void;
  isSettingDefault?: boolean;
}

export default function SettingWorkspaceCard({
  group,
  onSetDefault,
  isSettingDefault,
}: SettingWorkspaceCardProps) {
  const { token } = theme.useToken();
  const isDefault = group.isDefault;

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        background: isDefault ? token.colorPrimaryBg : token.colorFillAlter,
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={14}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: isDefault
                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                : `linear-gradient(135deg, ${token.colorFill} 0%, ${token.colorFillSecondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDefault
                ? `0 4px 14px ${token.colorPrimaryBorder}`
                : "0 2px 6px rgba(0,0,0,0.08)",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <Flex vertical gap={3}>
            <Flex align="center" gap={8}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: token.colorText,
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}
              >
                {group.name}
              </Text>
              {isDefault && (
                <span
                  style={{
                    background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                    borderRadius: 20,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    padding: "2px 9px",
                    textTransform: "uppercase",
                    lineHeight: "18px",
                  }}
                >
                  ★ Default
                </span>
              )}
            </Flex>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {group.membersCount} miembro{group.membersCount !== 1 && "s"}
            </Text>
          </Flex>
        </Flex>
        <Space size={4}>
          <Tooltip
            title={
              isDefault
                ? "Ya es el workspace por defecto"
                : "Establecer como workspace por defecto"
            }
          >
            <Button
              type="text"
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              disabled={isDefault || isSettingDefault}
              onClick={() => onSetDefault(group.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: token.colorWarning, fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: token.colorTextQuaternary, fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
          <ExitWorkspaceModal group={group} />
          <InviteUserToWorkspace group={group} />
        </Space>
      </Flex>
    </Card>
  );
}
