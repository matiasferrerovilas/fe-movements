import { Avatar, Card, Divider, Empty, Flex, List, theme, Typography } from "antd";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import { useCurrentWorkspace } from "@/apis/workspace/WorkspaceContext";
import { useWorkspacesSubscription } from "@/apis/websocket/useWorkspacesSubscription";
import InviteUserToWorkspace from "@/components/modals/workspaces/InviteUserToWorkspace";
import ExitWorkspaceModal from "@/components/modals/workspaces/ExitWorkspaceModal";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

const { Title, Text } = Typography;

export function SettingCurrentWorkspace() {
  const { token } = theme.useToken();
  const { currentWorkspace, workspaces, isLoading } = useCurrentWorkspace();
  // Los miembros vienen incluidos en el workspace activo (metadata.members)
  const members = currentWorkspace?.metadata.members ?? [];
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);

  useWorkspacesSubscription();

  // Solo mostrar botón de salir si hay más de un workspace
  const canLeave = workspaces.length > 1;

  if (!currentWorkspace) {
    return (
      <Card loading={isLoading} style={{ borderRadius: 16 }}>
        <Empty description="No hay workspace seleccionado" />
      </Card>
    );
  }

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      {/* Header con nombre + botón salir */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div style={{ flex: 1 }}>
          <Flex align="center" gap={8}>
            <Title level={5} style={{ margin: 0 }}>
              {currentWorkspace.workspaceName}
            </Title>
            <span
              style={{
                background: token.colorFillSecondary,
                borderRadius: 12,
                color: token.colorTextSecondary,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
              }}
            >
              {currentWorkspace.metadata.members.length} miembro
              {currentWorkspace.metadata.members.length !== 1 && "s"}
            </span>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labels.workspaceGestionar}
          </Text>
        </div>
        {canLeave && <ExitWorkspaceModal group={currentWorkspace} />}
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Lista de miembros con botón invitar */}
      <div>
        <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
          <Flex align="center" gap={8}>
            <UserOutlined style={{ color: token.colorTextSecondary }} />
            <Text strong style={{ fontSize: 14 }}>
              {labels.miembros}
            </Text>
          </Flex>
          <InviteUserToWorkspace group={currentWorkspace} />
        </Flex>
        <List
          dataSource={members}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={labels.workspaceNoMiembros}
              />
            ),
          }}
          renderItem={(email) => (
            <List.Item style={{ padding: "8px 0" }}>
              <Flex align="center" gap={12}>
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}
                />
                <Flex align="center" gap={6}>
                  <MailOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                  <Text style={{ fontSize: 13 }}>{email}</Text>
                </Flex>
              </Flex>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
}
