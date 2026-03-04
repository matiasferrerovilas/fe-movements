import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tooltip, Typography } from "antd";
import type { GroupsWithMembers } from "../../models/UserGroup";
import InviteUserToGroup from "../modals/groups/InviteUserToGroup";
import ExitGroupModal from "../modals/groups/ExitGroupModal";

const { Text } = Typography;

interface SettingGroupCardProps {
  group: GroupsWithMembers;
  onSetDefault: (accountId: number) => void;
  isSettingDefault?: boolean;
}

const css = `
  .group-card {
    border-radius: 16px !important;
    transition: all 0.25s ease !important;
    overflow: hidden;
  }
  .group-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important;
  }
  .group-card-default {
    background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%) !important;
    border: 1.5px solid #91b4f5 !important;
  }
  .group-card-normal {
    background: #f7f8fa !important;
    border: 1.5px solid #e8eaed !important;
  }
  .star-btn {
    border-radius: 50% !important;
    width: 34px !important;
    height: 34px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
  }
  .star-btn:not(:disabled):hover {
    background: #fff8e1 !important;
    transform: scale(1.18);
  }
`;

export default function SettingGroupCard({
  group,
  onSetDefault,
  isSettingDefault,
}: SettingGroupCardProps) {
  return (
    <>
      <style>{css}</style>
      <Card
        hoverable
        className={`group-card ${group.isDefault ? "group-card-default" : "group-card-normal"}`}
        styles={{ body: { padding: "14px 18px", cursor: "default" } }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: group.isDefault
                  ? "linear-gradient(135deg, #1a6fd4 0%, #4f9cf7 100%)"
                  : "linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: group.isDefault
                  ? "0 4px 14px rgba(26, 111, 212, 0.32)"
                  : "0 2px 6px rgba(0,0,0,0.08)",
                flexShrink: 0,
                transition: "all 0.25s ease",
              }}
            >
              <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text
                  strong
                  style={{
                    fontSize: 15,
                    color: group.isDefault ? "#1a3a6b" : "#1f2937",
                    letterSpacing: "-0.2px",
                    lineHeight: 1,
                  }}
                >
                  {group.name}
                </Text>
                {group.isDefault && (
                  <span
                    style={{
                      background: "linear-gradient(90deg, #1a6fd4, #4f9cf7)",
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
              </div>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                {group.membersCount} miembro{group.membersCount !== 1 && "s"}
              </Text>
            </div>
          </div>
          <Space size={4}>
            <Tooltip
              title={
                group.isDefault
                  ? "Ya es el grupo por defecto"
                  : "Establecer como grupo por defecto"
              }
            >
              <Button
                type="text"
                className="star-btn"
                disabled={group.isDefault || isSettingDefault}
                onClick={() => onSetDefault(group.accountId)}
                icon={
                  group.isDefault ? (
                    <StarFilled style={{ color: "#f5a623", fontSize: 18 }} />
                  ) : (
                    <StarOutlined style={{ color: "#c4c9d4", fontSize: 18 }} />
                  )
                }
              />
            </Tooltip>
            <ExitGroupModal group={group} />
            <InviteUserToGroup group={group} />
          </Space>
        </div>
      </Card>
    </>
  );
}
