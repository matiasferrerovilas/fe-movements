import { Button, Popconfirm } from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Workspace } from "@/models/UserWorkspace";
import { exitWorkspaceApi } from "@/apis/WorkspaceApi";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

interface ExitWorkspaceModalProps {
  group: Workspace;
}
export default function ExitWorkspaceModal({ group }: ExitWorkspaceModalProps) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);
  const exitWorkspaceMutation = useMutation({
    mutationFn: () => exitWorkspaceApi(group.workspaceId),
    onError: (err) => {
      console.error("Error saliendo del grupo:", err);
    },
    onSuccess: () => {
      console.debug("✅ Has salido del grupo correctamente");
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
    },
  });

  return (
    <Popconfirm
      title={labels.workspaceSalir}
      onConfirm={() => exitWorkspaceMutation.mutate()}
      okText="Sí"
      cancelText="No"
      placement="topRight"
    >
      <Button
        type="text"
        icon={<LogoutOutlined style={{ fontSize: 22, cursor: "pointer" }} />}
        style={{
          color: "#ff4d4f",
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 18,
        }}
        title="Salir del grupo"
      />
    </Popconfirm>
  );
}
