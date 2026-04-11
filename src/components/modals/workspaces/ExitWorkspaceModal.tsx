import { Button, Popconfirm } from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceDetail } from "../../../models/UserWorkspace";
import { exitWorkspaceApi } from "../../../apis/WorkspaceApi";

interface ExitWorkspaceModalProps {
  group: WorkspaceDetail;
}
export default function ExitWorkspaceModal({ group }: ExitWorkspaceModalProps) {
  const queryClient = useQueryClient();
  const exitWorkspaceMutation = useMutation({
    mutationFn: () => exitWorkspaceApi(group.id),
    onError: (err) => {
      console.error("Error saliendo del grupo:", err);
    },
    onSuccess: () => {
      console.debug("✅ Has salido del grupo correctamente");
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-count"] });
    },
  });

  return (
    <Popconfirm
      title="¿Estás seguro de que quieres salir del grupo?"
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
