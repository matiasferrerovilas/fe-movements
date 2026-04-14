import { Divider, Select, Space, Typography } from "antd";
import SwapOutlined from "@ant-design/icons/SwapOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { useCurrentWorkspace } from "../apis/workspace/WorkspaceContext";
import CreateWorkspaceModal from "./modals/workspaces/CreateWorkspaceModal";

const { Text } = Typography;

interface WorkspaceSelectorProps {
  /** Compact mode for mobile drawer */
  compact?: boolean;
}

export default function WorkspaceSelector({ compact = false }: WorkspaceSelectorProps) {
  const { currentWorkspace, workspaces, setCurrentWorkspace, isLoading } =
    useCurrentWorkspace();

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
              Workspace activo
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
                      <span>Crear workspace</span>
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
        <Space size={8}>
          <Select
            value={currentWorkspace?.workspaceId}
            onChange={(value) => setCurrentWorkspace(value)}
            style={{ minWidth: 140 }}
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
                    <span>Crear workspace</span>
                  </Space>
                </div>
              </>
            )}
            options={workspaceOptions}
          />
        </Space>
      )}
    </CreateWorkspaceModal>
  );
}
