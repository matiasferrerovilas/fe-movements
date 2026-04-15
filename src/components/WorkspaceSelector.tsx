import { Badge, Divider, Select, Space, Typography, theme } from "antd";
import SwapOutlined from "@ant-design/icons/SwapOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import { useCurrentWorkspace } from "../apis/workspace/WorkspaceContext";
import CreateWorkspaceModal from "./modals/workspaces/CreateWorkspaceModal";
import { useCurrentUser } from "../apis/hooks/useCurrentUser";
import { getEntityLabels } from "./utils/entityLabels";

const { Text } = Typography;

interface WorkspaceSelectorProps {
  /** Compact mode for mobile drawer */
  compact?: boolean;
}

export default function WorkspaceSelector({ compact = false }: WorkspaceSelectorProps) {
  const { currentWorkspace, workspaces, setCurrentWorkspace, isLoading } =
    useCurrentWorkspace();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);
  const { token } = theme.useToken();

  if (isLoading || workspaces.length === 0) {
    return null;
  }

  const workspaceOptions = workspaces.map((ws) => ({
    value: ws.workspaceId,
    label: ws.workspaceName,
  }));

  if (compact) {
    return (
      <CreateWorkspaceModal>
        {(openModal) => (
          <div style={{ padding: "0 16px", marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              {labels.workspaceActivo}
            </Text>
            <Select
              value={currentWorkspace?.workspaceId}
              onChange={(value) => setCurrentWorkspace(value)}
              style={{ width: "100%" }}
              loading={isLoading}
              suffixIcon={<SwapOutlined />}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div
                    style={{ padding: "4px 8px", cursor: "pointer" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openModal}
                  >
                    <Space>
                      <PlusOutlined />
                      <span>{labels.workspaceCrear}</span>
                    </Space>
                  </div>
                </>
              )}
              options={workspaceOptions}
            />
          </div>
        )}
      </CreateWorkspaceModal>
    );
  }

  return (
    <CreateWorkspaceModal>
      {(openModal) => (
        <div
          style={{
            background: token.colorFillSecondary,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: "4px 8px 4px 12px",
            transition: "background 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = token.colorFillTertiary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = token.colorFillSecondary;
          }}
        >
          <AppstoreOutlined style={{ color: token.colorTextSecondary, fontSize: 14 }} />
          <Select
            value={currentWorkspace?.workspaceId}
            onChange={(value) => setCurrentWorkspace(value)}
            style={{ minWidth: 140, flex: 1 }}
            loading={isLoading}
            suffixIcon={<SwapOutlined />}
            variant="borderless"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <div
                  style={{ padding: "4px 8px", cursor: "pointer" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openModal}
                >
                  <Space>
                    <PlusOutlined />
                    <span>{labels.workspaceCrear}</span>
                  </Space>
                </div>
              </>
            )}
            options={workspaceOptions}
          />
          <Badge
            count={workspaces.length}
            showZero
            style={{
              backgroundColor: token.colorPrimaryBg,
              color: token.colorPrimary,
              fontWeight: 600,
              fontSize: 11,
            }}
          />
        </div>
      )}
    </CreateWorkspaceModal>
  );
}
