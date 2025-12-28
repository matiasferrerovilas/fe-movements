import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { Card, Space, Tag, Typography } from "antd";
import type { AccountsWithUsersCount } from "../../models/UserGroup";
import InviteUserToGroup from "../modals/groups/InviteUserToGroup";
import ExitGroupModal from "../modals/groups/ExitGroupModal";
const { Text } = Typography;

interface SettingGroupCardProps {
  group: AccountsWithUsersCount;
}
export default function SettingGroupCard({ group }: SettingGroupCardProps) {
  return (
    <>
      <Card
        key={group.accountId}
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
          background: "#e8ebf0",
          padding: "12px 16px",
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
              <Text strong>{group.name}</Text>
              {group.name === "DEFAULT" && (
                <Tag color="default" style={{ fontSize: 11 }}>
                  Por defecto
                </Tag>
              )}
            </Space>
          </Space>
          <div>
            <ExitGroupModal group={group} />
            <InviteUserToGroup group={group} />
            <Text type="secondary" style={{ fontSize: 16 }}>
              {group.membersCount} miembro{group.membersCount > 1 && "s"}
            </Text>
          </div>
        </Space>
      </Card>
    </>
  );
}
