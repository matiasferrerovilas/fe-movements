import { Button, Popconfirm } from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Workspace } from "@/models/UserWorkspace";
import { exitWorkspaceApi } from "@/apis/WorkspaceApi";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

interface ExitWorkspaceModalProps {
  group: Workspace;
}
export default function ExitWorkspaceModal({ group }: ExitWorkspaceModalProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null, t);
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
      okText={t("settings.currentWorkspace.exitConfirmOk")}
      cancelText={t("settings.currentWorkspace.exitConfirmCancel")}
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
        title={t("settings.currentWorkspace.exitButton")}
        aria-label={t("settings.currentWorkspace.exitButton")}
      />
    </Popconfirm>
  );
}
